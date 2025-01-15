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

            displayResults(response);
        } catch (error) {
            console.error('Error:', error);
            resultDiv.innerText = 'Error analyzing data: ' + error.message;
        }
    }

    async function uploadAndAnalyzeFiles(files) {
        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append('files', files[i]);
        }

        const response = await fetch('http://localhost:3001/upload-and-analyze', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        return await response.json();
    }

    async function streamAndAnalyzeData(source) {
        const response = await fetch('http://localhost:3001/stream-and-analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ source })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        return await response.json();
    }

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
            }
        });

        const diagramDefinition = diagram.join('\n');
        container.innerHTML = diagramDefinition;

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

    function showBottlenecks(bottlenecks) {
        // Implementation remains the same
    }

    function showOptimization(optimization) {
        // Implementation remains the same
    }
});

