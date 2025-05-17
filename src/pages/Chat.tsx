import React, { useState, useRef, useEffect, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { BotIcon } from "@/components/BotIcon";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Settings, Lightbulb, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import ChatMessage from "@/components/ChatMessage";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useUser, SignInButton, SignUpButton, UserButton } from "@clerk/clerk-react";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  images?: string[];
  reasoning?: boolean;
  reasoningSteps?: string;
  isReasoningExpanded?: boolean;
}

interface Model {
  id: string;
  name: string;
  description: string;
  category: string;
  character_limit: number;
  reasoning: boolean;
}

const API_KEY = process.env.NEXT_PUBLIC_AI_API_KEY;
const MODEL = process.env.NEXT_PUBLIC_AI_MODEL;

const Chat = () => {
  const { isSignedIn, user } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>("meta-llama/llama-3.3-70b-instruct:free");
  const [isMobileSettingsOpen, setIsMobileSettingsOpen] = useState(false);
  const [isModelSelectorOpen, setIsModelSelectorOpen] = useState(false);
  const [isQuickModelSelectorOpen, setIsQuickModelSelectorOpen] = useState(false);
  const [modelSearchTerm, setModelSearchTerm] = useState("");
  const [reasoningEnabled, setReasoningEnabled] = useState(false);
  const [autoEnableReasoning, setAutoEnableReasoning] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    Popular: true,
    Small: false,
    Large: false,
    Reasoning: false,
    Code: false,
    Other: false
  });

  const models: Model[] = [
    {
      id: "meta-llama/llama-3.3-70b-instruct:free",
      name: "Llama 3 70B",
      description: "The most powerful open LLM. Great for almost all tasks.",
      category: "Popular",
      character_limit: 3000,
      reasoning: true,
    },
    {
      id: "meta-llama/llama-3.3-8b-instruct:free",
      name: "Llama 3 8B",
      description: "A smaller, faster model. Good for simple tasks.",
      category: "Small",
      character_limit: 4000,
      reasoning: true,
    },
    {
      id: "mistralai/Mistral-7B-Instruct-v0.2:free",
      name: "Mistral 7B",
      description: "A small, fast model. Good for simple tasks.",
      category: "Small",
      character_limit: 4000,
      reasoning: false,
    },
    {
      id: "mistralai/Mixtral-8x22B-Instruct-v0.1:free",
      name: "Mixtral 8x22B",
      description: "A high-quality model that can handle complex tasks.",
      category: "Large",
      character_limit: 2000,
      reasoning: true,
    },
    {
      id: "NousResearch/Nous-Hermes-2-Mixtral-8x22B-DPO:free",
      name: "Nous Hermes 2",
      description: "An uncensored model that is good for creative tasks.",
      category: "Other",
      character_limit: 2000,
      reasoning: true,
    },
    {
      id: "codellama/CodeLlama-34b-Instruct:free",
      name: "Code Llama 34B",
      description: "A model that is good for generating and understanding code.",
      category: "Code",
      character_limit: 2000,
      reasoning: true,
    },
    {
      id: "teknium/OpenHermes-2.5-Mistral-7B:free",
      name: "OpenHermes 2.5",
      description: "A model that is good at reasoning and following instructions.",
      category: "Reasoning",
      character_limit: 3000,
      reasoning: true,
    },
  ];

  const selectedModelData = models.find((model) => model.id === selectedModel);
  const selectedModelName = selectedModelData?.name || "Llama 3 70B";
  const selectedModelCharacterLimit = selectedModelData?.character_limit || 3000;
  const hasReasoningCapability = selectedModelData?.reasoning || false;

  const filteredModels = models.filter((model) =>
    model.name.toLowerCase().includes(modelSearchTerm.toLowerCase())
  );

  const handleCategoryToggle = (category: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: selectedModel,
          prompt: input,
          reasoning: reasoningEnabled,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const aiMessage: Message = {
        id: Date.now().toString() + "-ai",
        role: "assistant",
        content: data.response,
        reasoning: data.reasoning,
        reasoningSteps: data.reasoning_steps,
        isReasoningExpanded: false,
      };

      setMessages((prev) => [...prev, aiMessage]);

      if (autoEnableReasoning && data.reasoning) {
        setReasoningEnabled(true);
      }
    } catch (error: any) {
      console.error("Failed to fetch AI response:", error);
      toast({
        title: "Something went wrong.",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const toggleReasoning = (id: string) => {
    setMessages((prevMessages) =>
      prevMessages.map((msg) =>
        msg.id === id ? { ...msg, isReasoningExpanded: !msg.isReasoningExpanded } : msg
      )
    );
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="hidden md:flex justify-between items-center p-4 border-b bg-card">
        <div className="w-full max-w-7xl mx-auto flex justify-between items-center px-4">
          <div className="flex items-center gap-2">
            <BotIcon className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold">AI Chat Assistant</h1>
          </div>
          <div className="flex items-center gap-4">
            <Dialog open={isModelSelectorOpen} onOpenChange={setIsModelSelectorOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex justify-between items-center gap-2 w-[250px]">
                  <span className="truncate">{selectedModelName}</span>
                  <ChevronDown className="h-4 w-4 flex-shrink-0" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Select a Model</DialogTitle>
                  <DialogDescription>
                    Choose the AI model that best suits your needs.
                  </DialogDescription>
                </DialogHeader>
                <Input
                  type="search"
                  placeholder="Search models..."
                  className="my-4"
                  value={modelSearchTerm}
                  onChange={(e) => setModelSearchTerm(e.target.value)}
                />
                <ScrollArea className="h-[400px] w-full rounded-md border">
                  <div className="p-3">
                    {Object.keys(expandedCategories).map((category) => (
                      <div key={category} className="mb-4">
                        <div
                          className="flex items-center justify-between py-2 cursor-pointer"
                          onClick={() => handleCategoryToggle(category)}
                        >
                          <h2 className="text-sm font-semibold">{category}</h2>
                          <ChevronDown
                            className={`h-4 w-4 transition-transform ${expandedCategories[category] ? "rotate-180" : ""
                              }`}
                          />
                        </div>
                        {expandedCategories[category] && (
                          <ul>
                            {filteredModels
                              .filter((model) => model.category === category)
                              .map((model) => (
                                <li key={model.id} className="py-2">
                                  <label
                                    className="flex items-center p-2 rounded-md hover:bg-secondary cursor-pointer"
                                  >
                                    <input
                                      type="radio"
                                      name="model"
                                      value={model.id}
                                      className="mr-2"
                                      checked={selectedModel === model.id}
                                      onChange={() => {
                                        setSelectedModel(model.id);
                                        setIsModelSelectorOpen(false);
                                      }}
                                    />
                                    <div className="space-y-1 leading-none">
                                      <p className="text-sm font-medium">{model.name}</p>
                                      <p className="text-sm text-muted-foreground">
                                        {model.description}
                                      </p>
                                    </div>
                                  </label>
                                </li>
                              ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </DialogContent>
            </Dialog>
            
            {hasReasoningCapability && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2">
                      <Switch 
                        id="reasoning-mode" 
                        checked={reasoningEnabled}
                        onCheckedChange={setReasoningEnabled}
                      />
                      <Label htmlFor="reasoning-mode" className="flex items-center gap-1">
                        <Lightbulb className="h-4 w-4" />
                        <span className="hidden sm:inline">Reasoning</span>
                      </Label>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Enable deeper reasoning for complex questions</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            
            <Button variant="outline" size="sm" onClick={clearChat}>Clear Chat</Button>
            <ThemeToggle />
            
            {!isSignedIn ? (
              <div className="flex items-center gap-2">
                <SignInButton mode="modal">
                  <Button variant="outline" size="sm">Log in</Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button size="sm">Sign up</Button>
                </SignUpButton>
              </div>
            ) : (
              <UserButton afterSignOutUrl="/" />
            )}
          </div>
        </div>
      </header>

      <header className="md:hidden flex justify-between items-center p-3 border-b bg-card sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <BotIcon className="w-5 h-5 text-primary" />
          <h1 className="text-lg font-bold">AI Chat Assistant</h1>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isQuickModelSelectorOpen} onOpenChange={setIsQuickModelSelectorOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-1 px-2 py-1 h-8">
                <span className="text-sm truncate max-w-[100px]">{selectedModelName}</span>
                <ChevronDown className="h-3 w-3 flex-shrink-0" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Select a Model</DialogTitle>
              </DialogHeader>
              <ScrollArea className="h-[200px] sm:h-[400px] w-full rounded-md border">
                <div className="p-3">
                  {models.map((model) => (
                    <div key={model.id} className="mb-2">
                      <label className="flex items-center p-2 rounded-md hover:bg-secondary cursor-pointer">
                        <input
                          type="radio"
                          name="model"
                          value={model.id}
                          className="mr-2"
                          checked={selectedModel === model.id}
                          onChange={() => {
                            setSelectedModel(model.id);
                            setIsQuickModelSelectorOpen(false);
                          }}
                        />
                        <div className="space-y-1 leading-none">
                          <p className="text-sm font-medium">{model.name}</p>
                          <p className="text-sm text-muted-foreground">{model.description}</p>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>
          
          {hasReasoningCapability && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant={reasoningEnabled ? "default" : "outline"} 
                    size="icon" 
                    className="h-8 w-8 p-0"
                    onClick={() => setReasoningEnabled(!reasoningEnabled)}
                  >
                    <Lightbulb className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{reasoningEnabled ? "Disable" : "Enable"} reasoning</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
          <Sheet open={isMobileSettingsOpen} onOpenChange={setIsMobileSettingsOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                <Settings className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85vw] sm:w-[350px]">
              <SheetHeader>
                <SheetTitle>Settings</SheetTitle>
              </SheetHeader>
              <div className="py-4 space-y-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Reasoning Mode</h3>
                  <p className="text-sm text-muted-foreground">
                    Enable deeper reasoning for complex questions.
                  </p>
                  <div className="flex items-center justify-between rounded-md border p-3 shadow-sm">
                    <Label htmlFor="auto-enable-reasoning" className="flex items-center gap-1">
                      Auto-Enable Reasoning
                    </Label>
                    <Switch
                      id="auto-enable-reasoning"
                      checked={autoEnableReasoning}
                      onCheckedChange={setAutoEnableReasoning}
                    />
                  </div>
                </div>
                
                <div className="border-t pt-4 mt-4">
                  <h3 className="text-sm font-medium mb-3">Account</h3>
                  {!isSignedIn ? (
                    <div className="flex flex-col gap-2">
                      <SignInButton mode="modal">
                        <Button variant="outline" className="w-full">Log in</Button>
                      </SignInButton>
                      <SignUpButton mode="modal">
                        <Button className="w-full">Sign up</Button>
                      </SignUpButton>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{user?.fullName}</span>
                      <UserButton afterSignOutUrl="/" />
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-4">
        <div className="w-full max-w-4xl mx-auto">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              onToggleReasoning={toggleReasoning}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </main>

      <footer className="p-4 border-t bg-card">
        <div className="w-full max-w-4xl mx-auto flex items-center">
          <Textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message here..."
            className="resize-none flex-1 rounded-md border-0 bg-transparent py-2 pl-0 pr-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          />
          <Button onClick={sendMessage} disabled={isLoading}>
            {isLoading ? "Sending..." : "Send"}
          </Button>
        </div>
      </footer>
    </div>
  );
};

export default Chat;
