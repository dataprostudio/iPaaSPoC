from ctransformers import AutoModelForCausalLM
import os
import sys
import json

def test_model():
    try:
        input_text = sys.stdin.read()
        if not input_text:
            print("No input received", file=sys.stderr)
            return
            
        print("Starting model processing...", file=sys.stderr)
        
        model_path = "D:/Repos/iPaaSPoC/models/Llama-3.2-3B-Instruct-Q6_K.gguf"
        
        print(f"Checking model file...", file=sys.stderr)
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model file not found at {model_path}")
            
        print(f"Model size: {os.path.getsize(model_path) / (1024*1024*1024):.2f} GB", file=sys.stderr)
        
        print("Loading model...", file=sys.stderr)
        llm = AutoModelForCausalLM.from_pretrained(
            model_path,
            model_type="llama",
            threads=1,
            context_length=512,
            gpu_layers=0  # CPU only for testing
        )
        
        print("Model loaded successfully!", file=sys.stderr)
        
        response = llm("Test", max_tokens=10)
        
        workflow_data = {
            "nodes": [
                {"id": 1, "label": "Start"},
                {"id": 2, "label": str(response)[:50] if response else "Process"}
            ],
            "edges": [
                {"from": 1, "to": 2}
            ]
        }
        
        print(json.dumps(workflow_data))
        
    except Exception as e:
        print(f"Detailed error: {str(e)}", file=sys.stderr)
        error_data = {
            "error": str(e),
            "type": str(type(e).__name__)
        }
        print(json.dumps(error_data))
        sys.exit(1)

if __name__ == "__main__":
    test_model() 