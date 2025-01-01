document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('fileInput');
    const streamSource = document.getElementById('streamSource');
    const analyzeButton = document.getElementById('analyzeButton');
    const resultDiv = document.getElementById('result');
    const processFlowDiv = document.getElementById('processFlow');
    const bottlenecksDiv = document.getElementById('bottlenecks');
    const optimizationDiv = document.getElementById('optimization');

    fileInput.addEventListener('change', handleFileSelection);
    analyzeButton.addEventListener('click', handleAnalysis);

    async function checkLLMStatus() {
        try {
            const response = await fetch('/llm_status');
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

    function handleFileSelection(event) {
        const files = event.target.files;
        updateFileList(files);
    }

    function updateFileList(files) {
        const fileList = document.getElementById('fileList');
        fileList.innerHTML = Array.from(files).map(file => `<div>${file.name}</div>`).join('');
    }

    async function handleAnalysis() {
        const files = fileInput.files;
        const selectedSource = streamSource.value;

        if (files.length === 0 && !selectedSource) {
            alert('Please select files to upload or choose a data source for streaming.');
            return;
        }

        resultDiv.innerText = 'Analyzing...';
        processFlowDiv.innerHTML = '';
        bottlenecksDiv.innerHTML = '';
        optimizationDiv.innerHTML = '';

        try {
            let response;
            if (files.length > 0) {
                response = await uploadAndAnalyzeFiles(files);
            } else {
                response = await streamAndAnalyzeData(selectedSource);
            }

            // Ensure the response is JSON
            const responseText = await response.text();
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (parseError) {
                throw new Error('Server returned invalid JSON response');
            }

            displayResults(data);
        } catch (error) {
            console.error('Error:', error);
            resultDiv.innerHTML = `
                <div class="error-message">
                    Error analyzing data:<br>
                    ${error.message}<br>
                    <small>Please try again or contact support if the problem persists.</small>
                </div>
            `;
        }
    }

    async function uploadAndAnalyzeFiles(files) {
        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append('files', files[i]);
        }

        try {
            const response = await fetch('/upload-and-analyze', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Upload error:', error);
            throw new Error(`Failed to analyze files: ${error.message}`);
        }
    }

    async function streamAndAnalyzeData(source) {
        const response = await fetch('/stream-and-analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ source })
        });

        const responseText = await response.text();
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (parseError) {
            throw new Error('Server returned invalid JSON response');
        }

        if (!response.ok) {
            throw new Error(data.message || `HTTP error! status: ${response.status}`);
        }

        return data;
    }

    function displayResults(data) {
        resultDiv.innerText = 'Analysis complete!';
        
        if (data.processFlow) {
            visualizeProcess(data.processFlow);
        }
        
        if (data.bottlenecks) {
            showBottlenecks(data.bottlenecks);
        }
        
        if (data.optimization) {
            showOptimization(data.optimization);
        }
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
        const diagram = ['flowchart TD'];
        processFlow.forEach((step, index) => {
            const currentId = `step${index}`;
            const nextId = `step${index + 1}`;
            const cleanStep = step.replace(/[^a-zA-Z0-9\s]/g, '');
            diagram.push(`    ${currentId}["${cleanStep}"]`);
            if (index < processFlow.length - 1) {
                diagram.push(`    ${currentId} --> ${nextId}`);
            }
        });

        const diagramDefinition = diagram.join('\n');
        container.innerHTML = diagramDefinition;

        // Render the new diagram
        mermaid.render('mermaid-svg', diagramDefinition).then(result => {
            container.innerHTML = result.svg;
        }).catch(error => {
            console.error('Mermaid rendering error:', error);
            container.innerHTML = `
                <div class="error-message">
                    Error rendering process diagram: ${error.message}
                </div>
            `;
        });
    }

    function showBottlenecks(bottlenecks) {
        bottlenecksDiv.innerHTML = '<h2>Bottlenecks</h2>';
        
        if (bottlenecks.identified && bottlenecks.issues) {
            const list = document.createElement('ul');
            bottlenecks.issues.forEach(issue => {
                const item = document.createElement('li');
                item.textContent = issue;
                list.appendChild(item);
            });
            bottlenecksDiv.appendChild(list);
        } else {
            bottlenecksDiv.innerHTML += '<p>No bottlenecks identified.</p>';
        }
    }

    function showOptimization(optimization) {
        optimizationDiv.innerHTML = '<h2>Optimization Suggestions</h2>';
        
        if (optimization.suggestions && optimization.suggestions.length > 0) {
            const list = document.createElement('ul');
            optimization.suggestions.forEach(suggestion => {
                const item = document.createElement('li');
                item.textContent = suggestion;
                list.appendChild(item);
            });
            optimizationDiv.appendChild(list);
        } else {
            optimizationDiv.innerHTML += '<p>No optimization suggestions available.</p>';
        }
    }
});

