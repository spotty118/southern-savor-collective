import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export const useFavorites = (user: any) => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("favorites")
          .select("recipe_id")
          .eq("user_id", user.id);

        if (error) {
          console.error("Error fetching favorites:", error);
          return;
        }
        
        setFavorites(new Set(data?.map((fav) => fav.recipe_id) || []));
      } catch (error: any) {
        console.error("Error fetching favorites:", error);
      }
    };

    fetchFavorites();
  }, [user]);

  const handleLoveClick = async (recipeId: string) => {
    if (!user) {
      toast({
        title: "Please login",
        description: "You need to be logged in to favorite recipes",
      });
      navigate("/auth");
      return;
    }

    const newFavorites = new Set(favorites);
    const isFavorited = favorites.has(recipeId);

    try {
      if (isFavorited) {
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("recipe_id", recipeId);
          
        if (error) throw error;
        newFavorites.delete(recipeId);
      } else {
        const { error } = await supabase
          .from("favorites")
          .insert({
            user_id: user.id,
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

  return { favorites, handleLoveClick };
};