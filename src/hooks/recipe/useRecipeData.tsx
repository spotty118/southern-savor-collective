import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Ingredient {
  amount: string;
  unit: string;
  item: string;
}

interface RecipeData {
  id: string;
  title: string;
  description: string | null;
  ingredients: Ingredient[];
  instructions: string[];
  cook_time: string;
  difficulty: string | null;
  image_url: string | null;
  author_id: string;
  author?: {
    username: string | null;
  };
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
            author:profiles(username)
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
          author: data.author as { username: string | null }
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

    fetchRecipe();
  }, [id]);

  return { recipe, loading, setRecipe };
};