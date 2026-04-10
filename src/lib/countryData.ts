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
    code: "DE", name: "Germany", flagEmoji: "🇩🇪", region: "Western Europe",
    metrics: {
      activePersonnel: 181500, reservePersonnel: 34000, defenseBudgetUsd: 55.8e9, gdpUsd: 4.07e12,
      aircraft: 601, fighterJets: 134, attackHelicopters: 55, tanks: 266, armoredVehicles: 9217,
      navalVessels: 65, submarines: 6, aircraftCarriers: 0, nuclearWarheads: 0, population: 83e6, landAreaKm2: 357022
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
    code: "TR", name: "Turkey", flagEmoji: "🇹🇷", region: "Middle East",
    metrics: {
      activePersonnel: 355200, reservePersonnel: 378700, defenseBudgetUsd: 17.5e9, gdpUsd: 0.905e12,
      aircraft: 1069, fighterJets: 205, attackHelicopters: 107, tanks: 2229, armoredVehicles: 11256,
      navalVessels: 154, submarines: 12, aircraftCarriers: 1, nuclearWarheads: 0, population: 85e6, landAreaKm2: 783562
    }
  },
  {
    code: "PK", name: "Pakistan", flagEmoji: "🇵🇰", region: "South Asia",
    metrics: {
      activePersonnel: 654000, reservePersonnel: 550000, defenseBudgetUsd: 10.3e9, gdpUsd: 0.376e12,
      aircraft: 1413, fighterJets: 363, attackHelicopters: 57, tanks: 3742, armoredVehicles: 9935,
      navalVessels: 114, submarines: 9, aircraftCarriers: 0, nuclearWarheads: 170, population: 231e6, landAreaKm2: 881913
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
    code: "BR", name: "Brazil", flagEmoji: "🇧🇷", region: "South America",
    metrics: {
      activePersonnel: 360000, reservePersonnel: 1340000, defenseBudgetUsd: 21.8e9, gdpUsd: 2.08e12,
      aircraft: 665, fighterJets: 42, attackHelicopters: 12, tanks: 466, armoredVehicles: 2100,
      navalVessels: 112, submarines: 6, aircraftCarriers: 0, nuclearWarheads: 0, population: 214e6, landAreaKm2: 8515767
    }
  },
  {
    code: "IT", name: "Italy", flagEmoji: "🇮🇹", region: "Western Europe",
    metrics: {
      activePersonnel: 165500, reservePersonnel: 18300, defenseBudgetUsd: 32.1e9, gdpUsd: 2.1e12,
      aircraft: 850, fighterJets: 209, attackHelicopters: 59, tanks: 200, armoredVehicles: 6800,
      navalVessels: 184, submarines: 8, aircraftCarriers: 2, nuclearWarheads: 0, population: 59e6, landAreaKm2: 301340
    }
  },
  {
    code: "AU", name: "Australia", flagEmoji: "🇦🇺", region: "Oceania",
    metrics: {
      activePersonnel: 60000, reservePersonnel: 30000, defenseBudgetUsd: 32e9, gdpUsd: 1.7e12,
      aircraft: 450, fighterJets: 100, attackHelicopters: 57, tanks: 60, armoredVehicles: 3000,
      navalVessels: 50, submarines: 6, aircraftCarriers: 0, nuclearWarheads: 0, population: 26e6, landAreaKm2: 7692024
    }
  },
  {
    code: "CA", name: "Canada", flagEmoji: "🇨🇦", region: "North America",
    metrics: {
      activePersonnel: 68000, reservePersonnel: 30000, defenseBudgetUsd: 22e9, gdpUsd: 2.1T,
      aircraft: 400, fighterJets: 80, attackHelicopters: 21, tanks: 80, armoredVehicles: 1700,
      navalVessels: 60, submarines: 4, aircraftCarriers: 0, nuclearWarheads: 0, population: 38e6, landAreaKm2: 9984670
    }
  },
  {
    code: "EG", name: "Egypt", flagEmoji: "🇪🇬", region: "North Africa",
    metrics: {
      activePersonnel: 440000, reservePersonnel: 480000, defenseBudgetUsd: 4.6e9, gdpUsd: 475e9,
      aircraft: 1000, fighterJets: 290, attackHelicopters: 46, tanks: 4000, armoredVehicles: 12000,
      navalVessels: 300, submarines: 8, aircraftCarriers: 2, nuclearWarheads: 0, population: 105e6, landAreaKm2: 1002450
    }
  },
  {
    code: "SA", name: "Saudi Arabia", flagEmoji: "🇸🇦", region: "Middle East",
    metrics: {
      activePersonnel: 250000, reservePersonnel: 0, defenseBudgetUsd: 75e9, gdpUsd: 1.06e12,
      aircraft: 800, fighterJets: 270, attackHelicopters: 43, tanks: 1000, armoredVehicles: 6000,
      navalVessels: 50, submarines: 0, aircraftCarriers: 0, nuclearWarheads: 0, population: 35e6, landAreaKm2: 2149690
    }
  },
  {
    code: "ES", name: "Spain", flagEmoji: "🇪🇸", region: "Western Europe",
    metrics: {
      activePersonnel: 120000, reservePersonnel: 15000, defenseBudgetUsd: 17e9, gdpUsd: 1.42e12,
      aircraft: 500, fighterJets: 130, attackHelicopters: 24, tanks: 300, armoredVehicles: 2700,
      navalVessels: 60, submarines: 3, aircraftCarriers: 1, nuclearWarheads: 0, population: 47e6, landAreaKm2: 505990
    }
  },
  {
    code: "MX", name: "Mexico", flagEmoji: "🇲🇽", region: "North America",
    metrics: {
      activePersonnel: 270000, reservePersonnel: 80000, defenseBudgetUsd: 8e9, gdpUsd: 1.32e12,
      aircraft: 400, fighterJets: 0, attackHelicopters: 70, tanks: 0, armoredVehicles: 850,
      navalVessels: 200, submarines: 0, aircraftCarriers: 0, nuclearWarheads: 0, population: 130e6, landAreaKm2: 1964375
    }
  },
  {
    code: "NO", name: "Norway", flagEmoji: "🇳🇴", region: "Scandinavia",
    metrics: {
      activePersonnel: 23250, reservePersonnel: 40000, defenseBudgetUsd: 8.2e9, gdpUsd: 0.579e12,
      aircraft: 150, fighterJets: 57, attackHelicopters: 0, tanks: 36, armoredVehicles: 800,
      navalVessels: 70, submarines: 6, aircraftCarriers: 0, nuclearWarheads: 0, population: 5.4e6, landAreaKm2: 385207
    }
  },
  {
    code: "SE", name: "Sweden", flagEmoji: "🇸🇪", region: "Scandinavia",
    metrics: {
      activePersonnel: 24400, reservePersonnel: 32000, defenseBudgetUsd: 7.9e9, gdpUsd: 0.585e12,
      aircraft: 205, fighterJets: 96, attackHelicopters: 0, tanks: 121, armoredVehicles: 2600,
      navalVessels: 65, submarines: 5, aircraftCarriers: 0, nuclearWarheads: 0, population: 10.4e6, landAreaKm2: 450295
    }
  },
  {
    code: "FI", name: "Finland", flagEmoji: "🇫🇮", region: "Scandinavia",
    metrics: {
      activePersonnel: 24000, reservePersonnel: 870000, defenseBudgetUsd: 4.8e9, gdpUsd: 0.281e12,
      aircraft: 160, fighterJets: 62, attackHelicopters: 0, tanks: 200, armoredVehicles: 3200,
      navalVessels: 50, submarines: 0, aircraftCarriers: 0, nuclearWarheads: 0, population: 5.5e6, landAreaKm2: 338424
    }
  },
  {
    code: "DK", name: "Denmark", flagEmoji: "🇩🇰", region: "Scandinavia",
    metrics: {
      activePersonnel: 17200, reservePersonnel: 67000, defenseBudgetUsd: 7.5e9, gdpUsd: 0.396e12,
      aircraft: 120, fighterJets: 45, attackHelicopters: 0, tanks: 44, armoredVehicles: 700,
      navalVessels: 57, submarines: 0, aircraftCarriers: 0, nuclearWarheads: 0, population: 5.9e6, landAreaKm2: 43094
    }
  },
  {
    code: "UA", name: "Ukraine", flagEmoji: "🇺🇦", region: "Eastern Europe",
    metrics: {
      activePersonnel: 900000, reservePersonnel: 1000000, defenseBudgetUsd: 44e9, gdpUsd: 0.16e12,
      aircraft: 312, fighterJets: 69, attackHelicopters: 33, tanks: 2596, armoredVehicles: 12303,
      navalVessels: 38, submarines: 0, aircraftCarriers: 0, nuclearWarheads: 0, population: 43e6, landAreaKm2: 603550
    }
  },
  {
    code: "PL", name: "Poland", flagEmoji: "🇵🇱", region: "Eastern Europe",
    metrics: {
      activePersonnel: 120000, reservePersonnel: 0, defenseBudgetUsd: 28.8e9, gdpUsd: 0.69e12,
      aircraft: 452, fighterJets: 91, attackHelicopters: 28, tanks: 569, armoredVehicles: 3100,
      navalVessels: 86, submarines: 1, aircraftCarriers: 0, nuclearWarheads: 0, population: 38e6, landAreaKm2: 312685
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