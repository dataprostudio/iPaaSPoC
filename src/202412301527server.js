import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());
app.use(express.static(join(__dirname, '../public')));

// Add a specific route for the root path
app.get('/', (req, res) => {
    res.sendFile(join(__dirname, '../public/index.html'));
});

// Update the route to match what's in your frontend code
app.post('/upload-and-analyze', upload.array('files'), (req, res) => {
    console.log('Received request'); // Debug log
    console.log('Files:', req.files); // Debug log

    if (req.files && req.files.length > 0) {
        console.log('Processing files...'); // Debug log
        
        // Mock response data for testing
        const mockResponse = {
            processFlow: [
                'A[Start] --> B[Process 1]',
                'B --> C[Process 2]',
                'C --> D[End]'
            ],
            bottlenecks: [
                'Process 1 takes too long',
                'Process 2 has high error rate'
            ],
            optimization: 'Suggested optimization: Implement parallel processing in Process 1'
        };
        
        console.log('Sending response:', mockResponse); // Debug log
        res.json(mockResponse);
    } else {
        console.log('No files received'); // Debug log
        res.status(400).send('No files uploaded');
    }
});

const PORT = process.env.PORT || 3000;
const DOMAIN = process.env.DOMAIN || 'localhost';

app.listen(PORT, () => {
    console.log(`Server is running on ${DOMAIN}:${PORT}`);
});