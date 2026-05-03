import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

import mongoose from 'mongoose';
import app from './app';

// Validate required env variables
const {
  DATABASE_STRING,
  DATABASE_PASSWORD,
  DATABASE_NAME,
  PORT
} = process.env;

if (!DATABASE_STRING || !DATABASE_PASSWORD || !DATABASE_NAME) {
  console.error('Missing required environment variables.');
  process.exit(1);
}

// Database connection
const connectToDatabase = async (): Promise<void> => {
  try {
    const db: string = DATABASE_STRING
      .replace('<PASSWORD>', DATABASE_PASSWORD)
      .replace('DB_NAME', DATABASE_NAME);
    await mongoose.connect(db);

    console.log(`App has been connected to the ${DATABASE_NAME} database`);
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

// Start the application
const startApp = async (): Promise<void> => {
  await connectToDatabase();

  const port: number = PORT ? parseInt(PORT, 10) : 8010;

  app.listen(port, () => {
    console.log(`App running on port: ${port}`);
  });
};

// Initialize the application
startApp();