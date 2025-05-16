import { useUser } from "@clerk/clerk-react";
import ReactMarkdown, { Components } from "react-markdown";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatMessageProps {
  message: Message;
}

const ChatMessage = ({ message }: ChatMessageProps) => {
  const { user } = useUser();
  const isUser = message.role === "user";
  const [displayedContent, setDisplayedContent] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!isUser) {
      setIsTyping(true);
      let index = 0;
      const content = message.content;
      
      // Process multiple characters per tick for faster typing
      const charsPerTick = 3; // Process 3 characters at once
      const typingInterval = setInterval(() => {
        if (index < content.length) {
          const nextChars = content.slice(index, index + charsPerTick);
          setDisplayedContent(prev => prev + nextChars);
          index += charsPerTick;
        } else {
          setIsTyping(false);
          clearInterval(typingInterval);
        }
      }, 2); // Reduced from 20ms to 2ms

      return () => clearInterval(typingInterval);
    } else {
      setDisplayedContent(message.content);
    }
  }, [message.content, isUser]);

  const components: Partial<Components> = {
    ul: ({ children }) => (
      <ul className="my-3 ml-2 list-disc space-y-2 pl-4">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="my-3 ml-2 list-decimal space-y-2 pl-4">{children}</ol>
    ),
    li: ({ children }) => (
      <li className="marker:text-primary">{children}</li>
    ),
    code: ({ children, className }) => {
      // Handle triple backtick code blocks
      if (className) {
        const language = className.replace('language-', '');
        return (
          <pre className="my-3 overflow-x-auto rounded-lg bg-muted/50 p-4 border border-border">
            <code className={`language-${language} font-mono text-sm`}>
              {children}
            </code>
          </pre>
        );
      }
      // Handle inline code
      return (
        <code className="rounded bg-muted/50 px-1.5 py-0.5 font-mono text-sm border-border">
          {children}
        </code>
      );
    },
    pre: ({ children }) => (
      <div className="not-prose">
        {children}
      </div>
    ),
    h1: ({ children }) => (
      <h1 className="mt-6 mb-4 text-2xl font-bold first:mt-0 text-foreground/90">{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 className="mt-5 mb-3 text-xl font-semibold first:mt-0 text-foreground/90">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="mt-4 mb-2 text-lg font-medium first:mt-0 text-foreground/90">{children}</h3>
    ),
    p: ({ children }) => (
      <p className="mb-3 leading-7 [&:not(:first-child)]:mt-3">{children}</p>
    ),
    blockquote: ({ children }) => (
      <blockquote className="mt-3 mb-3 border-l-2 border-primary/50 bg-muted/30 pl-4 py-2 italic">
        {children}
      </blockquote>
    ),
    a: ({ children, href }) => (
      <a href={href} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    ),
    img: ({ src, alt }) => (
      <img src={src} alt={alt} className="rounded-lg my-4 border border-border" />
    ),
    table: ({ children }) => (
      <div className="my-4 overflow-x-auto rounded-lg border border-border">
        <table className="w-full border-collapse text-sm">
          {children}
        </table>
      </div>
    ),
    th: ({ children }) => (
      <th className="border-b border-border bg-muted px-4 py-2 text-left font-medium">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="border-b border-border px-4 py-2">
        {children}
      </td>
    ),
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      <div className={cn(
        "flex items-start gap-3 mb-4 animate-fade-in",
        isUser ? "justify-end" : "justify-start"
      )}>
        {!isUser && (
          <Avatar className="h-8 w-8 mt-1 flex-shrink-0">
            <AvatarImage src="/masked-icon.svg" alt="AI" />
            <AvatarFallback>AI</AvatarFallback>
          </Avatar>
        )}
        
        <div className={cn(
          "rounded-lg px-4 py-3 max-w-[85%] shadow-message relative",
          isUser 
            ? "bg-primary text-primary-foreground" 
            : "bg-card border border-border"
        )}>
          {isUser ? (
            <p className="whitespace-pre-wrap break-words">{displayedContent}</p>
          ) : (
            <div className="prose dark:prose-invert prose-sm max-w-none">
              <div className="[&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                <ReactMarkdown components={components}>
                  {displayedContent}
                </ReactMarkdown>
              </div>
              {isTyping && (
                <div className="h-4 w-4 mt-1">
                  <div className="typing-cursor" />
                </div>
              )}
            </div>
          )}
        </div>

        {isUser && (
          <Avatar className="h-8 w-8 mt-1 flex-shrink-0">
            <AvatarImage src={user?.imageUrl} alt={user?.fullName || "User"} />
            <AvatarFallback>{user?.firstName?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
