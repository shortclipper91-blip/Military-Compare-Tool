import { Country, MilitaryMetrics } from "./countryData";

export interface CategoryWeights {
  manpower: number;
  airPower: number;
  groundForces: number;
  navalForces: number;
  economy: number;
}

export const DEFAULT_WEIGHTS: CategoryWeights = {
  manpower: 0.25,
  airPower: 0.25,
  groundForces: 0.2,
  navalForces: 0.2,
  economy: 0.1,
};

function normalize(val: number, max: number) {
  return max === 0 ? 0 : Math.min(val / max, 1) * 100;
}

export function calculateScores(countries: Country[]) {
  const max = {
    personnel: Math.max(...countries.map(c => c.metrics.activePersonnel + c.metrics.reservePersonnel * 0.5)),
    aircraft: Math.max(...countries.map(c => c.metrics.aircraft)),
    tanks: Math.max(...countries.map(c => c.metrics.tanks)),
    naval: Math.max(...countries.map(c => c.metrics.navalVessels)),
    budget: Math.max(...countries.map(c => c.metrics.defenseBudgetUsd)),
  };

  return countries.map(c => {
    const manpower = normalize(c.metrics.activePersonnel + c.metrics.reservePersonnel * 0.5, max.personnel);
    const airPower = normalize(c.metrics.aircraft * 0.5 + c.metrics.fighterJets, max.aircraft);
    const groundForces = normalize(c.metrics.tanks + c.metrics.armoredVehicles * 0.2, max.tanks);
    const navalForces = normalize(c.metrics.navalVessels + c.metrics.submarines * 2 + c.metrics.aircraftCarriers * 10, max.naval);
    const economy = normalize(c.metrics.defenseBudgetUsd, max.budget);

    const totalScore = (
      manpower * DEFAULT_WEIGHTS.manpower +
      airPower * DEFAULT_WEIGHTS.airPower +
      groundForces * DEFAULT_WEIGHTS.groundForces +
      navalForces * DEFAULT_WEIGHTS.navalForces +
      economy * DEFAULT_WEIGHTS.economy
    );

    return {
      code: c.code,
      totalScore,
      categories: { manpower, airPower, groundForces, navalForces, economy }
    };
  });
}