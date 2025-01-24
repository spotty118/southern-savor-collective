import { useState } from "react";
import { Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface AIEnhanceButtonProps {
  content: string;
  type: "instructions" | "description";
  onEnhanced: (enhancedContent: string) => void;
  disabled?: boolean;
  index?: number;
}

export const AIEnhanceButton = ({ 
  content, 
  type, 
  onEnhanced,
  disabled,
  index 
}: AIEnhanceButtonProps) => {
  const [isEnhancing, setIsEnhancing] = useState(false);

  const enhanceContent = async () => {
    setIsEnhancing(true);
    try {
      const { data, error } = await supabase.functions.invoke('enhance-recipe', {
        body: { content, type, singleInstruction: type === "instructions" }
      });

      if (error) throw error;

      if (data?.enhancedContent) {
        onEnhanced(data.enhancedContent);
        toast({
          title: "Success!",
          description: `Recipe ${type === "instructions" ? "step" : type} enhanced with Southern charm`,
        });
      }
    } catch (error) {
      console.error('Error enhancing content:', error);
      toast({
        title: "Error",
        description: "Failed to enhance content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsEnhancing(false);
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
      {isEnhancing ? "Enhancing..." : "Add Southern Charm"}
    </Button>
  );
};