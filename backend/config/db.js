import mongoose from 'mongoose';

export const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!mongoURI) {
    throw new Error('MONGODB_URI is required. Copy backend/.env.example to backend/.env and configure it.');
  }

  await mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 5000 });
  console.info('Connected to MongoDB');
};






