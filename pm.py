import subprocess
import pandas as pd

# Step 1: Preprocess the Event Log
def preprocess_event_log(file_path):
    """Read and preprocess event log data."""
    data = pd.read_csv(file_path)
    summary = data.groupby("Activity").size().to_dict()
    return summary

# Step 2: Format Prompt
def generate_prompt(summary):
    """Generate a prompt for the LLM."""
    return f"Analyze this event log summary: {summary}. Identify bottlenecks and suggest improvements."

# Step 3: Send Prompt to Llama 3.2
def query_llama(prompt, model_path="llama-3.2-3b-q4.bin"):
    """Send a prompt to the local instance of Llama 3.2."""
    try:
        process = subprocess.run(
            ["./main", "-m", model_path, "-p", prompt],
            text=True,
            capture_output=True,
            check=True
        )
        return process.stdout
    except subprocess.CalledProcessError as e:
        print("Error running the model:", e.stderr)
        return None

# Step 4: Main Workflow
def main():
    # File path to the event log (CSV format)
    file_path = "event_log.csv"
    
    # Preprocess the event log
    event_summary = preprocess_event_log(file_path)
    print("Event Summary:", event_summary)

    # Generate prompt
    prompt = generate_prompt(event_summary)
    print("Generated Prompt:", prompt)

    # Query the model
    model_output = query_llama(prompt)
    if model_output:
        print("Model Output:\n", model_output)

if __name__ == "__main__":
    main()
