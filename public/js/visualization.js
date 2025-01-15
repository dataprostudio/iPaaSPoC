// WorkflowVisualizer class definition
class WorkflowVisualizer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.nodes = [];
        this.edges = [];
        this.setupCanvas();
    }

    setupCanvas() {
        const container = this.canvas.parentElement;
        if (container) {
            this.canvas.width = container.clientWidth;
            this.canvas.height = 400;
        }
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    setData(data) {
        this.nodes = data.nodes || [];
        this.edges = data.edges || [];
    }

    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw edges
        this.edges.forEach(edge => {
            const fromNode = this.nodes.find(n => n.id === edge.from);
            const toNode = this.nodes.find(n => n.id === edge.to);
            if (fromNode && toNode) {
                this.ctx.beginPath();
                this.ctx.moveTo(fromNode.x, fromNode.y);
                this.ctx.lineTo(toNode.x, toNode.y);
                this.ctx.strokeStyle = '#000000';
                this.ctx.stroke();
            }
        });

        // Draw nodes
        this.nodes.forEach(node => {
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, 20, 0, 2 * Math.PI);
            this.ctx.fillStyle = '#4CAF50';
            this.ctx.fill();
            this.ctx.strokeStyle = '#000000';
            this.ctx.stroke();

            // Draw label
            this.ctx.fillStyle = '#000000';
            this.ctx.font = '12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(node.label, node.x, node.y + 30);
        });
    }
}

// Initialization function
function initVisualizer() {
    console.log('Initializing visualizer');
    const canvas = document.getElementById('workflowCanvas');
    
    if (!canvas) {
        console.error('Canvas element not found, retrying in 100ms');
        setTimeout(initVisualizer, 100);
        return;
    }

    try {
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