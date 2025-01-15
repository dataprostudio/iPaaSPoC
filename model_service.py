from ctransformers import AutoModelForCausalLM
import sys
import json
import traceback

def process_input(input_text):
    try:
        print("Starting model service...", file=sys.stderr)
        
        # Load the model using ctransformers
        model_path = "D:/Repos/iPaaSPoC/models/Llama-3.2-3B-Instruct-Q6_K.gguf"
        print(f"Loading model from: {model_path}", file=sys.stderr)
        
        # Initialize the model with CUDA support
        llm = AutoModelForCausalLM.from_pretrained(
            model_path,
            model_type="llama",
            gpu_layers=50,  # Adjust based on your GPU memory
            context_length=2048
        )
        
        print("Model loaded successfully", file=sys.stderr)
        
        # Create prompt for workflow analysis
        prompt = f"""Analyze this process and extract workflow nodes and connections:
        {input_text}
        
        Return only a structured workflow description with nodes and their connections.
        """
        
        # Generate response
        print("Generating response...", file=sys.stderr)
        response = llm(prompt, max_tokens=512, temperature=0.7)
        print("Response generated", file=sys.stderr)
        
        # Process the response into workflow format
        workflow_data = {
            "nodes": [
                {"id": 1, "label": "Start"},
                {"id": 2, "label": response[:50]}  # Use first 50 chars of response as label
            ],
            "edges": [
                {"from": 1, "to": 2}
            ]
        }
        
        # Print the result to stdout
        print(json.dumps(workflow_data))
        
    except Exception as e:
        error_msg = {
            "error": str(e),
            "type": str(type(e).__name__),
            "traceback": traceback.format_exc()
        }
        print(json.dumps(error_msg), file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    try:
        print("Reading input...", file=sys.stderr)
        input_text = sys.stdin.read()
        if not input_text:
            raise ValueError("No input received")
        process_input(input_text)
    except Exception as e:
        print(json.dumps({
            "error": f"Input processing failed: {str(e)}",
            "traceback": traceback.format_exc()
        }), file=sys.stderr)
        sys.exit(1) 