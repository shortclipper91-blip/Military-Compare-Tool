import { Router, type IRouter } from "express";
import { db, countriesTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/metadata/alliances", async (_req, res): Promise<void> => {
  const countries = await db.select({ alliances: countriesTable.alliances }).from(countriesTable);
  const allianceSet = new Set<string>();
  for (const c of countries) {
    const alliances = c.alliances as string[];
    for (const a of alliances) {
      if (a) allianceSet.add(a);
    }
  }
  res.json([...allianceSet].sort());
});

router.get("/metadata/regions", async (_req, res): Promise<void> => {
  const countries = await db.select({
    continent: countriesTable.continent,
    region: countriesTable.region,
  }).from(countriesTable);

  const continentSet = new Set<string>();
  const regionSet = new Set<string>();
  for (const c of countries) {
    if (c.continent) continentSet.add(c.continent);
    if (c.region) regionSet.add(c.region);
  }

  res.json({
    continents: [...continentSet].sort(),
    regions: [...regionSet].sort(),
  });
});

export default router;
