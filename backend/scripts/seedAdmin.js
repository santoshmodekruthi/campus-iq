import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';

dotenv.config();

async function seedAdmin() {
  const { MONGODB_URI, MONGO_URI, ADMIN_USERNAME, ADMIN_PASSWORD } = process.env;
  if (!(MONGODB_URI || MONGO_URI)) throw new Error('Set MONGODB_URI in backend/.env before seeding');
  if (!ADMIN_USERNAME || !ADMIN_PASSWORD) throw new Error('Set ADMIN_USERNAME and ADMIN_PASSWORD in backend/.env before seeding');
  if (ADMIN_PASSWORD.length < 12) throw new Error('ADMIN_PASSWORD must be at least 12 characters');

  await mongoose.connect(MONGODB_URI || MONGO_URI);
  await User.init();
  const existing = await User.findOne({ role: 'admin', username: ADMIN_USERNAME.trim() }).select('_id');
  if (existing) {
    console.info('Administrator already exists; credentials and record were left unchanged.');
    return;
  }

  await User.create({
    name: 'Campus IQ Administrator',
    email: `admin+${encodeURIComponent(ADMIN_USERNAME.trim())}@campus-iq.invalid`,
    username: ADMIN_USERNAME.trim(),
    password: ADMIN_PASSWORD,
    role: 'admin',
  });
  console.info('Initial administrator created. The password was not displayed.');
}

seedAdmin()
  .catch((error) => {
    console.error('Admin seed failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
