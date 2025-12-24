import dotenv from 'dotenv';
import { Server } from 'http';

// Load environment variables from config.env
// If NODE_ENV is already set (by cross-env), it won't be overwritten
dotenv.config({ path: './config.env' });

// Validate required environment variables
const requiredEnvVars: string[] = [
  'DATABASE',
  'DATABASE_PASSWORD',
  'JWT_SECRET',
  'JWT_EXPIRES_IN',
  'JWT_COOKIE_EXPIRES_IN',
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingEnvVars.forEach(envVar => console.error(`   - ${envVar}`));
  console.error('\nPlease check your config.env file.');
  process.exit(1);
}

process.on('uncaughtException', (err: Error) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

import mongoose from 'mongoose';
import app from './app.js';

const DB = (process.env.DATABASE as string).replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD as string
);

mongoose.connect(DB).then(() => console.log('DB connection successful'));

const port = process.env.PORT || 3000;
const server: Server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});

interface NodeError extends Error {
  name: string;
  message: string;
}

process.on('unhandledRejection', (err: NodeError) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
