import express from 'express';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs/promises';
import fetch from 'node-fetch';
import { BitsAndBytesConfig } from 'transformers';
import torch from 'torch';
import { AutoModelForCausalLM } from 'transformers';

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

const processPrompt = `
Analyze this text and identify:
1. Each distinct process step
2. The relationships between steps
3. Any input/output dependencies

Format your response as:
- Step Name: [name]
- Description: [details]
- Dependencies: [connections]

Text to analyze:
`;

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
        const modelName = req.body.model || 'process-mining-model';
        console.log('Using model:', modelName);

        const fileContent = req.file.buffer.toString('utf-8');
        
        // Process mining specific prompt
        const prompt = `
        Analyze this process description and provide:
        1. Process steps
        2. System interactions
        3. Bottlenecks
        4. Data flow
        
        Text: ${fileContent}
        `;

        const response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: modelName,
                prompt: prompt,
                stream: false,
                options: {
                    temperature: 0.3
                }
            })
        });

        const data = await response.json();
        
        // Parse the response for visualization
        const processSteps = parseProcessSteps(data.response);
        
        res.json({
            success: true,
            analysis: data.response,
            visualization: {
                nodes: processSteps.nodes,
                edges: processSteps.edges
            }
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

function parseProcessSteps(response) {
    // Parse the LLM response into nodes and edges
    const nodes = [];
    const edges = [];
    
    // Simple parsing example - enhance based on your needs
    const lines = response.split('\n');
    let nodeId = 1;
    
    lines.forEach(line => {
        if (line.match(/^\d+\./)) {
            const step = line.replace(/^\d+\./, '').trim();
            nodes.push({
                id: nodeId,
                label: step
            });
            
            if (nodeId > 1) {
                edges.push({
                    from: nodeId - 1,
                    to: nodeId
                });
            }
            
            nodeId++;
        }
    });
    
    return { nodes, edges };
}

// Add quantization configuration
const quantization_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_compute_dtype=torch.float16,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_use_double_quant=True
)

// Load model with quantization
const model = AutoModelForCausalLM.from_pretrained(
    modelName,
    quantization_config=quantization_config,
    device_map="auto"
)

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
