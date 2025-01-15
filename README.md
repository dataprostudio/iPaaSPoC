# iPaaSPoC
AI process miner and systems integrations optimizer - Proof of Concept

## Prerequisites

Before installing, ensure you have:
1. Node.js v18 or higher
2. CMake (required for node-llama-cpp)
3. A GGUF format LLaMA model

### Downloading the Model

1. Create a `Models/Llama-3.2-3B-GGUF` directory in the project root (automatically created on first run)
2. Download the GGUF model:
   ```bash
   # For Windows PowerShell
   New-Item -ItemType Directory -Force -Path "Models/Llama-3.2-3B-GGUF"
   Invoke-WebRequest -Uri "https://huggingface.co/TheBloke/llama2-3.2b-gguf/resolve/main/llama2_3.2b.Q4_K_M.gguf" -OutFile "Models/Llama-3.2-3B-GGUF/llama2_3.2b.Q4_K_M.gguf"
   
   # For Linux/macOS
   mkdir -p Models/Llama-3.2-3B-GGUF
   curl -L "https://huggingface.co/TheBloke/llama2-3.2b-gguf/resolve/main/llama2_3.2b.Q4_K_M.gguf" -o "Models/Llama-3.2-3B-GGUF/llama2_3.2b.Q4_K_M.gguf"
   ```
3. Verify the file exists and has the exact name: `llama2_3.2b.Q4_K_M.gguf`

### Installing CMake

**Windows:**
1. Download from https://cmake.org/download/
2. Install the Windows x64 Installer
3. During installation, select "Add CMake to the system PATH"

**Linux:**
