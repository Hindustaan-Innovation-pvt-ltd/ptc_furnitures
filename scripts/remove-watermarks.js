const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

async function main() {
  await mongoose.connect('mongodb://admin:PtcPassword123%40@127.0.0.1:27017/ptc_furnitures?authSource=admin');
  const products = await mongoose.connection.db.collection('products').find().toArray();
  let updated = 0;
  for (const p of products) {
    if (p.originalImages && p.originalImages.length > 0) {
      await mongoose.connection.db.collection('products').updateOne(
        { _id: p._id },
        { $set: { images: p.originalImages } }
      );
      updated++;
    }
  }
  console.log(`Updated ${updated} products in MongoDB!`);

  // Update backup file data/furnitures.products.json
  const dataPath = path.join(process.cwd(), 'data', 'furnitures.products.json');
  if (fs.existsSync(dataPath)) {
    const raw = fs.readFileSync(dataPath, 'utf-8');
    const json = JSON.parse(raw);
    let jsonUpdated = 0;
    for (const item of json) {
      if (item.originalImages && item.originalImages.length > 0) {
        item.images = item.originalImages;
        jsonUpdated++;
      }
    }
    fs.writeFileSync(dataPath, JSON.stringify(json, null, 2), 'utf-8');
    console.log(`Updated ${jsonUpdated} products in data/furnitures.products.json!`);
  }

  await mongoose.disconnect();
}

main().catch(console.error);
