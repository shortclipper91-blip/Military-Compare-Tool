import { pgTable, text, serial, real, bigint, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const countriesTable = pgTable("countries", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  flagEmoji: text("flag_emoji").notNull(),
  continent: text("continent").notNull(),
  region: text("region").notNull(),
  alliances: jsonb("alliances").notNull().$type<string[]>().default([]),
  activePersonnel: bigint("active_personnel", { mode: "number" }),
  reservePersonnel: bigint("reserve_personnel", { mode: "number" }),
  paramilitary: bigint("paramilitary", { mode: "number" }),
  defenseBudgetUsd: real("defense_budget_usd"),
  gdpUsd: real("gdp_usd"),
  population: bigint("population", { mode: "number" }),
  landAreaKm2: real("land_area_km2"),
  aircraft: bigint("aircraft", { mode: "number" }),
  fighterJets: bigint("fighter_jets", { mode: "number" }),
  attackHelicopters: bigint("attack_helicopters", { mode: "number" }),
  transportHelicopters: bigint("transport_helicopters", { mode: "number" }),
  tanks: bigint("tanks", { mode: "number" }),
  armoredVehicles: bigint("armored_vehicles", { mode: "number" }),
  selfPropelledArtillery: bigint("self_propelled_artillery", { mode: "number" }),
  rocketProjectors: bigint("rocket_projectors", { mode: "number" }),
  navalVessels: bigint("naval_vessels", { mode: "number" }),
  submarines: bigint("submarines", { mode: "number" }),
  destroyers: bigint("destroyers", { mode: "number" }),
  frigates: bigint("frigates", { mode: "number" }),
  aircraftCarriers: bigint("aircraft_carriers", { mode: "number" }),
  nuclearWarheads: bigint("nuclear_warheads", { mode: "number" }),
  dataSources: jsonb("data_sources").notNull().$type<Array<{metric: string; source: string; confidence: string; lastUpdated: string}>>().default([]),
}, (table) => {
  return {
    continentIdx: index("continent_idx").on(table.continent),
    regionIdx: index("region_idx").on(table.region),
    nameIdx: index("name_idx").on(table.name),
  };
});

export const insertCountrySchema = createInsertSchema(countriesTable).omit({ id: true });
export type InsertCountry = z.infer<typeof insertCountrySchema>;
export type Country = typeof countriesTable.$inferSelect;