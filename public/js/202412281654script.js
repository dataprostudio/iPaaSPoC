document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('fileInput');
    const uploadButton = document.getElementById('uploadButton');
    const resultDiv = document.getElementById('result');
    const processFlowDiv = document.getElementById('processFlow');
    const bottlenecksDiv = document.getElementById('bottlenecks');
    const optimizationDiv = document.getElementById('optimization');

    uploadButton.addEventListener('click', uploadFiles);

    async function uploadFiles() {
        const files = fileInput.files;
        console.log('Files selected:', files.length); // Debug log

        if (files.length === 0) {
            alert('Please select one or more files to upload');
            return;
        }

        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append('files', files[i]);
            console.log('Appending file:', files[i].name); // Debug log
        }

        resultDiv.innerText = 'Uploading and analyzing files...';
        processFlowDiv.innerHTML = '';
        bottlenecksDiv.innerHTML = '';
        optimizationDiv.innerHTML = '';

        try {
            console.log('Sending request to server...'); // Debug log
            const response = await fetch('/upload-and-analyze', {
                method: 'POST',
                body: formData
            });

            console.log('Response status:', response.status); // Debug log

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Received data:', data); // Debug log
            
            resultDiv.innerText = 'Analysis complete!';
            visualizeProcess(data.processFlow);
            showBottlenecks(data.bottlenecks);
            showOptimization(data.optimization);
        } catch (error) {
            console.error('Error:', error);
            resultDiv.innerText = 'Error uploading and analyzing files: ' + error.message;
        }
    }

    // Add a state to track expanded nodes
    let expandedNodes = new Set();
    let processDetails = {
        'Process 1': {
            subprocesses: [
                'P1.1[Data Validation]',
                'P1.2[Error Checking]',
                'P1.3[Data Transformation]'
            ],
            manualSteps: [
                'Manual data review',
                'Error correction',
                'Quality assurance'
            ]
        },
        'Process 2': {
            subprocesses: [
                'P2.1[Data Processing]',
                'P2.2[Integration]'
            ],
            manualSteps: [
                'Integration verification',
                'System synchronization'
            ]
        }
    };

    const processBottlenecks = {
        'Process 1': {
            main: [
                'Process 1 takes too long',
                'High resource consumption'
            ],
            subprocesses: {
                'Data Validation': ['Data validation failures: 15%', 'Manual review bottleneck'],
                'Error Checking': ['High false positive rate', 'Sequential processing limitation'],
                'Data Transformation': ['Memory intensive operations', 'Slow processing speed']
            }
        },
        'Process 2': {
            main: [
                'Process 2 has high error rate',
                'Integration delays'
            ],
            subprocesses: {
                'Data Processing': ['Queue overflow during peak hours', 'Resource contention'],
                'Integration': ['API rate limiting issues', 'Synchronization delays']
            }
        }
    };

    // Add detailed optimization suggestions
    const processOptimizations = {
        'Process 1': {
            summary: 'Implement parallel processing and automation',
            details: {
                mainProcess: {
                    suggestions: [
                        'Implement parallel processing for data validation',
                        'Adopt automated validation tools',
                        'Replace manual review with ML-based validation'
                    ],
                    tools: [
                        {
                            name: 'DataValidator Pro',
                            type: '3rd Party Tool',
                            benefits: [
                                'Reduces validation time by 75%',
                                'Built-in ML capabilities',
                                'Automated error correction'
                            ],
                            implementation: 'Medium complexity, 2-3 weeks integration time'
                        }
                    ],
                    processChanges: [
                        'Remove manual validation step',
                        'Implement automated workflow triggers',
                        'Add validation result caching'
                    ]
                },
                subprocesses: {
                    'Data Validation': {
                        suggestions: [
                            'Replace current validation logic with DataValidator Pro API',
                            'Implement validation caching for repeated checks'
                        ],
                        impact: 'Expected 70% reduction in validation time'
                    },
                    'Error Checking': {
                        suggestions: [
                            'Implement parallel error checking',
                            'Add machine learning-based prediction for common errors'
                        ],
                        impact: 'Expected 60% reduction in false positives'
                    },
                    'Data Transformation': {
                        suggestions: [
                            'Optimize memory usage with streaming transformation',
                            'Implement batch processing for large datasets'
                        ],
                        impact: 'Expected 40% reduction in processing time'
                    }
                }
            }
        },
        'Process 2': {
            summary: 'Optimize integration with API management and caching',
            details: {
                mainProcess: {
                    suggestions: [
                        'Implement API rate limiting management',
                        'Add response caching layer',
                        'Implement retry mechanisms with exponential backoff'
                    ],
                    tools: [
                        {
                            name: 'APIManager Plus',
                            type: '3rd Party Solution',
                            benefits: [
                                'Smart rate limiting',
                                'Built-in caching',
                                'Automatic retry handling'
                            ],
                            implementation: 'Low complexity, 1-2 weeks integration time'
                        }
                    ],
                    processChanges: [
                        'Add API request queuing',
                        'Implement cache invalidation strategy',
                        'Add monitoring and alerting'
                    ]
                },
                subprocesses: {
                    'Data Processing': {
                        suggestions: [
                            'Implement queue management system',
                            'Add load balancing for peak hours'
                        ],
                        impact: 'Expected 80% reduction in queue overflow incidents'
                    },
                    'Integration': {
                        suggestions: [
                            'Implement smart retry mechanism',
                            'Add circuit breaker pattern'
                        ],
                        impact: 'Expected 65% reduction in integration failures'
                    }
                }
            }
        }
    };

    function visualizeProcess(processFlow) {
        // Create the base flowchart with subprocesses
        const flowchart = `
            graph TD
            classDef clickable fill:#f9f,stroke:#333,stroke-width:2px,cursor:pointer;
            classDef expanded fill:#fcf,stroke:#ff00de,stroke-width:3px;
            classDef default fill:#f0f0f0,stroke:#666;
            
            %% Main process flow
            A[Start] --> B[Process 1 🔍]
            B --> C[Process 2 🔍]
            C --> D[End]
            
            %% Add subprocess connections for expanded nodes
            ${Array.from(expandedNodes).map(node => {
                const details = processDetails[node];
                if (!details) return '';
                
                // Create subprocess nodes and connections
                let subprocessFlow = [];
                details.subprocesses.forEach((subprocess, index) => {
                    if (node === 'Process 1') {
                        subprocessFlow.push(`B --> P1_${index}${subprocess}`);
                    } else if (node === 'Process 2') {
                        subprocessFlow.push(`C --> P2_${index}${subprocess}`);
                    }
                });
                return subprocessFlow.join('\n');
            }).join('\n')}
            
            %% Style nodes
            class B,C clickable;
            ${Array.from(expandedNodes).map(node => `class ${node === 'Process 1' ? 'B' : 'C'} expanded`).join('\n')}
            
            %% Add tooltips
            click B callback "Click to see details of Process 1"
            click C callback "Click to see details of Process 2"
            
            %% Add bottleneck tooltips
            ${Object.entries(processBottlenecks).map(([process, bottlenecks]) => `
                B:::tooltip[${bottlenecks.main.join('<br>')}]
                ${Object.entries(bottlenecks.subprocesses).map(([subprocess, issues], index) => `
                    P1_${index}:::tooltip[${issues.join('<br>')}]
                `).join('\n')}
            `).join('\n')}
        `;

        processFlowDiv.innerHTML = `
            <h2>Process Flowchart</h2>
            <p class="click-hint">👆 Click on process boxes with 🔍 to see details</p>
            <div class="mermaid">${flowchart}</div>
        `;

        // Force Mermaid to re-render
        mermaid.initialize({
            startOnLoad: true,
            securityLevel: 'loose',
            flowchart: {
                htmlLabels: true,
                curve: 'basis'
            }
        });

        const callback = function(nodeId) {
            const processName = nodeId === 'B' ? 'Process 1' : 'Process 2';
            if (expandedNodes.has(processName)) {
                expandedNodes.delete(processName);
            } else {
                expandedNodes.add(processName);
            }
            
            showProcessDetails(processName);
            showBottlenecks(processName);
            showOptimization(processName);
            visualizeProcess(processFlow);
        };

        // Register the click handler with Mermaid
        mermaid.init(undefined, '.mermaid');
        window.callback = callback;
    }

    function showProcessDetails(processName) {
        const details = processDetails[processName];
        if (!details) return;

        // Create or get the details panel
        let detailsPanel = document.getElementById('processDetails');
        if (!detailsPanel) {
            detailsPanel = document.createElement('div');
            detailsPanel.id = 'processDetails';
            processFlowDiv.appendChild(detailsPanel);
        }

        // Show process details
        detailsPanel.innerHTML = `
            <h3>${processName} Details</h3>
            <h4>Manual Steps:</h4>
            <ul>
                ${details.manualSteps.map(step => `<li>${step}</li>`).join('')}
            </ul>
        `;
    }

    function showBottlenecks(processName) {
        const bottlenecks = processBottlenecks[processName];
        if (!bottlenecks) return;

        bottlenecksDiv.innerHTML = `
            <h2 style="color: red;">Process Bottlenecks</h2>
            <div class="bottleneck-section">
                <h3 style="color: red;">${processName} Main Bottlenecks:</h3>
                <ul>
                    ${bottlenecks.main.map(b => `<li>${b}</li>`).join('')}
                </ul>
            </div>
            
            <div class="bottleneck-section">
                <h3 style="color: red;">Subprocess Bottlenecks:</h3>
                ${Object.entries(bottlenecks.subprocesses).map(([subprocess, issues]) => `
                    <div class="subprocess-bottlenecks">
                        <h4 style="color: red;">${subprocess}:</h4>
                        <ul>
                            ${issues.map(issue => `<li>${issue}</li>`).join('')}
                        </ul>
                    </div>
                `).join('')}
            </div>
        `;
    }

    function showOptimization(processName) {
        const optimization = processOptimizations[processName];
        if (!optimization) return;

        optimizationDiv.innerHTML = `
            <h2>Optimized Integration</h2>
            <div class="optimization-summary">
                <h3>Summary</h3>
                <p>${optimization.summary}</p>
            </div>
            
            <div class="optimization-details">
                <h3>Detailed Optimization Plan</h3>
                
                <div class="optimization-section">
                    <h4>Main Process Improvements</h4>
                    <ul>
                        ${optimization.details.mainProcess.suggestions.map(s => `<li>${s}</li>`).join('')}
                    </ul>
                </div>

                <div class="optimization-section">
                    <h4>Recommended Tools</h4>
                    ${optimization.details.mainProcess.tools.map(tool => `
                        <div class="tool-recommendation">
                            <h5>${tool.name} (${tool.type})</h5>
                            <p><strong>Benefits:</strong></p>
                            <ul>
                                ${tool.benefits.map(b => `<li>${b}</li>`).join('')}
                            </ul>
                            <p><strong>Implementation:</strong> ${tool.implementation}</p>
                        </div>
                    `).join('')}
                </div>

                <div class="optimization-section">
                    <h4>Process Changes</h4>
                    <ul>
                        ${optimization.details.mainProcess.processChanges.map(c => `<li>${c}</li>`).join('')}
                    </ul>
                </div>

                <div class="optimization-section">
                    <h4>Subprocess Optimizations</h4>
                    ${Object.entries(optimization.details.subprocesses).map(([name, details]) => `
                        <div class="subprocess-optimization">
                            <h5>${name}</h5>
                            <ul>
                                ${details.suggestions.map(s => `<li>${s}</li>`).join('')}
                            </ul>
                            <p class="impact" style="color: green;"><strong>Impact:</strong> ${details.impact}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
});