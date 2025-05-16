import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface Model {
  name: string;
  id: string;
  context: number;
}

interface ModelSelectorProps {
  models: Model[];
  selectedModel: string;
  onModelSelect: (modelId: string) => void;
}

type ModelCategory = {
  name: string;
  models: Model[];
  description: string;
};

const categorizeModels = (models: Model[]): Record<string, ModelCategory[]> => {
  // Helper function to get model size in billions
  const getModelSize = (name: string): number => {
    const match = name.match(/(\d+)B/);
    return match ? parseInt(match[1]) : 0;
  };

  const categories: Record<string, ModelCategory[]> = {
    "Popular Models": [
      {
        name: "Large Language Models",
        models: models.filter(m => 
          m.name.toLowerCase().includes("llama") || 
          m.name.toLowerCase().includes("mistral") ||
          m.name.toLowerCase().includes("gemini")
        ).sort((a, b) => getModelSize(b.name) - getModelSize(a.name)),
        description: "Industry-leading large language models"
      },
      {
        name: "Specialized Models",
        models: models.filter(m => 
          m.name.toLowerCase().includes("coder") || 
          m.name.toLowerCase().includes("prover") ||
          m.name.toLowerCase().includes("reasoning")
        ),
        description: "Models optimized for specific tasks"
      }
    ],
    "By Size": [
      {
        name: "Very Large (70B+)",
        models: models.filter(m => getModelSize(m.name) >= 70)
          .sort((a, b) => getModelSize(b.name) - getModelSize(a.name)),
        description: "Most capable but slower models"
      },
      {
        name: "Large (20B-69B)",
        models: models.filter(m => {
          const size = getModelSize(m.name);
          return size >= 20 && size < 70;
        }).sort((a, b) => getModelSize(b.name) - getModelSize(a.name)),
        description: "Good balance of capability and speed"
      },
      {
        name: "Medium (7B-19B)",
        models: models.filter(m => {
          const size = getModelSize(m.name);
          return size >= 7 && size < 20;
        }).sort((a, b) => getModelSize(b.name) - getModelSize(a.name)),
        description: "Fast with good performance"
      },
      {
        name: "Small (1B-6B)",
        models: models.filter(m => {
          const size = getModelSize(m.name);
          return size >= 1 && size < 7;
        }).sort((a, b) => getModelSize(b.name) - getModelSize(a.name)),
        description: "Very fast, suitable for simple tasks"
      }
    ],
    "By Type": [
      {
        name: "Vision Models",
        models: models.filter(m => 
          m.name.toLowerCase().includes("vl") || 
          m.name.toLowerCase().includes("vision")
        ),
        description: "Models that can understand images"
      },
      {
        name: "Reasoning Models",
        models: models.filter(m => 
          m.name.toLowerCase().includes("reasoning") ||
          m.name.toLowerCase().includes("prover") ||
          m.name.toLowerCase().includes("deepseek")
        ),
        description: "Models optimized for logical reasoning"
      },
      {
        name: "Coding Models",
        models: models.filter(m => 
          m.name.toLowerCase().includes("coder") ||
          m.name.toLowerCase().includes("code") ||
          m.name.toLowerCase().includes("deepcoder")
        ),
        description: "Models specialized in programming tasks"
      }
    ]
  };

  // Remove empty categories
  Object.keys(categories).forEach(key => {
    categories[key] = categories[key].filter(category => category.models.length > 0);
    if (categories[key].length === 0) {
      delete categories[key];
    }
  });

  return categories;
};

export const ModelSelector = ({ models, selectedModel, onModelSelect }: ModelSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const categories = categorizeModels(models);
  const selectedModelName = models.find(m => m.id === selectedModel)?.name || "Select Model";

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-[200px] justify-start">
          <span className="truncate">{selectedModelName}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Select AI Model</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="Popular Models" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            {Object.keys(categories).map((category) => (
              <TabsTrigger key={category} value={category}>
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
          {Object.entries(categories).map(([tabKey, categoryGroups]) => (
            <TabsContent key={tabKey} value={tabKey}>
              <ScrollArea className="h-[400px] pr-4">
                {categoryGroups.map((category) => (
                  <div key={category.name} className="mb-6">
                    <div className="mb-2">
                      <h3 className="text-sm font-semibold">{category.name}</h3>
                      <p className="text-xs text-muted-foreground">{category.description}</p>
                    </div>
                    <div className="space-y-2">
                      {category.models.map((model) => (
                        <Button
                          key={model.id}
                          variant="ghost"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            model.id === selectedModel && "bg-primary/10"
                          )}
                          onClick={() => {
                            onModelSelect(model.id);
                            setIsOpen(false);
                          }}
                        >
                          <div className="flex flex-col items-start">
                            <span className="font-medium">{model.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {model.id.split('/')[0]}
                            </span>
                          </div>
                          {model.id === selectedModel && (
                            <Badge variant="secondary" className="ml-auto">
                              Selected
                            </Badge>
                          )}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}; 