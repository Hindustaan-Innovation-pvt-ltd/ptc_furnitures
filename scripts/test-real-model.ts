import { connectToDatabase } from "../src/lib/mongodb";
import { Product } from "../src/lib/db-models";

async function testReal() {
  console.log("Connecting...");
  await connectToDatabase();
  console.log("Connected.");

  const products = await Product.find().limit(3);
  const reorderIds = products.map(p => p.id);

  console.log("Reorder IDs:", reorderIds);

  const bulkOps = reorderIds.map((id, index) => ({
    updateOne: {
      filter: { id },
      update: { $set: { position: index } },
    },
  }));

  console.log("Running bulkWrite...");
  try {
    const result = await Product.bulkWrite(bulkOps);
    console.log("Success! bulkWrite result:", result);
  } catch (err) {
    console.error("bulkWrite threw error:", err);
  }
}

testReal().then(() => process.exit(0)).catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});
