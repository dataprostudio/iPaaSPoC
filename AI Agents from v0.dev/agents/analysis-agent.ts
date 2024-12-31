import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { type AnalysisResult, type Bottleneck, type ProcessMetrics } from '../types'

export class AnalysisAgent {
  private async analyzeFiles(files: string[]): Promise<AnalysisResult> {
    const { text } = await generateText({
      model: openai('gpt-4o'),
      prompt: `Analyze these CRM/ERP logs and identify bottlenecks, metrics, and issues: ${files.join('\n')}`,
      system: "You are an expert system analyzer. Analyze the provided logs and identify bottlenecks, performance metrics, and issues."
    })

    return JSON.parse(text) as AnalysisResult
  }

  private async generateSuggestions(analysis: AnalysisResult): Promise<string[]> {
    const { text } = await generateText({
      model: openai('gpt-4o'),
      prompt: `Generate optimization suggestions based on this analysis: ${JSON.stringify(analysis)}`,
      system: "You are an expert system optimizer. Generate practical suggestions to improve system performance."
    })

    return JSON.parse(text) as string[]
  }

  async analyze(files: string[]): Promise<{
    analysis: AnalysisResult
    suggestions: string[]
  }> {
    const analysis = await this.analyzeFiles(files)
    const suggestions = await this.generateSuggestions(analysis)
    return { analysis, suggestions }
  }
}

