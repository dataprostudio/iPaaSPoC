import express from 'express';
const router = express.Router();

router.post('/analyze', async (req, res) => {
  try {
    const orchestrator = req.app.get('orchestrator');
    if (!orchestrator) {
      throw new Error('Orchestrator not initialized');
    }

    const status = await orchestrator.getLLMStatus();
    if (!status.available) {
      return res.status(503).json({
        error: 'Analysis service unavailable',
        details: status
      });
    }

    const result = await orchestrator.orchestrate(req.body.files);
    res.json(result);
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({
      error: 'Error analyzing data',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
