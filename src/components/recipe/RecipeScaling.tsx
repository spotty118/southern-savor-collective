import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Ingredient {
  amount: string;
  unit: string;
  item: string;
}

interface RecipeScalingProps {
  recipeId: string;
  defaultServings: number;
  ingredients: Ingredient[];
  instructions: string[];
  currentUserId?: string | null;
  onIngredientsScale: (scaledIngredients: Ingredient[]) => void;
  onInstructionsScale: (scaledInstructions: string[]) => void;
}

export const RecipeScaling = ({
  recipeId,
  defaultServings,
  ingredients,
  instructions,
  currentUserId,
  onIngredientsScale,
  onInstructionsScale,
}: RecipeScalingProps) => {
  const [servings, setServings] = useState(defaultServings);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchUserPreference = async () => {
      if (!currentUserId) return;

      try {
        const { data, error } = await supabase
          .from("recipe_scaling_preferences")
          .select("servings")
          .eq("recipe_id", recipeId)
          .eq("user_id", currentUserId)
          .single();

        if (error) throw error;
        if (data) {
          setServings(data.servings);
          // Temporarily pass original values without scaling
          onIngredientsScale(ingredients);
          onInstructionsScale(instructions);
        }
      } catch (error) {
        console.error("Error fetching scaling preference:", error);
      }
    };

    fetchUserPreference();
  }, [currentUserId, recipeId, defaultServings]);

  const handleServingsChange = async (newServings: number) => {
    if (newServings < 1) return;
    setServings(newServings);
    
    // Temporarily disabled scaling - just pass original values
    onIngredientsScale(ingredients);
    onInstructionsScale(instructions);

    if (!currentUserId) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("recipe_scaling_preferences")
        .upsert({
          recipe_id: recipeId,
          user_id: currentUserId,
          servings: newServings
        }, {
          onConflict: 'recipe_id,user_id'
        });

      if (error) throw error;
    } catch (error) {
      console.error("Error saving scaling preference:", error);
      toast({
        title: "Error",
        description: "Failed to save your serving preference",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={() => handleServingsChange(servings - 1)}
        disabled={servings <= 1 || isLoading}
      >
        <Minus className="h-4 w-4" />
      </Button>
      
      <div className="flex items-center gap-2">
        <Input
          type="number"
          value={servings}
          onChange={(e) => handleServingsChange(parseInt(e.target.value) || defaultServings)}
          className="w-20 text-center"
          min="1"
        />
        <span className="text-sm text-gray-600">servings</span>
      </div>

      <Button
        variant="outline"
        size="icon"
        onClick={() => handleServingsChange(servings + 1)}
        disabled={isLoading}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
};