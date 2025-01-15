export default {
  apps: [{
    name: "ipaaspoc",
    script: "./src/index.js",
    env_production: {
      NODE_ENV: "production",
      MODEL_PATH: "D:/Repos/iPaaSPoC/models/Llama-3.2-3B-Instruct-Q6_K.gguf",
      HOST: "localhost",
      PORT: 3000
    }
  }]
}
