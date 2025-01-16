import express from 'express';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs/promises';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Configure multer for file uploads
const upload = multer({
    dest: 'uploads/',
    limits: { fileSize: 5 * 1024 * 1024 }
});

app.use(express.static('public'));

async function processWithOllama(input) {
    try {
        console.log('Sending request to Ollama API...');
        const response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: "custom-model",
                prompt: `Analyze this process and extract workflow nodes and connections:\n${input}`,
                stream: false
            })
        });

        const data = await response.json();
        console.log('Raw Ollama response:', data);

        return {
            analysis: data.response,
            workflow: {
                nodes: [
                    { id: 1, label: "Start" },
                    { id: 2, label: data.response.slice(0, 50) }
                ],
                edges: [{ from: 1, to: 2 }]
            }
        };
    } catch (error) {
        console.error('Detailed Ollama error:', error);
        throw error;
    }
}

app.post('/generate', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            throw new Error('No file uploaded');
        }

        const fileContent = await fs.readFile(req.file.path, 'utf8');
        console.log('File content received:', fileContent.slice(0, 100) + '...');
        console.log('Processing with Ollama...');
        
        const result = await processWithOllama(fileContent);
        console.log('Analysis content:', result.analysis);

        res.json({
            success: true,
            message: 'File processed successfully',
            data: result.workflow,
            analysis: result.analysis,
            rawResponse: result
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
