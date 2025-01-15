import * as dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

// Configure dotenv
dotenv.config();
console.log('Environment variables loaded:', process.env.PORT);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Process Mining Analysis endpoint
app.post('/api/analyze-process', async (req, res) => {
  try {
    const { eventLog } = req.body;
    
    // Call Python script for PM4Py analysis
    const pythonProcess = spawn('python', ['./src/process_analysis.py'], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    // Send event log data to Python script
    pythonProcess.stdin.write(JSON.stringify(eventLog));
    pythonProcess.stdin.end();

    let processOutput = '';
    pythonProcess.stdout.on('data', (data) => {
      processOutput += data.toString();
    });

    // Wait for Python analysis to complete
    await new Promise((resolve, reject) => {
      pythonProcess.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error(`Python process exited with code ${code}`));
      });
    });

    const result = JSON.parse(processOutput);
    res.json(result);

  } catch (error) {
    console.error('Process analysis error:', error);
    res.status(500).json({ error: error.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
