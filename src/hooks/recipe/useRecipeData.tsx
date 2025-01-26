import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Tables } from "@/integrations/supabase/types";

interface Ingredient {
  amount: string;
  unit: string;
  item: string;
  [key: string]: string;
}

interface RecipeData {
  id: string;
  title: string;
  description: string | null;
  ingredients: Ingredient[];
  instructions: string[];
  cook_time: unknown;
  difficulty: string | null;
  image_url: string | null;
  default_servings: number | null;
  author: {
    username: string | null;
  };
  categories: Tables<"categories">[];
  author_id: string | null;
  created_at: string;
  updated_at: string;
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

        // Type guard for ingredients
        const isIngredient = (value: unknown): value is Ingredient => {
          if (!value || typeof value !== 'object') return false;
          const ing = value as Record<string, unknown>;
          return typeof ing.amount === 'string' && 
                 typeof ing.unit === 'string' && 
                 typeof ing.item === 'string';
        };

        // Parse ingredients from JSON and validate
        const ingredients = Array.isArray(data.ingredients) 
          ? data.ingredients.filter(isIngredient)
          : [];

        // Parse instructions from JSON
        const instructions = Array.isArray(data.instructions)
          ? data.instructions.filter((i): i is string => typeof i === 'string')
          : [];

        const formattedData: RecipeData = {
          id: data.id,
          title: data.title,
          description: data.description,
          ingredients,
          instructions,
          cook_time: data.cook_time?.toString() || '',
          difficulty: data.difficulty,
          image_url: data.image_url,
          default_servings: data.default_servings || 4,
          author: data.author as { username: string | null },
          categories: data.categories?.map(cat => cat.categories) || [],
          created_at: data.created_at,
          updated_at: data.updated_at,
          author_id: data.author_id
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