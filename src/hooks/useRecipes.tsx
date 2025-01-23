import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Tables } from "@/integrations/supabase/types";

export const useRecipes = (categoryFilter: string = "All Y'all") => {
  const [recipes, setRecipes] = useState<(Tables<"recipes"> & { 
    author: { username: string | null };
    _count?: { comments: number };
    average_rating?: number;
  })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        let query = supabase
          .from("recipes")
          .select(`
            *,
            author:profiles(username),
            recipe_categories!inner(
              category:categories(name)
            ),
            comments(count),
            ratings(value:rating)
          `)
          .order("created_at", { ascending: false });

        if (categoryFilter !== "All Y'all") {
          query = query.eq("recipe_categories.category.name", categoryFilter);
        }

        const { data, error } = await query;

        if (error) throw error;
        
        const formattedData = data?.map(recipe => ({
          ...recipe,
          ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : [],
          instructions: Array.isArray(recipe.instructions) ? recipe.instructions : [],
          _count: {
            comments: recipe.comments?.length || 0
          },
          average_rating: recipe.ratings?.length 
            ? recipe.ratings.reduce((acc: number, curr: any) => acc + curr.value, 0) / recipe.ratings.length
            : 0
        })) || [];
        
        setRecipes(formattedData);
      } catch (error: any) {
        console.error("Error fetching recipes:", error);
        toast({
          title: "Error",
          description: "Failed to load recipes",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [categoryFilter]);

  return { recipes, loading };
};