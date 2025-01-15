import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs/promises';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Configure multer for file uploads
const upload = multer({
    dest: 'uploads/',
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

app.use(express.static('public'));
app.use('/static', express.static('public/static'));

async function processWithPythonModel(input) {
    return new Promise((resolve, reject) => {
        console.log('Starting Python process...');
        const pythonPath = 'D:\\Program Files\\Python\\Python312\\python.exe';
        const pythonProcess = spawn(pythonPath, ['model_service.py'], {
            stdio: ['pipe', 'pipe', 'pipe']
        });
        
        let outputData = '';
        let errorData = '';

        pythonProcess.stdout.on('data', (data) => {
            console.log('Python stdout:', data.toString());
            outputData += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            console.error('Python stderr:', data.toString());
            errorData += data.toString();
        });

        pythonProcess.on('error', (error) => {
            console.error('Failed to start Python process:', error);
            reject(error);
        });

        pythonProcess.on('close', (code) => {
            console.log(`Python process exited with code ${code}`);
            if (code !== 0) {
                reject(new Error(`Python process failed: ${errorData}`));
                return;
            }
            try {
                const result = JSON.parse(outputData);
                if (result.error) {
                    reject(new Error(result.error));
                    return;
                }
                resolve(result);
            } catch (error) {
                reject(new Error(`Failed to parse Python output: ${error.message}\nOutput: ${outputData}`));
            }
        });

        // Send input to Python script
        pythonProcess.stdin.write(input);
        pythonProcess.stdin.end();
    });
}

app.post('/generate', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            throw new Error('No file uploaded');
        }

        const fileContent = await fs.readFile(req.file.path, 'utf8');
        const processData = await processWithPythonModel(fileContent);

        res.json({
            success: true,
            message: 'File processed successfully',
            filename: req.file.filename,
            data: processData,
            bottlenecks: [],
            optimization: 'Processed with Hugging Face Transformers'
        });

    } catch (error) {
        console.error('Processing error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
