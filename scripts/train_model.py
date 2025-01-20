from unsloth import FastLanguageModel
import json
import torch
from datasets import Dataset
from transformers import TrainingArguments

# Load training data
with open('data/process_mining_prompts.json', 'r') as f:
    data = json.load(f)

# Create dataset
dataset = Dataset.from_dict({
    'instruction': [x['instruction'] for x in data['training_data']],
    'input': [x['input'] for x in data['training_data']],
    'output': [x['output'] for x in data['training_data']]
})

# Initialize model with process mining specific config
model, tokenizer = FastLanguageModel.from_pretrained(
    model_name="D:/path/to/your/Llama-3.2-3B-Instruct-GGUF",
    max_seq_length=4096,  # Increased for longer process descriptions
    dtype=torch.bfloat16,
    load_in_4bit=True,
    trust_remote_code=True
)

# Enhanced training configuration
training_args = TrainingArguments(
    output_dir="./process_mining_model",
    num_train_epochs=3,           # Increase for better accuracy
    per_device_train_batch_size=2,# Adjust based on GPU memory
    learning_rate=2e-5,          # Lower for more stable training
    warmup_steps=100,            # Gradual learning rate increase
    logging_steps=10,            # How often to log progress
    save_steps=50,               # How often to save checkpoints
    evaluation_strategy="steps",
    eval_steps=50,
    load_best_model_at_end=True
)

# Train model with process mining focus
trainer = model.train(
    dataset=dataset,
    args=training_args,
    data_collator=lambda x: {
        'input_ids': torch.stack([d['input_ids'] for d in x]),
        'attention_mask': torch.stack([d['attention_mask'] for d in x]),
        'labels': torch.stack([d['labels'] for d in x])
    }
)

# Save the process mining specialized model
model.save_pretrained("./process_mining_model") 