import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Vehicle from '../models/Vehicle.js';

dotenv.config();

async function migrate() {
  const mongoUri =
    process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pehra';
  console.log(`Connecting to MongoDB at ${mongoUri}...`);
  await mongoose.connect(mongoUri);

  console.log('Migrating deleted vehicle records...');
  const deletedVehicles = await Vehicle.find(
    { status: 'DELETED' },
    null,
    { includeDeleted: true },
  );

  let updatedCount = 0;
  for (const v of deletedVehicles) {
    let modified = false;

    // 1. Ensure isDeleted flag
    if (!v.isDeleted) {
      v.isDeleted = true;
      modified = true;
    }

    // 2. Backfill deletedAt (best-effort: use updatedAt)
    if (!v.deletedAt) {
      v.deletedAt = v.updatedAt || new Date();
      modified = true;
    }

    // 3. Restore mangled identifiers
    if (v.vehicleNumber?.includes('_DEL_')) {
      v.vehicleNumber = v.vehicleNumber.split('_DEL_')[0];
      modified = true;
    }
    if (v.chassisNumber?.includes('_DEL_')) {
      v.chassisNumber = v.chassisNumber.split('_DEL_')[0];
      modified = true;
    }
    if (v.engineNumber?.includes('_DEL_')) {
      v.engineNumber = v.engineNumber.split('_DEL_')[0];
      modified = true;
    }

    if (modified) {
      await v.save();
      updatedCount++;
    }
  }

  console.log(`Migrated ${updatedCount} deleted vehicle record(s).`);

  // 4. Safer than syncIndexes() — only creates, never drops
  console.log('Ensuring partial unique indexes...');
  await Vehicle.createIndexes();
  console.log('Indexes ensured.');

  // 5. Explicitly drop known legacy indexes (safe if already gone)
  for (const name of ['vehicleNumber_1', 'chassisNumber_1', 'engineNumber_1']) {
    try {
      await Vehicle.collection.dropIndex(name);
      console.log(`Dropped legacy index: ${name}`);
    } catch (err) {
      if (err.codeName !== 'IndexNotFound') throw err;
      // silently ignore — already gone
    }
  }

  await mongoose.disconnect();
  console.log('Migration completed cleanly.');
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});