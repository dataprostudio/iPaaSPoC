import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function analyzeProcess(filePaths) {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn('python', [
      path.join(__dirname, 'process_analyzer.py'),
      ...filePaths
    ]);

    let processFlow = [];
    let bottlenecks = [];

    pythonProcess.stdout.on('data', (data) => {
      const result = JSON.parse(data.toString());
      processFlow = result.processFlow;
      bottlenecks = result.bottlenecks;
    });

    pythonProcess.stderr.on('data', (data) => {
      console.error(`Python Error: ${data}`);
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Python process exited with code ${code}`));
      } else {
        resolve({ processFlow, bottlenecks });
      }
    });
  });
}