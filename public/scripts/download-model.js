import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { get } from 'https';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const modelDir = join(__dirname, '../Models/Llama-3.2-3B-GGUF');
const modelPath = join(modelDir, 'Llama-3.2-3B.Q4_K_M.gguf');
const modelUrl = 'https://huggingface.co/QuantFactory/Llama-3.2-3B-GGUF/Llama-3.2-3B.Q4_K_M.gguf';

if (!existsSync(modelDir)) {
    mkdirSync(modelDir, { recursive: true });
}

console.log('Downloading model...');
console.log(`From: ${modelUrl}`);
console.log(`To: ${modelPath}`);

const file = createWriteStream(modelPath);
get(modelUrl, (response) => {
    const total = parseInt(response.headers['content-length'], 10);
    let current = 0;

    response.on('data', (chunk) => {
        current += chunk.length;
        const progress = (current / total) * 100;
        process.stdout.write(`Progress: ${progress.toFixed(2)}%\r`);
    });

    response.pipe(file);
});

file.on('finish', () => {
    console.log('\nModel download completed!');
    file.close();
});

file.on('error', (err) => {
    console.error('Error downloading model:', err);
    process.exit(1);
});
