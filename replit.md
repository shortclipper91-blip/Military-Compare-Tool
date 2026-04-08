# Military Strength Comparator

## Overview

A full-stack military intelligence dashboard for comparing national armed forces. Users select countries and compare capabilities using interactive charts, a custom Military Strength Index with adjustable weights, coalition mode, and historical timeline charts.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite (artifacts/military-strength)
- **API framework**: Express 5 (artifacts/api-server)
- **Database**: PostgreSQL + Drizzle ORM
- **Charts**: Recharts (RadarChart, BarChart, LineChart)
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Features

1. **Head-to-Head Comparison** — Select two countries, get radar chart + bar chart + advantage banners + Military Strength Index with adjustable category weights
2. **Scenario Modes** — Full Spectrum / Air Superiority / Naval Dominance / Ground War
3. **Coalition Builder** — Build Team A vs Team B by combining countries, compare combined totals
4. **Historical Timeline** — Line charts of defense spending / active personnel since 1995
5. **Region/Alliance Filters** — Filter countries by continent, region, or alliance (NATO, AUKUS, etc.)
6. **Data Transparency** — Each metric shows source, confidence level, and last updated date
7. **Dark mode** — Default dark theme with amber/gold accent colors

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/scripts run seed` — reseed the database with country data

## Country Data

24 countries included: USA, Russia, China, India, UK, France, Germany, Japan, South Korea, Turkey, Pakistan, Israel, Saudi Arabia, Brazil, Italy, Norway, Sweden, Finland, Poland, Ukraine, Australia, Canada, North Korea, Egypt.

Data sourced from SIPRI, IISS Military Balance, Global Firepower, FAS Nuclear Notebook (2023-2024).

## API Endpoints

- `GET /api/countries` — list all countries (filter by continent, alliance, region)
- `GET /api/countries/:code` — get a single country
- `GET /api/countries/:code/timeline` — historical spending/personnel data
- `POST /api/comparison` — compare 2+ countries with weights and scenario
- `POST /api/comparison/coalitions` — compare two multi-country coalitions
- `GET /api/metadata/alliances` — list all alliances
- `GET /api/metadata/regions` — list all continents and regions

## DB Schema

- `countries` — military metrics, economy data, alliances, data sources
- `timelines` — historical yearly data per country
