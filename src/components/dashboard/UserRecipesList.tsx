import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RecipeGrid } from "@/components/recipe/RecipeGrid";
import { Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface UserRecipesListProps {
  userId: string;
  type: "created" | "liked";
  currentUserId: string | null;
}

export const UserRecipesList = ({ userId, type, currentUserId }: UserRecipesListProps) => {
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        console.log(`Fetching ${type} recipes for user:`, userId);
        
        let query;
        if (type === "created") {
          query = supabase
            .from("recipes")
            .select(`
              *,
              author:profiles(username)
            `)
            .eq("author_id", userId)
            .order("created_at", { ascending: false });
        } else {
          query = supabase
            .from("favorites")
            .select(`
              recipe:recipes(
                *,
                author:profiles(username)
              )
            `)
            .eq("user_id", userId)
            .order("created_at", { ascending: false });
        }

        const { data, error } = await query;

        if (error) throw error;

        const formattedRecipes = type === "liked" 
          ? data.map((item: any) => item.recipe)
          : data;

        console.log(`${type} recipes:`, formattedRecipes);
        setRecipes(formattedRecipes);
      } catch (error) {
        console.error(`Error fetching ${type} recipes:`, error);
        toast({
          title: "Error",
          description: `Failed to load ${type} recipes`,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    const fetchFavorites = async () => {
      if (!currentUserId) return;

      try {
        console.log("Fetching favorites for user:", currentUserId);
        const { data, error } = await supabase
          .from("favorites")
          .select("recipe_id")
          .eq("user_id", currentUserId);

        if (error) throw error;

        const favoriteIds = new Set(data?.map((fav) => fav.recipe_id));
        console.log("Fetched favorites:", favoriteIds);
        setFavorites(favoriteIds);
      } catch (error) {
        console.error("Error fetching favorites:", error);
      }
    };

    fetchRecipes();
    fetchFavorites();
  }, [userId, type, currentUserId]);

  const handleLoveClick = async (recipeId: string) => {
    if (!currentUserId) {
      toast({
        title: "Please login",
        description: "You need to be logged in to favorite recipes",
      });
      return;
    }

    const newFavorites = new Set(favorites);
    const isFavorited = favorites.has(recipeId);

    try {
      if (isFavorited) {
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", currentUserId)
          .eq("recipe_id", recipeId);
          
        if (error) throw error;
        newFavorites.delete(recipeId);
      } else {
        const { error } = await supabase
          .from("favorites")
          .insert({
            user_id: currentUserId,
            recipe_id: recipeId,
          });
          
        if (error) throw error;
        newFavorites.add(recipeId);
      }
      setFavorites(newFavorites);
    } catch (error: any) {
      console.error("Error handling favorite:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (recipes.length === 0) {
    return (
      <div className="text-center py-8 bg-white rounded-lg shadow-sm">
        <p className="text-lg text-gray-600">
          {type === "created" 
            ? "No recipes created yet" 
            : "No favorite recipes yet"}
        </p>
      </div>
    );
  }

  return (
    <RecipeGrid
      recipes={recipes}
      favorites={favorites}
      currentUserId={currentUserId}
      onLoveClick={handleLoveClick}
      onRecipeClick={(id) => window.location.href = `/recipe/${id}`}
      onEditClick={(id) => window.location.href = `/recipe/${id}/edit`}
    />
  );
};