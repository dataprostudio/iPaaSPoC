import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { promises as fs, existsSync } from 'fs';  // Changed this line
import { OrchestratorAgent } from './agents/orchestrator-agent.js';
import { json } from 'express'; // Add at the beginning of file with other imports

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

// Update model path for the correct filename
const modelPath = process.env.LLM_MODEL_PATH || join(process.cwd(), 'Models', 'Llama-3.2-3B-GGUF', 'Llama-3.2-3B.Q4_K_M.gguf');

// Update model validation function
async function validateModel(modelPath) {
    try {
        const modelDir = dirname(modelPath);
        
        // Create models directory if it doesn't exist
        if (!existsSync(modelDir)) {  // Use imported existsSync
            await fs.mkdir(modelDir, { recursive: true });
        }

        // Check if model file exists
        if (!existsSync(modelPath)) {  // Use imported existsSync
            throw new Error(
                `Model file not found at ${modelPath}\n` +
                `Please download the model using:\n` +
                `npm run download-model\n` +
                `or manually download from:\n` +
                `https://huggingface.co/TheBloke/llama2-3.2b-gguf/resolve/main/llama2_3.2b.Q4_K_M.gguf`
            );
        }

        const stats = await fs.stat(modelPath);
        if (!stats.isFile()) {
            throw new Error('Model path must point to a file');
        }
        const fileSizeGB = stats.size / (1024 * 1024 * 1024);
        console.log(`Model file size: ${fileSizeGB.toFixed(2)} GB`);
        
        // Verify file extension
        if (!modelPath.toLowerCase().endsWith('.gguf')) {
            throw new Error('Model file must have .gguf extension');
        }
        
        return true;
    } catch (error) {
        console.error('Model validation failed:', error.message);
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

// Update LLM status endpoint
app.get('/llm_status', (req, res) => {  // Changed from llm-status to llm_status
    res.json({
        ...llmStatus,
        modelPath,
        expectedFilename: 'llama2_3.2b.Q4_K_M.gguf',
        downloadUrl: 'https://huggingface.co/TheBloke/llama2-3.2b-gguf/resolve/main/llama2_3.2b.Q4_K_M.gguf',
        expectedFormat: 'GGUF',
        modelType: 'Llama 2 3.2B Q4_K_M'
    });
});

app.post('/upload-and-analyze', upload.array('files'), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                error: 'No files uploaded',
                message: 'Please select at least one file to analyze'
            });
        }

        // Process the files and generate analysis
        const analysisResult = await analyzeFiles(req.files);
        
        // Ensure the response is valid JSON
        const response = {
            processFlow: analysisResult.processFlow || [],
            bottlenecks: analysisResult.bottlenecks || {},
            optimization: analysisResult.optimization || {}
        };

        // Send the JSON response
        res.json(response);
    } catch (error) {
        console.error('Analysis error:', error);
        res.status(500).json({
            error: 'Analysis failed',
            message: error.message || 'An unexpected error occurred during analysis'
        });
    }
});

// Helper function to analyze files
async function analyzeFiles(files) {
    try {
        const fileContents = await Promise.all(files.map(async (file) => {
            const content = await fs.readFile(file.path, 'utf8');
            return {
                name: file.originalname,
                content: content
            };
        }));

        // Use orchestrator to analyze the files
        const analysis = await orchestrator.analyzeFiles(fileContents);

        // Clean up uploaded files
        await Promise.all(files.map(file => fs.unlink(file.path)));

        return {
            processFlow: analysis.processFlow || [],
            bottlenecks: analysis.bottlenecks || {},
            optimization: analysis.optimization || {},
            nodes: analysis.nodes || [],
            edges: analysis.edges || [],
            details: analysis.details || {}
        };
    } catch (error) {
        console.error('Analysis error:', error);
        throw new Error(`Analysis failed: ${error.message}`);
    }
}

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

