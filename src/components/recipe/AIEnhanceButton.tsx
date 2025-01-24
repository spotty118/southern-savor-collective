import { useState } from "react";
import { Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface AIEnhanceButtonProps {
  content: string[];
  type: "instructions" | "description";
  onEnhanced: (enhancedContent: string[]) => void;
  disabled?: boolean;
}

export const AIEnhanceButton = ({ 
  content, 
  type, 
  onEnhanced,
  disabled 
}: AIEnhanceButtonProps) => {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const enhanceContent = async () => {
    if (type !== "instructions" || !content.length) return;
    
    setIsEnhancing(true);
    const enhancedInstructions = [...content];
    
    try {
      // Sequentially enhance each instruction
      for (let i = 0; i < content.length; i++) {
        setCurrentIndex(i);
        const instruction = content[i];
        
        if (!instruction.trim()) continue;

        const { data, error } = await supabase.functions.invoke('enhance-recipe', {
          body: { 
            content: instruction, 
            type,
            singleInstruction: true
          }
        });

        if (error) throw error;

        if (data?.enhancedContent) {
          enhancedInstructions[i] = data.enhancedContent;
          // Update instructions as we go
          onEnhanced(enhancedInstructions);
        }
      }

      toast({
        title: "Success!",
        description: "All instructions enhanced with Southern charm",
      });
    } catch (error) {
      console.error('Error enhancing content:', error);
      toast({
        title: "Error",
        description: "Failed to enhance instructions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsEnhancing(false);
      setCurrentIndex(0);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={enhanceContent}
      disabled={disabled || isEnhancing}
      className="gap-2"
    >
      <Wand2 className="h-4 w-4" />
      {isEnhancing 
        ? `Enhancing step ${currentIndex + 1} of ${content.length}...` 
        : "Add Southern Charm to All Steps"}
    </Button>
  );
};