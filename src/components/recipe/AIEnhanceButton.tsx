import { useState } from "react";
import { Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { recipeAPI, type Ingredient } from "@/lib/api/recipe";
import { z } from "zod";

interface AIEnhanceButtonProps {
  content: string[];
  type: "instructions" | "description";
  onEnhanced: (enhancedContent: string[]) => void;
  disabled?: boolean;
  ingredients?: Ingredient[];
}

const contentSchema = z.array(z.string().min(1, "Content items cannot be empty"));

export const AIEnhanceButton = ({
  content,
  type,
  onEnhanced,
  disabled,
  ingredients
}: AIEnhanceButtonProps) => {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const validateContent = (content: unknown): string[] => {
    try {
      return contentSchema.parse(content);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Invalid content format: ${error.errors.map(e => e.message).join(', ')}`);
      }
      throw error;
    }
  };

  const enhanceContent = async () => {
    if (!content?.length) return;

    try {
      setIsEnhancing(true);
      setProgress({ current: 0, total: content.length });

      // Validate inputs
      const validatedContent = validateContent(content);
      if (ingredients) {
        await recipeAPI.validateIngredients(ingredients);
      }

      // Process enhancement
      const enhancedContent = await recipeAPI.enhanceRecipeWithRateLimit(
        validatedContent,
        ingredients
      );

      // Update content as we go to show progress
      onEnhanced(enhancedContent);

      toast({
        title: "Success!",
        description: type === "instructions"
          ? "All instructions enhanced with Southern charm"
          : "Description enhanced with Southern charm",
      });
    } catch (error) {
      console.error('Error enhancing content:', error);
      
      // Handle specific error types
      if (error instanceof Error) {
        let errorMessage = error.message;
        
        // Parse rate limit error
        if (error.message.includes('Rate limit')) {
          errorMessage = "You've reached the enhancement limit. Please try again in a minute.";
        }
        // Parse validation errors
        else if (error.message.includes('Invalid')) {
          errorMessage = "Please check your recipe content and try again.";
        }
        
        toast({
          title: "Enhancement Failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setIsEnhancing(false);
      setProgress({ current: 0, total: 0 });
    }
  };

  // Ensure content is valid before enabling the button
  const isContentValid = Array.isArray(content) && content.length > 0;

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={enhanceContent}
      disabled={disabled || isEnhancing || !isContentValid}
      className="gap-2"
      aria-busy={isEnhancing}
    >
      <Wand2 className="h-4 w-4" />
      {isEnhancing
        ? progress.total > 0 
          ? `Enhancing ${type === "instructions" ? `step ${progress.current + 1} of ${progress.total}` : "description"}...`
          : `Enhancing ${type}...`
        : `Add Southern Charm${type === "instructions" ? " to All Steps" : ""}`}
    </Button>
  );
};