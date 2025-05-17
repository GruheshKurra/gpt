import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { 
  Send, 
  ChevronDown, 
  Loader2, 
  BotIcon, 
  Lightbulb, 
  Save, 
  Share, 
  Trash, 
  Download, 
  Settings,
  Workflow,
  MessageSquare,
  Plus,
  Menu,
  Check,
  Computer,
  Sun,
  Moon,
  Bot
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "@/components/ThemeProvider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SavedConversations } from "@/components/SavedConversations";
import { ReasoningVisualizer } from "@/components/ReasoningVisualizer";
import { ModelInfo } from "@/components/ModelInfo";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  reasoning?: boolean;
  reasoningSteps?: string;
  isStreaming?: boolean;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  model: string;
  updatedAt?: number;
}

const API_KEY = "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";

const SYSTEM_PROMPT = `You are a helpful, respectful and honest assistant. Always approach questions thoughtfully and provide accurate, well-reasoned responses.`;

const REASONING_PROMPT = `Before responding, I want you to think step-by-step about the problem or query. Label your thinking process under a "### My Reasoning Process:" heading. After completing your reasoning process, provide your final answer under a "### Answer:" heading. The reasoning process should show your detailed analysis, while the answer should be clear and concise.`;

const MODELS = [
  {
    name: "DeepSeek R1 (Best for Reasoning)",
    id: "deepseek/deepseek-r1:free",
    context: 163840,
    capabilities: { reasoning: true, streaming: true }
  },
  {
    name: "Llama 3.3 70B (Best Overall)",
    id: "meta-llama/llama-3.3-70b-instruct:free",
    context: 131072,
    capabilities: { streaming: true }
  },
  {
    name: "Nemotron Ultra 253B (Very Large)",
    id: "nvidia/llama-3.1-nemotron-ultra-253b-v1:free",
    context: 131072,
    capabilities: { streaming: true }
  },
  {
    name: "Llama 3.1 405B (Largest)",
    id: "meta-llama/llama-3.1-405b:free",
    context: 64000,
    capabilities: { streaming: true }
  }
];

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>("meta-llama/llama-3.3-70b-instruct:free");
  const [reasoningEnabled, setReasoningEnabled] = useState(false);
  const [streamingEnabled, setStreamingEnabled] = useState(true);
  const [conversationId, setConversationId] = useState<string>("");
  const [temperature, setTemperature] = useState<number>(0.7);
  const [savedConversationsCount, setSavedConversationsCount] = useState<number>(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  const selectedModelObject = MODELS.find(model => model.id === selectedModel);
  const hasReasoningCapability = selectedModelObject?.capabilities?.reasoning || false;
  const hasStreamingCapability = selectedModelObject?.capabilities?.streaming || false;

  // Count saved conversations
  useEffect(() => {
    let count = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("conversation_")) {
        count++;
      }
    }
    setSavedConversationsCount(count);
  }, [messages, conversationId]);

  // Load conversations from localStorage on mount
  useEffect(() => {
    const savedConversationId = localStorage.getItem("currentConversationId");
    if (savedConversationId) {
      setConversationId(savedConversationId);
      const savedConversation = localStorage.getItem(`conversation_${savedConversationId}`);
      if (savedConversation) {
        const parsedConversation = JSON.parse(savedConversation);
        setMessages(parsedConversation.messages);
        setSelectedModel(parsedConversation.model);
      }
    } else {
      // Generate a new conversation ID if none exists
      const newId = Date.now().toString();
      setConversationId(newId);
      localStorage.setItem("currentConversationId", newId);
    }
    
    // Load user preferences
    const savedStreamingPreference = localStorage.getItem("streamingEnabled");
    if (savedStreamingPreference !== null) {
      setStreamingEnabled(savedStreamingPreference === "true");
    }
    
    const savedTemperature = localStorage.getItem("temperature");
    if (savedTemperature !== null) {
      setTemperature(Number(savedTemperature));
    }
  }, []);

  // Save conversation whenever messages change
  useEffect(() => {
    if (conversationId && messages.length > 0) {
      // Use first user message as title or default
      const firstUserMessage = messages.find(m => m.role === "user");
      const title = firstUserMessage 
        ? firstUserMessage.content.slice(0, 30) + (firstUserMessage.content.length > 30 ? "..." : "")
        : "New conversation";
        
      const conversation: Conversation = {
        id: conversationId,
        title,
        messages,
        model: selectedModel,
        updatedAt: Date.now()
      };
      localStorage.setItem(`conversation_${conversationId}`, JSON.stringify(conversation));
    }
  }, [messages, conversationId, selectedModel]);

  // Save user preferences
  useEffect(() => {
    localStorage.setItem("streamingEnabled", String(streamingEnabled));
  }, [streamingEnabled]);
  
  useEffect(() => {
    localStorage.setItem("temperature", String(temperature));
  }, [temperature]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Create a new conversation
  const createNewConversation = () => {
    if (messages.length > 0) {
      const newId = Date.now().toString();
      setConversationId(newId);
      localStorage.setItem("currentConversationId", newId);
      setMessages([]);
      toast({
        title: "New conversation started",
        description: "Your previous conversation has been saved.",
      });
    }
  };

  // Load a saved conversation
  const loadConversation = (conversation: Conversation) => {
    setConversationId(conversation.id);
    localStorage.setItem("currentConversationId", conversation.id);
    setMessages(conversation.messages);
    setSelectedModel(conversation.model);
    toast({
      title: "Conversation loaded",
      description: "Successfully loaded the conversation.",
    });
  };

  // Handle streaming response
  const handleStreamResponse = async (response: Response) => {
    const reader = response.body?.getReader();
    if (!reader) return;

    const assistantMessage: Message = { 
      id: Date.now().toString(), 
      role: "assistant", 
      content: "",
      reasoning: reasoningEnabled,
      reasoningSteps: "",
      isStreaming: true
    };
    
    setMessages((prev) => [...prev, assistantMessage]);
    
    let accumulatedContent = "";
    
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n').filter(line => line.trim() !== '');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.choices && data.choices[0].delta && data.choices[0].delta.content) {
                accumulatedContent += data.choices[0].delta.content;
                
                let finalContent = accumulatedContent;
                let reasoningSteps = "";
                
                // Check if we can separate reasoning from answer as they stream in
                if (reasoningEnabled && 
                    accumulatedContent.includes("### My Reasoning Process:") && 
                    accumulatedContent.includes("### Answer:")) {
                  const reasoningMatch = accumulatedContent.match(/### My Reasoning Process:([\s\S]*?)### Answer:/);
                  const answerMatch = accumulatedContent.match(/### Answer:([\s\S]*)/);
                  
                  if (reasoningMatch && answerMatch) {
                    reasoningSteps = reasoningMatch[1].trim();
                    finalContent = answerMatch[1].trim();
                  }
                }
                
                setMessages(prev => 
                  prev.map(msg => 
                    msg.id === assistantMessage.id 
                      ? { ...msg, content: finalContent, reasoningSteps, isStreaming: true } 
                      : msg
                  )
                );
              }
            } catch (e) {
              console.error("Error parsing streaming JSON:", e);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error reading stream:", error);
    } finally {
      // Mark message as no longer streaming when complete
      setMessages(prev => 
        prev.map(msg => 
          msg.id === assistantMessage.id 
            ? { ...msg, isStreaming: false } 
            : msg
        )
      );
    }
  };

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

      const streamSetting = streamingEnabled && hasStreamingCapability;

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
          temperature: reasoningEnabled ? Math.min(0.7, temperature) : temperature,
          max_tokens: 4000,
          stream: streamSetting,
        })
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      // Handle streaming response
      if (streamSetting) {
        await handleStreamResponse(response);
      } else {
        // Handle regular response
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
      }
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

  // Function to share the conversation
  const shareConversation = () => {
    // Create shareable text
    const shareableText = messages.map(msg => 
      `${msg.role === 'user' ? 'You' : 'AI'}: ${msg.content}`
    ).join('\n\n');
    
    navigator.clipboard.writeText(shareableText).then(() => {
      toast({
        title: "Conversation copied",
        description: "The conversation has been copied to your clipboard.",
      });
    }).catch(err => {
      console.error('Failed to copy conversation: ', err);
      toast({
        title: "Error",
        description: "Failed to copy the conversation.",
        variant: "destructive"
      });
    });
  };

  // Function to export conversation as JSON
  const exportConversation = () => {
    if (messages.length === 0) return;
    
    try {
      const conversation: Conversation = {
        id: conversationId,
        title: messages[0]?.content.slice(0, 30) + "...",
        messages,
        model: selectedModel
      };
      
      const jsonString = JSON.stringify(conversation, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Create a visible button that will trigger the download
      toast({
        title: "Exporting conversation",
        description: (
          <div className="mt-2 flex justify-center">
            <Button 
              asChild
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => URL.revokeObjectURL(url)}
            >
              <a href={url} download={`ai-conversation-${new Date().toISOString().slice(0, 10)}.json`}>
                <Download className="h-4 w-4" />
                <span>Download Conversation</span>
              </a>
            </Button>
          </div>
        ),
      });
    } catch (error) {
      console.error("Error exporting conversation:", error);
      toast({
        title: "Error",
        description: "Failed to export the conversation.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="flex justify-between items-center p-3 border-b bg-card sticky top-0 z-10">
        <div className="w-full max-w-4xl mx-auto flex justify-between items-center px-4">
          <div className="flex items-center gap-2">
            <BotIcon className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold hidden md:block">AI Chat Assistant</h1>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Model selector and info */}
            <div className="flex items-center">
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="w-[120px] md:w-[200px] text-xs md:text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MODELS.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      <span className="hidden md:inline">{model.name}</span>
                      <span className="md:hidden">{model.name.split(' ')[0]}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="hidden sm:block ml-1">
                {selectedModelObject && <ModelInfo model={selectedModelObject} />}
              </div>
            </div>
            
            {/* Main action buttons */}
            <div className="flex items-center gap-2">
              {/* Reasoning toggle */}
              {hasReasoningCapability && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={reasoningEnabled ? "default" : "outline"}
                      size="icon"
                      onClick={() => setReasoningEnabled(!reasoningEnabled)}
                      className="h-9 w-9 md:h-9 md:w-auto md:px-3"
                    >
                      <Lightbulb className="h-4 w-4" />
                      <span className="hidden md:inline ml-1">Reasoning</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {reasoningEnabled ? "Disable reasoning" : "Enable reasoning"}
                  </TooltipContent>
                </Tooltip>
              )}
              
              {/* New conversation button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={createNewConversation}
                    className={messages.length > 0 ? 'relative' : ''}
                  >
                    <Plus className="h-4 w-4" />
                    {messages.length > 0 && (
                      <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary animate-pulse"></span>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>New conversation</TooltipContent>
              </Tooltip>
              
              {/* Main menu dropdown for history, settings, etc. */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Menu className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Conversation</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem 
                      onClick={createNewConversation}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      <span>New Conversation</span>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem
                      onClick={() => {
                        const hiddenHistoryButton = document.querySelector('[data-history-trigger]') as HTMLElement;
                        if (hiddenHistoryButton) {
                          hiddenHistoryButton.click();
                        }
                      }}
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      <span>History</span>
                      {savedConversationsCount > 0 && (
                        <span className="ml-auto text-xs rounded-full bg-muted px-2 py-0.5">
                          {savedConversationsCount}
                        </span>
                      )}
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem
                      onClick={() => {
                        if (messages.length > 0) {
                          // Keep the conversation ID but clear messages
                          setMessages([]);
                          toast({
                            title: "Conversation cleared",
                            description: "The current conversation has been cleared.",
                          });
                        }
                      }}
                      disabled={messages.length === 0}
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      <span>Clear Conversation</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Share</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem
                    onClick={shareConversation}
                    disabled={messages.length === 0}
                  >
                    <Share className="mr-2 h-4 w-4" />
                    <span>Copy to Clipboard</span>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem
                    onClick={exportConversation}
                    disabled={messages.length === 0}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    <span>Export as JSON</span>
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Settings</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  {/* <div className="p-2">
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="dropdown-streaming" className="text-xs">
                        Streaming
                      </Label>
                      <Switch 
                        id="dropdown-streaming" 
                        checked={streamingEnabled}
                        onCheckedChange={setStreamingEnabled}
                        disabled={!hasStreamingCapability}
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <Label htmlFor="temperature-dropdown" className="text-xs">
                          Temperature: {temperature.toFixed(1)}
                        </Label>
                      </div>
                      <Slider
                        id="temperature-dropdown"
                        min={0}
                        max={1}
                        step={0.1}
                        value={[temperature]}
                        onValueChange={(values) => setTemperature(values[0])}
                        className="w-full"
                      />
                    </div>
                  </div> */}
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem
                      onClick={() => setTheme('light')}
                    >
                      <Sun className="mr-2 h-4 w-4" />
                      <span>Light Mode</span>
                      {theme === 'light' && <Check className="ml-auto h-4 w-4" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setTheme('dark')}
                    >
                      <Moon className="mr-2 h-4 w-4" />
                      <span>Dark Mode</span>
                      {theme === 'dark' && <Check className="ml-auto h-4 w-4" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setTheme('system')}
                    >
                      <Computer className="mr-2 h-4 w-4" />
                      <span>System Theme</span>
                      {theme === 'system' && <Check className="ml-auto h-4 w-4" />}
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Hidden component to access saved conversations */}
              <div className="hidden">
                <SavedConversations 
                  onSelectConversation={loadConversation} 
                  currentConversationId={conversationId} 
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto scroll-smooth">
          <div className="w-full max-w-4xl mx-auto">
            <div className="flex-1 space-y-6 p-4 md:p-6">
              {messages.length === 0 ? (
                <div className="flex h-[60vh] flex-col items-center justify-center text-center">
                  <div className="rounded-full bg-primary/10 p-4 mb-4">
                    <BotIcon className="h-12 w-12 text-primary" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-2">Welcome to AI Chat Assistant</h3>
                  <p className="text-muted-foreground mb-6">Ask me anything - I'm here to help!</p>
                  
                  <div className="max-w-md w-full bg-card border rounded-lg p-6 shadow-sm">
                    <h4 className="font-medium mb-4 flex items-center gap-2 text-lg">
                      <Workflow className="h-5 w-5 text-primary" />
                      How can I help you today?
                    </h4>
                    
                    <div className="space-y-4 text-sm">
                      <p className="text-muted-foreground">
                        You can ask me about anything, from answering questions to helping with tasks.
                      </p>
                      
                      {hasReasoningCapability && (
                        <div className="flex items-center gap-2 text-sm border-t pt-4">
                          <Lightbulb className="h-4 w-4 text-amber-500 flex-shrink-0" />
                          <span>
                            <span className="font-medium">Reasoning mode</span> is available for complex questions
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                messages.map((message) => (
                  <div key={message.id} className="flex items-start gap-4 animate-fade-in">
                    <div className={`
                      flex-1 rounded-lg px-4 py-3 shadow-sm
                      ${message.role === "user" 
                          ? "bg-primary/10 border-primary/20 ml-10 md:ml-16" 
                          : "bg-card border border-border mr-10 md:mr-16 shadow-message"
                      }
                    `}>
                      {message.role === "user" ? (
                        <div className="prose dark:prose-invert prose-sm max-w-none break-words prose-headings:mt-4 prose-headings:mb-2 prose-headings:text-foreground prose-headings:font-semibold prose-headings:text-base prose-p:mt-3 prose-p:leading-relaxed">
                          <ReactMarkdown>
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <div className="prose dark:prose-invert prose-sm max-w-none break-words prose-headings:mt-6 prose-headings:mb-2 prose-headings:text-foreground prose-headings:font-semibold prose-headings:text-lg prose-p:mt-3 prose-p:leading-relaxed">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                            <Bot className="h-3 w-3" />
                            <span>Powered by {selectedModelObject?.name.split(' ')[0]}</span>
                          </div>
                          <ReactMarkdown>
                            {message.content}
                          </ReactMarkdown>
                          {message.isStreaming && (
                            <div className="mt-1 animate-pulse">▌</div>
                          )}
                          {message.reasoningSteps && (
                            <div className="mt-4 pt-4 border-t border-border">
                              <div className="flex items-center gap-2 text-amber-500 text-sm font-medium mb-2">
                                <Lightbulb className="h-4 w-4" />
                                <span>Reasoning Process</span>
                                {message.isStreaming && (
                                  <div className="animate-pulse">▌</div>
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground prose-headings:mt-4 prose-headings:mb-2 prose-headings:text-amber-500/80 prose-headings:font-medium prose-headings:text-sm">
                                <ReactMarkdown>
                                  {message.reasoningSteps}
                                </ReactMarkdown>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
              {isLoading && !streamingEnabled && (
                <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground py-8">
                  {reasoningEnabled ? (
                    <>
                      <ReasoningVisualizer isActive={true} />
                      <p className="text-sm mt-2 text-center">
                        The AI is analyzing your question with step-by-step reasoning.
                        <br />This may take a moment for complex queries.
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        <span className="text-base font-medium">Generating response...</span>
                      </div>
                      <p className="text-sm mt-2 text-center">
                        Processing your request with {selectedModelObject?.name.split(' ')[0]}
                      </p>
                    </>
                  )}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>

        <div className="border-t bg-card p-4">
          <div className="w-full max-w-4xl mx-auto">
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