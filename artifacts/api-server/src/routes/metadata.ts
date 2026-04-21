import { Router, type IRouter } from "express";
import { sql } from "drizzle-orm";
import { db, countriesTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/metadata/alliances", async (_req, res): Promise<void> => {
  // Use a specialized query to get distinct alliance strings from the jsonb array
  const result = await db.execute(sql`
    SELECT DISTINCT jsonb_array_elements_text(${countriesTable.alliances}) as alliance 
    FROM ${countriesTable}
    ORDER BY alliance
  `);
  
  const alliances = result.rows.map(row => row.alliance as string).filter(Boolean);
  res.json(alliances);
});

router.get("/metadata/regions", async (_req, res): Promise<void> => {
  // Get distinct continents and regions efficiently
  const continentsResult = await db.selectDistinct({ 
    continent: countriesTable.continent 
  }).from(countriesTable).orderBy(countriesTable.continent);
  
  const regionsResult = await db.selectDistinct({ 
    region: countriesTable.region 
  }).from(countriesTable).orderBy(countriesTable.region);

  res.json({
    continents: continentsResult.map(r => r.continent).filter(Boolean),
    regions: regionsResult.map(r => r.region).filter(Boolean),
  });
});

export default router;