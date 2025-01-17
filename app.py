import gradio as gr
from ctransformers import AutoModelForCausalLM
import logging
import os
import sys

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
            
            self.model = AutoModelForCausalLM.from_pretrained(
                self.model_path,
                model_type="llama",
                context_length=512,
                gpu_layers=0  # Start with CPU only to test
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
        response = process_text.model.model(input_text)
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
    description="Upload text to analyze the process"
)

# Launch with API access enabled
if __name__ == "__main__":
    try:
        logger.info("Starting Gradio server...")
        demo.launch(
            share=False, 
            server_name="127.0.0.1", 
            server_port=7860,
            show_error=True
        )
    except Exception as e:
        logger.error(f"Failed to start server: {str(e)}")
        sys.exit(1)