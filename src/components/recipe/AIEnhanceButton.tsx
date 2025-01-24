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

  const cleanEnhancedContent = (content: string): string => {
    return content
      .replace(/^Enhanced Version:?\s*/i, '')  // Remove "Enhanced Version:" prefix
      .replace(/^"(.+)"$/, '$1')              // Remove surrounding quotes
      .replace(/^\d+\.\s*/, '')               // Remove leading numbers
      .trim();
  };

  const enhanceContent = async () => {
    if (!content?.length) return;
    
    setIsEnhancing(true);
    const enhancedContent = [...content];
    let hasError = false;
    
    try {
      console.log('Starting enhancement process for:', type);
      // Sequentially enhance each item
      for (let i = 0; i < content.length; i++) {
        setCurrentIndex(i);
        const item = content[i];
        
        if (!item?.trim()) {
          console.log(`Skipping empty ${type} item ${i + 1}`);
          continue;
        }

        console.log(`Enhancing ${type} item ${i + 1}/${content.length}`);
        const { data, error } = await supabase.functions.invoke('enhance-recipe', {
          body: { 
            content: item, 
            type,
            singleInstruction: true
          }
        });

        if (error) {
          console.error(`Error enhancing ${type} item ${i + 1}:`, error);
          hasError = true;
          throw error;
        }

        if (data?.enhancedContent) {
          console.log(`Successfully enhanced ${type} item ${i + 1}:`, data.enhancedContent);
          // Ensure we're getting a string, not an array, and clean it up
          const enhancedText = Array.isArray(data.enhancedContent) 
            ? cleanEnhancedContent(data.enhancedContent[0])
            : cleanEnhancedContent(data.enhancedContent);
            
          enhancedContent[i] = enhancedText;
          // Update content as we go to show progress
          onEnhanced([...enhancedContent]);
        } else {
          console.error(`No enhanced content received for ${type} item ${i + 1}`);
          hasError = true;
        }
      }

      if (!hasError) {
        toast({
          title: "Success!",
          description: type === "instructions" 
            ? "All instructions enhanced with Southern charm"
            : "Description enhanced with Southern charm",
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
      setCurrentIndex(0);
    }
  };

  // Ensure content is valid before enabling the button
  const isContentValid = Array.isArray(content) && content.every(item => 
    typeof item === 'string' && item !== null
  );

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={enhanceContent}
      disabled={disabled || isEnhancing || !isContentValid}
      className="gap-2"
    >
      <Wand2 className="h-4 w-4" />
      {isEnhancing 
        ? `Enhancing ${type === "instructions" ? `step ${currentIndex + 1} of ${content.length}` : "description"}...` 
        : `Add Southern Charm${type === "instructions" ? " to All Steps" : ""}`}
    </Button>
  );
};