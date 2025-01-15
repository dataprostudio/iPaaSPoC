"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.visit = exports.use = exports.Type = exports.someField = exports.PathVisitor = exports.Path = exports.NodePath = exports.namedTypes = exports.getSupertypeNames = exports.getFieldValue = exports.getFieldNames = exports.getBuilderName = exports.finalize = exports.eachField = exports.defineMethod = exports.builtInTypes = exports.builders = exports.astNodesAreEquivalent = void 0;
var tslib_1 = require("tslib");
var fork_1 = tslib_1.__importDefault(require("./fork"));
var core_1 = tslib_1.__importDefault(require("./def/core"));
var es6_1 = tslib_1.__importDefault(require("./def/es6"));
var es7_1 = tslib_1.__importDefault(require("./def/es7"));
var es2020_1 = tslib_1.__importDefault(require("./def/es2020"));
var jsx_1 = tslib_1.__importDefault(require("./def/jsx"));
var flow_1 = tslib_1.__importDefault(require("./def/flow"));
var esprima_1 = tslib_1.__importDefault(require("./def/esprima"));
var babel_1 = tslib_1.__importDefault(require("./def/babel"));
var typescript_1 = tslib_1.__importDefault(require("./def/typescript"));
var es_proposals_1 = tslib_1.__importDefault(require("./def/es-proposals"));
var namedTypes_1 = require("./gen/namedTypes");
Object.defineProperty(exports, "namedTypes", { enumerable: true, get: function () { return namedTypes_1.namedTypes; } });
var _a = fork_1.default([
    // This core module of AST types captures ES5 as it is parsed today by
    // git://github.com/ariya/esprima.git#master.
    core_1.default,
    // Feel free to add to or remove from this list of extension modules to
    // configure the precise type hierarchy that you need.
    es6_1.default,
    es7_1.default,
    es2020_1.default,
    jsx_1.default,
    flow_1.default,
    esprima_1.default,
    babel_1.default,
    typescript_1.default,
    es_proposals_1.default,
]), astNodesAreEquivalent = _a.astNodesAreEquivalent, builders = _a.builders, builtInTypes = _a.builtInTypes, defineMethod = _a.defineMethod, eachField = _a.eachField, finalize = _a.finalize, getBuilderName = _a.getBuilderName, getFieldNames = _a.getFieldNames, getFieldValue = _a.getFieldValue, getSupertypeNames = _a.getSupertypeNames, n = _a.namedTypes, NodePath = _a.NodePath, Path = _a.Path, PathVisitor = _a.PathVisitor, someField = _a.someField, Type = _a.Type, use = _a.use, visit = _a.visit;
exports.astNodesAreEquivalent = astNodesAreEquivalent;
exports.builders = builders;
exports.builtInTypes = builtInTypes;
exports.defineMethod = defineMethod;
exports.eachField = eachField;
exports.finalize = finalize;
exports.getBuilderName = getBuilderName;
exports.getFieldNames = getFieldNames;
exports.getFieldValue = getFieldValue;
exports.getSupertypeNames = getSupertypeNames;
exports.NodePath = NodePath;
exports.Path = Path;
exports.PathVisitor = PathVisitor;
exports.someField = someField;
exports.Type = Type;
exports.use = use;
exports.visit = visit;
// Populate the exported fields of the namedTypes namespace, while still
// retaining its member types.
Object.assign(namedTypes_1.namedTypes, n);

async function analyzeProcess(eventLog) {
    try {
        const response = await fetch('/api/analyze-process', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ eventLog })
        });
        
        const data = await response.json();
        
        // Display metrics
        displayMetrics(data.metrics);
        
        // Display process map
        if (data.metrics.process_map) {
            const img = document.createElement('img');
            img.src = `data:image/png;base64,${data.metrics.process_map}`;
            document.getElementById('visualization').appendChild(img);
        }
        
        // Display LLM analysis
        displayAnalysis(data.analysis);
        
    } catch (error) {
        console.error('Error:', error);
    }
}

function displayMetrics(metrics) {
    // Display your metrics here
    const metricsDiv = document.getElementById('metrics');
    metricsDiv.innerHTML = `
        <h3>Process Metrics</h3>
        <ul>
            <li>Number of Cases: ${metrics.number_of_cases}</li>
            <li>Number of Events: ${metrics.number_of_events}</li>
            <li>Average Case Duration: ${metrics.average_case_duration.toFixed(2)}</li>
            <li>Number of Variants: ${metrics.number_of_variants}</li>
        </ul>
    `;
}

function displayAnalysis(analysis) {
    const analysisDiv = document.getElementById('analysis');
    analysisDiv.innerHTML = `
        <h3>LLM Analysis</h3>
        <p>${analysis}</p>
    `;
}

// Test function to send sample event log
async function testProcessAnalysis() {
    const sampleEventLog = [
        {
            "case:concept:name": "case1",
            "concept:name": "start",
            "time:timestamp": "2024-01-13T10:00:00"
        },
        {
            "case:concept:name": "case1",
            "concept:name": "end",
            "time:timestamp": "2024-01-13T11:00:00"
        }
    ];

    try {
        const response = await fetch('/api/analyze-process', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ eventLog: sampleEventLog })
        });
        
        const data = await response.json();
        console.log('Analysis results:', data);
    } catch (error) {
        console.error('Error:', error);
    }
}

import * as tf from '@tensorflow/tfjs';

async function analyzeWithTensorflow(metrics) {
    const model = tf.sequential({
        layers: [
            tf.layers.dense({inputShape: [4], units: 8, activation: 'relu'}),
            tf.layers.dense({units: 1, activation: 'sigmoid'})
        ]
    });
    
    // Process your metrics here
    const tensorData = tf.tensor2d([
        [
            metrics.number_of_cases,
            metrics.number_of_events,
            metrics.average_case_duration,
            metrics.variant_count
        ]
    ]);
    
    const prediction = model.predict(tensorData);
    return prediction.dataSync()[0];
}
