import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Trash, Clock, Calendar, Search, Bot, SortAsc, SortDesc } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

interface Conversation {
  id: string;
  title: string;
  messages: any[];
  model: string;
  updatedAt?: number;
}

interface SavedConversationsProps {
  onSelectConversation: (conversation: Conversation) => void;
  currentConversationId: string;
}

export function SavedConversations({ 
  onSelectConversation, 
  currentConversationId 
}: SavedConversationsProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    loadConversations();
  }, [isOpen]);

  const loadConversations = () => {
    const savedConversations: Conversation[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("conversation_")) {
        try {
          const conversationData = localStorage.getItem(key);
          if (conversationData) {
            const conversation = JSON.parse(conversationData);
            if (conversation.id && conversation.messages) {
              // Add a timestamp if not present
              if (!conversation.updatedAt) {
                conversation.updatedAt = Date.now();
              }
              savedConversations.push(conversation);
            }
          }
        } catch (e) {
          console.error("Error parsing saved conversation:", e);
        }
      }
    }
    
    // Apply sorting
    savedConversations.sort((a, b) => {
      const aTime = a.updatedAt || 0;
      const bTime = b.updatedAt || 0;
      return sortDirection === 'desc' ? bTime - aTime : aTime - bTime;
    });
    
    setConversations(savedConversations);
  };

  const deleteConversation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (window.confirm("Are you sure you want to delete this conversation?")) {
      localStorage.removeItem(`conversation_${id}`);
      setConversations(conversations.filter(c => c.id !== id));
    }
  };

  const handleSelect = (conversation: Conversation) => {
    onSelectConversation(conversation);
    setIsOpen(false);
  };

  // Format date from timestamp
  const formatDate = (timestamp?: number) => {
    if (!timestamp) return "Unknown date";
    return new Date(timestamp).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Format time from timestamp
  const formatTime = (timestamp?: number) => {
    if (!timestamp) return "";
    return new Date(timestamp).toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter conversations based on search query
  const filteredConversations = conversations.filter(conv => 
    conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.messages.some(msg => 
      msg.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  // Group conversations by date
  const groupedConversations = filteredConversations.reduce((groups, conversation) => {
    if (!conversation.updatedAt) return groups;
    
    const date = new Date(conversation.updatedAt).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(conversation);
    return groups;
  }, {} as Record<string, Conversation[]>);

  const sortedDates = Object.keys(groupedConversations).sort((a, b) => {
    return sortDirection === 'desc' 
      ? new Date(b).getTime() - new Date(a).getTime()
      : new Date(a).getTime() - new Date(b).getTime();
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1" data-history-trigger>
          <MessageSquare className="h-4 w-4" />
          <span>History</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            <span>Conversation History</span>
          </DialogTitle>
          <DialogDescription>
            Your saved conversations. Click on one to load it.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex items-center gap-2 mt-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search conversations..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc')}
            title={sortDirection === 'desc' ? 'Newest first' : 'Oldest first'}
          >
            {sortDirection === 'desc' ? <SortDesc className="h-4 w-4" /> : <SortAsc className="h-4 w-4" />}
          </Button>
        </div>
        
        <ScrollArea className="h-[50vh] mt-2 rounded-md border p-2">
          {filteredConversations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? "No matching conversations found" : "No saved conversations found"}
            </div>
          ) : (
            <div className="space-y-4">
              {sortedDates.map(date => (
                <div key={date} className="space-y-2">
                  <div className="flex items-center gap-2 sticky top-0 bg-card z-10 py-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-medium text-muted-foreground">{date}</h3>
                    <div className="grow h-px bg-border"></div>
                  </div>
                  
                  {groupedConversations[date].map((conversation) => (
                    <div 
                      key={conversation.id} 
                      className={`p-3 rounded-md cursor-pointer relative hover:bg-accent group ${
                        conversation.id === currentConversationId ? "bg-primary/10 hover:bg-primary/20 border-primary/20 border" : "bg-card border-border border"
                      }`}
                      onClick={() => handleSelect(conversation)}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <div className="font-medium truncate pr-8 flex items-center gap-1">
                          <Bot className="h-3.5 w-3.5 text-primary/70 flex-shrink-0" />
                          <span className="truncate">{conversation.title || "Unnamed conversation"}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 absolute top-2 right-2"
                          onClick={(e) => deleteConversation(conversation.id, e)}
                        >
                          <Trash className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                      <div className="text-xs text-muted-foreground flex justify-between">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatTime(conversation.updatedAt)}</span>
                        </div>
                        <div className="flex gap-2 items-center">
                          <span className="text-xs text-muted-foreground">
                            {conversation.messages.length} messages
                          </span>
                          <Badge variant="outline" className="text-[10px] h-4 px-1 bg-accent/50">
                            {conversation.model.split('/')[0]}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        
        <DialogFooter className="flex justify-between items-center">
          <div className="text-xs text-muted-foreground">
            {filteredConversations.length} conversation{filteredConversations.length !== 1 ? 's' : ''}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              if (window.confirm("Are you sure you want to clear all conversation history? This cannot be undone.")) {
                // Keep only the current conversation (if there is one)
                Object.keys(localStorage).forEach(key => {
                  if (key.startsWith('conversation_') && key !== `conversation_${currentConversationId}`) {
                    localStorage.removeItem(key);
                  }
                });
                loadConversations();
              }
            }}
            disabled={filteredConversations.length === 0}
            className="flex items-center gap-1"
          >
            <Trash className="h-4 w-4" />
            <span>Clear All</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 