import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Send, ChevronDown, Loader2, BotIcon, Lightbulb } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  reasoning?: boolean;
  reasoningSteps?: string;
}

const API_KEY = "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";

const SYSTEM_PROMPT = `You are a helpful, respectful and honest assistant. Always approach questions thoughtfully and provide accurate, well-reasoned responses.`;

const REASONING_PROMPT = `Before responding, I want you to think step-by-step about the problem or query. Label your thinking process under a "### My Reasoning Process:" heading. After completing your reasoning process, provide your final answer under a "### Answer:" heading. The reasoning process should show your detailed analysis, while the answer should be clear and concise.`;

const MODELS = [
  {
    name: "DeepSeek R1 (Best for Reasoning)",
    id: "deepseek/deepseek-r1:free",
    context: 163840,
    capabilities: { reasoning: true }
  },
  {
    name: "Llama 3.3 70B (Best Overall)",
    id: "meta-llama/llama-3.3-70b-instruct:free",
    context: 131072
  },
  {
    name: "Nemotron Ultra 253B (Very Large)",
    id: "nvidia/llama-3.1-nemotron-ultra-253b-v1:free",
    context: 131072
  },
  {
    name: "Llama 3.1 405B (Largest)",
    id: "meta-llama/llama-3.1-405b:free",
    context: 64000
  }
];

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>("meta-llama/llama-3.3-70b-instruct:free");
  const [reasoningEnabled, setReasoningEnabled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const selectedModelObject = MODELS.find(model => model.id === selectedModel);
  const hasReasoningCapability = selectedModelObject?.capabilities?.reasoning || false;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { 
      id: Date.now().toString(), 
      role: "user", 
      content: input,
      reasoning: reasoningEnabled
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      let systemMessage = SYSTEM_PROMPT;
      if (reasoningEnabled) {
        systemMessage = `${SYSTEM_PROMPT}\n\n${REASONING_PROMPT}`;
      }
      
      const apiMessages = [
        { role: "system", content: systemMessage },
        ...messages.filter(msg => msg.role !== "system").map(({ role, content }) => {
          return { role, content };
        }),
      ];
      
      apiMessages.push({ role: userMessage.role, content: userMessage.content });

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${API_KEY}`,
          "HTTP-Referer": window.location.origin,
          "X-Title": "AI Chat Assistant"
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: apiMessages,
          temperature: reasoningEnabled ? 0.7 : 0.9,
          max_tokens: 4000
        })
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      let finalContent = content;
      let reasoningSteps = "";
      
      if (reasoningEnabled && content.includes("### My Reasoning Process:") && content.includes("### Answer:")) {
        const reasoningMatch = content.match(/### My Reasoning Process:([\s\S]*?)### Answer:/);
        const answerMatch = content.match(/### Answer:([\s\S]*)/);
        
        if (reasoningMatch && answerMatch) {
          reasoningSteps = reasoningMatch[1].trim();
          finalContent = answerMatch[1].trim();
        }
      }
      
      const assistantMessage: Message = { 
        id: Date.now().toString(), 
        role: "assistant", 
        content: finalContent,
        reasoning: reasoningEnabled,
        reasoningSteps: reasoningSteps
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error calling OpenRouter API:", error);
      toast({
        title: "Error",
        description: "Failed to get a response from the AI. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="flex justify-between items-center p-4 border-b bg-card">
        <div className="w-full max-w-3xl mx-auto flex justify-between items-center px-4">
          <div className="flex items-center gap-2">
            <BotIcon className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold">AI Chat Assistant</h1>
          </div>
          <div className="flex items-center gap-3">
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MODELS.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    {model.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasReasoningCapability && (
              <Button
                variant={reasoningEnabled ? "default" : "outline"}
                size="sm"
                onClick={() => setReasoningEnabled(!reasoningEnabled)}
                className="flex items-center gap-1"
              >
                <Lightbulb className="h-4 w-4" />
                <span className="hidden sm:inline">{reasoningEnabled ? "Disable" : "Enable"} Reasoning</span>
              </Button>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto scroll-smooth">
          <div className="w-full max-w-3xl mx-auto">
            <div className="flex-1 space-y-6 p-4 md:p-6">
              {messages.length === 0 ? (
                <div className="flex h-[60vh] flex-col items-center justify-center text-center">
                  <div className="rounded-full bg-primary/10 p-4 mb-4">
                    <BotIcon className="h-12 w-12 text-primary" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-2">Welcome to AI Chat Assistant</h3>
                  <p className="text-muted-foreground">Ask me anything - I'm here to help!</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div key={message.id} className="flex items-start gap-4 animate-fade-in">
                    <div className={`flex-1 rounded-lg px-4 py-3 ${
                      message.role === "user" 
                        ? "bg-primary text-primary-foreground ml-12" 
                        : "bg-card border border-border mr-12"
                    }`}>
                      <div className="prose dark:prose-invert prose-sm max-w-none">
                        <ReactMarkdown>
                          {message.content}
                        </ReactMarkdown>
                        {message.reasoningSteps && (
                          <div className="mt-4 pt-4 border-t border-border">
                            <div className="flex items-center gap-2 text-amber-500 text-sm font-medium mb-2">
                              <Lightbulb className="h-4 w-4" />
                              <span>Reasoning Process</span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              <ReactMarkdown>
                                {message.reasoningSteps}
                              </ReactMarkdown>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="flex items-center justify-center gap-2 text-muted-foreground py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <span>{reasoningEnabled ? "AI is thinking deeply..." : "AI is thinking..."}</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>

        <div className="border-t bg-card p-4">
          <div className="w-full max-w-3xl mx-auto">
            <form onSubmit={handleSubmit} className="relative">
              <Input
                ref={inputRef}
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="pr-12 py-6 text-base"
                disabled={isLoading}
              />
              <Button 
                type="submit" 
                disabled={isLoading || !input.trim()}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-9 w-9 p-0"
                size="icon"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
                <span className="sr-only">Send</span>
              </Button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Chat;