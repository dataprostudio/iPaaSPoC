import { OrchestratorAgent } from './agents/orchestrator-agent'

async function main() {
  const orchestrator = new OrchestratorAgent()

  try {
    // Start the optimization process
    await orchestrator.orchestrate([
      'crm-logs.txt',
      'erp-transactions.log',
      'system-metrics.json'
    ])

    // Keep the process running for continuous monitoring
    process.on('SIGINT', async () => {
      console.log('Shutting down...')
      await orchestrator.stop()
      process.exit(0)
    })
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

main()

