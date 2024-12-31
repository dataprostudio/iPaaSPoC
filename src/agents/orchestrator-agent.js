import { LlamaModel, LlamaContext, LlamaChatSession } from 'node-llama-cpp'
import { AnalysisAgent } from './analysis-agent.js'
import { PipelineAgent } from './pipeline-agent.js'
import path from 'path'
import fs from 'fs'

export class OrchestratorAgent {
  constructor(modelPath) {
    this.llmAvailable = false;
    this.modelPath = modelPath || path.join(process.cwd(), 'models', 'llama-2-7b-chat.gguf')
    this.analysisAgent = new AnalysisAgent()
    this.pipelineAgent = new PipelineAgent()
    this.testEnv = new TestEnvironment()
    this.llmError = null;
    this.analysisRetries = 0;
    this.maxRetries = 3;
    this.lastAnalysisError = null;
    this.status = {
      isActive: false,
      lastActivity: null,
      currentOperation: null
    };
    
    if (modelPath) {
      this.initLlama().catch(error => {
        this.llmError = error;
        console.warn(`Failed to initialize LLM: ${error.message}`);
      });
    }
  }

  async initLlama() {
    try {
      this.model = new LlamaModel({
        modelPath: this.modelPath,
        contextSize: 4096,
      })
      this.context = new LlamaContext({ model: this.model })
      this.session = new LlamaChatSession({ context: this.context })
      
      // Test the model with a simple prompt to ensure it's working
      await this.session.prompt("Test", "System: Respond with 'OK' if working.");
      this.llmAvailable = true;
      this.llmError = null;
    } catch (error) {
      this.llmAvailable = false;
      this.llmError = error;
      this.model = null
      this.context = null
      this.session = null
      throw error;
    }
  }

  async getLLMStatus() {
    return {
      available: this.llmAvailable,
      error: this.llmError?.message || null,
      details: this.llmError ? {
        modelPath: this.modelPath,
        errorType: this.llmError.name,
        errorStack: this.llmError.stack
      } : null,
      status: this.status,
      analysisState: {
        lastError: this.lastAnalysisError?.message || null,
        retryCount: this.analysisRetries,
        maxRetries: this.maxRetries
      }
    };
  }

  async orchestrate(files) {
    this.status.isActive = true;
    this.status.lastActivity = new Date();
    this.status.currentOperation = 'orchestrating';

    if (!this.llmAvailable) {
      return {
        success: false,
        error: 'LLM not available',
        analysis: "LLM analysis unavailable - running in fallback mode",
        files: files.map(f => ({ name: f.name, summary: "File processing available but analysis requires LLM capabilities" }))
      };
    }

    try {
      if (!files || files.length === 0) {
        throw new Error('No files provided');
      }

      const fileData = await Promise.all(files.map(async file => {
        if (file.content) {
          return file.content;
        } else if (Buffer.isBuffer(file)) {
          return file.toString();
        } else if (typeof file === 'string') {
          return file;
        } else if (file.buffer) {
          return file.buffer.toString();
        } else {
          throw new Error('Unsupported file format. Please provide a valid file upload');
        }
      }));

      // Step 1: Analyze files with retry logic
      let analysis, suggestions;
      try {
        for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
          try {
            ({ analysis, suggestions } = await this.analysisAgent.analyze(fileData.join('\n')));
            this.lastAnalysisError = null;
            break;
          } catch (analysisError) {
            this.lastAnalysisError = analysisError;
            if (attempt === this.maxRetries) {
              throw new Error(`Analysis failed after ${this.maxRetries} attempts: ${analysisError.message}`);
            }
            await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt))); // Exponential backoff
          }
        }
      } catch (error) {
        return {
          success: false,
          error: error.message,
          details: {
            lastError: this.lastAnalysisError,
            attempts: this.analysisRetries,
            timestamp: new Date().toISOString()
          }
        };
      }

      // Step 2: Generate implementation plan
      let implementationPlan;
      if (this.session) {
        const prompt = `Create implementation plan for: ${JSON.stringify({ analysis, suggestions })}`;
        implementationPlan = await this.session.prompt(
          prompt,
          'You are a system architect. Create detailed implementation plans for system optimizations.'
        );
      } else {
        // Fallback mode without LLM
        implementationPlan = JSON.stringify({
          pipelineConfig: {
            steps: analysis.suggestedSteps || []
          }
        });
      }

      const implementation = typeof implementationPlan === 'string' ? 
        JSON.parse(implementationPlan) : implementationPlan;

      // Step 3: Setup pipeline
      await this.pipelineAgent.setupPipeline(implementation.pipelineConfig);

      // Step 4: Implement changes in test environment
      await this.implementChanges(implementation);

      // Step 5: Start monitoring
      await this.pipelineAgent.startListening();

      return { success: true, implementation };
    } catch (error) {
      console.error('Orchestration error:', error);
      this.status.currentOperation = 'error';
      throw new Error(`Orchestration failed: ${error.message}`);
    } finally {
      this.status.isActive = false;
      this.status.lastActivity = new Date();
    }
  }

  async orchestrateStream(source) {
    if (!this.llmAvailable) {
      return {
        analysis: "LLM analysis unavailable - running in fallback mode",
        source: source,
        summary: "Stream processing available but analysis requires LLM capabilities"
      };
    }
    // ...existing orchestrateStream code...
  }

  async implementChanges(implementation) {
    let codeResponse
    if (this.session) {
      const prompt = `Generate code for implementation: ${JSON.stringify(implementation)}`
      codeResponse = await this.session.prompt(
        prompt,
        'You are an expert programmer. Generate production-ready code for system optimizations.'
      )
    } else {
      // Fallback mode without LLM
      codeResponse = JSON.stringify({ 
        changes: implementation.pipelineConfig.steps 
      })
    }

    const code = typeof codeResponse === 'string' ? JSON.parse(codeResponse) : codeResponse
    await this.testEnv.deploy(code)
  }

  async stop() {
    await this.pipelineAgent.stopListening()
    this.context.free()
    this.model.free()
  }
}

class TestEnvironment {
  async deploy(code) {
    // Implementation details...
    console.log('Deploying code to test environment:', code)
  }
}

