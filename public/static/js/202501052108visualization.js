function initVisualizer() {
    console.log('Initializing visualizer');
    const canvas = document.getElementById('workflowCanvas');
    
    if (!canvas) {
        console.error('Canvas element not found, retrying in 100ms');
        setTimeout(initVisualizer, 100);
        return;
    }

    try {
        // Set canvas dimensions
        const container = canvas.parentElement;
        if (container) {
            canvas.width = container.clientWidth;
            canvas.height = 400; // Fixed height or adjust as needed
        }

        window.workflowVisualizer = new WorkflowVisualizer('workflowCanvas');
        
        // Add default data
        const defaultData = {
            nodes: [
                { id: 1, label: 'Start', x: 50, y: 50 },
                { id: 2, label: 'Process', x: 200, y: 50 },
                { id: 3, label: 'End', x: 350, y: 50 }
            ],
            edges: [
                { from: 1, to: 2 },
                { from: 2, to: 3 }
            ]
        };
        
        window.workflowVisualizer.setData(defaultData);
        window.workflowVisualizer.draw();
    } catch (error) {
        console.error('Visualizer initialization error:', error);
    }
}

// Initialize only after DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing visualizer');
    initVisualizer();
});