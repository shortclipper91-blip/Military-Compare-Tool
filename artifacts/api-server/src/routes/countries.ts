import { Router, type IRouter } from "express";
import { eq, inArray } from "drizzle-orm";
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

  let query = db.select().from(countriesTable);
  const conditions = [];
  if (parsed.data.continent) {
    conditions.push(eq(countriesTable.continent, parsed.data.continent));
  }
  if (parsed.data.region) {
    conditions.push(eq(countriesTable.region, parsed.data.region));
  }

  const countries = await query.orderBy(countriesTable.name);

  let filtered = countries;
  if (parsed.data.continent) {
    filtered = filtered.filter(c => c.continent === parsed.data.continent);
  }
  if (parsed.data.region) {
    filtered = filtered.filter(c => c.region === parsed.data.region);
  }
  if (parsed.data.alliance) {
    filtered = filtered.filter(c => {
      const alliances = c.alliances as string[];
      return alliances.includes(parsed.data.alliance!);
    });
  }

  res.json(filtered.map(countryToApiFormat));
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

  const [country] = await db
    .select()
    .from(countriesTable)
    .where(eq(countriesTable.code, params.data.code));

  if (!country) {
    res.status(404).json({ error: "Country not found" });
    return;
  }

  const timeline = await db
    .select()
    .from(timelinesTable)
    .where(eq(timelinesTable.countryCode, params.data.code))
    .orderBy(timelinesTable.year);

  res.json(timeline.map(t => ({
    year: t.year,
    defenseBudgetUsd: t.defenseBudgetUsd,
    activePersonnel: t.activePersonnel,
    gdpUsd: t.gdpUsd,
  })));
});

export default router;
