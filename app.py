import gradio as gr
from ctransformers import AutoModelForCausalLM
import logging
import os
import sys
import torch

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ModelWrapper:
    def __init__(self):
        self.model = None
        self.model_path = "D:/Repos/iPaaSPoC/models/Llama-3.2-3B-Instruct-Q6_K.gguf"
        
    def load(self):
        try:
            logger.info(f"Loading model from {self.model_path}")
            logger.info(f"Model size: {os.path.getsize(self.model_path) / (1024*1024*1024):.2f} GB")
            
            # Memory optimization for RTX 2060 (6GB VRAM) and 16GB RAM
            gpu_layers = 27  # Use about 4GB of VRAM
            batch_size = 1   # Keep batch size small
            context_length = 512  # Reduced context length
            thread_count = 4  # Balanced CPU usage
            
            logger.info(f"CUDA available: {torch.cuda.is_available()}")
            logger.info(f"GPU Memory: {torch.cuda.get_device_properties(0).total_memory / 1024**3:.2f} GB")
            
            self.model = AutoModelForCausalLM.from_pretrained(
                self.model_path,
                model_type="llama",
                gpu_layers=gpu_layers,  # Use GPU for some layers
                batch_size=batch_size,
                context_length=context_length,
                threads=thread_count,
                stream=True,  # Enable streaming for memory efficiency
                reset=True    # Reset CUDA memory after each generation
            )
            logger.info("Model loaded successfully")
            return True
        except Exception as e:
            logger.error(f"Error loading model: {str(e)}")
            return False

def process_text(input_text):
    try:
        if not hasattr(process_text, 'model'):
            process_text.model = ModelWrapper()
            if not process_text.model.load():
                return "Error: Could not load model"
        
        logger.info(f"Processing input: {input_text[:100]}...")
        
        # Memory-efficient generation settings
        response = process_text.model.model(
            input_text,
            max_tokens=256,        # Limit output length
            top_k=40,             # Reduce sampling space
            top_p=0.95,           # Nucleus sampling
            temperature=0.7,       # Slightly reduced randomness
            repetition_penalty=1.1 # Avoid repetitions
        )
        
        logger.info(f"Generated response: {response[:100]}...")
        return response
        
    except Exception as e:
        logger.error(f"Processing error: {str(e)}")
        return f"Error: {str(e)}"

# Create Gradio interface
demo = gr.Interface(
    fn=process_text,
    inputs=gr.Textbox(label="Input Text"),
    outputs=gr.Textbox(label="Analysis"),
    title="Process Analysis",
    description="Upload text to analyze the process",
    examples=[
        ["Analyze this process:"],
        ["Summarize the following:"]
    ]
)

# Launch with optimized settings
if __name__ == "__main__":
    try:
        logger.info("Starting Gradio server...")
        demo.launch(
            share=False, 
            server_name="127.0.0.1", 
            server_port=7860,
            show_error=True,
            enable_queue=True  # Queue requests to manage memory
        )
    except Exception as e:
        logger.error(f"Failed to start server: {str(e)}")
        sys.exit(1)