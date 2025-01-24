import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Tables } from "@/integrations/supabase/types";

interface Ingredient {
  amount: string;
  unit: string;
  item: string;
}

interface RecipeData extends Omit<Tables<"recipes">, "ingredients" | "instructions"> {
  ingredients: Ingredient[];
  instructions: string[];
  author?: {
    username: string | null;
  };
  categories?: Tables<"categories">[];
}

export const useRecipeData = (id: string | undefined) => {
  const [recipe, setRecipe] = useState<RecipeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const { data, error } = await supabase
          .from("recipes")
          .select(`
            *,
            author:profiles(username),
            categories:recipe_categories(categories(*))
          `)
          .eq("id", id)
          .single();

        if (error) throw error;

        const ingredients = Array.isArray(data.ingredients) 
          ? data.ingredients.map(ingredient => {
              if (typeof ingredient === 'object' && ingredient !== null) {
                const typedIngredient = ingredient as Record<string, unknown>;
                return {
                  amount: String(typedIngredient.amount || ''),
                  unit: String(typedIngredient.unit || ''),
                  item: String(typedIngredient.item || '')
                };
              }
              return { amount: '', unit: '', item: '' };
            })
          : [];

        const formattedData: RecipeData = {
          ...data,
          ingredients,
          instructions: Array.isArray(data.instructions) 
            ? data.instructions.filter((item): item is string => typeof item === 'string')
            : [],
          cook_time: data.cook_time?.toString() || '',
          default_servings: data.default_servings || 4,
          author: data.author as { username: string | null },
          categories: data.categories?.map(cat => cat.categories) || []
        };

        setRecipe(formattedData);
      } catch (error) {
        console.error("Error in fetchRecipe:", error);
        if (error instanceof Error) {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRecipe();
    }
  }, [id]);

  return { recipe, loading, setRecipe };
};