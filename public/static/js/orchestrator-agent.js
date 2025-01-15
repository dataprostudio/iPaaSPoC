import { LlamaModel, LlamaContext, LlamaChatSession } from 'node-llama-cpp'
import { AnalysisAgent } from './analysis-agent.js'
import { PipelineAgent } from './pipeline-agent.js'
import path from 'path'
import fs from 'fs'

export class OrchestratorAgent {
  constructor(modelPath) {
    this.llmAvailable = false;
    this.modelPath = modelPath || path.join(process.cwd(), 'Models', 'Llama-3.2-3B-GGUF', 'Llama-3.2-3B.Q4_K_M.gguf')
    this.modelConfig = {
      contextSize: 8192,  // Increased context size for Llama 3.1
      gpu_layers: 35,     // Use GPU for half the layers
      threads: 8,         // Adjust based on your CPU
      threads_batch: 8    // Parallel batch processing threads
    }
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
        ...this.modelConfig
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

  async formatPrompt(text, systemPrompt) {
    // Llama 3.1 specific prompt formatting
    return `[INST] ${systemPrompt}
${text} [/INST]`;
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
        const prompt = await this.formatPrompt(
          `Create implementation plan for: ${JSON.stringify({ analysis, suggestions })}`,
          'You are a system architect. Create detailed implementation plans for system optimizations.'
        );
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

  async analyzeFiles(files) {
    try {
        // Generate a system prompt for file analysis
        const systemPrompt = `Analyze the following files and create a process flow diagram. 
        Identify integration patterns, data flows, and potential bottlenecks.`;

        // Prepare files content for analysis
        const filesContent = files.map(f => `File: ${f.name}\n\n${f.content}`).join('\n\n');

        // If LLM is not available, provide basic analysis
        if (!this.llm) {
            return this.generateBasicAnalysis(files);
        }

        // Use LLM to analyze files
        const analysis = await this.llm.complete(systemPrompt, filesContent);
        
        // Parse the LLM response and structure it
        return this.structureAnalysis(analysis, files);
    } catch (error) {
        console.error('Analysis error in orchestrator:', error);
        return this.generateBasicAnalysis(files);
    }
  }

  generateBasicAnalysis(files) {
    // Generate a basic analysis when LLM is not available
    return {
        processFlow: files.map(f => f.name),
        nodes: files.map((f, i) => ({
            id: i.toString(),
            label: f.name,
            type: 'file'
        })),
        edges: files.slice(1).map((_, i) => ({
            id: `e${i}`,
            source: (i).toString(),
            target: (i + 1).toString()
        })),
        bottlenecks: {
            identified: false,
            message: 'Basic analysis mode - LLM analysis not available'
        },
        optimization: {
            suggestions: ['Enable LLM for detailed analysis']
        },
        details: {
            filesAnalyzed: files.map(f => f.name),
            mode: 'basic'
        }
    };
  }

  structureAnalysis(llmResponse, files) {
    // Convert LLM response into structured format
    const analysis = {
        processFlow: [],
        nodes: [],
        edges: [],
        bottlenecks: {},
        optimization: {},
        details: {}
    };

    try {
        // Parse LLM response and populate analysis
        // This is a simplified version - enhance based on your LLM's output format
        const parsedResponse = typeof llmResponse === 'string' ? 
            JSON.parse(llmResponse) : llmResponse;
        
        Object.assign(analysis, parsedResponse);
    } catch (error) {
        console.error('Error structuring analysis:', error);
        return this.generateBasicAnalysis(files);
    }

    return analysis;
  }
}

class TestEnvironment {
  async deploy(code) {
    // Implementation details...
    console.log('Deploying code to test environment:', code)
  }
}

