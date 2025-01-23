import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { RecipeGrid } from "@/components/recipe/RecipeGrid";
import { RecipeHeader } from "@/components/recipe/RecipeHeader";
import { RecipeFilters } from "@/components/recipe/RecipeFilters";
import { RecipeLoadingState } from "@/components/recipe/RecipeLoadingState";
import { RecipeEmptyState } from "@/components/recipe/RecipeEmptyState";
import { useRecipes } from "@/hooks/useRecipes";
import { useFavorites } from "@/hooks/useFavorites";

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditor, setIsEditor] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("All Y'all");
  
  const { recipes, loading } = useRecipes();
  const { favorites, handleLoveClick } = useFavorites(user);

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
        <RecipeFilters 
          selectedFilter={selectedFilter}
          onFilterChange={handleFilterChange}
        />

        {loading ? (
          <RecipeLoadingState />
        ) : recipes.length === 0 ? (
          <RecipeEmptyState selectedFilter={selectedFilter} user={user} />
        ) : (
          <RecipeGrid 
            recipes={recipes}
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