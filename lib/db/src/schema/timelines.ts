import { pgTable, serial, text, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const timelinesTable = pgTable("timelines", {
  id: serial("id").primaryKey(),
  countryCode: text("country_code").notNull(),
  year: integer("year").notNull(),
  defenseBudgetUsd: real("defense_budget_usd"),
  activePersonnel: integer("active_personnel"),
  gdpUsd: real("gdp_usd"),
});

export const insertTimelineSchema = createInsertSchema(timelinesTable).omit({ id: true });
export type InsertTimeline = z.infer<typeof insertTimelineSchema>;
export type Timeline = typeof timelinesTable.$inferSelect;
