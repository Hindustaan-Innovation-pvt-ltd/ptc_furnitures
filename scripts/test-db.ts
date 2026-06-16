import { readCatalogs, updateCatalog } from "../src/lib/catalogs";

async function run() {
  try {
    console.log("Reading catalogs...");
    const catalogs = await readCatalogs();
    console.log("Catalogs: ", catalogs);

    if (catalogs.length > 0) {
      const targetId = catalogs[0].id;
      console.log(`Setting catalog ${targetId} as default...`);
      const result = await updateCatalog(targetId, { isDefault: true });
      console.log("Update result: ", result);

      console.log("Reading catalogs again after update...");
      const catalogsAfter = await readCatalogs();
      console.log("Catalogs after: ", catalogsAfter);
    } else {
      console.log("No catalogs found to update.");
    }
  } catch (error) {
    console.error("Error running test:", error);
  } finally {
    process.exit(0);
  }
}

run();
