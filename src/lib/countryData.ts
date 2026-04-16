export interface MilitaryMetrics {
  activePersonnel?: number | null;
  reservePersonnel?: number | null;
  paramilitary?: number | null;
  defenseBudgetUsd?: number | null;
  gdpUsd?: number | null;
  population?: number | null;
  landAreaKm2?: number | null;
  aircraft?: number | null;
  fighterJets?: number | null;
  attackHelicopters?: number | null;
  transportHelicopters?: number | null;
  tanks?: number | null;
  armoredVehicles?: number | null;
  selfPropelledArtillery?: number | null;
  rocketProjectors?: number | null;
  navalVessels?: number | null;
  submarines?: number | null;
  destroyers?: number | null;
  frigates?: number | null;
  aircraftCarriers?: number | null;
  nuclearWarheads?: number | null;
}

export interface Country {
  code: string;
  name: string;
  flagEmoji: string;
  continent: string;
  region: string;
  alliances: string[];
  metrics: MilitaryMetrics;
  sources?: Record<string, string>;
}

const COMMON_SOURCES = {
  personnel: "IISS Military Balance 2024",
  budget: "SIPRI 2023",
  equipment: "Global Firepower 2024",
  nuclear: "FAS Nuclear Notebook 2023",
  economy: "World Bank 2023"
};

