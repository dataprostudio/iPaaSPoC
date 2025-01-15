import express from 'express';
import multer from 'multer';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const upload = multer({
    dest: 'uploads/',
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/static', express.static('public/static'));

app.post('/upload-and-analyze', upload.array('files'), (req, res) => {
    // Handle file upload and analysis
    const files = req.files;
    console.log('Files uploaded:', files);

    // Simulate analysis
    const analysisResult = {
        processFlow: ['Step 1', 'Step 2', 'Step 3'],
        bottlenecks: ['Bottleneck 1', 'Bottleneck 2'],
        optimization: 'Optimization suggestion here'
    };

    res.json(analysisResult);
});

app.get('/llm-status', (req, res) => {
    // Check LLM status
    const status = {
        available: true,
        modelPath: '/path/to/your/model',
        error: null,
        downloadInstructions: null
    };

    res.json(status);
});

app.post('/generate-text', (req, res) => {
    const prompt = req.body.prompt;
    // Simulate text generation
    const generatedText = `Generated text for prompt: ${prompt}`;
    res.json({ generatedText });
});

// Add file upload endpoint
app.post('/generate', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            throw new Error('No file uploaded');
        }
        
        // Sample workflow data
        const fileData = {
            nodes: [
                { id: 1, label: 'Start Process' },
                { id: 2, label: 'Review' },
                { id: 3, label: 'Approve' }
            ],
            edges: [
                { from: 1, to: 2 },
                { from: 2, to: 3 }
            ]
        };
        
        // Send response with data structure
        res.json({
            success: true,
            message: 'File uploaded successfully',
            filename: req.file.filename,
            data: fileData,
            bottlenecks: [], // Empty array for now
            optimization: 'No optimization suggestions yet.' // Default message
        });
    } catch (error) {
        console.error('Upload error:', error);
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
