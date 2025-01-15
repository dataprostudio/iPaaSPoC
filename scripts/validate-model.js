import fs from 'fs';
import path from 'path';

const modelDir = path.resolve('models');

function validateModelDirectory() {
    if (fs.existsSync(modelDir)) {
        console.log(`Model directory exists at ${modelDir}`);
    } else {
        console.error(`Model directory does not exist at ${modelDir}`);
        process.exit(1);
    }
}

validateModelDirectory();
