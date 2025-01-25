import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface RecipeRatingProps {
  recipeId: string;
  userId?: string | null;
  className?: string;
}

export const RecipeRating = ({ recipeId, userId, className = "" }: RecipeRatingProps) => {
  const [rating, setRating] = useState<number>(0);
  const [hover, setHover] = useState<number>(0);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [totalRatings, setTotalRatings] = useState<number>(0);
  const [userRating, setUserRating] = useState<number | null>(null);

  useEffect(() => {
    fetchRatings();
    if (userId) {
      fetchUserRating();
    }
  }, [recipeId, userId]);

  const fetchRatings = async () => {
    try {
      console.log("Fetching ratings for recipe:", recipeId);
      const { data, error } = await supabase
        .from("ratings")
        .select("rating")
        .eq("recipe_id", recipeId);

      if (error) {
        console.error("Error fetching ratings:", error);
        return;
      }

      if (data && data.length > 0) {
        const avg = data.reduce((acc, curr) => acc + curr.rating, 0) / data.length;
        console.log("Average rating:", avg, "Total ratings:", data.length);
        setAverageRating(Math.round(avg * 10) / 10);
        setTotalRatings(data.length);
      }
    } catch (error) {
      console.error("Error in fetchRatings:", error);
    }
  };

  const fetchUserRating = async () => {
    if (!userId || !recipeId) {
      console.log("Missing userId or recipeId for user rating fetch");
      return;
    }

    try {
      console.log("Fetching user rating for recipe:", recipeId, "user:", userId);
      const { data, error } = await supabase
        .from("ratings")
        .select("rating")
        .eq("recipe_id", recipeId)
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching user rating:", error);
        return;
      }

      if (data) {
        console.log("User rating found:", data.rating);
        setUserRating(data.rating);
        setRating(data.rating);
      }
    } catch (error) {
      console.error("Error in fetchUserRating:", error);
    }
  };

  const handleRating = async (value: number) => {
    if (!userId) {
      toast({
        title: "Please login",
        description: "You need to be logged in to rate recipes",
      });
      return;
    }

    try {
      console.log("Handling rating:", value, "for recipe:", recipeId, "user:", userId);
      if (userRating) {
        const { error } = await supabase
          .from("ratings")
          .update({ rating: value, updated_at: new Date().toISOString() })
          .eq("recipe_id", recipeId)
          .eq("user_id", userId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("ratings")
          .insert({
            recipe_id: recipeId,
            user_id: userId,
            rating: value,
          });

        if (error) throw error;
      }

      setUserRating(value);
      setRating(value);
      await fetchRatings();
      
      toast({
        title: "Thank you!",
        description: "Your rating has been saved",
      });
    } catch (error) {
      console.error("Error saving rating:", error);
      toast({
        title: "Error",
        description: "Failed to save your rating",
        variant: "destructive",
      });
    }
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <Button
            key={star}
            variant="ghost"
            size="sm"
            className="p-0 h-auto hover:bg-transparent"
            onClick={() => handleRating(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
          >
            <Star
              className={`h-5 w-5 transition-colors ${
                (hover || rating) >= star
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              }`}
            />
          </Button>
        ))}
      </div>
      {averageRating > 0 && (
        <p className="text-sm text-gray-500 mt-1">
          {averageRating} / 5 ({totalRatings} {totalRatings === 1 ? "rating" : "ratings"})
        </p>
      )}
    </div>
  );
};