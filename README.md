# AI Chat Assistant

A modern chat application with AI capabilities powered by multiple LLM models.

## Features

- Chat with multiple AI models
- Reasoning mode for complex questions
- Mobile-responsive UI
- Dark/light theme support
- Conversation history management
- Markdown rendering

## Tech Stack

- React
- TypeScript
- Shadcn UI
- Vite
- React Router

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## Configuration

You can customize your API key in the Chat.tsx file:

```typescript
const API_KEY = "your-openrouter-api-key";
```

## Models

The application supports multiple AI models with different capabilities:

- **DeepSeek R1**: Best for step-by-step reasoning tasks
- **Llama 3.3 70B**: Good all-around performance
- **Nemotron Ultra 253B**: Very large model with broad knowledge
- **Llama 3.1 405B**: Largest available model

## License

MIT
