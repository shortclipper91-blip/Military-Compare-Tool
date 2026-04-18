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

/**
 * Default global max values for consistent normalization across all pages.
 * These are based on the top performers in the dataset.
 */
const GLOBAL_MAX = {
  personnel: 3000000,
  aircraft: 13300,
  tanks: 12500,
  naval: 1000,
  budget: 900e9,
};

export function calculateScores(countries: Country[], weights: CategoryWeights = DEFAULT_WEIGHTS) {
  return countries.map((c) => {
    const normalize = (value: number, max: number) => Math.min((max ? value / max : 0) * 100, 100);

    const manpowerScore = normalize(
      (c.metrics.activePersonnel ?? 0) + (c.metrics.reservePersonnel ?? 0),
      GLOBAL_MAX.personnel
    );
    const airPowerScore = normalize(
      (c.metrics.aircraft ?? 0),
      GLOBAL_MAX.aircraft
    );
    const groundScore = normalize(
      (c.metrics.tanks ?? 0),
      GLOBAL_MAX.tanks
    );
    const navalScore = normalize(
      (c.metrics.navalVessels ?? 0) +
        (c.metrics.submarines ?? 0) * 2 +
        (c.metrics.aircraftCarriers ?? 0) * 10,
      GLOBAL_MAX.naval
    );
    const economyScore = normalize(c.metrics.defenseBudgetUsd ?? 0, GLOBAL_MAX.budget);

    // Logistics placeholder based on population/area
    const logisticsScore = normalize((c.metrics.population ?? 0) / 1e6, 1500);

    const totalScore = (
      manpowerScore * weights.manpower +
      airPowerScore * weights.airPower +
      groundScore * weights.groundForces +
      navalScore * weights.navalForces +
      economyScore * weights.economy +
      logisticsScore * weights.logistics
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
        logistics: logisticsScore,
      },
    };
  });
}

/**
 * Helper to turn a 0-100 score into a color string.
 * High scores -> Amber/Gold, Low scores -> Darker amber/brown.
 */
export function scoreToColor(score: number): string {
  // We use a CSS variable for primary, but for the map gradient we can use hex/hsl
  // High: #f59e0b (Amber 500), Low: #451a03 (Brown/Deep Orange)
  if (score > 80) return "#fbbf24"; // Amber 400
  if (score > 60) return "#f59e0b"; // Amber 500
  if (score > 40) return "#d97706"; // Amber 600
  if (score > 20) return "#b45309"; // Amber 700
  return "#92400e"; // Amber 800
}

/**
 * Consistent strength index specifically for the Map
 */
export function computeStrengthIndex(country: Country) {
  const [result] = calculateScores([country]);
  return { score: result.totalScore, normScore: result.totalScore / 100 };
}