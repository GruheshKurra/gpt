import { useState, useRef, useEffect } from "react";
import { UserButton } from "@clerk/clerk-react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Send, ChevronDown, ChevronUp, Loader2, BotIcon, Settings, X, Search, Lightbulb, PlusCircle, Brain, Code } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  reasoning?: boolean;
  reasoningSteps?: string;
  isReasoningExpanded?: boolean;
}

interface Model {
  name: string;
  id: string;
  context: number;
  category?: string;
  capabilities?: {
    code?: boolean;
    reasoning?: boolean;
  };
}

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
- Verify your solution

Always aim to be:
- Accurate and truthful
- Clear and concise
- Helpful while respecting boundaries
- Willing to say "I don't know" when uncertain`;

const REASONING_PROMPT = `Before responding, I want you to think step-by-step about the problem or query. Label your thinking process under a "### My Reasoning Process:" heading. After completing your reasoning process, provide your final answer under a "### Answer:" heading. The reasoning process should show your detailed analysis, while the answer should be clear and concise.`;

const AVAILABLE_MODELS: Model[] = [
  {
    name: "Llama 3.3 70B",
    id: "meta-llama/llama-3.3-70b-instruct:free",
    context: 131072,
    category: "Large"
  },
  {
    name: "Llama 3.3 8B Instruct",
    id: "meta-llama/llama-3.3-8b-instruct:free",
    context: 12800,
    category: "Popular"
  },
  {
    name: "DeepHermes 3 Mistral 24B",
    id: "nousresearch/deephermes-3-mistral-24b-preview:free",
    context: 32768,
    category: "Reasoning",
    capabilities: { reasoning: true }
  },
  {
    name: "Phi 4 Reasoning Plus",
    id: "microsoft/phi-4-reasoning-plus:free",
    context: 32768,
    category: "Reasoning",
    capabilities: { reasoning: true }
  },
  {
    name: "Phi 4 Reasoning",
    id: "microsoft/phi-4-reasoning:free",
    context: 32768,
    category: "Reasoning",
    capabilities: { reasoning: true }
  },
  {
    name: "Qwen3 0.6B",
    id: "qwen/qwen3-0.6b-04-28:free",
    context: 32000,
    category: "Small"
  },
  {
    name: "Qwen3 1.7B",
    id: "qwen/qwen3-1.7b:free",
    context: 32000,
    category: "Small"
  },
  {
    name: "Qwen3 4B",
    id: "qwen/qwen3-4b:free",
    context: 32000,
    category: "Popular"
  },
  {
    name: "DeepSeek Prover V2",
    id: "deepseek/deepseek-prover-v2:free",
    context: 163840,
    category: "Reasoning",
    capabilities: { reasoning: true }
  },
  {
    name: "Qwen3 30B",
    id: "qwen/qwen3-30b-a3b:free",
    context: 40960,
    category: "Large"
  },
  {
    name: "Qwen3 8B",
    id: "qwen/qwen3-8b:free",
    context: 40960,
    category: "Popular"
  },
  {
    name: "Qwen3 14B",
    id: "qwen/qwen3-14b:free",
    context: 40960,
    category: "Large"
  },
  {
    name: "Qwen3 32B",
    id: "qwen/qwen3-32b:free",
    context: 40960,
    category: "Large"
  },
  {
    name: "Qwen3 235B",
    id: "qwen/qwen3-235b-a22b:free",
    context: 40960,
    category: "Large"
  },
  {
    name: "DeepSeek R1T Chimera",
    id: "tngtech/deepseek-r1t-chimera:free",
    context: 163840,
    category: "Reasoning",
    capabilities: { reasoning: true }
  },
  {
    name: "GLM Z1 9B",
    id: "thudm/glm-z1-9b:free",
    context: 32000,
    category: "Popular"
  },
  {
    name: "GLM 4 9B",
    id: "thudm/glm-4-9b:free",
    context: 32000,
    category: "Popular"
  },
  {
    name: "MAI DS R1",
    id: "microsoft/mai-ds-r1:free",
    context: 163840,
    category: "Reasoning",
    capabilities: { reasoning: true }
  },
  {
    name: "GLM Z1 32B",
    id: "thudm/glm-z1-32b:free",
    context: 32768,
    category: "Large"
  },
  {
    name: "GLM 4 32B",
    id: "thudm/glm-4-32b:free",
    context: 32768,
    category: "Large"
  },
  {
    name: "Shisa V2 70B",
    id: "shisa-ai/shisa-v2-llama3.3-70b:free",
    context: 32768,
    category: "Large"
  },
  {
    name: "QwQ 32B RpR",
    id: "arliai/qwq-32b-arliai-rpr-v1:free",
    context: 32768,
    category: "Reasoning",
    capabilities: { reasoning: true }
  },
  {
    name: "Deepcoder 14B",
    id: "agentica-org/deepcoder-14b-preview:free",
    context: 96000,
    category: "Code",
    capabilities: { code: true }
  },
  {
    name: "Nemotron Super 49B",
    id: "nvidia/llama-3.3-nemotron-super-49b-v1:free",
    context: 131072,
    category: "Large"
  },
  {
    name: "Nemotron Ultra 253B",
    id: "nvidia/llama-3.1-nemotron-ultra-253b-v1:free",
    context: 131072,
    category: "Large"
  },
  {
    name: "Llama 4 Maverick",
    id: "meta-llama/llama-4-maverick:free",
    context: 128000,
    category: "Popular"
  },
  {
    name: "Llama 4 Scout",
    id: "meta-llama/llama-4-scout:free",
    context: 256000,
    category: "Popular"
  },
  {
    name: "DeepSeek V3 Base",
    id: "deepseek/deepseek-v3-base:free",
    context: 163840,
    category: "Reasoning",
    capabilities: { reasoning: true }
  },
  {
    name: "Qwerky 72B",
    id: "featherless/qwerky-72b:free",
    context: 32768,
    category: "Large"
  },
  {
    name: "Mistral Small 24B",
    id: "mistralai/mistral-small-3.1-24b-instruct:free",
    context: 96000,
    category: "Popular"
  },
  {
    name: "OlympicCoder 32B",
    id: "open-r1/olympiccoder-32b:free",
    context: 32768,
    category: "Code",
    capabilities: { code: true }
  },
  {
    name: "Gemma 3 1B",
    id: "google/gemma-3-1b-it:free",
    context: 32768,
    category: "Small"
  },
  {
    name: "Gemma 3 4B",
    id: "google/gemma-3-4b-it:free",
    context: 131072,
    category: "Popular"
  },
  {
    name: "Gemma 3 12B",
    id: "google/gemma-3-12b-it:free",
    context: 131072,
    category: "Popular"
  },
  {
    name: "Flash 3",
    id: "rekaai/reka-flash-3:free",
    context: 32768,
    category: "Popular"
  },
  {
    name: "Gemma 3 27B",
    id: "google/gemma-3-27b-it:free",
    context: 96000,
    category: "Large"
  },
  {
    name: "DeepSeek R1 Zero",
    id: "deepseek/deepseek-r1-zero:free",
    context: 128000,
    category: "Reasoning",
    capabilities: { reasoning: true }
  },
  {
    name: "QwQ 32B",
    id: "qwen/qwq-32b:free",
    context: 40000,
    category: "Large"
  },
  {
    name: "Moonlight 16B",
    id: "moonshotai/moonlight-16b-a3b-instruct:free",
    context: 8192,
    category: "Popular"
  },
  {
    name: "DeepHermes 3 Llama 8B",
    id: "nousresearch/deephermes-3-llama-3-8b-preview:free",
    context: 131072,
    category: "Reasoning",
    capabilities: { reasoning: true }
  },
  {
    name: "Dolphin 3.0 R1 24B",
    id: "cognitivecomputations/dolphin3.0-r1-mistral-24b:free",
    context: 32768,
    category: "Popular"
  },
  {
    name: "Dolphin 3.0 24B",
    id: "cognitivecomputations/dolphin3.0-mistral-24b:free",
    context: 32768,
    category: "Popular"
  },
  {
    name: "Mistral Small 24B",
    id: "mistralai/mistral-small-24b-instruct-2501:free",
    context: 32768,
    category: "Popular"
  },
  {
    name: "DeepSeek R1 Qwen 32B",
    id: "deepseek/deepseek-r1-distill-qwen-32b:free",
    context: 16000,
    category: "Reasoning",
    capabilities: { reasoning: true }
  },
  {
    name: "DeepSeek R1 Qwen 14B",
    id: "deepseek/deepseek-r1-distill-qwen-14b:free",
    context: 64000,
    category: "Reasoning",
    capabilities: { reasoning: true }
  },
  {
    name: "DeepSeek R1 Llama 70B",
    id: "deepseek/deepseek-r1-distill-llama-70b:free",
    context: 8192,
    category: "Reasoning",
    capabilities: { reasoning: true }
  },
  {
    name: "DeepSeek R1",
    id: "deepseek/deepseek-r1:free",
    context: 163840,
    category: "Reasoning",
    capabilities: { reasoning: true }
  },
  {
    name: "DeepSeek V3",
    id: "deepseek/deepseek-chat:free",
    context: 163840,
    category: "Reasoning",
    capabilities: { reasoning: true }
  },
  {
    name: "Gemini 2.0 Flash",
    id: "google/gemini-2.0-flash-exp:free",
    context: 1048576,
    category: "Popular"
  },
  {
    name: "Qwen2.5 Coder 32B",
    id: "qwen/qwen-2.5-coder-32b-instruct:free",
    context: 32768,
    category: "Code",
    capabilities: { code: true }
  },
  {
    name: "Qwen2.5 7B",
    id: "qwen/qwen-2.5-7b-instruct:free",
    context: 32768,
    category: "Popular"
  },
  {
    name: "Llama 3.2 3B",
    id: "meta-llama/llama-3.2-3b-instruct:free",
    context: 20000,
    category: "Small"
  },
  {
    name: "Llama 3.2 1B",
    id: "meta-llama/llama-3.2-1b-instruct:free",
    context: 131000,
    category: "Small"
  },
  {
    name: "Qwen2.5 72B",
    id: "qwen/qwen-2.5-72b-instruct:free",
    context: 32768,
    category: "Large"
  },
  {
    name: "Llama 3.1 405B",
    id: "meta-llama/llama-3.1-405b:free",
    context: 64000,
    category: "Large"
  },
  {
    name: "Llama 3.1 8B",
    id: "meta-llama/llama-3.1-8b-instruct:free",
    context: 131072,
    category: "Popular"
  },
  {
    name: "Mistral Nemo",
    id: "mistralai/mistral-nemo:free",
    context: 128000,
    category: "Popular"
  },
  {
    name: "Gemma 2 9B",
    id: "google/gemma-2-9b-it:free",
    context: 8192,
    category: "Popular"
  },
  {
    name: "Mistral 7B",
    id: "mistralai/mistral-7b-instruct:free",
    context: 32768,
    category: "Popular"
  }
];

const defaultModels = [
  {name: "Llama 3.3 70B", id: "meta-llama/llama-3.3-70b-instruct:free", category: "Large"},
  {name: "Phi 4 Reasoning", id: "microsoft/phi-4-reasoning:free", category: "Reasoning", capabilities: {reasoning: true}},
  {name: "Qwen2.5 Coder 32B", id: "qwen/qwen-2.5-coder-32b-instruct:free", category: "Code", capabilities: {code: true}},
  {name: "Mistral Small 24B", id: "mistralai/mistral-small-3.1-24b-instruct:free", category: "Popular"}
];

const categoryOrder = ["Popular", "Small", "Large", "Reasoning", "Code", "Other"];

const Chat = () => {
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

  const selectedModelObject = AVAILABLE_MODELS.find(model => model.id === selectedModel);
  const hasReasoningCapability = selectedModelObject?.capabilities?.reasoning || false;

  useEffect(() => {
    if (autoEnableReasoning && hasReasoningCapability) {
      setReasoningEnabled(true);
    } else if (!hasReasoningCapability) {
      setReasoningEnabled(false);
    }
  }, [selectedModel, hasReasoningCapability, autoEnableReasoning]);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const toggleReasoningExpansion = (messageId: string) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, isReasoningExpanded: !msg.isReasoningExpanded } 
          : msg
      )
    );
  };

  const focusInput = () => {
    inputRef.current?.focus();
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
      setTimeout(() => focusInput(), 100);
    }
  };

  const filteredModels = modelSearchTerm.trim()
    ? AVAILABLE_MODELS.filter(model => 
        model.name.toLowerCase().includes(modelSearchTerm.toLowerCase()) ||
        model.category?.toLowerCase().includes(modelSearchTerm.toLowerCase()) ||
        (model.capabilities?.reasoning && "reasoning".includes(modelSearchTerm.toLowerCase())) ||
        (model.capabilities?.code && "code".includes(modelSearchTerm.toLowerCase()))
      )
    : AVAILABLE_MODELS;

  const filteredGroupedModels = filteredModels.reduce((acc, model) => {
    const category = model.category || "Other";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(model);
    return acc;
  }, {} as Record<string, Model[]>);

  const groupedDefaultModels = defaultModels.reduce((acc, model) => {
    const category = model.category || "Other";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(model);
    return acc;
  }, {} as Record<string, Model[]>);

  const selectedModelName = selectedModelObject?.name || "Llama 3.3 70B";
  
  const clearChat = () => {
    setMessages([]);
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
              <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-hidden flex flex-col">
                <DialogHeader>
                  <DialogTitle>Select AI Model</DialogTitle>
                  <DialogDescription>
                    Choose the AI model that best suits your needs
                  </DialogDescription>
                </DialogHeader>
                
                <div className="flex items-center space-x-2 mb-4 mt-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search models..."
                    value={modelSearchTerm}
                    onChange={(e) => setModelSearchTerm(e.target.value)}
                    className="h-9"
                  />
                </div>
                
                <div className="overflow-y-auto flex-grow pr-1">
                  <Tabs defaultValue="category" className="w-full">
                    <TabsList className="mb-2">
                      <TabsTrigger value="category">By Category</TabsTrigger>
                      <TabsTrigger value="all">All Models</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="category" className="space-y-4">
                      {categoryOrder.map(category => (
                        filteredGroupedModels[category]?.length > 0 && (
                          <Collapsible 
                            key={category}
                            open={expandedCategories[category]} 
                            onOpenChange={() => toggleCategory(category)}
                            className="border rounded-md overflow-hidden"
                          >
                            <CollapsibleTrigger asChild>
                              <Button 
                                variant="ghost" 
                                className="w-full flex justify-between items-center px-4 py-2 h-auto"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold">{category}</span>
                                  <Badge variant="outline" className="ml-2">
                                    {filteredGroupedModels[category].length}
                                  </Badge>
                                </div>
                                {expandedCategories[category] ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="px-4 py-2 space-y-2">
                              {filteredGroupedModels[category].map((model) => (
                                <Button 
                                  key={model.id} 
                                  variant={selectedModel === model.id ? "secondary" : "ghost"}
                                  className="w-full justify-start text-left h-auto py-3"
                                  onClick={() => {
                                    setSelectedModel(model.id);
                                    setIsModelSelectorOpen(false);
                                  }}
                                >
                                  <div className="flex flex-col items-start">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span>{model.name}</span>
                                      <div className="flex gap-1 mt-1">
                                        {model.capabilities?.reasoning && (
                                          <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">
                                            Reasoning
                                          </Badge>
                                        )}
                                        {model.capabilities?.code && (
                                          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                                            Code
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                    <span className="text-xs text-muted-foreground mt-1">
                                      Context: {Math.round(model.context / 1000)}k tokens
                                    </span>
                                  </div>
                                </Button>
                              ))}
                            </CollapsibleContent>
                          </Collapsible>
                        )
                      ))}
                    </TabsContent>
                    
                    <TabsContent value="all">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {filteredModels.map((model) => (
                          <Button 
                            key={model.id} 
                            variant={selectedModel === model.id ? "secondary" : "outline"}
                            className="justify-start text-left h-auto py-3"
                            onClick={() => {
                              setSelectedModel(model.id);
                              setIsModelSelectorOpen(false);
                            }}
                          >
                            <div className="flex flex-col items-start">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-medium">{model.name}</span>
                                <Badge variant="outline" className="bg-muted">
                                  {model.category}
                                </Badge>
                              </div>
                              <div className="flex gap-1 mt-1">
                                {model.capabilities?.reasoning && (
                                  <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">
                                    Reasoning
                                  </Badge>
                                )}
                                {model.capabilities?.code && (
                                  <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                                    Code
                                  </Badge>
                                )}
                              </div>
                              <span className="text-xs text-muted-foreground mt-1">
                                Context: {Math.round(model.context / 1000)}k tokens
                              </span>
                            </div>
                          </Button>
                        ))}
                      </div>
                    </TabsContent>
                    </Tabs>
               </div>
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
           <UserButton afterSignOutUrl="/" />
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
           <DialogContent className="w-[90vw] max-w-[350px] max-h-[80vh] overflow-hidden">
             <DialogHeader>
               <DialogTitle>Quick Model Selection</DialogTitle>
             </DialogHeader>
             <ScrollArea className="h-[400px] pr-3">
               <div className="space-y-3">
                 {categoryOrder.map(category => groupedDefaultModels[category] && (
                   <div key={category} className="space-y-2">
                     <h3 className="text-sm font-medium">{category} Models</h3>
                     <div className="space-y-2">
                       {groupedDefaultModels[category]?.map(model => (
                         <Button
                           key={model.id}
                           variant={selectedModel === model.id ? "secondary" : "outline"}
                           className="w-full justify-start text-left h-auto"
                           onClick={() => {
                             setSelectedModel(model.id);
                             setIsQuickModelSelectorOpen(false);
                           }}
                         >
                           <div className="flex-1 flex flex-col items-start">
                             <span className="font-medium">{model.name}</span>
                             <div className="flex gap-1 mt-1">
                               {model.capabilities?.reasoning && (
                                 <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">
                                   <Brain className="h-3 w-3 mr-1" />
                                   Reasoning
                                 </Badge>
                               )}
                               {model.capabilities?.code && (
                                 <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                                   <Code className="h-3 w-3 mr-1" />
                                   Code
                                 </Badge>
                               )}
                             </div>
                           </div>
                         </Button>
                       ))}
                     </div>
                   </div>
                 ))}
                 <div className="pt-2">
                   <Button 
                     variant="outline" 
                     className="w-full flex items-center justify-center gap-1"
                     onClick={() => {
                       setIsQuickModelSelectorOpen(false);
                       setIsModelSelectorOpen(true);
                     }}
                   >
                     <PlusCircle className="h-4 w-4" />
                     <span>View All Models</span>
                   </Button>
                 </div>
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
                 <h3 className="text-sm font-medium">Select Model</h3>
                 <div className="px-1">
                   <p className="text-xs text-muted-foreground mb-2">
                     Currently using: <span className="font-semibold">{selectedModelName}</span>
                   </p>
                   
                   <Dialog open={isModelSelectorOpen} onOpenChange={setIsModelSelectorOpen}>
                     <DialogTrigger asChild>
                       <Button variant="outline" className="w-full justify-between items-center">
                         <span className="truncate">Change Model</span>
                         <ChevronDown className="h-4 w-4 flex-shrink-0" />
                       </Button>
                     </DialogTrigger>
                     <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-hidden flex flex-col">
                       <DialogHeader>
                         <DialogTitle>Select AI Model</DialogTitle>
                         <DialogDescription>
                           Choose the AI model that best suits your needs
                         </DialogDescription>
                       </DialogHeader>
                       
                       <div className="flex items-center space-x-2 mb-4 mt-2">
                         <Search className="h-4 w-4 text-muted-foreground" />
                         <Input
                           placeholder="Search models..."
                           value={modelSearchTerm}
                           onChange={(e) => setModelSearchTerm(e.target.value)}
                           className="h-9"
                         />
                       </div>
                       
                       <div className="overflow-y-auto flex-grow pr-1">
                         <Tabs defaultValue="category" className="w-full">
                           <TabsList className="mb-2">
                             <TabsTrigger value="category">By Category</TabsTrigger>
                             <TabsTrigger value="all">All Models</TabsTrigger>
                           </TabsList>
                           
                           <TabsContent value="category" className="space-y-4">
                             {categoryOrder.map(category => (
                               filteredGroupedModels[category]?.length > 0 && (
                                 <Collapsible 
                                   key={category}
                                   open={expandedCategories[category]} 
                                   onOpenChange={() => toggleCategory(category)}
                                   className="border rounded-md overflow-hidden"
                                 >
                                   <CollapsibleTrigger asChild>
                                     <Button 
                                       variant="ghost" 
                                       className="w-full flex justify-between items-center px-4 py-2 h-auto"
                                     >
                                       <div className="flex items-center gap-2">
                                         <span className="font-semibold">{category}</span>
                                         <Badge variant="outline" className="ml-2">
                                           {filteredGroupedModels[category].length}
                                         </Badge>
                                       </div>
                                       {expandedCategories[category] ? (
                                         <ChevronUp className="h-4 w-4" />
                                       ) : (
                                         <ChevronDown className="h-4 w-4" />
                                       )}
                                     </Button>
                                   </CollapsibleTrigger>
                                   <CollapsibleContent className="px-4 py-2 space-y-2">
                                     {filteredGroupedModels[category].map((model) => (
                                       <Button 
                                         key={model.id} 
                                         variant={selectedModel === model.id ? "secondary" : "ghost"}
                                         className="w-full justify-start text-left h-auto py-3"
                                         onClick={() => {
                                           setSelectedModel(model.id);
                                           setIsModelSelectorOpen(false);
                                           setIsMobileSettingsOpen(false);
                                         }}
                                       >
                                         <div className="flex flex-col items-start">
                                           <div className="flex items-center gap-2">
                                             <span>{model.name}</span>
                                           </div>
                                           <div className="flex gap-1 mt-1">
                                             {model.capabilities?.reasoning && (
                                               <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">
                                                 Reasoning
                                               </Badge>
                                             )}
                                             {model.capabilities?.code && (
                                               <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                                                 Code
                                               </Badge>
                                             )}
                                           </div>
                                           <span className="text-xs text-muted-foreground mt-1">
                                             Context: {Math.round(model.context / 1000)}k tokens
                                           </span>
                                         </div>
                                       </Button>
                                     ))}
                                   </CollapsibleContent>
                                 </Collapsible>
                               )
                             ))}
                           </TabsContent>
                           
                           <TabsContent value="all">
                             <div className="grid grid-cols-1 gap-2">
                               {filteredModels.map((model) => (
                                 <Button 
                                   key={model.id} 
                                   variant={selectedModel === model.id ? "secondary" : "outline"}
                                   className="justify-start text-left h-auto py-3"
                                   onClick={() => {
                                     setSelectedModel(model.id);
                                     setIsModelSelectorOpen(false);
                                     setIsMobileSettingsOpen(false);
                                   }}
                                 >
                                   <div className="flex flex-col items-start">
                                     <div className="flex items-center gap-2 flex-wrap">
                                       <span className="font-medium">{model.name}</span>
                                       <Badge variant="outline" className="bg-muted">
                                         {model.category}
                                       </Badge>
                                     </div>
                                     <div className="flex gap-1 mt-1">
                                       {model.capabilities?.reasoning && (
                                         <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">
                                           Reasoning
                                         </Badge>
                                       )}
                                       {model.capabilities?.code && (
                                         <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                                           Code
                                         </Badge>
                                       )}
                                     </div>
                                     <span className="text-xs text-muted-foreground mt-1">
                                       Context: {Math.round(model.context / 1000)}k tokens
                                     </span>
                                   </div>
                                 </Button>
                               ))}
                             </div>
                           </TabsContent>
                         </Tabs>
                       </div>
                     </DialogContent>
                   </Dialog>
                   
                   {hasReasoningCapability && (
                     <div className="flex items-center justify-between mt-4">
                       <span className="text-sm font-medium">Auto-enable reasoning</span>
                       <Switch 
                         checked={autoEnableReasoning}
                         onCheckedChange={setAutoEnableReasoning}
                       />
                     </div>
                   )}
                   <div className="flex items-center justify-between mt-4">
                     <span className="text-sm font-medium">Theme</span>
                     <ThemeToggle />
                   </div>
                   <div className="flex items-center justify-between mt-4">
                     <span className="text-sm font-medium">Account</span>
                     <UserButton afterSignOutUrl="/" />
                   </div>
                   <Button 
                     variant="outline" 
                     className="w-full mt-4" 
                     onClick={() => {
                       clearChat();
                       setIsMobileSettingsOpen(false);
                     }}
                   >
                     Clear Chat
                   </Button>
                 </div>
               </div>
             </div>
           </SheetContent>
         </Sheet>
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
                 <div className="mt-8 text-sm text-muted-foreground text-center">
                   <div className="flex flex-col gap-2 items-center">
                     <p className="mb-1">Using: <span className="font-semibold">{selectedModelName}</span></p>
                     <div className="flex flex-col sm:flex-row gap-2">
                       <Button 
                         variant="outline" 
                         size="sm" 
                         onClick={() => setIsQuickModelSelectorOpen(true)}
                         className="md:hidden flex items-center gap-1"
                       >
                         <PlusCircle className="h-4 w-4" />
                         <span>Change Model</span>
                       </Button>
                       {hasReasoningCapability && (
                         <Button 
                           variant={reasoningEnabled ? "default" : "outline"}
                           size="sm"
                           onClick={() => setReasoningEnabled(!reasoningEnabled)}
                           className="flex items-center gap-1"
                         >
                           <Lightbulb className="h-4 w-4" />
                           <span>{reasoningEnabled ? "Disable" : "Enable"} Reasoning</span>
                         </Button>
                       )}
                     </div>
                   </div>
                   <div className="flex flex-col gap-2 mt-6">
                     <p className="text-xs text-muted-foreground">Model capabilities:</p>
                     <div className="flex gap-2 justify-center flex-wrap">
                       {hasReasoningCapability && (
                         <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 flex items-center gap-1">
                           <Brain className="h-3 w-3" />
                           Reasoning
                         </Badge>
                       )}
                       {selectedModelObject?.capabilities?.code && (
                         <Badge className="bg-green-500/10 text-green-500 border-green-500/20 flex items-center gap-1">
                           <Code className="h-3 w-3" />
                           Code
                         </Badge>
                       )}
                       <Badge variant="outline">
                         {Math.round(selectedModelObject?.context || 0 / 1000)}k tokens
                       </Badge>
                     </div>
                   </div>
                 </div>
               </div>
             ) : (
               messages.filter(msg => msg.role !== "system").map((message) => (
                 <div key={message.id} className="w-full max-w-4xl mx-auto px-4">
                   <div className={`flex items-start gap-3 mb-4 animate-fade-in ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                     {message.role === "assistant" && (
                       <Avatar className="h-8 w-8 mt-1 flex-shrink-0">
                         <AvatarImage src="/masked-icon.svg" alt="AI" />
                         <AvatarFallback>AI</AvatarFallback>
                       </Avatar>
                     )}
                     
                     <div className={`rounded-lg px-4 py-3 max-w-[85%] shadow-message relative ${
                       message.role === "user" 
                         ? "bg-primary text-primary-foreground" 
                         : "bg-card border border-border"
                     }`}>
                       {message.role === "user" ? (
                         <p className="whitespace-pre-wrap break-words">{message.content}</p>
                       ) : (
                         <div className="prose dark:prose-invert prose-sm max-w-none">
                           <div className="[&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                             <ReactMarkdown>
                               {message.content}
                             </ReactMarkdown>
                             
                             {message.reasoningSteps && (
                               <div className="mt-2">
                                 <div className="flex items-center justify-between border-t pt-2 mt-4">
                                   <div className="flex items-center gap-1 text-amber-500 text-sm font-medium">
                                     <Lightbulb className="h-4 w-4" />
                                     <span>Reasoning process</span>
                                   </div>
                                   <Button
                                     variant="ghost"
                                     size="sm"
                                     className="h-7 px-2"
                                     onClick={() => toggleReasoningExpansion(message.id)}
                                   >
                                     {message.isReasoningExpanded ? "Hide" : "Show"}
                                     {message.isReasoningExpanded ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
                                   </Button>
                                 </div>
                                 
                                 {message.isReasoningExpanded && (
                                   <div className="mt-2 border-l-2 border-amber-500/30 pl-4 text-sm text-muted-foreground">
                                     <ReactMarkdown>
                                       {message.reasoningSteps}
                                     </ReactMarkdown>
                                   </div>
                                 )}
                               </div>
                             )}
                           </div>
                         </div>
                       )}
                     </div>

                     {message.role === "user" && (
                       <Avatar className="h-8 w-8 mt-1 flex-shrink-0">
                         <AvatarFallback className="bg-primary text-primary-foreground">
                           <span className="text-sm font-medium">You</span>
                         </AvatarFallback>
                       </Avatar>
                     )}
                   </div>
                 </div>
               ))
             )}
             {isLoading && (
               <div className="flex items-center justify-center space-x-2 text-muted-foreground py-4">
                 <Loader2 className="h-5 w-5 animate-spin text-primary" />
                 <span>{reasoningEnabled ? "AI is thinking deeply..." : "AI is thinking..."}</span>
               </div>
             )}
             <div ref={messagesEndRef} />
           </div>
         </div>
       </div>

       <div className="border-t bg-card p-4 md:p-4 sticky bottom-0">
         <div className="w-full max-w-3xl mx-auto">
           <form onSubmit={handleSubmit} className="relative">
             <div className="flex gap-2 items-center">
               <Input
                 ref={inputRef}
                 placeholder="Type your message..."
                 value={input}
                 onChange={(e) => setInput(e.target.value)}
                 className="flex-1 bg-background pr-20 py-6 text-base"
                 disabled={isLoading}
               />
               
               <div className="absolute right-12 top-1/2 transform -translate-y-1/2 flex items-center">
                 {hasReasoningCapability && (
                   <TooltipProvider>
                     <Tooltip>
                       <TooltipTrigger asChild>
                         <Button
                           type="button"
                           variant={reasoningEnabled ? "default" : "ghost"}
                           size="icon"
                           className="h-9 w-9 p-0 mr-1 md:hidden"
                           onClick={() => setReasoningEnabled(!reasoningEnabled)}
                         >
                           <Lightbulb className="h-5 w-5" />
                         </Button>
                       </TooltipTrigger>
                       <TooltipContent>
                         <p>{reasoningEnabled ? "Disable" : "Enable"} reasoning</p>
                       </TooltipContent>
                     </Tooltip>
                   </TooltipProvider>
                 )}
               </div>
               
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
             </div>
             <div className="flex justify-between items-center text-xs text-muted-foreground mt-2">
               <div className="md:hidden">
                 Using: {selectedModelName}
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
     </main>
   </div>
 );
};

export default Chat;

interface AvatarProps {
 className?: string;
 children: React.ReactNode;
}

const Avatar = ({ className, children }: AvatarProps) => {
 return (
   <div className={`flex items-center justify-center overflow-hidden rounded-full ${className || ''}`}>
     {children}
   </div>
 );
};

const AvatarImage = ({ src, alt }: { src: string; alt: string }) => {
 return src ? <img src={src} alt={alt} className="h-full w-full object-cover" /> : null;
};

const AvatarFallback = ({ children, className }: { children: React.ReactNode; className?: string }) => {
 return (
   <div className={`flex h-full w-full items-center justify-center bg-muted text-muted-foreground ${className || ''}`}>
     {children}
   </div>
 );
};