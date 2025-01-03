let bottlenecksDiv;
let optimizationDiv;

document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('fileInput');
    const uploadButton = document.getElementById('uploadButton');
    const resultDiv = document.getElementById('result');
    const processFlowDiv = document.getElementById('processFlow');
    bottlenecksDiv = document.getElementById('bottlenecks');
    optimizationDiv = document.getElementById('optimization');

    uploadButton.addEventListener('click', uploadFiles);

    async function uploadFiles() {
        // ... (keep the existing upload logic)

        try {
            // ... (keep the existing try/catch block)
            
            resultDiv.innerText = 'Analysis complete!';
            visualizeProcess(data.processFlow);
            showBottlenecks(data.bottlenecks);
            showOptimization(data.optimization);
        } catch (error) {
            console.error('Error:', error);
            resultDiv.innerText = 'Error uploading and analyzing files: ' + error.message;
        }
    }

    function visualizeProcess(processFlow) {
        // ... (keep the existing visualizeProcess function)
    }

    function showBottlenecks(bottlenecks) {
        bottlenecksDiv.innerHTML = `
            <h2 class="bottleneck-heading">Process Bottlenecks</h2>
            <ul>
                ${bottlenecks.map(b => `<li>${b}</li>`).join('')}
            </ul>
        `;
    }

    function showOptimization(optimization) {
        const regex = /(\d+(?:\.\d+)?%)/g;
        const optimizationWithHighlight = optimization.replace(regex, '<span class="improvement-percentage">$1</span>');
        
        optimizationDiv.innerHTML = `
            <h2>Optimized Integration</h2>
            <p>${optimizationWithHighlight}</p>
        `;
    }
});

const styles = `
    .bottleneck-heading {
        color: red;
    }
    .improvement-percentage {
        color: green;
    }
`;

const styleElement = document.createElement('style');
styleElement.textContent = styles;
document.head.appendChild(styleElement);


const processBottlenecks = {
    "ProcessA": {
        "main": ["Issue 1", "Issue 2"],
        "subprocesses": {
            "SubprocessA": ["Sub-Issue 1", "Sub-Issue 2"],
            "SubprocessB": ["Sub-Issue 3"]
        }
    },
    "ProcessB": {
        "main": ["Issue 3"],
        "subprocesses": {
            "SubprocessC": ["Sub-Issue 4", "Sub-Issue 5"]
        }
    }
};

const processOptimizations = {
    "ProcessA": {
        "summary": "Improved efficiency by 15%",
        "details": {
            "subprocesses": {
                "SubprocessA": {
                    "suggestions": ["Suggestion 1", "Suggestion 2"],
                    "impact": "20%"
                },
                "SubprocessB": {
                    "suggestions": ["Suggestion 3"],
                    "impact": "10%"
                }
            }
        }
    },
    "ProcessB": {
        "summary": "Reduced latency by 10%",
        "details": {
            "subprocesses": {
                "SubprocessC": {
                    "suggestions": ["Suggestion 4"],
                    "impact": "12%"
                }
            }
        }
    }
};


// function showBottlenecks(processName) {
//     if (!bottlenecksDiv) {
//         console.error('Bottlenecks div not found');
//         return;
//     }

//     const bottlenecks = processBottlenecks[processName];
//     if (!bottlenecks) return;

//     bottlenecksDiv.innerHTML = `
//         <h2 class="bottleneck-heading">Process Bottlenecks</h2>
//         <div class="bottleneck-section">
//             <h3 class="bottleneck-heading">${processName} Main Bottlenecks:</h3>
//             <ul>
//                 ${bottlenecks.main.map(b => `<li>${b}</li>`).join('')}
//             </ul>
//         </div>
        
//         <div class="bottleneck-section">
//             <h3 class="bottleneck-heading">Subprocess Bottlenecks:</h3>
//             ${Object.entries(bottlenecks.subprocesses).map(([subprocess, issues]) => `
//                 <div class="subprocess-bottlenecks">
//                     <h4 class="bottleneck-heading">${subprocess}:</h4>
//                     <ul>
//                         ${issues.map(issue => `<li>${issue}</li>`).join('')}
//                     </ul>
//                 </div>
//             `).join('')}
//         </div>
//     `;
// }

// function showOptimization(processName) {
//     if (!optimizationDiv) {
//         console.error('Optimization div not found');
//         return;
//     }

//     const optimization = processOptimizations[processName];
//     if (!optimization) return;

//     optimizationDiv.innerHTML = `
//         <h2>Optimized Integration</h2>
//         <div class="optimization-summary">
//             <h3>Summary</h3>
//             <p>${optimization.summary}</p>
//         </div>
        
//         <div class="optimization-details">
//             <h3>Detailed Optimization Plan</h3>
            
//             <div class="optimization-section">
//                 <h4>Subprocess Optimizations</h4>
//                 ${Object.entries(optimization.details.subprocesses).map(([name, details]) => `
//                     <div class="subprocess-optimization">
//                         <h5>${name}</h5>
//                         <ul>
//                             ${details.suggestions.map(s => `<li>${s}</li>`).join('')}
//                         </ul>
//                         <p class="impact"><strong>Impact:</strong> <span class="improvement-percentage">${details.impact}</span></p>
//                     </div>
//                 `).join('')}
//             </div>
//         </div>
//     `;
// }

// document.addEventListener('DOMContentLoaded', () => {
//     showBottlenecks("ProcessA");
//     showOptimization("ProcessA");
// });