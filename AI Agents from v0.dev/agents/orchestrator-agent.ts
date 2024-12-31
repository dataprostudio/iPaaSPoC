import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { AnalysisAgent } from './analysis-agent'
import { PipelineAgent } from './pipeline-agent'
import { type Implementation, type TestEnvironment } from '../types'

export class OrchestratorAgent {
  private analysisAgent: AnalysisAgent
  private pipelineAgent: PipelineAgent
  private testEnv: TestEnvironment

  constructor() {
    this.analysisAgent = new AnalysisAgent()
    this.pipelineAgent = new PipelineAgent()
    this.testEnv = new TestEnvironment()
  }

  async orchestrate(files: string[]): Promise<void> {
    // Step 1: Analyze files
    const { analysis, suggestions } = await this.analysisAgent.analyze(files)

    // Step 2: Generate implementation plan
    const { text: implementationPlan } = await generateText({
      model: openai('gpt-4o'),
      prompt: `Create implementation plan for: ${JSON.stringify({ analysis, suggestions })}`,
      system: "You are a system architect. Create detailed implementation plans for system optimizations."
    })

    const implementation: Implementation = JSON.parse(implementationPlan)

    // Step 3: Setup pipeline
    await this.pipelineAgent.setupPipeline(implementation.pipelineConfig)

    // Step 4: Implement changes in test environment
    await this.implementChanges(implementation)

    // Step 5: Start monitoring
    await this.pipelineAgent.startListening()
  }

  private async implementChanges(implementation: Implementation): Promise<void> {
    const { text: code } = await generateText({
      model: openai('gpt-4o'),
      prompt: `Generate code for implementation: ${JSON.stringify(implementation)}`,
      system: "You are an expert programmer. Generate production-ready code for system optimizations."
    })

    await this.testEnv.deploy(JSON.parse(code))
  }

  async stop(): Promise<void> {
    await this.pipelineAgent.stopListening()
  }
}

