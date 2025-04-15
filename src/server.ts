import dotenv from 'dotenv';
dotenv.config();

import { buildApp } from './app';

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';

const start = async () => {
  try {
    const app = await buildApp();
    await app.listen({ port: PORT, host: HOST });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
};

start();