import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env explicitly from the server directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const PORT = process.env.PORT || 5000;
export const GEMINI_API_KEY = (process.env.GEMINI_API_KEY || '').trim();