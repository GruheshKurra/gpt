
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown, ChevronUp, Search, Brain, Code } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export interface Model {
  name: string;
  id: string;
  context: number;
  category?: string;
  capabilities?: {
    code?: boolean;
    reasoning?: boolean;
    vision?: boolean;
  };
}

interface ModelSelectorProps {
  models: Model[];
  selectedModel: string;
  onModelSelect: (modelId: string) => void;
  className?: string;
}

// Extract model size (e.g., "70B" from "Llama 3 70B")
const getModelSize = (name: string): number => {
  const match = name.match(/(\d+)B/);
  return match ? parseInt(match[1]) : 0;
};

// Group models by category for organization
const categorizeModels = (models: Model[]) => {
  const categorized: Record<string, Model[]> = {
    "Popular": [],
    "Small": [],
    "Medium": [],
    "Large": [],
    "Reasoning": [],
    "Code": [],
    "Vision": [],
    "Other": []
  };
  
  models.forEach(model => {
    if (model.capabilities?.reasoning) {
      categorized["Reasoning"].push(model);
    } else if (model.capabilities?.code) {
      categorized["Code"].push(model);
    } else if (model.capabilities?.vision) {
      categorized["Vision"].push(model);
    } else if (model.category === "Popular") {
      categorized["Popular"].push(model);
    } else if (getModelSize(model.name) >= 70) {
      categorized["Large"].push(model);
    } else if (getModelSize(model.name) >= 20) {
      categorized["Medium"].push(model);
    } else if (getModelSize(model.name) > 0) {
      categorized["Small"].push(model);
    } else {
      categorized["Other"].push(model);
    }
  });
  
  // Remove empty categories
  return Object.fromEntries(
    Object.entries(categorized).filter(([_, models]) => models.length > 0)
  );
};

export function ModelSelector({ models, selectedModel, onModelSelect, className }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    "Popular": true,
    "Small": false,
    "Medium": false,
    "Large": false,
    "Reasoning": true,
    "Code": true,
    "Vision": false,
    "Other": false,
  });
  
  const selectedModelData = models.find(m => m.id === selectedModel);
  const categorizedModels = categorizeModels(models);
  
  const filteredModels = searchTerm.trim()
    ? models.filter(model => 
        model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        model.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        model.category?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : models;
  
  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className={cn("justify-between", className)}>
          <span className="flex items-center gap-2 truncate">
            {selectedModelData?.capabilities?.reasoning && (
              <Brain className="h-3.5 w-3.5 text-amber-500" />
            )}
            {selectedModelData?.capabilities?.code && (
              <Code className="h-3.5 w-3.5 text-green-500" />
            )}
            <span className="truncate">{selectedModelData?.name || "Select model"}</span>
          </span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select AI Model</DialogTitle>
        </DialogHeader>
        
        {/* Search input */}
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search models..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-9"
          />
        </div>

        <Tabs defaultValue="categories">
          <TabsList className="grid grid-cols-2 mb-2">
            <TabsTrigger value="categories">By Category</TabsTrigger>
            <TabsTrigger value="all">All Models</TabsTrigger>
          </TabsList>
          
          <TabsContent value="categories" className="space-y-2">
            <ScrollArea className="h-[350px] pr-3">
              {Object.entries(categorizedModels).map(([category, categoryModels]) => (
                <Collapsible 
                  key={category}
                  open={expandedCategories[category]} 
                  onOpenChange={() => toggleCategory(category)}
                  className="mb-2"
                >
                  <CollapsibleTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="w-full flex justify-between items-center p-2 h-auto"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{category}</span>
                        <Badge variant="outline" className="ml-1">
                          {categoryModels.length}
                        </Badge>
                      </div>
                      {expandedCategories[category] ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-1 space-y-1">
                    {categoryModels.map((model) => (
                      <Button 
                        key={model.id} 
                        variant="ghost"
                        className={cn(
                          "w-full justify-start px-2 py-1.5 h-auto text-left font-normal",
                          model.id === selectedModel && "bg-primary/5"
                        )}
                        onClick={() => {
                          onModelSelect(model.id);
                          setIsOpen(false);
                        }}
                      >
                        <div className="flex justify-between w-full items-start">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1.5">
                              <span className="font-medium">{model.name}</span>
                              {model.capabilities?.reasoning && (
                                <Brain className="h-3.5 w-3.5 text-amber-500" />
                              )}
                              {model.capabilities?.code && (
                                <Code className="h-3.5 w-3.5 text-green-500" />
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {Math.round(model.context/1000)}k ctx
                            </span>
                          </div>
                          {model.id === selectedModel && (
                            <Check className="h-4 w-4" />
                          )}
                        </div>
                      </Button>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="all">
            <ScrollArea className="h-[350px]">
              <div className="space-y-1">
                {filteredModels.map((model) => (
                  <Button 
                    key={model.id} 
                    variant="ghost"
                    className={cn(
                      "w-full justify-start px-2 py-1.5 h-auto text-left font-normal",
                      model.id === selectedModel && "bg-primary/5"
                    )}
                    onClick={() => {
                      onModelSelect(model.id);
                      setIsOpen(false);
                    }}
                  >
                    <div className="flex justify-between w-full items-start">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium">{model.name}</span>
                          {model.capabilities?.reasoning && (
                            <Brain className="h-3.5 w-3.5 text-amber-500" />
                          )}
                          {model.capabilities?.code && (
                            <Code className="h-3.5 w-3.5 text-green-500" />
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {Math.round(model.context/1000)}k ctx
                        </span>
                      </div>
                      {model.id === selectedModel && (
                        <Check className="h-4 w-4" />
                      )}
                    </div>
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
