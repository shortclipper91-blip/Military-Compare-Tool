import { Country } from "./countryData";

export interface CategoryWeights {
  manpower: number;
  airPower: number;
  groundForces: number;
  navalForces: number;
  economy: number;
  logistics: number;
}

/** Default balanced weights */
export const DEFAULT_WEIGHTS: CategoryWeights = {
  manpower: 0.2,
  airPower: 0.2,
  groundForces: 0.2,
  navalForces: 0.2,
  economy: 0.1,
  logistics: 0.1,
};

/**
 * Pre‑compute scores for all countries once.
 * This improves performance when many comparisons are performed.
 */
export const precomputedScores = (() => {
  const scores: any[] = [];
  const maxVals: any = {
    personnel: 0,
    aircraft: 0,
    tanks: 0,
    naval: 0,
    budget: 0,
  };

  // Determine max values for normalization
  CountryData.forEach((c) => {
    maxVals.personnel = Math.max(
      maxVals.personnel,
      (c.metrics.activePersonnel ?? 0) + (c.metrics.reservePersonnel ?? 0)
    );
    maxVals.aircraft = Math.max(maxVals.aircraft, c.metrics.aircraft ?? 0);
    maxVals.tanks = Math.max(maxVals.tanks, c.metrics.tanks ?? 0);
    maxVals.naval = Math.max(maxVals.naval, c.metrics.navalVessels ?? 0);
    maxVals.budget = Math.max(maxVals.budget, c.metrics.defenseBudgetUsd ?? 0);
  });

  CountryData.forEach((c) => {
    const normalize = (value: number, max: number) => (max ? value / max : 0) * 100;

    const manpowerScore = normalize(
      (c.metrics.activePersonnel ?? 0) + (c.metrics.reservePersonnel ?? 0),
      maxVals.personnel
    );
    const airPowerScore = normalize(
      (c.metrics.aircraft ?? 0) * 0.5 + (c.metrics.fighterJets ?? 0),
      maxVals.aircraft
    );
    const groundScore = normalize(
      (c.metrics.tanks ?? 0) + (c.metrics.armoredVehicles ?? 0) * 0.2,
      maxVals.tanks
    );
    const navalScore = normalize(
      (c.metrics.navalVessels ?? 0) +
        (c.metrics.submarines ?? 0) * 2 +
        (c.metrics.aircraftCarriers ?? 0) * 10,
      maxVals.naval    );
    const economyScore = normalize(c.metrics.defenseBudgetUsd ?? 0, maxVals.budget);

    const totalScore = (
      manpowerScore * DEFAULT_WEIGHTS.manpower +
      airPowerScore * DEFAULT_WEIGHTS.airPower +
      groundScore * DEFAULT_WEIGHTS.groundForces +
      navalScore * DEFAULT_WEIGHTS.navalForces +
      economyScore * DEFAULT_WEIGHTS.economy    );

    scores.push({
      code: c.code,
      totalScore,
      categories: {
        manpower: manpowerScore,
        airPower: airPowerScore,
        groundForces: groundScore,
        navalForces: navalScore,
        economy: economyScore,
      },
    });
  });

  return scores;
})();