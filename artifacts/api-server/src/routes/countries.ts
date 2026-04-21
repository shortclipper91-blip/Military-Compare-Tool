import { Router, type IRouter } from "express";
import { eq, and, sql } from "drizzle-orm";
import { db, countriesTable, timelinesTable } from "@workspace/db";
import {
  ListCountriesQueryParams,
  GetCountryParams,
  GetCountryTimelineParams,
} from "@workspace/api-zod";
import { countryToApiFormat } from "../lib/scoring";

const router: IRouter = Router();

router.get("/countries", async (req, res): Promise<void> => {
  const parsed = ListCountriesQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const conditions = [];
  if (parsed.data.continent) {
    conditions.push(eq(countriesTable.continent, parsed.data.continent));
  }
  if (parsed.data.region) {
    conditions.push(eq(countriesTable.region, parsed.data.region));
  }
  if (parsed.data.alliance) {
    conditions.push(sql`${countriesTable.alliances} @> ${JSON.stringify([parsed.data.alliance])}::jsonb`);
  }

  const countries = await db
    .select()
    .from(countriesTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(countriesTable.name);

  res.json(countries.map(countryToApiFormat));
});

router.get("/countries/:code", async (req, res): Promise<void> => {
  const params = GetCountryParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [country] = await db
    .select()
    .from(countriesTable)
    .where(eq(countriesTable.code, params.data.code));

  if (!country) {
    res.status(404).json({ error: "Country not found" });
    return;
  }

  res.json(countryToApiFormat(country));
});

router.get("/countries/:code/timeline", async (req, res): Promise<void> => {
  const params = GetCountryTimelineParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const timeline = await db
    .select()
    .from(timelinesTable)
    .where(eq(timelinesTable.countryCode, params.data.code))
    .orderBy(timelinesTable.year);

  if (timeline.length === 0) {
    // Check if country even exists
    const [country] = await db
      .select()
      .from(countriesTable)
      .where(eq(countriesTable.code, params.data.code));
    
    if (!country) {
      res.status(404).json({ error: "Country not found" });
      return;
    }
  }

  res.json(timeline.map(t => ({
    year: t.year,
    defenseBudgetUsd: t.defenseBudgetUsd,
    activePersonnel: t.activePersonnel,
    gdpUsd: t.gdpUsd,
  })));
});

export default router;