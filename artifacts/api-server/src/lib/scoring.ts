import type { Country } from "@workspace/db";

export interface CategoryWeights {
  manpower: number;
  airPower: number;
  groundForces: number;
  navalForces: number;
  economy: number;
  logistics: number;
}

export type Scenario = "full" | "air" | "naval" | "ground";

function normalizeValue(value: number | null | undefined, max: number): number {
  if (!value || max === 0) return 0;
  return Math.min(value / max, 1) * 100;
}

function getMaxValues(countries: Country[]) {
  const maxOf = (fn: (c: Country) => number | null | undefined) => {
    const vals = countries.map(fn).filter((v): v is number => v != null && v > 0);
    return vals.length > 0 ? Math.max(...vals) : 1;
  };
  return {
    activePersonnel: maxOf(c => c.activePersonnel),
    reservePersonnel: maxOf(c => c.reservePersonnel),
    aircraft: maxOf(c => c.aircraft),
    fighterJets: maxOf(c => c.fighterJets),
    attackHelicopters: maxOf(c => c.attackHelicopters),
    tanks: maxOf(c => c.tanks),
    armoredVehicles: maxOf(c => c.armoredVehicles),
    selfPropelledArtillery: maxOf(c => c.selfPropelledArtillery),
    rocketProjectors: maxOf(c => c.rocketProjectors),
    navalVessels: maxOf(c => c.navalVessels),
    submarines: maxOf(c => c.submarines),
    destroyers: maxOf(c => c.destroyers),
    frigates: maxOf(c => c.frigates),
    aircraftCarriers: maxOf(c => c.aircraftCarriers),
    defenseBudgetUsd: maxOf(c => c.defenseBudgetUsd),
    gdpUsd: maxOf(c => c.gdpUsd),
    landAreaKm2: maxOf(c => c.landAreaKm2),
    population: maxOf(c => c.population),
  };
}

export function computeManpowerScore(country: Country, maxVals: ReturnType<typeof getMaxValues>): number {
  const active = normalizeValue(country.activePersonnel, maxVals.activePersonnel) * 0.6;
  const reserve = normalizeValue(country.reservePersonnel, maxVals.reservePersonnel) * 0.4;
  return active + reserve;
}

export function computeAirPowerScore(country: Country, maxVals: ReturnType<typeof getMaxValues>): number {
  const totalAircraft = normalizeValue(country.aircraft, maxVals.aircraft) * 0.3;
  const fighters = normalizeValue(country.fighterJets, maxVals.fighterJets) * 0.5;
  const helicopters = normalizeValue(country.attackHelicopters, maxVals.attackHelicopters) * 0.2;
  return totalAircraft + fighters + helicopters;
}

export function computeGroundForcesScore(country: Country, maxVals: ReturnType<typeof getMaxValues>): number {
  const tanks = normalizeValue(country.tanks, maxVals.tanks) * 0.4;
  const armored = normalizeValue(country.armoredVehicles, maxVals.armoredVehicles) * 0.3;
  const artillery = normalizeValue(country.selfPropelledArtillery, maxVals.selfPropelledArtillery) * 0.15;
  const rockets = normalizeValue(country.rocketProjectors, maxVals.rocketProjectors) * 0.15;
  return tanks + armored + artillery + rockets;
}

export function computeNavalForcesScore(country: Country, maxVals: ReturnType<typeof getMaxValues>): number {
  const vessels = normalizeValue(country.navalVessels, maxVals.navalVessels) * 0.3;
  const submarines = normalizeValue(country.submarines, maxVals.submarines) * 0.3;
  const destroyers = normalizeValue(country.destroyers, maxVals.destroyers) * 0.2;
  const frigates = normalizeValue(country.frigates, maxVals.frigates) * 0.1;
  const carriers = normalizeValue(country.aircraftCarriers, maxVals.aircraftCarriers) * 0.1;
  return vessels + submarines + destroyers + frigates + carriers;
}

export function computeEconomyScore(country: Country, maxVals: ReturnType<typeof getMaxValues>): number {
  const budget = normalizeValue(country.defenseBudgetUsd, maxVals.defenseBudgetUsd) * 0.6;
  const gdp = normalizeValue(country.gdpUsd, maxVals.gdpUsd) * 0.4;
  return budget + gdp;
}

export function computeLogisticsScore(country: Country, maxVals: ReturnType<typeof getMaxValues>): number {
  const area = normalizeValue(country.landAreaKm2, maxVals.landAreaKm2) * 0.4;
  const pop = normalizeValue(country.population, maxVals.population) * 0.3;
  const aircraft = normalizeValue(country.aircraft, maxVals.aircraft) * 0.3;
  return area + pop + aircraft;
}

