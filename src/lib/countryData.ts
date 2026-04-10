export interface MilitaryMetrics {
  activePersonnel: number;
  reservePersonnel: number;
  defenseBudgetUsd: number;
  gdpUsd: number;
  aircraft: number;
  fighterJets: number;
  attackHelicopters: number;
  tanks: number;
  armoredVehicles: number;
  navalVessels: number;
  submarines: number;
  aircraftCarriers: number;
  nuclearWarheads: number;
  population: number;
  landAreaKm2: number;
}

export interface Country {
  code: string;
  name: string;
  flagEmoji: string;
  region: string;
  metrics: MilitaryMetrics;
}

export const COUNTRIES_DATA: Country[] = [
  {
    code: "US", name: "United States", flagEmoji: "🇺🇸", region: "North America",
    metrics: {
      activePersonnel: 1395350, reservePersonnel: 845600, defenseBudgetUsd: 886e9, gdpUsd: 25.46e12,
      aircraft: 13300, fighterJets: 1956, attackHelicopters: 983, tanks: 5500, armoredVehicles: 39253,
      navalVessels: 484, submarines: 68, aircraftCarriers: 11, nuclearWarheads: 5550, population: 331e6, landAreaKm2: 9833517
    }
  },
  {
    code: "CN", name: "China", flagEmoji: "🇨🇳", region: "East Asia",
    metrics: {
      activePersonnel: 2035000, reservePersonnel: 510000, defenseBudgetUsd: 224e9, gdpUsd: 17.96e12,
      aircraft: 3285, fighterJets: 1200, attackHelicopters: 327, tanks: 5000, armoredVehicles: 35000,
      navalVessels: 730, submarines: 60, aircraftCarriers: 3, nuclearWarheads: 410, population: 1412e6, landAreaKm2: 9596960
    }
  },
  {
    code: "RU", name: "Russia", flagEmoji: "🇷🇺", region: "Eastern Europe",
    metrics: {
      activePersonnel: 1320000, reservePersonnel: 2000000, defenseBudgetUsd: 109e9, gdpUsd: 2.24e12,
      aircraft: 4292, fighterJets: 772, attackHelicopters: 537, tanks: 12420, armoredVehicles: 27038,
      navalVessels: 598, submarines: 59, aircraftCarriers: 1, nuclearWarheads: 6255, population: 144e6, landAreaKm2: 17098242
    }
  },
  {
    code: "IN", name: "India", flagEmoji: "🇮🇳", region: "South Asia",
    metrics: {
      activePersonnel: 1455550, reservePersonnel: 1155000, defenseBudgetUsd: 81.4e9, gdpUsd: 3.39e12,
      aircraft: 2229, fighterJets: 538, attackHelicopters: 35, tanks: 4614, armoredVehicles: 10000,
      navalVessels: 295, submarines: 18, aircraftCarriers: 2, nuclearWarheads: 164, population: 1400e6, landAreaKm2: 3287263
    }
  },
  {
    code: "GB", name: "United Kingdom", flagEmoji: "🇬🇧", region: "Western Europe",
    metrics: {
      activePersonnel: 148500, reservePersonnel: 78840, defenseBudgetUsd: 68.5e9, gdpUsd: 3.07e12,
      aircraft: 887, fighterJets: 155, attackHelicopters: 50, tanks: 213, armoredVehicles: 5015,
      navalVessels: 67, submarines: 11, aircraftCarriers: 2, nuclearWarheads: 225, population: 67e6, landAreaKm2: 243610
    }
  },
  {
    code: "FR", name: "France", flagEmoji: "🇫🇷", region: "Western Europe",
    metrics: {
      activePersonnel: 203850, reservePersonnel: 40820, defenseBudgetUsd: 56.6e9, gdpUsd: 2.78e12,
      aircraft: 1055, fighterJets: 254, attackHelicopters: 56, tanks: 215, armoredVehicles: 6558,
      navalVessels: 180, submarines: 10, aircraftCarriers: 1, nuclearWarheads: 290, population: 68e6, landAreaKm2: 643801
    }
  },
  {
    code: "JP", name: "Japan", flagEmoji: "🇯🇵", region: "East Asia",
    metrics: {
      activePersonnel: 247150, reservePersonnel: 56100, defenseBudgetUsd: 46e9, gdpUsd: 4.23e12,
      aircraft: 1449, fighterJets: 235, attackHelicopters: 102, tanks: 1013, armoredVehicles: 3800,
      navalVessels: 155, submarines: 22, aircraftCarriers: 4, nuclearWarheads: 0, population: 125e6, landAreaKm2: 377975
    }
  },
  {
    code: "KR", name: "South Korea", flagEmoji: "🇰🇷", region: "East Asia",
    metrics: {
      activePersonnel: 500000, reservePersonnel: 3100000, defenseBudgetUsd: 43.1e9, gdpUsd: 1.67e12,
      aircraft: 1614, fighterJets: 395, attackHelicopters: 50, tanks: 2290, armoredVehicles: 7900,
      navalVessels: 166, submarines: 22, aircraftCarriers: 1, nuclearWarheads: 0, population: 52e6, landAreaKm2: 100210
    }
  },
  {
    code: "IL", name: "Israel", flagEmoji: "🇮🇱", region: "Middle East",
    metrics: {
      activePersonnel: 169500, reservePersonnel: 465000, defenseBudgetUsd: 23.4e9, gdpUsd: 0.527e12,
      aircraft: 612, fighterJets: 241, attackHelicopters: 48, tanks: 1370, armoredVehicles: 10000,
      navalVessels: 65, submarines: 5, aircraftCarriers: 0, nuclearWarheads: 90, population: 9e6, landAreaKm2: 22072
    }
  },
  {
    code: "KP", name: "North Korea", flagEmoji: "🇰🇵", region: "East Asia",
    metrics: {
      activePersonnel: 1280000, reservePersonnel: 600000, defenseBudgetUsd: 4e9, gdpUsd: 0.018e12,
      aircraft: 563, fighterJets: 82, attackHelicopters: 20, tanks: 6000, armoredVehicles: 4000,
      navalVessels: 492, submarines: 71, aircraftCarriers: 0, nuclearWarheads: 40, population: 26e6, landAreaKm2: 120538
    }
  }
];