import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { RecipeCard } from "@/components/RecipeCard";
import { supabase } from "@/integrations/supabase/client";
import { AuthButton } from "@/components/AuthButton";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const { data, error } = await supabase
          .from("recipes")
          .select(`
            *,
            author:profiles(username)
          `)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setRecipes(data || []);
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
  }, []);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("favorites")
          .select("recipe_id")
          .eq("user_id", user.id);

        if (error) throw error;
        setFavorites(new Set(data.map((fav) => fav.recipe_id)));
      } catch (error: any) {
        console.error("Error fetching favorites:", error);
      }
    };

    fetchFavorites();
  }, [user]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

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
        await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("recipe_id", recipeId);
        newFavorites.delete(recipeId);
      } else {
        await supabase.from("favorites").insert({
          user_id: user.id,
          recipe_id: recipeId,
        });
        newFavorites.add(recipeId);
      }
      setFavorites(newFavorites);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="container mx-auto">
        <header className="mb-12 flex items-center justify-between">
          <div className="text-center flex-1">
            <h1 className="mb-4 text-4xl font-bold text-accent md:text-5xl lg:text-6xl">
              Southern Comfort Recipes
            </h1>
            <p className="text-lg text-gray-600">
              Discover authentic Southern recipes passed down through generations
            </p>
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <Button onClick={() => navigate("/create-recipe")}>
                <Plus className="mr-2 h-4 w-4" />
                New Recipe
              </Button>
            )}
            <AuthButton user={user} />
          </div>
        </header>

        {loading ? (
          <div className="text-center">Loading recipes...</div>
        ) : recipes.length === 0 ? (
          <div className="text-center">
            <p className="text-lg text-gray-600">No recipes found</p>
            {user && (
              <Button onClick={() => navigate("/create-recipe")} className="mt-4">
                Create Your First Recipe
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {recipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                title={recipe.title}
                description={recipe.description || ""}
                image={recipe.image_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"}
                author={recipe.author?.username || "Anonymous"}
                cookTime={recipe.cook_time || "N/A"}
                difficulty={recipe.difficulty || "Easy"}
                isLoved={favorites.has(recipe.id)}
                onLoveClick={() => handleLoveClick(recipe.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;