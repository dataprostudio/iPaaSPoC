import fs from 'fs';
import path from 'path';

const modelDir = path.resolve('models');

if (!fs.existsSync(modelDir)) {
    fs.mkdirSync(modelDir, { recursive: true });
    console.log(`Created model directory at ${modelDir}`);
} else {
    console.log(`Model directory already exists at ${modelDir}`);
}
