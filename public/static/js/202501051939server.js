import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { promises as fs, existsSync } from 'fs';
import os from 'os';
import { OrchestratorAgent } from './agents/orchestrator-agent.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const upload = multer({ dest: 'uploads/' });
let orchestrator;
let llmStatus = {
    available: false,
    error: null,
    details: null,
    status: { isActive: false, lastActivity: null, currentOperation: null },
    analysisState: { lastError: null, retryCount: 0, maxRetries: 3 }
};

app.use(cors({
    origin: true,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

app.use(express.json());
app.use(express.static(join(__dirname, '../public')));

const modelPath = process.env.LLM_MODEL_PATH || join(process.cwd(), 'Models', 'Llama-3.2-3B-GGUF', 'Llama-3.2-3B.Q4_K_M.gguf');

async function validateModel(modelPath) {
    try {
        const modelDir = dirname(modelPath);
        
        console.log(`Checking model directory: ${modelDir}`);
        if (!existsSync(modelDir)) {
            throw new Error(`Model directory does not exist: ${modelDir}`);
        }

        console.log(`Checking model file: ${modelPath}`);
        if (!existsSync(modelPath)) {
            throw new Error(`Model file not found: ${modelPath}`);
        }

        const stats = await fs.stat(modelPath);
        if (!stats.isFile()) {
            throw new Error(`Model path is not a file: ${modelPath}`);
        }

        const fileSizeGB = stats.size / (1024 * 1024 * 1024);
        console.log(`Model file size: ${fileSizeGB.toFixed(2)} GB`);
        
        if (!modelPath.toLowerCase().endsWith('.gguf')) {
            throw new Error(`Model file must have .gguf extension: ${modelPath}`);
        }
        
        console.log('Model validation successful');
        return true;
    } catch (error) {
        console.error('Model validation failed:', error.message);
        throw error;
    }
}

async function initializeLLM() {
    try {
        console.log('Initializing LLM with model:', modelPath);
        await validateModel(modelPath);
        orchestrator = new OrchestratorAgent(modelPath);
        llmStatus = await orchestrator.getLLMStatus();
        llmStatus.available = true; // Ensure 'available' is set to true
        llmStatus.status.isActive = true;
        llmStatus.status.lastActivity = new Date().toISOString();
        llmStatus.status.currentOperation = 'Initialization';
        console.log('LLM Status:', llmStatus);
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
            },
            status: { isActive: false, lastActivity: new Date().toISOString(), currentOperation: 'Error' },
            analysisState: { lastError: error.message, retryCount: 0, maxRetries: 3 }
        };
    }
}

async function startServer() {
    await initializeLLM();

    app.get('/', (req, res) => {
        res.sendFile(join(__dirname, '../public/index.html'));
    });

    app.get('/llm_status', (req, res) => {
        res.json({
            ...llmStatus,
            modelPath,
            expectedFilename: 'Llama-3.2-3B.Q4_K_M.gguf',
            downloadUrl: 'https://huggingface.co/QuantFactory/Llama-3.2-3B-GGUF?show_file_info=Llama-3.2-3B.Q4_K_M.gguf'
        });
    });

    app.post('/upload-and-analyze', upload.array('files'), async (req, res) => {
        try {
            if (!req.files || req.files.length === 0) {
                return res.status(400).json({ error: 'No files uploaded' });
            }

            const filePaths = req.files.map(file => file.path);
            
            // Mock analysis result for testing
            const analysisResult = {
                processFlow: [
                    "Start",
                    "Data Ingestion",
                    "Validation",
                    "Processing",
                    "Integration",
                    "End"
                ],
                bottlenecks: [
                    "Data validation is taking too long",
                    "High error rate in processing step"
                ]
            };

            const optimizationResult = "Implement parallel processing and add data validation caching";
            
            res.json({
                processFlow: analysisResult.processFlow,
                bottlenecks: {
                    identified: true,
                    issues: analysisResult.bottlenecks
                },
                optimization: {
                    suggestions: [
                        "Implement parallel processing",
                        "Add data validation caching",
                        "Optimize error handling"
                    ]
                }
            });
        } catch (error) {
            console.error('Error during analysis:', error);
            res.status(500).json({ 
                error: 'Internal Server Error', 
                message: error.message 
            });
        }
    });

    app.post('/stream-and-analyze', async (req, res) => {
        try {
            const { source } = req.body;
            // Implement streaming data analysis logic here
            // For now, return a mock response
            res.json({
                processFlow: ['Start', 'Stream Data', 'Analyze Data', 'End'],
                bottlenecks: ['Stream Data is slow', 'Analyze Data has high error rate'],
                optimization: 'Optimize streaming and analysis processes'
            });
        } catch (error) {
            console.error('Error during streaming analysis:', error);
            res.status(500).json({ error: 'Internal Server Error', message: error.message });
        }
    });

    const PORT = process.env.PORT || 3000;

    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

startServer();