export const COUNTRIES_DATA: Country[] = [
  {
    code: "US", name: "United States", flagEmoji: "🇺🇸", region: "North America", continent: "North America", alliances: ["NATO"],
    metrics: {
      activePersonnel: 1395350, reservePersonnel: 845600, paramilitary: 0, defenseBudgetUsd: 886e9, gdpUsd: 25.46e12,
      aircraft: 13300, fighterJets: 1956, attackHelicopters: 983, transportHelicopters: 1147,
      tanks: 5500, armoredVehicles: 39253, selfPropelledArtillery: 3269, rocketProjectors: 1366,
      navalVessels: 484, submarines: 68, destroyers: 92, frigates: 0, aircraftCarriers: 11, nuclearWarheads: 5550,
      population: 331e6, landAreaKm2: 9833517
    },
    sources: COMMON_SOURCES
  },
  {
    code: "CN", name: "China", flagEmoji: "🇨🇳", region: "East Asia", continent: "Asia", alliances: ["SCO"],
    metrics: {
      activePersonnel: 2035000, reservePersonnel: 510000, paramilitary: 660000, defenseBudgetUsd: 224e9, gdpUsd: 17.96e12,
      aircraft: 3285, fighterJets: 1200, attackHelicopters: 327, transportHelicopters: 436,
      tanks: 5000, armoredVehicles: 35000, selfPropelledArtillery: 2000, rocketProjectors: 2650,
      navalVessels: 730, submarines: 60, destroyers: 50, frigates: 54, aircraftCarriers: 3, nuclearWarheads: 410,
      population: 1412e6, landAreaKm2: 9596960
    },
    sources: COMMON_SOURCES
  },
  {
    code: "RU", name: "Russia", flagEmoji: "🇷🇺", region: "Eastern Europe", continent: "Europe", alliances: ["CSTO"],
    metrics: {
      activePersonnel: 1320000, reservePersonnel: 2000000, paramilitary: 250000, defenseBudgetUsd: 109e9, gdpUsd: 2.24e12,
      aircraft: 4292, fighterJets: 772, attackHelicopters: 537, transportHelicopters: 365,
      tanks: 12420, armoredVehicles: 27038, selfPropelledArtillery: 5765, rocketProjectors: 3740,
      navalVessels: 598, submarines: 59, destroyers: 15, frigates: 11, aircraftCarriers: 1, nuclearWarheads: 6255,
      population: 144e6, landAreaKm2: 17098242
    },
    sources: COMMON_SOURCES
  },
  {
    code: "IN", name: "India", flagEmoji: "🇮🇳", region: "South Asia", continent: "Asia", alliances: ["SCO"],
    metrics: {
      activePersonnel: 1455550, reservePersonnel: 1155000, paramilitary: 2527000, defenseBudgetUsd: 81.4e9, gdpUsd: 3.39e12,
      aircraft: 2229, fighterJets: 538, attackHelicopters: 35, transportHelicopters: 197,
      tanks: 4614, armoredVehicles: 10000, selfPropelledArtillery: 140, rocketProjectors: 1062,
      navalVessels: 295, submarines: 18, destroyers: 11, frigates: 14, aircraftCarriers: 2, nuclearWarheads: 164,
      population: 1400e6, landAreaKm2: 3287263
    },
    sources: COMMON_SOURCES
  },
  {
    code: "GB", name: "United Kingdom", flagEmoji: "🇬🇧", region: "Western Europe", continent: "Europe", alliances: ["NATO"],
    metrics: {
      activePersonnel: 148500, reservePersonnel: 78840, paramilitary: 0, defenseBudgetUsd: 68.5e9, gdpUsd: 3.07e12,
      aircraft: 887, fighterJets: 155, attackHelicopters: 50, transportHelicopters: 86,
      tanks: 213, armoredVehicles: 5015, selfPropelledArtillery: 89, rocketProjectors: 56,
      navalVessels: 67, submarines: 11, destroyers: 6, frigates: 13, aircraftCarriers: 2, nuclearWarheads: 225,
      population: 67e6, landAreaKm2: 243610
    },
    sources: COMMON_SOURCES
  },
  {
    code: "FR", name: "France", flagEmoji: "🇫🇷", region: "Western Europe", continent: "Europe", alliances: ["NATO"],
    metrics: {
      activePersonnel: 203850, reservePersonnel: 40820, paramilitary: 101400, defenseBudgetUsd: 56.6e9, gdpUsd: 2.78e12,
      aircraft: 1055, fighterJets: 254, attackHelicopters: 56, transportHelicopters: 196,
      tanks: 215, armoredVehicles: 6558, selfPropelledArtillery: 109, rocketProjectors: 136,
      navalVessels: 180, submarines: 10, destroyers: 0, frigates: 21, aircraftCarriers: 1, nuclearWarheads: 290,
      population: 68e6, landAreaKm2: 643801
    },
    sources: COMMON_SOURCES
  },
  {
    code: "DE", name: "Germany", flagEmoji: "🇩🇪", region: "Western Europe", continent: "Europe", alliances: ["NATO"],
    metrics: {
      activePersonnel: 181500, reservePersonnel: 34000, paramilitary: 0, defenseBudgetUsd: 55.8e9, gdpUsd: 4.07e12,
      aircraft: 601, fighterJets: 134, attackHelicopters: 55, transportHelicopters: 112,
      tanks: 266, armoredVehicles: 9217, selfPropelledArtillery: 119, rocketProjectors: 56,
      navalVessels: 65, submarines: 6, destroyers: 0, frigates: 11, aircraftCarriers: 0, nuclearWarheads: 0,
      population: 83e6, landAreaKm2: 357022
    },
    sources: COMMON_SOURCES
  },
  {
    code: "JP", name: "Japan", flagEmoji: "🇯🇵", region: "East Asia", continent: "Asia", alliances: [],
    metrics: {
      activePersonnel: 247150, reservePersonnel: 56100, paramilitary: 0, defenseBudgetUsd: 46e9, gdpUsd: 4.23e12,
      aircraft: 1449, fighterJets: 235, attackHelicopters: 102, transportHelicopters: 116,
      tanks: 1013, armoredVehicles: 3800, selfPropelledArtillery: 209, rocketProjectors: 99,
      navalVessels: 155, submarines: 22, destroyers: 36, frigates: 0, aircraftCarriers: 4, nuclearWarheads: 0,
      population: 125e6, landAreaKm2: 377975
    },
    sources: COMMON_SOURCES
  },
  {
    code: "KR", name: "South Korea", flagEmoji: "🇰🇷", region: "East Asia", continent: "Asia", alliances: [],
    metrics: {
      activePersonnel: 500000, reservePersonnel: 3100000, paramilitary: 4700000, defenseBudgetUsd: 43.1e9, gdpUsd: 1.67e12,
      aircraft: 1614, fighterJets: 395, attackHelicopters: 50, transportHelicopters: 201,
      tanks: 2290, armoredVehicles: 7900, selfPropelledArtillery: 2136, rocketProjectors: 399,
      navalVessels: 166, submarines: 22, destroyers: 12, frigates: 18, aircraftCarriers: 1, nuclearWarheads: 0,
      population: 52e6, landAreaKm2: 100210
    },
    sources: COMMON_SOURCES
  },
  {
    code: "TR", name: "Turkey", flagEmoji: "🇹🇷", region: "Middle East", continent: "Europe", alliances: ["NATO"],
    metrics: {
      activePersonnel: 355200, reservePersonnel: 378700, paramilitary: 148700, defenseBudgetUsd: 17.5e9, gdpUsd: 0.905e12,
      aircraft: 1069, fighterJets: 205, attackHelicopters: 107, transportHelicopters: 178,
      tanks: 2229, armoredVehicles: 11256, selfPropelledArtillery: 728, rocketProjectors: 756,
      navalVessels: 154, submarines: 12, destroyers: 0, frigates: 16, aircraftCarriers: 1, nuclearWarheads: 0,
      population: 85e6, landAreaKm2: 783562
    },
    sources: COMMON_SOURCES
  },
  {
    code: "PK", name: "Pakistan", flagEmoji: "🇵🇰", region: "South Asia", continent: "Asia", alliances: ["SCO"],
    metrics: {
      activePersonnel: 654000, reservePersonnel: 550000, paramilitary: 480000, defenseBudgetUsd: 10.3e9, gdpUsd: 0.376e12,
      aircraft: 1413, fighterJets: 363, attackHelicopters: 57, transportHelicopters: 163,
      tanks: 3742, armoredVehicles: 9935, selfPropelledArtillery: 609, rocketProjectors: 552,
      navalVessels: 114, submarines: 9, destroyers: 0, frigates: 10, aircraftCarriers: 0, nuclearWarheads: 170,
      population: 231e6, landAreaKm2: 881913
    },
    sources: COMMON_SOURCES
  },
  {
    code: "IL", name: "Israel", flagEmoji: "🇮🇱", region: "Middle East", continent: "Asia", alliances: [],
    metrics: {
      activePersonnel: 169500, reservePersonnel: 465000, paramilitary: 8050, defenseBudgetUsd: 23.4e9, gdpUsd: 0.527e12,
      aircraft: 612, fighterJets: 241, attackHelicopters: 48, transportHelicopters: 79,
      tanks: 1370, armoredVehicles: 10000, selfPropelledArtillery: 650, rocketProjectors: 286,
      navalVessels: 65, submarines: 5, destroyers: 0, frigates: 0, aircraftCarriers: 0, nuclearWarheads: 90,
      population: 9e6, landAreaKm2: 22072
    },
    sources: COMMON_SOURCES
  },
  {
    code: "BR", name: "Brazil", flagEmoji: "🇧🇷", region: "South America", continent: "South America", alliances: [],
    metrics: {
      activePersonnel: 360000, reservePersonnel: 1340000, paramilitary: 395000, defenseBudgetUsd: 21.8e9, gdpUsd: 2.08e12,
      aircraft: 665, fighterJets: 42, attackHelicopters: 12, transportHelicopters: 123,
      tanks: 466, armoredVehicles: 2100, selfPropelledArtillery: 0, rocketProjectors: 172,
      navalVessels: 112, submarines: 6, destroyers: 0, frigates: 7, aircraftCarriers: 0, nuclearWarheads: 0,
      population: 214e6, landAreaKm2: 8515767
    },
    sources: COMMON_SOURCES
  },
  {
    code: "IT", name: "Italy", flagEmoji: "🇮🇹", region: "Western Europe", continent: "Europe", alliances: ["NATO"],
    metrics: {
      activePersonnel: 165500, reservePersonnel: 18300, paramilitary: 254050, defenseBudgetUsd: 32.1e9, gdpUsd: 2.1e12,
      aircraft: 850, fighterJets: 209, attackHelicopters: 59, transportHelicopters: 113,
      tanks: 200, armoredVehicles: 6800, selfPropelledArtillery: 54, rocketProjectors: 21,
      navalVessels: 184, submarines: 8, destroyers: 0, frigates: 12, aircraftCarriers: 2, nuclearWarheads: 0,
      population: 59e6, landAreaKm2: 301340
    },
    sources: COMMON_SOURCES
  },
  {
    code: "AU", name: "Australia", flagEmoji: "🇦🇺", region: "Oceania", continent: "Oceania", alliances: ["AUKUS"],
    metrics: {
      activePersonnel: 60000, reservePersonnel: 30000, paramilitary: 0, defenseBudgetUsd: 32e9, gdpUsd: 1.7e12,
      aircraft: 450, fighterJets: 100, attackHelicopters: 57, transportHelicopters: 74,
      tanks: 60, armoredVehicles: 3000, selfPropelledArtillery: 0, rocketProjectors: 80,
      navalVessels: 50, submarines: 6, destroyers: 0, frigates: 12, aircraftCarriers: 0, nuclearWarheads: 0,
      population: 26e6, landAreaKm2: 7692024
    },
    sources: COMMON_SOURCES
  },
  {
    code: "CA", name: "Canada", flagEmoji: "🇨🇦", region: "North America", continent: "North America", alliances: ["NATO"],
    metrics: {
      activePersonnel: 68000, reservePersonnel: 30000, paramilitary: 0, defenseBudgetUsd: 22e9, gdpUsd: 2.1e12,
      aircraft: 400, fighterJets: 80, attackHelicopters: 21, transportHelicopters: 52,
      tanks: 80, armoredVehicles: 1700, selfPropelledArtillery: 0, rocketProjectors: 32,
      navalVessels: 60, submarines: 4, destroyers: 0, frigates: 12, aircraftCarriers: 0, nuclearWarheads: 0,
      population: 38e6, landAreaKm2: 9984670
    },
    sources: COMMON_SOURCES
  },
  {
    code: "EG", name: "Egypt", flagEmoji: "🇪🇬", region: "North Africa", continent: "Africa", alliances: [],
    metrics: {
      activePersonnel: 440000, reservePersonnel: 480000, paramilitary: 397000, defenseBudgetUsd: 4.6e9, gdpUsd: 475e9,
      aircraft: 1000, fighterJets: 290, attackHelicopters: 46, transportHelicopters: 141,
      tanks: 4000, armoredVehicles: 12000, selfPropelledArtillery: 1143, rocketProjectors: 1380,
      navalVessels: 300, submarines: 8, destroyers: 0, frigates: 11, aircraftCarriers: 2, nuclearWarheads: 0,
      population: 105e6, landAreaKm2: 1002450
    },
    sources: COMMON_SOURCES
  },
  {
    code: "SA", name: "Saudi Arabia", flagEmoji: "🇸🇦", region: "Middle East", continent: "Asia", alliances: [],
    metrics: {
      activePersonnel: 250000, reservePersonnel: 0, paramilitary: 24500, defenseBudgetUsd: 75e9, gdpUsd: 1.06e12,
      aircraft: 800, fighterJets: 270, attackHelicopters: 43, transportHelicopters: 125,
      tanks: 1000, armoredVehicles: 6000, selfPropelledArtillery: 100, rocketProjectors: 73,
      navalVessels: 50, submarines: 0, destroyers: 0, frigates: 7, aircraftCarriers: 0, nuclearWarheads: 0,
      population: 35e6, landAreaKm2: 2149690
    },
    sources: COMMON_SOURCES
  },
  {
    code: "ES", name: "Spain", flagEmoji: "🇪🇸", region: "Western Europe", continent: "Europe", alliances: ["NATO"],
    metrics: {
      activePersonnel: 120000, reservePersonnel: 15000, paramilitary: 80210, defenseBudgetUsd: 17e9, gdpUsd: 1.42e12,
      aircraft: 500, fighterJets: 130, attackHelicopters: 24, transportHelicopters: 59,
      tanks: 300, armoredVehicles: 2700, selfPropelledArtillery: 96, rocketProjectors: 16,
      navalVessels: 60, submarines: 3, destroyers: 0, frigates: 11, aircraftCarriers: 1, nuclearWarheads: 0,
      population: 47e6, landAreaKm2: 505990
    },
    sources: COMMON_SOURCES
  },
  {
    code: "MX", name: "Mexico", flagEmoji: "🇲🇽", region: "North America", continent: "North America", alliances: [],
    metrics: {
      activePersonnel: 270000, reservePersonnel: 80000, paramilitary: 11000, defenseBudgetUsd: 8e9, gdpUsd: 1.32e12,
      aircraft: 400, fighterJets: 0, attackHelicopters: 70, transportHelicopters: 162,
      tanks: 0, armoredVehicles: 850, selfPropelledArtillery: 0, rocketProjectors: 0,
      navalVessels: 200, submarines: 0, destroyers: 0, frigates: 7, aircraftCarriers: 0, nuclearWarheads: 0,
      population: 130e6, landAreaKm2: 1964375
    },
    sources: COMMON_SOURCES
  },
  {
    code: "NO", name: "Norway", flagEmoji: "🇳🇴", region: "Scandinavia", continent: "Europe", alliances: ["NATO"],
    metrics: {
      activePersonnel: 23250, reservePersonnel: 40000, paramilitary: 0, defenseBudgetUsd: 8.2e9, gdpUsd: 0.579e12,
      aircraft: 150, fighterJets: 57, attackHelicopters: 0, transportHelicopters: 18,
      tanks: 36, armoredVehicles: 800, selfPropelledArtillery: 18, rocketProjectors: 36,
      navalVessels: 70, submarines: 6, destroyers: 0, frigates: 5, aircraftCarriers: 0, nuclearWarheads: 0,
      population: 5.4e6, landAreaKm2: 385207
    },
    sources: COMMON_SOURCES
  },
  {
    code: "SE", name: "Sweden", flagEmoji: "🇸🇪", region: "Scandinavia", continent: "Europe", alliances: ["NATO"],
    metrics: {
      activePersonnel: 24400, reservePersonnel: 32000, paramilitary: 0, defenseBudgetUsd: 7.9e9, gdpUsd: 0.585e12,
      aircraft: 205, fighterJets: 96, attackHelicopters: 0, transportHelicopters: 16,
      tanks: 121, armoredVehicles: 2600, selfPropelledArtillery: 48, rocketProjectors: 0,
      navalVessels: 65, submarines: 5, destroyers: 0, frigates: 7, aircraftCarriers: 0, nuclearWarheads: 0,
      population: 10.4e6, landAreaKm2: 450295
    },
    sources: COMMON_SOURCES
  },
  {
    code: "FI", name: "Finland", flagEmoji: "🇫🇮", region: "Scandinavia", continent: "Europe", alliances: ["NATO"],
    metrics: {
      activePersonnel: 24000, reservePersonnel: 870000, paramilitary: 0, defenseBudgetUsd: 4.8e9, gdpUsd: 0.281e12,
      aircraft: 160, fighterJets: 62, attackHelicopters: 0, transportHelicopters: 60,
      tanks: 200, armoredVehicles: 3200, selfPropelledArtillery: 48, rocketProjectors: 100,
      navalVessels: 50, submarines: 0, destroyers: 0, frigates: 0, aircraftCarriers: 0, nuclearWarheads: 0,
      population: 5.5e6, landAreaKm2: 338424
    },
    sources: COMMON_SOURCES
  },
  {
    code: "DK", name: "Denmark", flagEmoji: "🇩🇰", region: "Scandinavia", continent: "Europe", alliances: ["NATO"],
    metrics: {
      activePersonnel: 17200, reservePersonnel: 67000, paramilitary: 0, defenseBudgetUsd: 7.5e9, gdpUsd: 0.396e12,
      aircraft: 120, fighterJets: 45, attackHelicopters: 0, transportHelicopters: 14,
      tanks: 44, armoredVehicles: 700, selfPropelledArtillery: 0, rocketProjectors: 0,
      navalVessels: 57, submarines: 0, destroyers: 0, frigates: 9, aircraftCarriers: 0, nuclearWarheads: 0,
      population: 5.9e6, landAreaKm2: 43094
    },
    sources: COMMON_SOURCES
  },
  {
    code: "UA", name: "Ukraine", flagEmoji: "🇺🇦", region: "Eastern Europe", continent: "Europe", alliances: [],
    metrics: {
      activePersonnel: 900000, reservePersonnel: 1000000, paramilitary: 102000, defenseBudgetUsd: 44e9, gdpUsd: 0.16e12,
      aircraft: 312, fighterJets: 69, attackHelicopters: 33, transportHelicopters: 112,
      tanks: 2596, armoredVehicles: 12303, selfPropelledArtillery: 1067, rocketProjectors: 1017,
      navalVessels: 38, submarines: 0, destroyers: 0, frigates: 1, aircraftCarriers: 0, nuclearWarheads: 0,
      population: 43e6, landAreaKm2: 603550
    },
    sources: COMMON_SOURCES
  },
  {
    code: "PL", name: "Poland", flagEmoji: "🇵🇱", region: "Eastern Europe", continent: "Europe", alliances: ["NATO"],
    metrics: {
      activePersonnel: 120000, reservePersonnel: 0, paramilitary: 21400, defenseBudgetUsd: 28.8e9, gdpUsd: 0.69e12,
      aircraft: 452, fighterJets: 91, attackHelicopters: 28, transportHelicopters: 80,
      tanks: 569, armoredVehicles: 3100, selfPropelledArtillery: 531, rocketProjectors: 302,
      navalVessels: 86, submarines: 1, destroyers: 0, frigates: 2, aircraftCarriers: 0, nuclearWarheads: 0,
      population: 38e6, landAreaKm2: 312685
    },
    sources: COMMON_SOURCES
  },
  {
    code: "KP", name: "North Korea", flagEmoji: "🇰🇵", region: "East Asia", continent: "Asia", alliances: [],
    metrics: {
      activePersonnel: 1280000, reservePersonnel: 600000, paramilitary: 5700000, defenseBudgetUsd: 4e9, gdpUsd: 0.018e12,
      aircraft: 563, fighterJets: 82, attackHelicopters: 20, transportHelicopters: 50,
      tanks: 6000, armoredVehicles: 4000, selfPropelledArtillery: 4400, rocketProjectors: 2400,
      navalVessels: 492, submarines: 71, destroyers: 0, frigates: 2, aircraftCarriers: 0, nuclearWarheads: 40,
      population: 26e6, landAreaKm2: 120538
    },
    sources: COMMON_SOURCES
  }
];