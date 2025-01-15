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
                body: formData,
                headers: {
                    // Don't set Content-Type here, let the browser set it with boundary
                    'Accept': 'application/json'
                }
            });

            console.log('Response status:', response.status); // Debug log

            // Get the response text first
            const responseText = await response.text();
            let data;
            
            try {
                // Try to parse it as JSON
                data = JSON.parse(responseText);
            } catch (parseError) {
                console.error('JSON Parse Error:', parseError);
                console.error('Raw response:', responseText);
                throw new Error('Server returned invalid JSON response');
            }

            if (!response.ok || data.error) {
                throw new Error(data.message || data.error || `Server error: ${response.status}`);
            }

            console.log('Received data:', data); // Debug log
            
            resultDiv.innerText = 'Analysis complete!';
            displayResults(data);
        } catch (error) {
            console.error('Error:', error);
            resultDiv.innerHTML = `
                <div class="error-message">
                    Error uploading and analyzing files:<br>
                    ${error.message}<br>
                    <small>Please try again or contact support if the problem persists.</small>
                </div>
            `;
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
        // Simplified Mermaid initialization
        mermaid.initialize({
            startOnLoad: true,
            securityLevel: 'loose',
            flowchart: {
                htmlLabels: true,
                curve: 'basis'
            }
        });
    }

    // Call the function to initialize Mermaid
    checkAndUpgradeMermaid();

    // Add LLM status check
    async function checkLLMStatus() {
        try {
            const response = await fetch('/llm-status');
            const status = await response.json();
            
            const statusDiv = document.createElement('div');
            statusDiv.className = 'llm-status';
            statusDiv.innerHTML = `
                <div class="status-indicator ${status.available ? 'available' : 'unavailable'}">
                    LLM Status: ${status.available ? 'Available' : 'Fallback Mode'}
                </div>
                ${status.error ? `
                    <div class="status-error">
                        <p>Error: ${status.error}</p>
                        <p>Model Path: ${status.modelPath}</p>
                        ${status.downloadInstructions ? `
                            <p>Download Instructions: 
                                <a href="${status.downloadInstructions.split(' ')[1]}" target="_blank">
                                    Download Model
                                </a>
                            </p>
                        ` : ''}
                    </div>
                ` : ''}
            `;
            
            document.querySelector('.container').insertBefore(
                statusDiv, 
                document.querySelector('.container').firstChild
            );
        } catch (error) {
            console.error('Failed to check LLM status:', error);
        }
    }

    // Call status check on page load
    checkLLMStatus();

    function displayResults(data) {
        resultDiv.innerText = 'Analysis complete!';
        
        // Check Mermaid status before rendering
        if (checkMermaidStatus()) {
            visualizeProcess(data.processFlow);
        } else {
            processFlowDiv.innerHTML = '<div class="error-message">Unable to load diagram rendering library</div>';
        }
        
        showBottlenecks(data.bottlenecks);
        showOptimization(data.optimization);
    }

    function visualizeProcess(processFlow) {
        if (!processFlow || !Array.isArray(processFlow)) {
            console.error('Invalid process flow data:', processFlow);
            return;
        }

        const container = document.getElementById('mermaidContainer');
        if (!container) {
            console.error('Mermaid container not found');
            return;
        }

        // Build the Mermaid diagram definition
        const diagram = [
            'graph TD',
            'classDef default fill:#f9f,stroke:#333,stroke-width:2px;',
            'classDef active fill:#f96,stroke:#333,stroke-width:4px;'
        ];

        // Add nodes and connections
        processFlow.forEach((step, index) => {
            const currentId = `step${index}`;
            const nextId = `step${index + 1}`;
            const cleanStep = step.replace(/[^a-zA-Z0-9\s-]/g, ''); // Clean the step text

            if (index < processFlow.length - 1) {
                diagram.push(`    ${currentId}["${cleanStep}"] --> ${nextId}["${processFlow[index + 1]}"]`);
            } else {
                diagram.push(`    ${currentId}["${cleanStep}"]`);
            }
        });

        const diagramDefinition = diagram.join('\n');
        container.innerHTML = `\`\`\`mermaid\n${diagramDefinition}\n\`\`\``;

        // Clear any existing diagrams and render the new one
        try {
            mermaid.contentLoaded();
        } catch (error) {
            console.error('Mermaid rendering error:', error);
            container.innerHTML = `
                <div class="error-message">
                    Error rendering process diagram: ${error.message}
                </div>
            `;
        }
    }

    // Update the checkMermaidStatus function
    function checkMermaidStatus() {
        if (typeof mermaid === 'undefined') {
            console.error('Mermaid is not loaded!');
            return false;
        }
        // Remove the version check and just verify mermaid is available
        return true;
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

    async function generateText(prompt) {
        try {
            const response = await fetch('/generate-text', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ prompt })
            });

            if (!response.ok) {
                throw new Error('Failed to generate text');
            }

            const data = await response.json();
            return data.generatedText;
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    }

    // Example usage
    document.getElementById('generateButton').addEventListener('click', async () => {
        const prompt = document.getElementById('promptInput').value;
        try {
            const generatedText = await generateText(prompt);
            document.getElementById('generatedText').innerText = generatedText;
        } catch (error) {
            document.getElementById('generatedText').innerText = 'Error generating text';
        }
    });
});