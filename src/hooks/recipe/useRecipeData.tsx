import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Tables } from "@/integrations/supabase/types";

interface RecipeTime {
  hours?: number;
  minutes: number;
}

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
  cook_time: RecipeTime | null;
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
  
  const formatIngredients = useCallback((raw: unknown): Ingredient[] => {
    if (!Array.isArray(raw)) return [];
    
    return raw.filter((ing): ing is Ingredient => 
      ing && 
      typeof ing === 'object' &&
      typeof ing.amount === 'string' &&
      typeof ing.unit === 'string' &&
      typeof ing.item === 'string'
    );
  }, []);

  const formatInstructions = useCallback((raw: unknown): string[] => {
    if (!Array.isArray(raw)) return [];
    return raw.filter((i): i is string => typeof i === 'string');
  }, []);

  const parseCookTime = useCallback((rawTime: unknown): RecipeTime | null => {
    try {
      if (typeof rawTime !== 'string') return null;
      const parsed = JSON.parse(rawTime);
      if (typeof parsed === 'object' && parsed !== null &&
          (parsed.hours === undefined || typeof parsed.hours === 'number') &&
          typeof parsed.minutes === 'number') {
        return parsed as RecipeTime;
      }
    } catch { }
    return null;
  }, []);

  useEffect(() => {
    if (!id) return;

    let isMounted = true;

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
        if (!isMounted) return;

        const formattedData: RecipeData = {
          id: data.id,
          title: data.title,
          description: data.description,
          ingredients: formatIngredients(data.ingredients),
          instructions: formatInstructions(data.instructions),
          cook_time: parseCookTime(data.cook_time),
          difficulty: data.difficulty,
          image_url: data.image_url,
          default_servings: data.default_servings ?? 4,
          author: {
            username: data.author?.username ?? null
          },
          categories: data.categories?.map((cat: any) => cat.categories) ?? [],
          created_at: data.created_at,
          updated_at: data.updated_at,
          author_id: data.author_id
        };

        setRecipe(formattedData);
      } catch (error) {
        if (!isMounted) return;
        if (error instanceof Error) {
          toast({
            title: "Error loading recipe",
            description: error.message,
            variant: "destructive",
          });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchRecipe();

    return () => {
      isMounted = false;
    };
  }, [id, formatIngredients, formatInstructions, parseCookTime]);

  return { recipe, loading, setRecipe };
};