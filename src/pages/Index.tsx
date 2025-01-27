import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { CookingPot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RecipeGrid } from "@/components/recipe/RecipeGrid";
import { RecipeHeader } from "@/components/recipe/RecipeHeader";
import { Footer } from "@/components/Footer";
import { Tables } from "@/integrations/supabase/types";
import { BuilderComponent } from '@builder.io/react';
import { builder } from '@/integrations/builder/client';

interface RecipeWithExtras extends Tables<"recipes"> {
  author: { username: string | null };
  categories: Tables<"categories">[];
}

const Index = () => {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState<RecipeWithExtras[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<RecipeWithExtras[]>([]);
  const [categories, setCategories] = useState<Tables<"categories">[]>([]);
  const [user, setUser] = useState<any>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditor, setIsEditor] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("All Y'all");
  const [builderContent, setBuilderContent] = useState(null);

  useEffect(() => {
    async function fetchBuilderContent() {
      const content = await builder.get('page', {
        url: window.location.pathname
      }).promise();
      
      setBuilderContent(content);
    }
    fetchBuilderContent();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from("categories")
          .select("*")
          .order("name");

        if (error) throw error;
        console.log("Fetched categories:", data);
        setCategories(data || []);
      } catch (error: any) {
        console.error("Error fetching categories:", error);
        toast({
          title: "Error",
          description: "Failed to load categories",
          variant: "destructive",
        });
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        console.log("Fetching recipes...");
        const { data: recipesData, error: recipesError } = await supabase
          .from("recipes")
          .select(`
            *,
            author:profiles(username)
          `)
          .order("created_at", { ascending: false });

        if (recipesError) throw recipesError;
        console.log("Initial recipes data:", recipesData);

        // Fetch categories for each recipe
        const recipesWithCategories = await Promise.all(
          recipesData.map(async (recipe) => {
            const { data: categoryData, error: categoryError } = await supabase
              .from("recipe_categories")
              .select(`
                categories (
                  *
                )
              `)
              .eq("recipe_id", recipe.id);

            if (categoryError) throw categoryError;
            console.log(`Categories for recipe ${recipe.id}:`, categoryData);

            return {
              ...recipe,
              categories: categoryData?.map((c) => c.categories) || [],
            };
          })
        );

        console.log("Final recipes with categories:", recipesWithCategories);
        setRecipes(recipesWithCategories);
        setFilteredRecipes(recipesWithCategories);
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
      if (!user?.id) {
        console.log("No user ID available for fetching favorites");
        return;
      }

      try {
        console.log("Fetching favorites for user:", user.id);
        const { data, error } = await supabase
          .from("favorites")
          .select("recipe_id")
          .eq("user_id", user.id);

        if (error) {
          console.error("Error fetching favorites:", error);
          return;
        }
        
        const favoriteIds = new Set(data?.map((fav) => fav.recipe_id) || []);
        console.log("Fetched favorites:", favoriteIds);
        setFavorites(favoriteIds);
      } catch (error: any) {
        console.error("Error in fetchFavorites:", error);
      }
    };

    fetchFavorites();
  }, [user?.id]); // Changed dependency to user?.id

  useEffect(() => {
    console.log("Setting up auth state listener");
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      console.log("Current user from session:", currentUser);
      setUser(currentUser);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      console.log("Auth state changed, new user:", currentUser);
      setUser(currentUser);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const checkUserRoles = async () => {
      if (!user?.id) {
        console.log("No user ID available for checking roles");
        setIsAdmin(false);
        setIsEditor(false);
        return;
      }
      
      try {
        console.log("Checking roles for user:", user.id);
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id);

        if (!error && data) {
          const roles = data.map(r => r.role);
          console.log("User roles:", roles);
          setIsAdmin(roles.includes('admin'));
          setIsEditor(roles.includes('editor'));
        }
      } catch (error) {
        console.error("Error checking user roles:", error);
      }
    };

    checkUserRoles();
  }, [user?.id]); // Changed dependency to user?.id

  const handleLoveClick = async (recipeId: string) => {
    if (!user?.id) {
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

  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);
    if (filter === "All Y'all") {
      setFilteredRecipes(recipes);
    } else {
      const filtered = recipes.filter((recipe) =>
        recipe.categories.some((category) => category.name === filter)
      );
      setFilteredRecipes(filtered);
    }
  };

  const handleRecipeClick = (recipeId: string) => {
    navigate(`/recipe/${recipeId}`);
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      <RecipeHeader 
        user={user} 
        isAdmin={isAdmin} 
        selectedFilter={selectedFilter}
        onFilterChange={handleFilterChange}
        categories={categories}
      />

      {builderContent && (
        <BuilderComponent 
          model="page" 
          content={builderContent} 
        />
      )}

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
            {user?.id && selectedFilter === "All Y'all" && (
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
      <Footer />
    </div>
  );
};

export default Index;
