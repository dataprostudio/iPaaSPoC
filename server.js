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
app.use(express.json());

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

// Function to process with Ollama
async function processWithOllama(input) {
    try {
        console.log('Connecting to Ollama...');
        const response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: "custom-model",
                prompt: input,
                stream: false,
                options: {
                    num_gpu: 1,
                    num_thread: 6,
                    num_ctx: 2048,
                    temperature: 0.7,
                    top_p: 0.9
                }
            })
        });

        if (!response.ok) {
            throw new Error(`Ollama API error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.response;
    } catch (error) {
        console.error('Ollama error:', error);
        throw error;
    }
}

app.post('/generate', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            throw new Error('No file uploaded');
        }

        const fileContent = await fs.readFile(req.file.path, 'utf8');
        console.log('Processing with Ollama...');
        
        const response = await processWithOllama(fileContent);
        console.log('Ollama response received');

        const workflow_data = {
            nodes: [
                { id: 1, label: "Start" },
                { id: 2, label: response.slice(0, 50) }
            ],
            edges: [
                { from: 1, to: 2 }
            ]
        };

        res.json({
            success: true,
            message: 'File processed successfully',
            data: workflow_data,
            analysis: response
        });

    } catch (error) {
        console.error('Processing error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.post('/api/generate', upload.single('file'), async (req, res) => {
    try {
        console.log('Received upload request');
        
        if (!req.file) {
            console.log('No file received');
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const modelName = req.body.model || 'custom-model';
        console.log('Using model:', modelName);
        
        // Add error handling for file content
        const fileContent = req.file.buffer.toString('utf-8');
        if (!fileContent) {
            throw new Error('Empty file content');
        }
        console.log('File content length:', fileContent.length);

        // Modify the Ollama API call
        console.log('Calling Ollama API with model:', modelName);
        const ollamaResponse = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: modelName,
                prompt: fileContent,  // Send just the content
                stream: false  // Disable streaming for now
            })
        });

        if (!ollamaResponse.ok) {
            const errorText = await ollamaResponse.text();
            throw new Error(`Ollama API error: ${ollamaResponse.statusText}. Details: ${errorText}`);
        }

        const data = await ollamaResponse.json();
        console.log('Ollama response received');

        res.json({
            success: true,
            message: "File processed successfully",
            data: data
        });

    } catch (error) {
        console.error('Error details:', error);
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
