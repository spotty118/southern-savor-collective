import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { RecipeCard } from "@/components/RecipeCard";
import { supabase } from "@/integrations/supabase/client";
import { AuthButton } from "@/components/AuthButton";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Plus, User, Settings, CakeSlice, CookingPot } from "lucide-react";

// Southern-inspired difficulty mapping
const difficultyMapping: { [key: string]: string } = {
  "Easy": "Easy as Pie",
  "Medium": "Sunday Supper Simple",
  "Hard": "Down-Home Challenge"
};

const Index = () => {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

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
        
        // Ensure data is properly formatted
        const formattedData = data?.map(recipe => ({
          ...recipe,
          ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : [],
          instructions: Array.isArray(recipe.instructions) ? recipe.instructions : []
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
  }, []);

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

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .eq("role", "admin")
          .single();

        if (!error && data) {
          setIsAdmin(true);
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
      }
    };

    checkAdminStatus();
  }, [user]);

  const handleRecipeClick = (recipeId: string) => {
    navigate(`/recipe/${recipeId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FDE1D3] to-[#FDFCFB] px-4 py-8">
      <div className="container mx-auto">
        <header className="mb-12">
          <div className="text-center max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-4">
              <CookingPot className="h-8 w-8 text-[#FEC6A1]" />
              <h1 className="text-4xl font-bold text-accent font-display md:text-5xl lg:text-6xl">
                Southern Comfort Recipes
              </h1>
              <CakeSlice className="h-8 w-8 text-[#FEC6A1]" />
            </div>
            <p className="text-lg text-gray-700 font-light italic">
              "Where every recipe tells a story and every meal brings folks together"
            </p>
            <div className="mt-4 text-sm text-gray-600">
              From Grandma's kitchen to yours - sharing the flavors of the South
            </div>
          </div>
          <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
            {user && (
              <>
                <Button 
                  onClick={() => navigate("/create-recipe")}
                  className="bg-[#FEC6A1] text-accent hover:bg-[#FDE1D3] transform transition-transform duration-200 hover:scale-105"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Share Your Recipe
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate("/profile")}
                  className="border-[#FEC6A1] text-accent hover:bg-[#FDE1D3] transform transition-transform duration-200 hover:scale-105"
                >
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Button>
                {isAdmin && (
                  <Button 
                    variant="outline" 
                    onClick={() => navigate("/admin")}
                    className="border-[#FEC6A1] text-accent hover:bg-[#FDE1D3] transform transition-transform duration-200 hover:scale-105"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Admin
                  </Button>
                )}
              </>
            )}
            <AuthButton user={user} />
          </div>
        </header>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-pulse flex flex-col items-center gap-4">
              <CookingPot className="h-12 w-12 text-[#FEC6A1]" />
              <p className="text-accent">Loading our family recipes...</p>
            </div>
          </div>
        ) : recipes.length === 0 ? (
          <div className="text-center py-12 bg-white/50 rounded-lg shadow-sm backdrop-blur-sm">
            <p className="text-lg text-gray-700 mb-4">No recipes found in the cookbook yet</p>
            {user && (
              <Button 
                onClick={() => navigate("/create-recipe")} 
                className="bg-[#FEC6A1] text-accent hover:bg-[#FDE1D3] transform transition-transform duration-200 hover:scale-105"
              >
                Share Your First Recipe
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {recipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                title={recipe.title}
                description={recipe.description || ""}
                image={recipe.image_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"}
                author={recipe.author?.username || "Anonymous"}
                cookTime={recipe.cook_time || "N/A"}
                difficulty={difficultyMapping[recipe.difficulty] || recipe.difficulty || "Easy as Pie"}
                isLoved={favorites.has(recipe.id)}
                onLoveClick={() => handleLoveClick(recipe.id)}
                onClick={() => handleRecipeClick(recipe.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;