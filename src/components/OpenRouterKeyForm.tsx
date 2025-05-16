
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface OpenRouterKeyFormProps {
  onSave: (key: string) => void;
  defaultKey?: string;
}

const OpenRouterKeyForm = ({ onSave, defaultKey }: OpenRouterKeyFormProps) => {
  const [apiKey, setApiKey] = useState(defaultKey || "");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (defaultKey && defaultKey.trim()) {
      setApiKey(defaultKey.trim());
    }
  }, [defaultKey]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      onSave(apiKey.trim());
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Set API Key</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>OpenRouter API Key</DialogTitle>
            <DialogDescription>
              Enter your OpenRouter API key to use the chat. You can get a free API key from{" "}
              <a 
                href="https://openrouter.ai/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                openrouter.ai
              </a>
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="api-key" className="mb-2 block">
              API Key
            </Label>
            <Input
              id="api-key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk_or_..."
              className="w-full"
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={!apiKey.trim()}>
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default OpenRouterKeyForm;
