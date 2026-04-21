import { pgTable, serial, text, integer, real, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const timelinesTable = pgTable("timelines", {
  id: serial("id").primaryKey(),
  countryCode: text("country_code").notNull(),
  year: integer("year").notNull(),
  defenseBudgetUsd: real("defense_budget_usd"),
  activePersonnel: integer("active_personnel"),
  gdpUsd: real("gdp_usd"),
}, (table) => {
  return {
    countryCodeYearIdx: index("country_code_year_idx").on(table.countryCode, table.year),
  };
});

export const insertTimelineSchema = createInsertSchema(timelinesTable).omit({ id: true });
export type InsertTimeline = z.infer<typeof insertTimelineSchema>;
export type Timeline = typeof timelinesTable.$inferSelect;