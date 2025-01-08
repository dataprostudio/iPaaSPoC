import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import http from 'http';
import fs from 'fs';
import os from 'os';

dotenv.config();

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Add uploads directory check
const ensureUploadsDir = () => {
    const uploadDir = join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }
    return uploadDir;
};

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, ensureUploadsDir())
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
});

const upload = multer({ storage: storage });

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files with proper MIME types
app.use(express.static(join(__dirname, '../public'), {
    setHeaders: (res, path) => {
        if (path.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        }
    }
}));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'healthy' });
});

// File upload endpoint
app.post('/generate', upload.single('file'), (req, res) => {
    console.log('Upload request received');
    try {
        if (!req.file) {
            console.log('No file in request');
            return res.status(400).json({ error: 'No file uploaded' });
        }
        
        console.log('File received:', req.file);

        // Send back visualization data
        res.json({
            status: 'success',
            file: req.file.filename,
            nodes: [
                { id: 1, label: 'Start', x: 50, y: 50 },
                { id: 2, label: 'Process', x: 200, y: 50 },
                { id: 3, label: 'End', x: 350, y: 50 }
            ],
            edges: [
                { from: 1, to: 2 },
                { from: 2, to: 3 }
            ]
        });

    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Error processing file' });
    }
});

// AWS connectivity check
const checkAWSConnectivity = async () => {
    try {
        const AWS_DOMAIN = process.env.AWS_DOMAIN || 'aws.amazon.com';
        const response = await fetch(`https://${AWS_DOMAIN}`);
        if (response.ok) {
            console.log('AWS connectivity: OK');
        } else {
            console.warn('AWS connectivity: Failed');
        }
    } catch (error) {
        console.error('AWS connectivity check failed:', error);
    }
};

// Start server function
const startServer = async () => {
    try {
        const PORT = process.env.PORT || 3000;
        
        // Create HTTP server
        const server = http.createServer(app);
        
        // Start listening
        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log('----------------------------------------');
            console.log('Server Configuration:');
            console.log(`1. Port: ${PORT}`);
            console.log(`2. Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`3. Platform: ${os.platform()}`);
            console.log('----------------------------------------');
            
            // Log important paths
            console.log('Directory Configuration:');
            console.log(`1. Static files: ${join(__dirname, '../public')}`);
            console.log(`2. Uploads: ${join(__dirname, '../uploads')}`);
            console.log('----------------------------------------');

            checkAWSConnectivity();
        });

        // Error handling for the server
        server.on('error', (error) => {
            console.error('Server error:', error);
            if (error.code === 'EADDRINUSE') {
                console.error(`Port ${PORT} is already in use`);
            }
        });

    } catch (error) {
        console.error('Server startup failed:', error);
        process.exit(1);
    }
};

// Start the server
startServer().catch(error => {
    console.error('Failed to start server:', error);
    process.exit(1);
});

export default app;