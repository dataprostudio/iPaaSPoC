import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { type DataStream, type PipelineConfig } from '../types'

export class PipelineAgent {
  private stream: DataStream | null = null

  async setupPipeline(config: PipelineConfig): Promise<void> {
    const { text } = await generateText({
      model: openai('gpt-4o'),
      prompt: `Generate a data pipeline configuration for: ${JSON.stringify(config)}`,
      system: "You are a data pipeline expert. Create efficient data streaming configurations."
    })

    const pipelineSetup = JSON.parse(text)
    this.stream = new DataStream(pipelineSetup)
  }

  async startListening(): Promise<void> {
    if (!this.stream) {
      throw new Error('Pipeline not configured')
    }

    this.stream.on('data', async (data) => {
      const { text } = await generateText({
        model: openai('gpt-4o'),
        prompt: `Process this incoming data stream: ${JSON.stringify(data)}`,
        system: "You are a real-time data processor. Analyze incoming data streams for anomalies and patterns."
      })

      return JSON.parse(text)
    })
  }

  async stopListening(): Promise<void> {
    if (this.stream) {
      await this.stream.close()
      this.stream = null
    }
  }
}

