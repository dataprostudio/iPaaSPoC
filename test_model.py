from ctransformers import AutoModelForCausalLM
import os

def test_model():
    try:
        print("Testing model loading...")
        model_path = "D:/Repos/iPaaSPoC/models/Llama-3.2-3B-Instruct-Q6_K.gguf"
        
        print(f"Model file exists: {os.path.exists(model_path)}")
        if os.path.exists(model_path):
            print(f"Model size: {os.path.getsize(model_path) / (1024*1024*1024):.2f} GB")
        
        # Try with minimal configuration and different model type
        config = {
            "model_type": "llama2",  # Changed from 'llama' to 'llama2'
            "context_length": 1024,   # Reduced context length
            "gpu_layers": 0           # Keep CPU only for testing
        }
        
        print("Attempting to load model with config:", config)
        
        llm = AutoModelForCausalLM.from_pretrained(
            model_path,
            **config
        )
        
        print("Model loaded successfully!")
        
    except Exception as e:
        print(f"Detailed error: {str(e)}")
        print(f"Error type: {type(e)}")

if __name__ == "__main__":
    test_model() 