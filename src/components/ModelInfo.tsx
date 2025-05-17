import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Info, Lightbulb, Zap, Brain, Radio } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ModelInfoProps {
  model: {
    name: string;
    id: string;
    context: number;
    capabilities?: {
      reasoning?: boolean;
      streaming?: boolean;
    };
  };
}

export function ModelInfo({ model }: ModelInfoProps) {
  const formatContextWindow = (tokens: number) => {
    if (tokens >= 100000) {
      return `${Math.round(tokens / 1000)}K tokens`;
    }
    return `${tokens.toLocaleString()} tokens`;
  };

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <div className="flex items-center gap-1 cursor-help">
          <Info className="h-4 w-4 text-muted-foreground" />
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Model Information</h4>
          <div className="text-xs">
            <div className="font-semibold">{model.name}</div>
            <div className="text-muted-foreground mt-1">{model.id}</div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-card rounded-md p-2 text-xs border">
              <div className="flex items-center gap-1 text-muted-foreground mb-1">
                <Brain className="h-3 w-3" />
                <span>Context Window</span>
              </div>
              <div className="font-medium">{formatContextWindow(model.context)}</div>
            </div>

            <div className="bg-card rounded-md p-2 text-xs border">
              <div className="flex items-center gap-1 text-muted-foreground mb-1">
                <Radio className="h-3 w-3" />
                <span>Streaming</span>
              </div>
              <div className="font-medium">
                {model.capabilities?.streaming ? "Supported" : "Not supported"}
              </div>
            </div>
          </div>
          
          <div className="flex gap-1 flex-wrap mt-2">
            {model.capabilities?.reasoning && (
              <Badge variant="outline" className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/30">
                <Lightbulb className="h-3 w-3 text-amber-500" />
                <span className="text-amber-700 dark:text-amber-400">Step-by-step reasoning</span>
              </Badge>
            )}
            {model.capabilities?.streaming && (
              <Badge variant="outline" className="flex items-center gap-1 bg-blue-50 dark:bg-blue-950/30">
                <Zap className="h-3 w-3 text-blue-500" />
                <span className="text-blue-700 dark:text-blue-400">Fast streaming</span>
              </Badge>
            )}
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
} 