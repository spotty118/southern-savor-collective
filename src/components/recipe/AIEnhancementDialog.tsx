import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface AIEnhancementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  enhancedContent?: string;
  onApplyChanges: () => Promise<void>;
}

export const AIEnhancementDialog = ({
  open,
  onOpenChange,
  enhancedContent,
  onApplyChanges,
}: AIEnhancementDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="vintage-paper">
        <DialogHeader>
          <DialogTitle className="font-display">AI Enhanced Version</DialogTitle>
          <DialogDescription>
            Here's an AI-enhanced version of your recipe content. Would you like to
            apply these changes?
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          <div className="p-4 bg-white/50 rounded-lg">
            <h3 className="font-display font-medium mb-2">Enhanced Content:</h3>
            <p className="text-gray-700">{enhancedContent}</p>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="hover:bg-[hsl(var(--vintage-cream))] hover:text-accent-foreground"
            >
              Keep Original
            </Button>
            <Button onClick={onApplyChanges}>Apply Changes</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};