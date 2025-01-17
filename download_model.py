from huggingface_hub import hf_hub_download

# Download a smaller model known to work with ctransformers
model_path = hf_hub_download(
    repo_id="TheBloke/Llama-2-7B-Chat-GGUF",
    filename="llama-2-7b-chat.q4_K_M.gguf"
)
print(f"Downloaded model to: {model_path}") 