import { db, countriesTable, timelinesTable } from "@workspace/db";
import { COUNTRIES_SEED, TIMELINES_SEED } from "../../artifacts/api-server/src/lib/countryData";

async function seed() {
  console.log("Seeding countries...");

  await db.delete(timelinesTable);
  await db.delete(countriesTable);

  for (const country of COUNTRIES_SEED) {
    await db.insert(countriesTable).values({
      code: country.code,
      name: country.name,
      flagEmoji: country.flagEmoji,
      continent: country.continent,
      region: country.region,
      alliances: country.alliances,
      activePersonnel: country.activePersonnel,
      reservePersonnel: country.reservePersonnel,
      paramilitary: country.paramilitary,
      defenseBudgetUsd: country.defenseBudgetUsd,
      gdpUsd: country.gdpUsd,
      population: country.population,
      landAreaKm2: country.landAreaKm2,
      aircraft: country.aircraft,
      fighterJets: country.fighterJets,
      attackHelicopters: country.attackHelicopters,
      transportHelicopters: country.transportHelicopters,
      tanks: country.tanks,
      armoredVehicles: country.armoredVehicles,
      selfPropelledArtillery: country.selfPropelledArtillery,
      rocketProjectors: country.rocketProjectors,
      navalVessels: country.navalVessels,
      submarines: country.submarines,
      destroyers: country.destroyers,
      frigates: country.frigates,
      aircraftCarriers: country.aircraftCarriers,
      nuclearWarheads: country.nuclearWarheads,
      dataSources: country.dataSources,
    }).onConflictDoNothing();
  }

  console.log(`Seeded ${COUNTRIES_SEED.length} countries`);

  for (const entry of TIMELINES_SEED) {
    await db.insert(timelinesTable).values(entry).onConflictDoNothing();
  }

  console.log(`Seeded ${TIMELINES_SEED.length} timeline entries`);
  console.log("Done!");
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
