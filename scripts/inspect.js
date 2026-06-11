const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ProductSchema = new Schema({
  id: String,
  brand: String,
  images: [String],
  name: String,
  tag: String,
  customFields: [{ label: String, value: String }],
  premium: Boolean
});

const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);

async function main() {
  await mongoose.connect('mongodb://ptcfurnitures.com:27017/ptc_furnitures');
  console.log("Connected to MongoDB.");
  
  const products = await Product.find().lean();
  console.log(`Found ${products.length} products.`);
  
  const tags = new Set();
  const fields = [];
  
  products.forEach(p => {
    if (p.tag) tags.add(p.tag);
    if (p.customFields && p.customFields.length > 0) {
      fields.push({ name: p.name, fields: p.customFields });
    }
    console.log(`- Product: ${p.name || 'Unnamed'}, Brand: ${p.brand}, Tag: ${p.tag || 'No Tag'}, Premium: ${p.premium || false}`);
  });
  
  console.log("All Unique Tags:", Array.from(tags));
  console.log("Products with custom fields:", JSON.stringify(fields, null, 2));
  
  await mongoose.disconnect();
}

main().catch(console.error);