export function scoreCountry(
  country: Country,
  weights: CategoryWeights,
  scenario: Scenario,
  maxVals: ReturnType<typeof getMaxValues>
) {
  const manpower = computeManpowerScore(country, maxVals);
  const airPower = computeAirPowerScore(country, maxVals);
  const groundForces = computeGroundForcesScore(country, maxVals);
  const navalForces = computeNavalForcesScore(country, maxVals);
  const economy = computeEconomyScore(country, maxVals);
  const logistics = computeLogisticsScore(country, maxVals);

  let totalScore: number;
  let categoryScores: Record<string, number>;

  if (scenario === "air") {
    totalScore = (airPower * 0.6) + (manpower * 0.1) + (economy * 0.2) + (logistics * 0.1);
    categoryScores = { manpower: manpower * 0.1, airPower: airPower * 0.6, economy: economy * 0.2, logistics: logistics * 0.1 };
  } else if (scenario === "naval") {
    totalScore = (navalForces * 0.6) + (manpower * 0.1) + (economy * 0.2) + (logistics * 0.1);
    categoryScores = { manpower: manpower * 0.1, navalForces: navalForces * 0.6, economy: economy * 0.2, logistics: logistics * 0.1 };
  } else if (scenario === "ground") {
    totalScore = (groundForces * 0.5) + (manpower * 0.2) + (economy * 0.2) + (logistics * 0.1);
    categoryScores = { manpower: manpower * 0.2, groundForces: groundForces * 0.5, economy: economy * 0.2, logistics: logistics * 0.1 };
  } else {
    totalScore =
      (manpower * weights.manpower) +
      (airPower * weights.airPower) +
      (groundForces * weights.groundForces) +
      (navalForces * weights.navalForces) +
      (economy * weights.economy) +
      (logistics * weights.logistics);
    categoryScores = {
      manpower: manpower * weights.manpower,
      airPower: airPower * weights.airPower,
      groundForces: groundForces * weights.groundForces,
      navalForces: navalForces * weights.navalForces,
      economy: economy * weights.economy,
      logistics: logistics * weights.logistics,
    };
  }

  return {
    countryCode: country.code,
    totalScore,
    categoryScores,
    rawScores: { manpower, airPower, groundForces, navalForces, economy, logistics },
  };
}

export function buildCategoryBreakdown(
  scores: ReturnType<typeof scoreCountry>[],
  countries: Country[]
) {
  const categories = ["manpower", "airPower", "groundForces", "navalForces", "economy", "logistics"];
  return categories.map(cat => {
    const scoreMap: Record<string, number> = {};
    let maxScore = -1;
    let advantageCode = "";

    for (const s of scores) {
      const raw = s.rawScores[cat as keyof typeof s.rawScores] ?? 0;
      scoreMap[s.countryCode] = raw;
      if (raw > maxScore) {
        maxScore = raw;
        advantageCode = s.countryCode;
      }
    }

    const advantageCountry = countries.find(c => c.code === advantageCode);
    return {
      category: cat,
      scores: scoreMap,
      advantage: `${advantageCountry?.flagEmoji ?? ""} ${advantageCountry?.name ?? advantageCode}`,
      advantageCountryCode: advantageCode,
    };
  });
}

export function countryToApiFormat(country: Country) {
  return {
    code: country.code,
    name: country.name,
    flagEmoji: country.flagEmoji,
    continent: country.continent,
    region: country.region,
    alliances: (country.alliances as string[]) ?? [],
    metrics: {
      activePersonnel: country.activePersonnel,
      reservePersonnel: country.reservePersonnel,
      paramilitary: country.paramilitary,
      defenseBudgetUsd: country.defenseBudgetUsd,
      gdpUsd: country.gdpUsd,
      population: country.population,
      landAreaKm2: country.landAreaKm2,
      aircraft: country.aircraft,
      fighterJets: country.fighterJets,
      attackHelicopters: country.attackHelicopters,
      transportHelicopters: country.transportHelicopters,
      tanks: country.tanks,
      armoredVehicles: country.armoredVehicles,
      selfPropelledArtillery: country.selfPropelledArtillery,
      rocketProjectors: country.rocketProjectors,
      navalVessels: country.navalVessels,
      submarines: country.submarines,
      destroyers: country.destroyers,
      frigates: country.frigates,
      aircraftCarriers: country.aircraftCarriers,
      nuclearWarheads: country.nuclearWarheads,
    },
    dataSources: (country.dataSources as Array<{metric: string; source: string; confidence: string; lastUpdated: string}>) ?? [],
  };
}

export function combineMetrics(countries: Country[]) {
  const sum = (fn: (c: Country) => number | null | undefined): number | null => {
    const vals = countries.map(fn).filter((v): v is number => v != null);
    return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) : null;
  };
  return {
    activePersonnel: sum(c => c.activePersonnel),
    reservePersonnel: sum(c => c.reservePersonnel),
    paramilitary: sum(c => c.paramilitary),
    defenseBudgetUsd: sum(c => c.defenseBudgetUsd),
    gdpUsd: sum(c => c.gdpUsd),
    population: sum(c => c.population),
    landAreaKm2: sum(c => c.landAreaKm2),
    aircraft: sum(c => c.aircraft),
    fighterJets: sum(c => c.fighterJets),
    attackHelicopters: sum(c => c.attackHelicopters),
    transportHelicopters: sum(c => c.transportHelicopters),
    tanks: sum(c => c.tanks),
    armoredVehicles: sum(c => c.armoredVehicles),
    selfPropelledArtillery: sum(c => c.selfPropelledArtillery),
    rocketProjectors: sum(c => c.rocketProjectors),
    navalVessels: sum(c => c.navalVessels),
    submarines: sum(c => c.submarines),
    destroyers: sum(c => c.destroyers),
    frigates: sum(c => c.frigates),
    aircraftCarriers: sum(c => c.aircraftCarriers),
    nuclearWarheads: sum(c => c.nuclearWarheads),
  };
}

export { getMaxValues };
