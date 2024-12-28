import sys
import json
import random

def analyze_process(file_paths):
    # This is a placeholder implementation
    # In a real scenario, you would process the files and extract actual data
    process_steps = ['Start', 'Receive Order', 'Process Payment', 'Prepare Shipment', 'Ship Order', 'End']
    process_flow = [f"{process_steps[i]}-->{process_steps[i+1]}" for i in range(len(process_steps)-1)]
    
    bottlenecks = [
        f"{random.choice(process_steps[1:-1])} is taking too long",
        f"High error rate in {random.choice(process_steps[1:-1])}"
    ]
    
    return {
        "processFlow": process_flow,
        "bottlenecks": bottlenecks
    }

if __name__ == "__main__":
    file_paths = sys.argv[1:]
    result = analyze_process(file_paths)
    print(json.dumps(result))