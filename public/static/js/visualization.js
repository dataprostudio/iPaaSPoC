// WorkflowVisualizer class definition
class WorkflowVisualizer {
    constructor(canvasId = 'visualizer') {
        this.canvasId = canvasId;
        this.initializeCanvas();
    }

    initializeCanvas() {
        try {
            this.canvas = document.getElementById(this.canvasId);
            if (!this.canvas) {
                throw new Error(`Canvas element '${this.canvasId}' not found`);
            }

            this.ctx = this.canvas.getContext('2d');
            if (!this.ctx) {
                throw new Error('Failed to get canvas context');
            }

            // Set explicit dimensions
            const container = document.getElementById('visualization-container');
            if (container) {
                this.canvas.width = container.clientWidth || 800;
                this.canvas.height = container.clientHeight || 600;
                console.log('Canvas dimensions:', this.canvas.width, 'x', this.canvas.height);
            }

            // Debug: Add border to see canvas
            this.canvas.style.border = '1px solid red';
            
            window.addEventListener('resize', () => this.resizeCanvas());
            console.log('Canvas initialized successfully');
        } catch (error) {
            console.error('Canvas initialization error:', error);
        }
    }

    resizeCanvas() {
        if (!this.canvas || !this.ctx) return;
        
        const container = document.getElementById('visualization-container');
        if (container) {
            this.canvas.width = container.clientWidth;
            this.canvas.height = container.clientHeight;
            if (this.lastData) {
                this.createVisualization(this.lastData);
            }
        }
    }

    createVisualization(data) {
        console.log('Creating visualization with data:', data);
        if (!this.ctx || !this.canvas) {
            console.error('No canvas or context');
            return;
        }

        this.lastData = data;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (!data?.data?.nodes) {
            console.error('Invalid data structure:', data);
            return;
        }

        // Debug: Draw background to verify canvas is working
        this.ctx.fillStyle = '#f0f0f0';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.drawEdges(data.data.edges);
        this.drawNodes(data.data.nodes);
    }

    drawNodes(nodes) {
        console.log('Drawing nodes:', nodes);
        const startX = 100;
        const startY = this.canvas.height / 2;
        const spacing = 200;

        nodes.forEach((node, index) => {
            const x = startX + (index * spacing);
            const y = startY;
            
            // Node circle
            this.ctx.beginPath();
            this.ctx.arc(x, y, 40, 0, Math.PI * 2);
            this.ctx.fillStyle = '#4CAF50';
            this.ctx.fill();
            this.ctx.strokeStyle = '#2E7D32';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();

            // Node label
            this.ctx.fillStyle = 'white';
            this.ctx.font = 'bold 14px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(node.label, x, y);
        });
    }

    drawEdges(edges) {
        console.log('Drawing edges:', edges);
        if (!edges) return;

        const startX = 100;
        const startY = this.canvas.height / 2;
        const spacing = 200;

        this.ctx.strokeStyle = '#2196F3';
        this.ctx.lineWidth = 2;

        edges.forEach(edge => {
            const fromX = startX + ((edge.from - 1) * spacing);
            const toX = startX + ((edge.to - 1) * spacing);
            const y = startY;

            // Draw arrow
            this.ctx.beginPath();
            this.ctx.moveTo(fromX + 40, y);
            this.ctx.lineTo(toX - 40, y);
            
            // Arrowhead
            const arrowSize = 10;
            this.ctx.moveTo(toX - 40, y);
            this.ctx.lineTo(toX - 40 - arrowSize, y - arrowSize);
            this.ctx.moveTo(toX - 40, y);
            this.ctx.lineTo(toX - 40 - arrowSize, y + arrowSize);
            
            this.ctx.stroke();
        });
    }
}

// Initialize visualizer
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing visualizer');
    window.visualizer = new WorkflowVisualizer('visualizer');
});

function switchTab(tabName) {
    console.log('Switching to', tabName, 'tab');
    
    // Remove active class from all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
        tab.style.display = 'none';
    });
    
    // Add active class to selected tab
    const selectedTab = document.getElementById(tabName);
    if (selectedTab) {
        selectedTab.classList.add('active');
        selectedTab.style.display = 'block';
    }
}