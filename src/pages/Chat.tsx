
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Send, Loader2, BotIcon, Lightbulb, Plus, ArrowRight } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ModelSelector } from "@/components/ModelSelector";
import ChatMessage from "@/components/ChatMessage";
import { AVAILABLE_MODELS } from "@/data/models";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

// Types
interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  reasoning?: boolean;
  reasoningSteps?: string;
  isReasoningExpanded?: boolean;
}

// Constants
const API_KEY = "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";

const SYSTEM_PROMPT = `You are a helpful, respectful and honest assistant. Always approach questions thoughtfully and provide accurate, well-reasoned responses.

When asked to explain something:
- Break down complex topics into simpler concepts
- Use clear examples to illustrate points
- Acknowledge uncertainties when present
- Cite sources when making factual claims

When asked to solve problems:
- Think through the problem step by step
- Consider different approaches
- Explain your reasoning process
- Verify your solution`;

const REASONING_PROMPT = `Before responding, I want you to think step-by-step about the problem or query. Label your thinking process under a "### My Reasoning Process:" heading. After completing your reasoning process, provide your final answer under a "### Answer:" heading. The reasoning process should show your detailed analysis, while the answer should be clear and concise.`;

const DEFAULT_MODEL_ID = "meta-llama/llama-3.3-70b-instruct:free";

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL_ID);
  const [reasoningEnabled, setReasoningEnabled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const selectedModelObject = AVAILABLE_MODELS.find(model => model.id === selectedModel);
  const hasReasoningCapability = selectedModelObject?.capabilities?.reasoning || false;
  
  useEffect(() => {
    // Auto-enable reasoning for models with reasoning capability
    if (hasReasoningCapability) {
      setReasoningEnabled(true);
    } else if (!hasReasoningCapability && reasoningEnabled) {
      setReasoningEnabled(false);
    }
  }, [selectedModel, hasReasoningCapability]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleToggleReasoning = (messageId: string) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId ? { ...msg, isReasoningExpanded: !msg.isReasoningExpanded } : msg
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { 
      id: Date.now().toString(), 
      role: "user" as const, 
      content: input,
      reasoning: reasoningEnabled,
      isReasoningExpanded: false
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
        role: "assistant" as const, 
        content: finalContent,
        reasoning: reasoningEnabled,
        reasoningSteps: reasoningSteps,
        isReasoningExpanded: false
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

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card p-3 sticky top-0 z-10">
        <div className="container max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <BotIcon className="text-primary h-5 w-5" />
            <h1 className="text-lg font-medium">AI Chat</h1>
          </div>

          <div className="flex items-center gap-3">
            <Link 
              to="/signup"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Sign Up
            </Link>
            <Link 
              to="/login"
              className={cn(
                "px-3 py-1.5 rounded-md text-sm flex items-center gap-1",
                "bg-primary text-primary-foreground hover:bg-primary/90"
              )}
            >
              Login
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main chat area */}
      <div className="flex-1 overflow-y-auto">
        <div className="container max-w-4xl mx-auto px-4 py-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
              <div className="p-4 rounded-full bg-primary/10 mb-4">
                <BotIcon className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-xl font-bold mb-2">Welcome to AI Chat</h2>
              <p className="text-muted-foreground mb-8 max-w-md">
                Experience the power of AI with different models. Ask questions, get explanations, 
                or request help with tasks.
              </p>
              
              <div className="flex flex-col items-center gap-4 max-w-md w-full">
                <ModelSelector
                  models={AVAILABLE_MODELS}
                  selectedModel={selectedModel}
                  onModelSelect={setSelectedModel}
                  className="w-full"
                />
                
                {hasReasoningCapability && (
                  <div className="flex items-center justify-between w-full px-2">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-amber-500" />
                      <Label htmlFor="reasoning" className="text-sm">Enable reasoning mode</Label>
                    </div>
                    <Switch 
                      id="reasoning" 
                      checked={reasoningEnabled}
                      onCheckedChange={setReasoningEnabled}
                    />
                  </div>
                )}
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full mt-4">
                  <Button 
                    onClick={() => setInput("Explain quantum computing in simple terms")}
                    className="justify-start text-left h-auto py-3"
                    variant="outline"
                  >
                    <div className="flex flex-col items-start text-sm">
                      <span className="font-medium">Explain quantum computing</span>
                      <span className="text-xs text-muted-foreground">in simple terms</span>
                    </div>
                  </Button>
                  <Button 
                    onClick={() => setInput("Write a short poem about artificial intelligence")}
                    className="justify-start text-left h-auto py-3"
                    variant="outline"
                  >
                    <div className="flex flex-col items-start text-sm">
                      <span className="font-medium">Write a short poem</span>
                      <span className="text-xs text-muted-foreground">about artificial intelligence</span>
                    </div>
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <ChatMessage 
                  key={message.id} 
                  message={message} 
                  onToggleReasoning={handleToggleReasoning}
                />
              ))}
              {isLoading && (
                <div className="flex justify-center py-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>{reasoningEnabled ? "Thinking deeply..." : "Generating response..."}</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input area */}
      <div className="border-t bg-card p-4 sticky bottom-0">
        <div className="container max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="relative">
            <div className="flex items-center">
              <ModelSelector
                models={AVAILABLE_MODELS}
                selectedModel={selectedModel}
                onModelSelect={setSelectedModel}
                className="hidden sm:flex w-[180px] mr-2 text-sm"
              />
              
              <div className="relative flex-1">
                <Input
                  ref={inputRef}
                  placeholder="Send a message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="pr-24 py-6"
                  disabled={isLoading}
                />
                
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {messages.length > 0 && (
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={clearChat}
                      title="Clear chat"
                    >
                      <Plus className="h-4 w-4 rotate-45" />
                    </Button>
                  )}
                  
                  <Button
                    type="submit"
                    size="icon"
                    disabled={isLoading || !input.trim()}
                    className="h-8 w-8"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-2 px-2 text-xs text-muted-foreground">
              <div className="sm:hidden flex items-center">
                Using: <span className="font-medium ml-1">{selectedModelObject?.name || "Loading..."}</span>
              </div>
              {reasoningEnabled && (
                <div className="flex items-center gap-1 text-amber-500">
                  <Lightbulb className="h-3 w-3" />
                  <span>Reasoning enabled</span>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;
