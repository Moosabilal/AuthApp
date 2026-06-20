import mongoose from 'mongoose';
import { env } from './env';

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 5000;

export const connectDB = async (retryCount = 0): Promise<void> => {
  try {
    const conn = await mongoose.connect(env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`✅  MongoDB connected: ${conn.connection.host}`);

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️   MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('error', (err: Error) => {
      console.error('❌  MongoDB connection error:', err.message);
    });
  } catch (error) {
    const err = error as Error;
    console.error(
      `❌  MongoDB connection failed (attempt ${retryCount + 1}/${MAX_RETRIES}): ${err.message}`
    );

    if (retryCount < MAX_RETRIES - 1) {
      console.log(`🔄  Retrying in ${RETRY_DELAY_MS / 1000}s...`);
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      return connectDB(retryCount + 1);
    }

    console.error('💥  Could not connect to MongoDB after maximum retries. Exiting.');
    process.exit(1);
  }
};
