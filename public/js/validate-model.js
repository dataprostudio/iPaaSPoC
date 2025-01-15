import { existsSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const modelPath = join(__dirname, '../Models/Llama-3.2-3B-GGUF/Llama-3.2-3B.Q4_K_M.gguf');

if (!existsSync(modelPath)) {
    console.error('Model file not found!');
    console.log('Please run: npm run download-model');
    process.exit(1);
}

const stats = statSync(modelPath);
const fileSizeGB = stats.size / (1024 * 1024 * 1024);
console.log(`Model file found (${fileSizeGB.toFixed(2)} GB)`);
process.exit(0);
