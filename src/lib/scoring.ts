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

export function getMaxValues(countries: any[]) {
  const maxOf = (fn: (c: any) => number | null | undefined) => {
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

export function scoreCountry(
  country: any,
  weights: CategoryWeights,
  scenario: Scenario,
  maxVals: any
) {
  const manpower = (normalizeValue(country.activePersonnel, maxVals.activePersonnel) * 0.6) + (normalizeValue(country.reservePersonnel, maxVals.reservePersonnel) * 0.4);
  const airPower = (normalizeValue(country.aircraft, maxVals.aircraft) * 0.3) + (normalizeValue(country.fighterJets, maxVals.fighterJets) * 0.5) + (normalizeValue(country.attackHelicopters, maxVals.attackHelicopters) * 0.2);
  const groundForces = (normalizeValue(country.tanks, maxVals.tanks) * 0.4) + (normalizeValue(country.armoredVehicles, maxVals.armoredVehicles) * 0.3) + (normalizeValue(country.selfPropelledArtillery, maxVals.selfPropelledArtillery) * 0.15) + (normalizeValue(country.rocketProjectors, maxVals.rocketProjectors) * 0.15);
  const navalForces = (normalizeValue(country.navalVessels, maxVals.navalVessels) * 0.3) + (normalizeValue(country.submarines, maxVals.submarines) * 0.3) + (normalizeValue(country.destroyers, maxVals.destroyers) * 0.2) + (normalizeValue(country.frigates, maxVals.frigates) * 0.1) + (normalizeValue(country.aircraftCarriers, maxVals.aircraftCarriers) * 0.1);
  const economy = (normalizeValue(country.defenseBudgetUsd, maxVals.defenseBudgetUsd) * 0.6) + (normalizeValue(country.gdpUsd, maxVals.gdpUsd) * 0.4);
  const logistics = (normalizeValue(country.landAreaKm2, maxVals.landAreaKm2) * 0.4) + (normalizeValue(country.population, maxVals.population) * 0.3) + (normalizeValue(country.aircraft, maxVals.aircraft) * 0.3);

  let totalScore: number;
  if (scenario === "air") totalScore = (airPower * 0.6) + (manpower * 0.1) + (economy * 0.2) + (logistics * 0.1);
  else if (scenario === "naval") totalScore = (navalForces * 0.6) + (manpower * 0.1) + (economy * 0.2) + (logistics * 0.1);
  else if (scenario === "ground") totalScore = (groundForces * 0.5) + (manpower * 0.2) + (economy * 0.2) + (logistics * 0.1);
  else totalScore = (manpower * weights.manpower) + (airPower * weights.airPower) + (groundForces * weights.groundForces) + (navalForces * weights.navalForces) + (economy * weights.economy) + (logistics * weights.logistics);

  return {
    countryCode: country.code,
    totalScore,
    rawScores: { manpower, airPower, groundForces, navalForces, economy, logistics },
  };
}