# AI Chat Assistant

A modern, feature-rich chat application powered by state-of-the-art AI models through OpenRouter.

## Features

### Core Features
- 🤖 Access to powerful AI models like DeepSeek-R1, Llama 3.3 70B, and more
- 💬 Clean, responsive chat interface
- 🌓 Light and dark mode support

### Advanced Reasoning
- 🧠 Step-by-step reasoning capability with DeepSeek-R1
- 📊 Visual reasoning indicators and progress visualization
- 🔄 Toggle between standard responses and detailed reasoning

### Enhanced User Experience
- ⚡ Real-time streaming responses for immediate feedback
- 💾 Automatic conversation saving and management
- 📤 Export and share conversations
- 🔧 Customizable settings (temperature, streaming)
- 📱 Fully responsive design for all devices

## Technologies Used

- React with TypeScript
- Vite for fast builds
- Tailwind CSS for styling
- shadcn/ui component library
- OpenRouter API for AI model access

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:5173`

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
