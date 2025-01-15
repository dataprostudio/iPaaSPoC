import sys
import json
import pm4py
from pm4py.objects.log.importer.xes import importer as xes_importer
from pm4py.algo.discovery.alpha import algorithm as alpha_miner
from pm4py.algo.discovery.dfg import algorithm as dfg_discovery
from pm4py.statistics.traces.generic.log import case_statistics

def generate_analysis(metrics):
    """Generate a simple analysis without using LLM"""
    analysis = []
    
    # Analyze number of cases
    if metrics["number_of_cases"] > 100:
        analysis.append("This is a large process with many cases.")
    else:
        analysis.append("This is a relatively small process.")
        
    # Analyze events
    avg_events_per_case = metrics["number_of_events"] / metrics["number_of_cases"]
    analysis.append(f"On average, each case contains {avg_events_per_case:.2f} events.")
    
    # Analyze variants
    variant_ratio = metrics["variant_count"] / metrics["number_of_cases"]
    if variant_ratio > 0.5:
        analysis.append("The process shows high variability in execution paths.")
    else:
        analysis.append("The process shows consistent execution paths.")
        
    # Analyze duration
    if metrics["average_case_duration"] > 86400:  # More than a day
        analysis.append(f"Cases take on average {metrics['average_case_duration']/86400:.1f} days to complete.")
    else:
        analysis.append(f"Cases take on average {metrics['average_case_duration']/3600:.1f} hours to complete.")
    
    return " ".join(analysis)

def analyze_process(event_log_data):
    try:
        # Convert JSON input to PM4Py event log format
        log = pm4py.convert_to_event_log(event_log_data)
        
        # Basic process metrics
        case_duration = case_statistics.get_all_case_durations(log)
        
        # Calculate basic metrics
        metrics = {
            "number_of_cases": len(log),
            "number_of_events": sum(len(case) for case in log),
            "average_case_duration": sum(case_duration) / len(case_duration) if case_duration else 0,
            "variant_count": len(pm4py.get_variants(log))
        }
        
        # Generate analysis using rule-based approach
        analysis = generate_analysis(metrics)
        
        return json.dumps({
            "metrics": metrics,
            "analysis": analysis
        })
    
    except Exception as e:
        return json.dumps({"error": str(e)})

if __name__ == "__main__":
    # Read input from stdin
    input_data = sys.stdin.read()
    try:
        event_log_data = json.loads(input_data)
        result = analyze_process(event_log_data)
        print(result)
    except json.JSONDecodeError as e:
        print(json.dumps({"error": f"Invalid JSON input: {str(e)}"})) 