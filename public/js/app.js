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

        const response = await fetch('/upload-and-analyze', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    }

    async function streamAndAnalyzeData(source) {
        const response = await fetch('/stream-and-analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ source })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    }

    function displayResults(data) {
        resultDiv.innerText = 'Analysis complete!';
        visualizeProcess(data.processFlow);
        showBottlenecks(data.bottlenecks);
        showOptimization(data.optimization);
    }

    function visualizeProcess(processFlow) {
        // Implementation remains the same
    }

    function showBottlenecks(bottlenecks) {
        // Implementation remains the same
    }

    function showOptimization(optimization) {
        // Implementation remains the same
    }
});

