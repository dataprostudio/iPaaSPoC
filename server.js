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

// Function to process with Gradio
async function processWithGradio(input) {
    try {
        console.log('Connecting to Gradio...');
        const response = await fetch('http://127.0.0.1:7860/run/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                fn_index: 0,
                data: [input],
                session_hash: Date.now().toString()
            })
        });

        if (!response.ok) {
            console.error('Gradio response not OK:', response.status);
            const errorText = await response.text();
            console.error('Error details:', errorText);
            throw new Error(`Gradio API error: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Gradio response received:', data);
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        return data.data ? data.data[0] : 'No response from model';
    } catch (error) {
        console.error('Detailed Gradio error:', error);
        throw new Error(`Failed to connect to Gradio: ${error.message}`);
    }
}

app.post('/generate', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            throw new Error('No file uploaded');
        }

        const fileContent = await fs.readFile(req.file.path, 'utf8');
        console.log('Processing with Gradio...');
        
        const response = await processWithGradio(fileContent);
        console.log('Gradio response received');

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
