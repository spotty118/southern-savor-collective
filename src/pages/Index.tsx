import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { CookingPot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RecipeGrid } from "@/components/recipe/RecipeGrid";
import { RecipeHeader } from "@/components/recipe/RecipeHeader";
import { Tables } from "@/integrations/supabase/types";

const Index = () => {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState<(Tables<"recipes"> & { author: { username: string | null } })[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<(Tables<"recipes"> & { author: { username: string | null } })[]>([]);
  const [user, setUser] = useState<any>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditor, setIsEditor] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("All Y'all");

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const { data, error } = await supabase
          .from("recipes")
          .select(`
            *,
            author:profiles(username),
            recipe_categories!inner (
              category:categories(name)
            )
          `)
          .order("created_at", { ascending: false });

        if (error) throw error;
        
        const formattedData = data?.map(recipe => ({
          ...recipe,
          ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : [],
          instructions: Array.isArray(recipe.instructions) ? recipe.instructions : []
        })) || [];
        
        setRecipes(formattedData);
        setFilteredRecipes(formattedData);
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
    const checkUserRoles = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id);

        if (!error && data) {
          const roles = data.map(r => r.role);
          setIsAdmin(roles.includes('admin'));
          setIsEditor(roles.includes('editor'));
        }
      } catch (error) {
        console.error("Error checking user roles:", error);
      }
    };

    checkUserRoles();
  }, [user]);

  const handleRecipeClick = (recipeId: string) => {
    navigate(`/recipe/${recipeId}`);
  };

  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);
    if (filter === "All Y'all") {
      setFilteredRecipes(recipes);
    } else {
      const filtered = recipes.filter(recipe => 
        recipe.recipe_categories?.some(
          rc => rc.category?.name === filter
        )
      );
      setFilteredRecipes(filtered);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      <RecipeHeader 
        user={user} 
        isAdmin={isAdmin} 
        selectedFilter={selectedFilter}
        onFilterChange={handleFilterChange}
      />

      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-pulse flex flex-col items-center gap-4">
              <CookingPot className="h-12 w-12 text-[#FEC6A1]" />
              <p className="text-accent">Loading our family recipes...</p>
            </div>
          </div>
        ) : filteredRecipes.length === 0 ? (
          <div className="text-center py-12 bg-white/50 rounded-lg shadow-sm backdrop-blur-sm">
            <p className="text-lg text-gray-700 mb-4">
              {selectedFilter === "All Y'all" 
                ? "No recipes found in the cookbook yet"
                : `No ${selectedFilter.toLowerCase()} recipes found`}
            </p>
            {user && selectedFilter === "All Y'all" && (
              <Button 
                onClick={() => navigate("/create-recipe")} 
                className="bg-[#FEC6A1] text-accent hover:bg-[#FDE1D3] transform transition-transform duration-200 hover:scale-105"
              >
                Share Your First Recipe
              </Button>
            )}
          </div>
        ) : (
          <RecipeGrid 
            recipes={filteredRecipes}
            favorites={favorites}
            currentUserId={user?.id}
            isAdmin={isAdmin}
            isEditor={isEditor}
            onLoveClick={handleLoveClick}
            onRecipeClick={handleRecipeClick}
            onEditClick={(id) => navigate(`/recipe/${id}/edit`)}
          />
        )}
      </div>
    </div>
  );
};

export default Index;