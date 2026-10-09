import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import User from '../models/User.js';
import StudentProfile from '../models/StudentProfile.js';
import { generateDemoStudents } from '../data/demoStudents.js';

dotenv.config();

async function seedStudents() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) throw new Error('Set MONGODB_URI in backend/.env before seeding');

  await mongoose.connect(uri);
  await User.init();
  await StudentProfile.init();

  const students = generateDemoStudents();
  const passwordHashes = new Map();
  const operations = [];
  const profileOperations = [];
  for (const student of students) {
    let passwordHash = passwordHashes.get(student.password);
    if (!passwordHash) {
      passwordHash = await bcrypt.hash(student.password, 12);
      passwordHashes.set(student.password, passwordHash);
    }
    const { password, profileStatistics, ...fields } = student;
    operations.push({
      updateOne: {
        filter: { registrationNumber: fields.registrationNumber },
        update: { $setOnInsert: { ...fields, password: passwordHash } },
        upsert: true,
      },
    });
  }

  const result = await User.bulkWrite(operations, { ordered: false });
  const seededUsers = await User.find({
    isSeeded: true,
    registrationNumber: { $in: students.map((student) => student.registrationNumber) },
  }).select('_id registrationNumber').lean();
  const profileByRegistration = new Map(students.map((student) => [student.registrationNumber, student.profileStatistics]));
  for (const user of seededUsers) {
    const statistics = profileByRegistration.get(user.registrationNumber);
    profileOperations.push({
      updateOne: {
        filter: { userId: user._id },
        update: { $setOnInsert: { userId: user._id, riskLevel: statistics.riskLevel, riskReason: statistics.riskReason, statistics } },
        upsert: true,
      },
    });
  }
  if (profileOperations.length) await StudentProfile.bulkWrite(profileOperations, { ordered: false });

  const collegeCounts = await User.aggregate([
    { $match: { isSeeded: true, registrationNumber: { $in: students.map((student) => student.registrationNumber) } } },
    { $group: { _id: '$college', count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);
  const count = await User.countDocuments({
    isSeeded: true,
    registrationNumber: { $in: students.map((student) => student.registrationNumber) },
  });

  console.info(`Generated ${students.length} synthetic student records.`);
  console.info(`New student records inserted: ${result.upsertedCount}; existing seeded records preserved.`);
  console.info(`Verified existing seed cohort count: ${count}.`);
  for (const college of collegeCounts) console.info(`${college._id}: ${college.count}`);
  if (count !== 1000 || collegeCounts.length !== 10 || collegeCounts.some((college) => college.count !== 100)) {
    throw new Error('Seed cohort verification failed. Existing records were not deleted or overwritten.');
  }
}

seedStudents()
  .catch((error) => {
    console.error('Student seed failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
