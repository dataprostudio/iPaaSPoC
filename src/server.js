import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import http from 'http';
import fs from 'fs';
import fetch from 'node-fetch';

dotenv.config();

// ES6 __dirname setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Hugging Face configuration
const HUGGING_FACE_API_TOKEN = process.env.HUGGING_FACE_API_TOKEN;
const MODEL_API_URL = "https://api-inference.huggingface.co/models/bartowski/Llama-3.2-1B-Instruct-GGUF";

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = join(__dirname, '../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(join(__dirname, '../public')));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Function to query Llama 3.2
async function queryLlama(content) {
    const response = await fetch(MODEL_API_URL, {
        headers: { 
            "Authorization": `Bearer ${HUGGING_FACE_API_TOKEN}`,
            "Content-Type": "application/json"
        },
        method: "POST",
        body: JSON.stringify({
            inputs: `<s>[INST] Analyze this business process and identify bottlenecks and optimization opportunities: ${content} [/INST]`,
            parameters: {
                max_length: 1000,
                temperature: 0.7,
                top_p: 0.95,
                return_full_text: false
            }
        }),
    });
    
    if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
    }
    
    return response.json();
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'healthy' });
});

// File upload and analysis endpoint
app.post('/generate', upload.single('file'), async (req, res) => {
    console.log('Upload request received');
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        
        console.log('File received:', req.file);

        // Read file content
        const fileContent = fs.readFileSync(req.file.path, 'utf8');
        
        // Query Llama 3.2 for analysis
        const analysis = await queryLlama(fileContent);
        
        // Process the analysis response
        const results = {
            nodes: [
                { id: 1, label: 'Start', x: 50, y: 50 },
                { id: 2, label: 'Process', x: 200, y: 50 },
                { id: 3, label: 'End', x: 350, y: 50 }
            ],
            edges: [
                { from: 1, to: 2 },
                { from: 2, to: 3 }
            ],
            bottlenecks: analysis.bottlenecks || ['Analyzing process...'],
            recommendations: analysis.recommendations || ['Generating recommendations...']
        };

        res.json({
            status: 'success',
            file: req.file.filename,
            ...results
        });

    } catch (error) {
        console.error('Processing error:', error);
        res.status(500).json({ error: 'Error processing file' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('----------------------------------------');
    console.log('Server Configuration:');
    console.log(`1. Port: ${PORT}`);
    console.log(`2. Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`3. Static files: ${join(__dirname, '../public')}`);
    console.log(`4. Uploads directory: ${join(__dirname, '../uploads')}`);
    console.log('----------------------------------------');
});

export default app;