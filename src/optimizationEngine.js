import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function optimizeIntegration(processFlow, bottlenecks) {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn('python', [
      path.join(__dirname, 'optimization_engine.py'),
      JSON.stringify({ processFlow, bottlenecks })
    ]);

    let optimization = '';

    pythonProcess.stdout.on('data', (data) => {
      optimization += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      console.error(`Python Error: ${data}`);
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Python process exited with code ${code}`));
      } else {
        resolve(optimization.trim());
      }
    });
  });
}