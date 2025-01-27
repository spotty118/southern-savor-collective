import { RecipeCard } from "@/components/RecipeCard";
import { Tables } from "@/integrations/supabase/types";

interface RecipeGridProps {
  recipes: (Tables<"recipes"> & { author: { username: string | null } })[];
  favorites: Set<string>;
  currentUserId?: string;
  isAdmin?: boolean;
  isEditor?: boolean;
  onLoveClick: (recipeId: string) => void;
  onRecipeClick: (recipeId: string) => void;
  onEditClick?: (recipeId: string) => void;
}

export const RecipeGrid = ({ 
  recipes, 
  favorites, 
  currentUserId,
  isAdmin = false,
  isEditor = false,
  onLoveClick, 
  onRecipeClick,
  onEditClick 
}: RecipeGridProps) => {
  console.log("Rendering RecipeGrid with:", {
    recipesCount: recipes.length,
    currentUserId,
    isAdmin,
    isEditor
  });
  
  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {recipes.map((recipe) => {
        if (!recipe?.id) {
          console.warn("Recipe without ID encountered:", recipe);
          return null;
        }

        const canEdit = Boolean(
          isAdmin || 
          isEditor || 
          (currentUserId && recipe.author_id === currentUserId)
        );

        return (
          <RecipeCard
            key={recipe.id}
            id={recipe.id}
            title={recipe.title}
            description={recipe.description || ""}
            image={recipe.image_url || "/placeholder.svg"}
            author={recipe.author?.username || "Anonymous"}
            cookTime={recipe.cook_time?.toString() || "N/A"}
            difficulty={recipe.difficulty || "Easy as Pie"}
            locationName={recipe.location_name || undefined}
            isLoved={favorites.has(recipe.id)}
            canEdit={canEdit}
            currentUserId={currentUserId}
            onLoveClick={() => onLoveClick(recipe.id)}
            onClick={() => onRecipeClick(recipe.id)}
            onEditClick={onEditClick && canEdit ? () => onEditClick(recipe.id) : undefined}
          />
        );
      })}
    </div>
  );
};