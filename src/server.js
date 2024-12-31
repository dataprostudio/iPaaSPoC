import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { OrchestratorAgent } from './agents/orchestrator-agent.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());
app.use(express.static(join(__dirname, '../public')));

// Configure model path - can be overridden via environment variable
const modelPath = process.env.LLM_MODEL_PATH || join(process.cwd(), 'models', 'llama-2-7b-chat.gguf');

try {
    const orchestrator = new OrchestratorAgent(modelPath);

    app.get('/', (req, res) => {
        res.sendFile(join(__dirname, '../public/index.html'));
    });

    app.post('/upload-and-analyze', upload.array('files'), async (req, res) => {
        console.log('Received file upload request');
        if (req.files && req.files.length > 0) {
            try {
                const filePaths = req.files.map(file => file.path);
                const result = await orchestrator.orchestrate(filePaths);
                res.json(result);
            } catch (error) {
                console.error('Error processing files:', error);
                res.status(500).json({ error: 'Error processing files' });
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

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
} catch (error) {
    console.error('Failed to initialize orchestrator:', error);
    console.error('Please ensure the model file is present in the models directory');
    process.exit(1);
}

