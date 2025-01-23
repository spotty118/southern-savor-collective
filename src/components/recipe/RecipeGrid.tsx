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

const difficultyMapping: { [key: string]: string } = {
  "Easy": "Easy as Pie",
  "Medium": "Sunday Supper Simple",
  "Hard": "Down-Home Challenge"
};

export const RecipeGrid = ({ 
  recipes, 
  favorites, 
  currentUserId,
  isAdmin,
  isEditor,
  onLoveClick, 
  onRecipeClick,
  onEditClick 
}: RecipeGridProps) => {
  console.log("Rendering RecipeGrid with recipes:", recipes);
  
  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {recipes.map((recipe) => (
        <RecipeCard
          key={recipe.id}
          title={recipe.title}
          description={recipe.description || ""}
          image={recipe.image_url || "/placeholder.svg"}
          author={recipe.author?.username || "Anonymous"}
          cookTime={recipe.cook_time?.toString() || "N/A"}
          difficulty={difficultyMapping[recipe.difficulty || "Easy"] || recipe.difficulty || "Easy as Pie"}
          isLoved={favorites.has(recipe.id)}
          canEdit={isAdmin || isEditor || recipe.author_id === currentUserId}
          onLoveClick={() => onLoveClick(recipe.id)}
          onClick={() => onRecipeClick(recipe.id)}
          onEditClick={onEditClick ? () => onEditClick(recipe.id) : undefined}
        />
      ))}
    </div>
  );
};