import { useState, useEffect } from "react";
import { Lightbulb } from "lucide-react";

interface ReasoningVisualizerProps {
  isActive: boolean;
  className?: string;
}

export function ReasoningVisualizer({ isActive, className = "" }: ReasoningVisualizerProps) {
  const [dots, setDots] = useState<string>(".");
  const [step, setStep] = useState<number>(0);
  const steps = ["Analyzing", "Reasoning", "Connecting", "Synthesizing"];

  useEffect(() => {
    if (!isActive) return;
    
    const dotInterval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? "." : prev + ".");
    }, 400);
    
    const stepInterval = setInterval(() => {
      setStep(prev => (prev + 1) % steps.length);
    }, 2000);
    
    return () => {
      clearInterval(dotInterval);
      clearInterval(stepInterval);
    };
  }, [isActive, steps.length]);

  if (!isActive) return null;

  return (
    <div className={`flex items-center gap-2 text-amber-500 animate-pulse ${className}`}>
      <Lightbulb className="h-5 w-5" />
      <div className="flex gap-1">
        <span className="font-medium">{steps[step]}</span>
        <span className="w-6">{dots}</span>
      </div>
    </div>
  );
} 