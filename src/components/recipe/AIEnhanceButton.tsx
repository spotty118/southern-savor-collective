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
    if (!content.length) return;
    
    setIsEnhancing(true);
    const enhancedContent = [...content];
    
    try {
      // Sequentially enhance each item
      for (let i = 0; i < content.length; i++) {
        setCurrentIndex(i);
        const item = content[i];
        
        if (!item.trim()) continue;

        const { data, error } = await supabase.functions.invoke('enhance-recipe', {
          body: { 
            content: item, 
            type,
            singleInstruction: true
          }
        });

        if (error) throw error;

        if (data?.enhancedContent) {
          enhancedContent[i] = data.enhancedContent;
          // Update content as we go
          onEnhanced(enhancedContent);
        }
      }

      toast({
        title: "Success!",
        description: type === "instructions" 
          ? "All instructions enhanced with Southern charm"
          : "Description enhanced with Southern charm",
      });
    } catch (error) {
      console.error('Error enhancing content:', error);
      toast({
        title: "Error",
        description: "Failed to enhance content. Please try again.",
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
        ? `Enhancing ${type === "instructions" ? `step ${currentIndex + 1} of ${content.length}` : "description"}...` 
        : `Add Southern Charm${type === "instructions" ? " to All Steps" : ""}`}
    </Button>
  );
};