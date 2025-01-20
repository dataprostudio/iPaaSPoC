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

            const container = document.getElementById('visualization-container');
            if (container) {
                this.canvas.width = container.clientWidth || 800;
                this.canvas.height = container.clientHeight || 600;
            }

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
        
        if (!window.networkInstance) {
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
                }
            };

            window.networkInstance = new vis.Network(container, networkData, options);
        }

        // Update Analysis tab content
        const analysisTab = document.querySelector('.analysis-tab-content');
        if (analysisTab && data.analysis) {
            analysisTab.innerHTML = `
                <div class="process-analysis">
                    <h3>Process Analysis</h3>
                    <div class="analysis-text">
                        ${data.analysis.split('\n').map(line => 
                            `<p>${line}</p>`
                        ).join('')}
                    </div>
                </div>
            `;
        }

        return window.networkInstance;
    }

    drawNodes(nodes) {
        nodes.forEach((node, index) => {
            const x = 100 + (index * 200);
            const y = this.canvas.height / 2;
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, 40, 0, Math.PI * 2);
            this.ctx.fillStyle = '#4CAF50';
            this.ctx.fill();
            this.ctx.strokeStyle = '#2E7D32';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();

            this.ctx.fillStyle = 'white';
            this.ctx.font = 'bold 14px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(node.label, x, y);
        });
    }

    drawEdges(edges) {
        if (!edges) return;

        edges.forEach(edge => {
            const fromX = 100 + ((edge.from - 1) * 200);
            const toX = 100 + ((edge.to - 1) * 200);
            const y = this.canvas.height / 2;

            this.ctx.strokeStyle = '#2196F3';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(fromX + 40, y);
            this.ctx.lineTo(toX - 40, y);
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
    // Store current tab
    localStorage.setItem('currentTab', tabName);
    
    document.querySelectorAll('.tab-content').forEach(tab => {
        if (tab.id === tabName) {
            tab.style.display = 'block';
            tab.classList.add('active');
        } else {
            tab.style.display = 'none';
            tab.classList.remove('active');
        }
    });
    
    // Redraw visualization if switching to its tab
    if (tabName === 'visualization-tab' && window.networkInstance) {
        setTimeout(() => {
            window.networkInstance.fit(); // Fit to view
            window.networkInstance.redraw(); // Force redraw
            const container = document.getElementById('visualization');
            if (container) {
                container.style.height = '600px'; // Set explicit height
                window.networkInstance.setSize('100%', '600px');
            }
        }, 100); // Small delay to ensure DOM is ready
    }
}

async function uploadFile() {
    try {
        const fileInput = document.getElementById('fileInput');
        const modelSelect = document.getElementById('modelSelect');
        const file = fileInput.files[0];
        
        if (!file) {
            alert('Please select a file first');
            return;
        }

        console.log('Selected file:', file.name);
        console.log('Selected model:', modelSelect.value);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('model', modelSelect.value);

        const response = await fetch('/api/generate', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Response data:', data);

        displayResults(data);
    } catch (error) {
        console.error('Error:', error);
        alert('Error uploading file: ' + error.message);
    }
}

// Add click handler for nodes
function initializeNodeClickHandler() {
    if (window.networkInstance) {
        window.networkInstance.on('click', function(params) {
            console.log('Node clicked:', params); // Debug log
            if (params.nodes.length > 0) {
                const nodeId = params.nodes[0];
                const node = window.networkInstance.body.data.nodes.get(nodeId);
                console.log('Node data:', node); // Debug log
                
                // Update analysis tab with node content
                const analysisTab = document.querySelector('.analysis-tab-content');
                if (analysisTab) {
                    analysisTab.innerHTML = `
                        <div class="process-analysis">
                            <h3>Node Content</h3>
                            <div class="analysis-text">
                                <p>${node.label || 'No content available'}</p>
                            </div>
                        </div>
                    `;
                    // Make sure analysis tab is visible
                    switchTab('analysis-tab');
                }
            }
        });
    }
}

// Call this after creating visualization
document.addEventListener('DOMContentLoaded', () => {
    initializeNodeClickHandler();
});

function displayResults(data) {
    console.log('Received data for visualization:', data);
    
    // Create nodes from LLM analysis
    const nodes = [];
    let nodeId = 1;
    
    // Add process nodes from LLM analysis
    if (data.analysis) {
        // Parse the LLM response to extract process steps
        const processes = extractProcesses(data.analysis);
        processes.forEach(process => {
            nodes.push({
                id: nodeId,
                label: process.name,
                title: process.details,
                shape: 'box',
                color: '#97C2FC'
            });
            nodeId++;
        });
    }

    // Create edges between nodes
    const edges = [];
    for (let i = 1; i < nodes.length; i++) {
        edges.push({ from: i, to: i + 1, arrows: 'to' });
    }

    const container = document.getElementById('visualization');
    const options = {
        nodes: {
            shape: 'box',
            margin: 10,
            widthConstraint: { maximum: 200 },
            font: { size: 14 }
        },
        interaction: {
            hover: true,
            tooltipDelay: 0
        },
        physics: {
            enabled: true,
            hierarchicalRepulsion: {
                nodeDistance: 150
            }
        }
    };

    // Create network
    const network = new vis.Network(container, { nodes, edges }, options);

    // Handle node clicks - show detailed modal
    network.on('click', function(params) {
        if (params.nodes.length > 0) {
            const nodeId = params.nodes[0];
            const node = nodes.find(n => n.id === nodeId);
            if (node && node.title) {
                showDetailsModal(node.label, node.title);
            }
        }
    });

    // Update analysis tab
    updateAnalysisTab(data.analysis);
}

// Helper function to extract processes from LLM analysis
function extractProcesses(analysis) {
    // Split analysis into process steps
    const processes = [];
    const lines = analysis.split('\n');
    
    let currentProcess = null;
    
    lines.forEach(line => {
        // Look for process indicators (numbers, bullets, etc.)
        if (line.match(/^\d+\.|\*|\-/)) {
            if (currentProcess) {
                processes.push(currentProcess);
            }
            currentProcess = {
                name: line.replace(/^\d+\.|\*|\-/, '').trim(),
                details: ''
            };
        } else if (currentProcess && line.trim()) {
            currentProcess.details += line.trim() + '\n';
        }
    });
    
    if (currentProcess) {
        processes.push(currentProcess);
    }
    
    return processes;
}

// Show modal with node details
function showDetailsModal(title, content) {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">${title}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <pre>${content}</pre>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();
    modal.addEventListener('hidden.bs.modal', () => {
        modal.remove();
    });
}

// Update analysis tab content
function updateAnalysisTab(analysis) {
    const analysisContent = document.getElementById('analysisContent');
    if (analysisContent && analysis) {
        analysisContent.innerHTML = `<pre>${analysis}</pre>`;
    }
}