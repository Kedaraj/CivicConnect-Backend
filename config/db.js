import mongoose from "mongoose";

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('❌ MONGO_URI not set! Check your environment variables.');
    return;
  }
  console.log('🔄 Connecting to MongoDB...');
  console.log('   URI prefix:', uri.substring(0, 30) + '...');
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`❌ MongoDB error: ${err.message}`);
    console.error('   Retrying in 5 seconds...');
    setTimeout(connectDB, 5000);
  }
};

export default connectDB;
