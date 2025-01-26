import { useState, useEffect } from "react";
import { Recipe, RecipeId, RecipeError, RecipeErrorCode } from "@/types/recipe";
import { recipeService } from "@/services/RecipeService";
import { toast } from "@/hooks/use-toast";

interface RecipeState {
  recipe: Recipe | null;
  loading: boolean;
  error: RecipeError | null;
}

export const useRecipeData = (id: string | undefined) => {
  const [state, setState] = useState<RecipeState>({
    recipe: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    if (!id) {
      setState({
        recipe: null,
        loading: false,
        error: null
      });
      return;
    }

    const fetchRecipe = async () => {
      setState(prev => ({
        ...prev,
        loading: true,
        error: null
      }));

      try {
        const recipe = await recipeService.getRecipe(id as RecipeId);
        setState({
          recipe,
          loading: false,
          error: null
        });
      } catch (error) {
        console.error("Error in fetchRecipe:", error);
        
        const recipeError = error instanceof RecipeError
          ? error
          : new RecipeError(
              'An unexpected error occurred',
              RecipeErrorCode.SERVER_ERROR,
              { originalError: error }
            );

        setState({
          recipe: null,
          loading: false,
          error: recipeError
        });

        toast({
          title: "Error",
          description: recipeError.message,
          variant: "destructive",
        });
      }
    };

    fetchRecipe();

    // Cleanup function to abort any pending requests
    return () => {
      recipeService.invalidateCache(id as RecipeId);
    };
  }, [id]);

  const updateRecipe = async (recipe: Recipe) => {
    setState(prev => ({
      ...prev,
      recipe
    }));
  };

  return {
    ...state,
    setRecipe: updateRecipe
  };
};