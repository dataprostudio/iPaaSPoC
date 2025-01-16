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
        
        const analysisText = data.analysis || '';
        
        // Create nodes with tooltips - store in a persistent variable
        const nodes = new vis.DataSet([
            { id: 1, label: 'Start', shape: 'box' },
            { 
                id: 2, 
                label: 'Process', 
                shape: 'box',
                title: 'Click for analysis'
            }
        ]);

        const edges = new vis.DataSet([
            { from: 1, to: 2 }
        ]);

        const container = document.getElementById('visualization');
        const networkData = { nodes, edges };
        
        const options = {
            nodes: {
                shape: 'box',
                margin: 10,
                shadow: true,
                color: {
                    background: '#ffffff',
                    border: '#2B7CE9'
                },
                font: { size: 16 }
            },
            edges: {
                width: 2,
                color: '#2B7CE9'
            },
            interaction: {
                hover: true,
                tooltipDelay: 200,
                dragNodes: true,
                dragView: true
            },
            physics: {
                enabled: true,
                barnesHut: {
                    gravitationalConstant: -2000,
                    centralGravity: 0.3,
                    springLength: 200
                },
                stabilization: {
                    iterations: 50
                }
            }
        };

        // Create network instance
        const network = new vis.Network(container, networkData, options);
        
        // Store network instance
        window.currentNetwork = network;

        network.on('click', function(params) {
            if (params.nodes.length > 0) {
                const nodeId = params.nodes[0];
                if (nodeId === 2) {
                    const existingPopup = document.getElementById('node-details');
                    if (existingPopup) {
                        existingPopup.remove();
                    }

                    const popup = document.createElement('div');
                    popup.id = 'node-details';

                    popup.innerHTML = `
                        <div class="header">
                            <button class="close-button" 
                                    onclick="document.getElementById('node-details').remove()">✖</button>
                            <h3>Process Analysis</h3>
                        </div>
                        <div class="content">
                            ${analysisText.split('\n').map(line => 
                                line.trim().startsWith('*') ? 
                                `<li>${line.substring(1)}</li>` : 
                                `<p>${line}</p>`
                            ).join('')}
                        </div>
                    `;

                    document.body.appendChild(popup);

                    // Make popup draggable
                    let isDragging = false;
                    let currentX;
                    let currentY;
                    let initialX;
                    let initialY;

                    popup.addEventListener('mousedown', dragStart);
                    document.addEventListener('mousemove', drag);
                    document.addEventListener('mouseup', dragEnd);

                    function dragStart(e) {
                        initialX = e.clientX - popup.offsetLeft;
                        initialY = e.clientY - popup.offsetTop;
                        if (e.target === popup) {
                            isDragging = true;
                        }
                    }

                    function drag(e) {
                        if (isDragging) {
                            e.preventDefault();
                            currentX = e.clientX - initialX;
                            currentY = e.clientY - initialY;
                            popup.style.left = currentX + 'px';
                            popup.style.top = currentY + 'px';
                            popup.style.transform = 'none';
                        }
                    }

                    function dragEnd() {
                        isDragging = false;
                    }
                }
            }
        });

        return network;
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

// Update the Process Analysis section within the Analysis tab
function updateAnalysis(analysisText) {
    console.log('Analysis text received:', analysisText); 
    
    // Function to update content when tab is ready
    const updateContent = () => {
        // Try to find the analysis content area in the bundled structure
        const analysisContent = document.querySelector('[data-tab="analysis"] .process-analysis') ||
                              document.querySelector('.analysis-content-wrapper');
        
        if (analysisContent) {
            console.log('Found analysis content area');
            analysisContent.innerHTML = `
                <div class="analysis-text">
                    ${analysisText.split('\n').map(line => `<p>${line}</p>`).join('')}
                </div>
            `;
            console.log('Analysis content updated');
        } else {
            console.error('Analysis content area not found');
        }
    };

    // Wait for tab switch and content initialization
    setTimeout(updateContent, 200);
}

async function uploadFile() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    if (!file) {
        alert('Please select a file first');
        return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch('/generate', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        if (data.success) {
            // Update visualization
            window.visualizer.drawWorkflow(data.data);
            
            // Update analysis in your existing tab
            if (data.analysis) {
                updateAnalysis(data.analysis);
            }
        } else {
            throw new Error(data.error || 'Unknown error');
        }
    } catch (error) {
        console.error('Error uploading file:', error);
        alert('Error uploading file: ' + error.message);
    }
}