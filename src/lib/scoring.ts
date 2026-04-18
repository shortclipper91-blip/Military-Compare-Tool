import { Country, COUNTRIES_DATA } from "./countryData";

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

export function calculateScores(countries: Country[], weights: CategoryWeights = DEFAULT_WEIGHTS) {
  const maxVals = {
    personnel: 0,
    aircraft: 0,
    tanks: 0,
    naval: 0,
    budget: 0,
  };

  // Determine max values for normalization across the provided set
  countries.forEach((c) => {
    maxVals.personnel = Math.max(
      maxVals.personnel,
      (c.metrics.activePersonnel ?? 0) + (c.metrics.reservePersonnel ?? 0)
    );
    maxVals.aircraft = Math.max(maxVals.aircraft, c.metrics.aircraft ?? 0);
    maxVals.tanks = Math.max(maxVals.tanks, c.metrics.tanks ?? 0);
    maxVals.naval = Math.max(maxVals.naval, c.metrics.navalVessels ?? 0);
    maxVals.budget = Math.max(maxVals.budget, c.metrics.defenseBudgetUsd ?? 0);
  });

  return countries.map((c) => {
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
      maxVals.naval
    );
    const economyScore = normalize(c.metrics.defenseBudgetUsd ?? 0, maxVals.budget);

    const totalScore = (
      manpowerScore * weights.manpower +
      airPowerScore * weights.airPower +
      groundScore * weights.groundForces +
      navalScore * weights.navalForces +
      economyScore * weights.economy
    );

    return {
      code: c.code,
      totalScore,
      categories: {
        manpower: manpowerScore,
        airPower: airPowerScore,
        groundForces: groundScore,
        navalForces: navalScore,
        economy: economyScore,
      },
    };
  });
}