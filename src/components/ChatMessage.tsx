
import React from "react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import { Lightbulb } from "lucide-react";
import { Button } from "./ui/button";

interface ChatMessageProps {
  message: {
    id: string;
    role: "user" | "assistant" | "system";
    content: string;
    reasoning?: boolean;
    reasoningSteps?: string;
    isReasoningExpanded?: boolean;
  };
  onToggleReasoning?: (id: string) => void;
}

export default function ChatMessage({ message, onToggleReasoning }: ChatMessageProps) {
  const isUser = message.role === "user";
  
  return (
    <div className="w-full max-w-3xl mx-auto mb-6">
      <div className={cn(
        "flex items-start gap-4",
        isUser ? "justify-end" : "justify-start"
      )}>
        {/* User or AI avatar */}
        {!isUser && (
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-medium">AI</span>
          </div>
        )}
        
        {/* Message content */}
        <div className={cn(
          "rounded-lg px-4 py-3 max-w-[85%] shadow-sm",
          isUser 
            ? "bg-primary text-primary-foreground" 
            : "bg-card border border-border"
        )}>
          {isUser ? (
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          ) : (
            <div className="prose dark:prose-invert prose-sm max-w-none">
              <ReactMarkdown className="text-foreground" components={{
                pre: ({ node, ...props }) => (
                  <pre className="bg-muted/50 p-4 rounded-md overflow-x-auto border border-border my-2" {...props} />
                ),
                code: ({ node, inline, className, children, ...props }) => {
                  if (inline) {
                    return <code className="bg-muted/50 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>{children}</code>
                  }
                  return (
                    <code className={cn("font-mono text-sm", className)} {...props}>
                      {children}
                    </code>
                  )
                },
                ul: ({ children }) => <ul className="list-disc pl-6 space-y-1 my-2">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-6 space-y-1 my-2">{children}</ol>,
                li: ({ children }) => <li className="pl-1">{children}</li>,
                p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
                a: ({ children, href }) => (
                  <a href={href} className="text-primary hover:underline" target="_blank" rel="noreferrer">
                    {children}
                  </a>
                ),
                h1: ({ children }) => <h1 className="text-xl font-bold my-3">{children}</h1>,
                h2: ({ children }) => <h2 className="text-lg font-bold my-2.5">{children}</h2>,
                h3: ({ children }) => <h3 className="text-base font-bold my-2">{children}</h3>,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-primary/30 pl-3 italic my-3">{children}</blockquote>
                )
              }}>
                {message.content}
              </ReactMarkdown>
              
              {/* Reasoning section */}
              {message.reasoningSteps && (
                <div className="mt-4 pt-3 border-t border-border">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center text-amber-500">
                      <Lightbulb className="h-4 w-4 mr-1.5" />
                      <span className="text-sm font-medium">Reasoning process</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onToggleReasoning?.(message.id)}
                      className="h-7 text-xs px-2"
                    >
                      {message.isReasoningExpanded ? "Hide" : "Show"}
                    </Button>
                  </div>
                  
                  {message.isReasoningExpanded && (
                    <div className="border-l-2 border-amber-500/30 pl-3 text-sm text-muted-foreground">
                      <ReactMarkdown components={{
                        pre: ({ node, ...props }) => (
                          <pre className="bg-muted/50 p-2 rounded-md overflow-x-auto text-xs border border-border my-2" {...props} />
                        ),
                        code: ({ node, inline, className, children, ...props }) => {
                          if (inline) {
                            return <code className="bg-muted/50 px-1 py-0.5 rounded text-xs font-mono" {...props}>{children}</code>
                          }
                          return (
                            <code className={cn("font-mono text-xs", className)} {...props}>
                              {children}
                            </code>
                          )
                        },
                        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                      }}>
                        {message.reasoningSteps}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* User avatar */}
        {isUser && (
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-medium text-primary-foreground">You</span>
          </div>
        )}
      </div>
    </div>
  );
}
