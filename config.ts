import * as dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

// Helper to get env var with default and optional parsing
function getEnv(key: string, defaultValue: string): string {
  return process.env[key] ?? defaultValue;
}

export const CONFIG = {
  PORT: Number(getEnv('PORT', '3000')),
  MODEL_PATH: getEnv('MODEL_PATH', path.resolve('best.pt')),
  DATABASE_PATH: getEnv('DATABASE_PATH', path.resolve('database')),
  LOG_DIRECTORY: getEnv('LOG_DIRECTORY', path.resolve('logs')),
  CONFIDENCE_THRESHOLD: Number(getEnv('CONFIDENCE_THRESHOLD', '0.70')),
  MAX_UPLOAD_SIZE: getEnv('MAX_UPLOAD_SIZE', '10mb')
};

// Ensure required directories exist at startup
export function ensureStartupPaths() {
  const dirs = [CONFIG.DATABASE_PATH, CONFIG.LOG_DIRECTORY];
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      try {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`Created missing directory: ${dir}`);
      } catch (e) {
        console.warn(`Unable to create directory ${dir}:`, e);
      }
    }
  }
  // Warn if model path missing
  if (!fs.existsSync(CONFIG.MODEL_PATH)) {
    console.warn(`Warning: Model file not found at ${CONFIG.MODEL_PATH}. Ensure it exists before inference.`);
  }
}
