document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('fileInput');
    const uploadButton = document.getElementById('uploadButton');
    const resultDiv = document.getElementById('result');
    const processFlowDiv = document.getElementById('processFlow');
    const bottlenecksDiv = document.getElementById('bottlenecks');
    const optimizationDiv = document.getElementById('optimization');

    // Add event listener to handle file selection
    fileInput.addEventListener('change', handleFileSelection);

    uploadButton.addEventListener('click', uploadFiles);

    function handleFileSelection(event) {
        const files = event.target.files;
        console.log('Files selected:', files.length); // Debug log
        // Display selected file names
        resultDiv.innerHTML = `<p>Selected files:</p><ul>${Array.from(files).map(file => `<li>${file.name}</li>`).join('')}</ul>`;
        
        // Display selected file names to the right of the "Choose Files" button
        const fileList = document.createElement('div');
        fileList.id = 'fileList';
        fileList.innerHTML = `<ul>${Array.from(files).map(file => `<li>${file.name}</li>`).join('')}</ul>`;
        fileInput.parentNode.appendChild(fileList);

        // Remove previous file list if it exists
        const existingFileList = document.getElementById('fileList');
        if (existingFileList) {
            existingFileList.remove();
        }
    }

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
                'P1.1[Data Validation]': ['Data validation failures: 15%', 'Manual review bottleneck'],
                'P1.2[Error Checking]': ['High false positive rate', 'Sequential processing limitation'],
                'P1.3[Data Transformation]': ['Memory intensive operations', 'Slow processing speed']
            }
        },
        'Process 2': {
            main: [
                'Process 2 has high error rate',
                'Integration delays'
            ],
            subprocesses: {
                'P2.1[Data Processing]': ['Queue overflow during peak hours', 'Resource contention'],
                'P2.2[Integration]': ['API rate limiting issues', 'Synchronization delays']
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

    // Function to check and upgrade Mermaid version
    async function checkAndUpgradeMermaid() {
        const currentVersion = mermaid.version;
        const latestVersion = await fetch('https://api.github.com/repos/mermaid-js/mermaid/releases/latest')
            .then(response => response.json())
            .then(data => data.tag_name);

        if (currentVersion !== latestVersion) {
            console.log(`Upgrading Mermaid from version ${currentVersion} to ${latestVersion}`);
            const script = document.createElement('script');
            script.src = `https://cdn.jsdelivr.net/npm/mermaid@${latestVersion}/dist/mermaid.min.js`;
            script.onload = () => {
                console.log(`Mermaid upgraded to version ${latestVersion}`);
                mermaid.initialize({
                    startOnLoad: true,
                    securityLevel: 'loose',
                    flowchart: {
                        htmlLabels: true,
                        curve: 'basis'
                    }
                });
                visualizeProcess(); // Re-render the process flowchart
            };
            document.head.appendChild(script);
        } else {
            console.log(`Mermaid is up-to-date (version ${currentVersion})`);
        }
    }

    // Call the function to check and upgrade Mermaid
    checkAndUpgradeMermaid();

    function visualizeProcess(processFlow) {
        // Create the base flowchart with subprocesses
        let flowchart = [
            'graph TD',
            'classDef clickable fill:#f9f,stroke:#333,stroke-width:2px,cursor:pointer',
            'classDef expanded fill:#fcf,stroke:#ff00de,stroke-width:3px',
            'classDef default fill:#f0f0f0,stroke:#666',
            'classDef hover fill:#e6e6e6,stroke:#333,cursor:pointer',
            '',
            'A[Start] --> B[Process 1 🔍]',
            'B --> C[Process 2 🔍]',
            'C --> D[End]'
        ];

        // Add subprocess connections for expanded nodes
        expandedNodes.forEach(node => {
            const details = processDetails[node];
            if (!details) return;

            details.subprocesses.forEach((subprocess, index) => {
                const nodeId = node === 'Process 1' ? 'B' : 'C';
                const subprocessId = `${nodeId}_${index + 1}`;
                flowchart.push(`${nodeId} --> ${subprocessId}["${subprocess}"]`);
            });
        });

        // Add styling
        flowchart.push('class B,C clickable');
        expandedNodes.forEach(node => {
            const nodeId = node === 'Process 1' ? 'B' : 'C';
            flowchart.push(`class ${nodeId} expanded`);
        });

        processFlowDiv.innerHTML = `
            <style>
                .process-tooltip {
                    position: fixed;
                    background: rgba(0, 0, 0, 0.8);
                    color: white;
                    padding: 10px;
                    border-radius: 5px;
                    font-size: 14px;
                    max-width: 300px;
                    z-index: 1000;
                    pointer-events: none;
                    visibility: hidden;
                }
                .clickable {
                    cursor: pointer;
                }
            </style>
            <h2>Process Flowchart</h2>
            <p class="click-hint">👆 Click on process boxes with 🔍 to see details (hover to see bottlenecks)</p>
            <div class="mermaid">${flowchart.join('\n')}</div>
            <div id="tooltip" class="process-tooltip"></div>
        `;

        try {
            mermaid.initialize({
                startOnLoad: true,
                securityLevel: 'loose',
                flowchart: {
                    htmlLabels: true,
                    curve: 'basis'
                }
            });

            mermaid.init(undefined, '.mermaid');

            // Add hover functionality after Mermaid renders
            setTimeout(() => {
                const tooltip = document.getElementById('tooltip');
                
                // First, handle main process nodes
                document.querySelectorAll('.node.clickable').forEach(node => {
                    node.addEventListener('click', () => {
                        const processName = node.textContent.includes('Process 1') ? 'Process 1' : 'Process 2';
                        toggleDetails(processName);
                    });

                    setupHoverHandlers(node, tooltip);
                });

                // Handle all nodes that contain subprocess information
                document.querySelectorAll('.node').forEach(node => {
                    const nodeText = node.textContent.trim();
                    // Check if this is a subprocess node (contains P1.x or P2.x pattern)
                    if (nodeText.match(/P[12]\.\d+/)) {
                        setupHoverHandlers(node, tooltip);
                    }
                });

                function setupHoverHandlers(node, tooltip) {
                    node.addEventListener('mouseenter', (e) => {
                        let tooltipContent = '';
                        const nodeText = node.textContent.trim();
                        const isMainProcess = node.classList.contains('clickable');
                        
                        if (isMainProcess) {
                            // Handle main process hover
                            const processName = nodeText.includes('Process 1') ? 'Process 1' : 'Process 2';
                            const mainBottlenecks = processBottlenecks[processName]?.main;
                            
                            if (mainBottlenecks) {
                                tooltipContent = `
                                    <div style="max-width: 300px;">
                                    <strong>Main Process Bottlenecks:</strong>
                                    <ul style="margin: 5px 0; padding-left: 20px;">
                                        ${mainBottlenecks.map(b => `<li>${b}</li>`).join('')}
                                    </ul>
                                    </div>
                                `;
                            }
                        } else {
                            // Handle subprocess hover
                            const processName = nodeText.startsWith('P1') ? 'Process 1' : 'Process 2';
                            const subprocessName = nodeText.match(/P[12]\.\d+\[.*?\]/)?.[0];
                            
                            if (subprocessName && processBottlenecks[processName]?.subprocesses[subprocessName]) {
                                const bottlenecks = processBottlenecks[processName].subprocesses[subprocessName];
                                tooltipContent = `
                                    <div style="max-width: 300px;">
                                    <strong>Bottlenecks:</strong>
                                    <ul style="margin: 5px 0; padding-left: 20px;">
                                        ${bottlenecks.map(b => `<li>${b}</li>`).join('')}
                                    </ul>
                                    </div>
                                `;
                            }
                        }

                        if (tooltipContent) {
                            tooltip.innerHTML = tooltipContent;
                            tooltip.style.visibility = 'visible';
                        }
                    });

                    node.addEventListener('mousemove', (e) => {
                        tooltip.style.left = (e.pageX + 10) + 'px';
                        tooltip.style.top = (e.pageY - tooltip.offsetHeight - 10) + 'px';
                    });

                    node.addEventListener('mouseleave', () => {
                        tooltip.style.visibility = 'hidden';
                    });
                }
            }, 1000);
        } catch (error) {
            console.error('Mermaid syntax error:', error);
            displayMermaidSyntaxError();
        }
    }

    function toggleDetails(processName) {
        if (expandedNodes.has(processName)) {
            expandedNodes.delete(processName);
        } else {
            expandedNodes.add(processName);
        }
        
        visualizeProcess(processDetails); // Pass the correct process details
        showProcessDetails(processName);
        showBottlenecks(processName);
        showOptimization(processName);
    }

    // Function to display Mermaid syntax error message
    function displayMermaidSyntaxError() {
        const errorDiv = document.createElement('div');
        errorDiv.style.color = 'red';
        errorDiv.innerText = 'Syntax error in Mermaid diagram. Please check the syntax and try again.';
        processFlowDiv.appendChild(errorDiv);
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