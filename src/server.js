import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { promises as fs } from 'fs';
import { OrchestratorAgent } from './agents/orchestrator-agent.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const upload = multer({ dest: 'uploads/' });
let orchestrator;
let llmStatus = {
    available: false,
    error: null,
    details: null
};

// Update CORS configuration
app.use(cors({
    origin: true, // Allow all origins in development
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

app.use(express.json());
app.use(express.static(join(__dirname, '../public')));

// Configure model path - can be overridden via environment variable
const modelPath = process.env.LLM_MODEL_PATH || join(process.cwd(), 'models', 'llama-2-7b-chat.gguf');

// Add model validation function
async function validateModel(modelPath) {
    try {
        const stats = await fs.stat(modelPath);
        // GGUF models are typically >1GB
        if (stats.size < 1_000_000_000) {
            throw new Error('Model file appears to be incomplete or corrupted (size < 1GB)');
        }
        
        // Check file header for GGUF magic number
        const fd = await fs.open(modelPath, 'r');
        const buffer = Buffer.alloc(4);
        await fd.read(buffer, 0, 4, 0);
        await fd.close();
        
        if (buffer.toString('ascii') !== 'GGUF') {
            throw new Error('Invalid model format: File does not have GGUF header');
        }
        
        return true;
    } catch (error) {
        if (error.code === 'ENOENT') {
            throw new Error(`Model file not found at ${modelPath}`);
        }
        throw error;
    }
}

// Update model initialization
try {
    console.log('Initializing LLM with model:', modelPath);
    await validateModel(modelPath);
    orchestrator = new OrchestratorAgent(modelPath);
    llmStatus = await orchestrator.getLLMStatus();
} catch (error) {
    console.error('Failed to initialize LLM capabilities:', error);
    console.warn('Server will run in fallback mode without LLM capabilities');
    orchestrator = new OrchestratorAgent(null);
    llmStatus = {
        available: false,
        error: error.message,
        details: {
            modelPath,
            errorType: error.name,
            recommendation: 'Please ensure you have downloaded the correct GGUF model file'
        }
    };
}

app.get('/', (req, res) => {
    res.sendFile(join(__dirname, '../public/index.html'));
});

// Update status endpoint to include model info
app.get('/llm_status', (req, res) => {  // Changed from llm-status to llm_status
    res.json({
        ...llmStatus,
        modelPath,
        expectedFormat: 'GGUF',
        downloadInstructions: 'Download the model from https://huggingface.co/TheBloke/Llama-2-7B-Chat-GGUF'
    });
});

app.post('/upload-and-analyze', upload.array('files'), async (req, res) => {
    console.log('Received file upload request');
    if (req.files && req.files.length > 0) {
        try {
            const formattedFiles = await Promise.all(req.files.map(async file => ({
                content: await fs.readFile(file.path, 'utf8'),
                name: file.originalname
            })));
            
            const result = await orchestrator.orchestrate(formattedFiles);
            
            // Add visualization data to response
            const response = {
                ...result,
                processFlow: [
                    'Start',
                    'Receive Data',
                    'Process Files',
                    'Analyze Content',
                    'Generate Results',
                    'End'
                ],
                bottlenecks: [
                    'File processing time',
                    'Content analysis throughput'
                ],
                optimization: 'Implement parallel processing for file analysis'
            };
            
            // Clean up uploaded files
            await Promise.all(req.files.map(file => fs.unlink(file.path)));
            
            res.json(response);
        } catch (error) {
            console.error('Error processing files:', error);
            // Clean up uploaded files even if processing failed
            if (req.files) {
                await Promise.all(req.files.map(file => fs.unlink(file.path).catch(() => {})));
            }
            res.status(500).json({ 
                error: 'Error processing files',
                message: error.message,
                details: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        }
    } else {
        res.status(400).send('No files uploaded');
    }
});

app.post('/stream-and-analyze', async (req, res) => {
    console.log('Received streaming request');
    const { source } = req.body;
    if (source) {
        try {
            const result = await orchestrator.orchestrateStream(source);
            res.json(result);
        } catch (error) {
            console.error('Error processing stream:', error);
            res.status(500).json({ error: 'Error processing stream' });
        }
    } else {
        res.status(400).send('No data source specified');
    }
});

// Add error handler middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred'
    });
});

const PORT = process.env.PORT || 3001; // Change to 3001 to avoid conflict with frontend
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`LLM Status: ${llmStatus.available ? 'Available' : 'Fallback mode'}${llmStatus.error ? ` (${llmStatus.error})` : ''}`);
});

