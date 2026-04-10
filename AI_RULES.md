# AI Development Rules - STRATCOM.NET

## Tech Stack
- **Monorepo Architecture**: Managed with `pnpm` workspaces, separating the `api-server`, `military-strength` frontend, and shared `lib` packages.
- **Frontend**: React 19 with Vite and Tailwind CSS v4 for high-performance, utility-first styling.
- **Backend**: Express 5 on Node.js, providing a structured REST API.
- **Database**: PostgreSQL with Drizzle ORM for type-safe database interactions and migrations.
- **API Codegen**: OpenAPI 3.1 specifications processed by Orval to generate TanStack Query hooks and Zod schemas.
- **Data Fetching**: TanStack Query (React Query) for robust server-state management.
- **Routing**: Wouter for lightweight, hook-based client-side navigation.
- **Visualization**: Recharts for complex data displays like Radar and Area charts.
- **UI Components**: Shadcn UI primitives built on Radix UI for accessible, themed components.

## Library Usage Rules

### 1. UI & Styling
- **Components**: Always check `src/components/ui` first. Use Shadcn UI components for all standard interface elements.
- **Icons**: Use `lucide-react` exclusively for iconography.
- **Styling**: Use Tailwind CSS v4 utility classes. Avoid custom CSS files unless absolutely necessary for complex animations.
- **Themes**: The app is forced to `dark` mode. Use the defined CSS variables (e.g., `var(--primary)`) for consistent branding.

### 2. Data & API
- **API Calls**: Never write manual `fetch` or `axios` calls in components. Use the generated hooks from `@workspace/api-client-react`.
- **Validation**: Use the Zod schemas provided by `@workspace/api-zod` for form validation and data integrity.
- **Formatting**: Use the utility functions in `src/lib/format.ts` for numbers, currency, and compact displays to ensure consistency.

### 3. State & Logic
- **Server State**: Use TanStack Query for all data-fetching logic.
- **Routing**: Use `wouter` for navigation. Keep all route definitions in `src/App.tsx`.
- **Charts**: Use `recharts` for all data visualizations. Ensure charts are responsive by wrapping them in `ResponsiveContainer`.

### 4. Database
- **Schema**: Define all table structures in `lib/db/src/schema/`.
- **Queries**: Use the `db` instance from `@workspace/db` for all database operations.

## Development Workflow
- **Codegen**: If the API spec (`openapi.yaml`) changes, run `pnpm --filter @workspace/api-spec run codegen` to update hooks and types.
- **Seeding**: Use `pnpm --filter @workspace/scripts run seed` to reset the database with the latest military data.