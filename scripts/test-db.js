const mongoose = require('mongoose');

const MONGODB_URI = "mongodb://ptcfurnitures.com:27017/ptc_furnitures";

async function run() {
  console.log("Connecting to:", MONGODB_URI);
  await mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
  });
  console.log("Connected successfully.");

  const ProductSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    brand: { type: String, default: "" },
    position: { type: Number, default: 0 },
  }, { strict: false });

  const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);

  // Get a few products
  const products = await Product.find().limit(3);
  console.log("Found products:", products.map(p => ({ id: p.id, name: p.name, position: p.position })));

  if (products.length > 0) {
    const bulkOps = products.map((p, index) => ({
      updateOne: {
        filter: { id: p.id },
        update: { $set: { position: index } },
      },
    }));

    console.log("Running bulkWrite with ops:", JSON.stringify(bulkOps, null, 2));
    const result = await Product.bulkWrite(bulkOps);
    console.log("bulkWrite success result:", result);
  }

  await mongoose.disconnect();
  console.log("Disconnected.");
}

run().catch(err => {
  console.error("Error encountered:", err);
  process.exit(1);
});
