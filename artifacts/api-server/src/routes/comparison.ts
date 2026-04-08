import { Router, type IRouter } from "express";
import { inArray } from "drizzle-orm";
import { db, countriesTable } from "@workspace/db";
import { CompareCountriesBody, CompareCoalitionsBody } from "@workspace/api-zod";
import {
  scoreCountry,
  buildCategoryBreakdown,
  countryToApiFormat,
  combineMetrics,
  getMaxValues,
  type CategoryWeights,
  type Scenario,
} from "../lib/scoring";

const router: IRouter = Router();

router.post("/comparison", async (req, res): Promise<void> => {
  const parsed = CompareCountriesBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { countryCodes, weights, scenario } = parsed.data;

  const countries = await db
    .select()
    .from(countriesTable)
    .where(inArray(countriesTable.code, countryCodes));

  if (countries.length < 2) {
    res.status(400).json({ error: "At least 2 valid countries required" });
    return;
  }

  const maxVals = getMaxValues(countries);
  const scores = countries.map(c =>
    scoreCountry(c, weights as CategoryWeights, scenario as Scenario, maxVals)
  );

  const categoryBreakdown = buildCategoryBreakdown(scores, countries);

  const sortedScores = [...scores].sort((a, b) => b.totalScore - a.totalScore);
  const winnerCountry = countries.find(c => c.code === sortedScores[0].countryCode);
  const overallWinner = `${winnerCountry?.flagEmoji ?? ""} ${winnerCountry?.name ?? sortedScores[0].countryCode}`;

  res.json({
    countries: countries.map(countryToApiFormat),
    scores: scores.map(s => ({
      countryCode: s.countryCode,
      totalScore: s.totalScore,
      categoryScores: s.categoryScores,
    })),
    categoryBreakdown,
    overallWinner,
  });
});

router.post("/comparison/coalitions", async (req, res): Promise<void> => {
  const parsed = CompareCoalitionsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { teamA, teamB, weights, scenario } = parsed.data;
  const allCodes = [...teamA, ...teamB];

  const allCountries = await db
    .select()
    .from(countriesTable)
    .where(inArray(countriesTable.code, allCodes));

  const countriesA = allCountries.filter(c => teamA.includes(c.code));
  const countriesB = allCountries.filter(c => teamB.includes(c.code));

  if (countriesA.length === 0 || countriesB.length === 0) {
    res.status(400).json({ error: "Each coalition must have at least one valid country" });
    return;
  }

  const maxVals = getMaxValues(allCountries);

  const combinedA = combineMetrics(countriesA);
  const combinedB = combineMetrics(countriesB);

  const createVirtualCountry = (code: string, combined: ReturnType<typeof combineMetrics>) => ({
    id: 0,
    code,
    name: code,
    flagEmoji: "",
    continent: "",
    region: "",
    alliances: [] as string[],
    activePersonnel: combined.activePersonnel,
    reservePersonnel: combined.reservePersonnel,
    paramilitary: combined.paramilitary,
    defenseBudgetUsd: combined.defenseBudgetUsd,
    gdpUsd: combined.gdpUsd,
    population: combined.population,
    landAreaKm2: combined.landAreaKm2,
    aircraft: combined.aircraft,
    fighterJets: combined.fighterJets,
    attackHelicopters: combined.attackHelicopters,
    transportHelicopters: combined.transportHelicopters,
    tanks: combined.tanks,
    armoredVehicles: combined.armoredVehicles,
    selfPropelledArtillery: combined.selfPropelledArtillery,
    rocketProjectors: combined.rocketProjectors,
    navalVessels: combined.navalVessels,
    submarines: combined.submarines,
    destroyers: combined.destroyers,
    frigates: combined.frigates,
    aircraftCarriers: combined.aircraftCarriers,
    nuclearWarheads: combined.nuclearWarheads,
    dataSources: [] as Array<{metric: string; source: string; confidence: string; lastUpdated: string}>,
  });

  const virtualA = createVirtualCountry("TEAM_A", combinedA);
  const virtualB = createVirtualCountry("TEAM_B", combinedB);

  const scoreA = scoreCountry(virtualA, weights as CategoryWeights, scenario as Scenario, maxVals);
  const scoreB = scoreCountry(virtualB, weights as CategoryWeights, scenario as Scenario, maxVals);

  const categoryBreakdown = buildCategoryBreakdown([scoreA, scoreB], [
    { ...virtualA, name: "Team A", flagEmoji: "🅰️" },
    { ...virtualB, name: "Team B", flagEmoji: "🅱️" },
  ]);

  const winner = scoreA.totalScore >= scoreB.totalScore ? "Team A" : "Team B";

  res.json({
    teamA: {
      teamName: "Team A",
      countries: countriesA.map(countryToApiFormat),
      combinedMetrics: combinedA,
      totalScore: scoreA.totalScore,
      categoryScores: scoreA.categoryScores,
    },
    teamB: {
      teamName: "Team B",
      countries: countriesB.map(countryToApiFormat),
      combinedMetrics: combinedB,
      totalScore: scoreB.totalScore,
      categoryScores: scoreB.categoryScores,
    },
    categoryBreakdown,
    winner,
  });
});

export default router;
