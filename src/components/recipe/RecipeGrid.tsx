import { RecipeCard } from "@/components/RecipeCard";
import { Tables } from "@/integrations/supabase/types";

interface RecipeGridProps {
  recipes: (Tables<"recipes"> & { 
    author: { username: string | null };
    _count?: { comments: number };
    average_rating?: number;
  })[];
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
  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {recipes.map((recipe) => (
        <RecipeCard
          key={recipe.id}
          title={recipe.title}
          description={recipe.description || ""}
          image={recipe.image_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"}
          author={recipe.author?.username || "Anonymous"}
          cookTime={recipe.cook_time?.toString() || "N/A"}
          difficulty={difficultyMapping[recipe.difficulty || "Easy"] || recipe.difficulty || "Easy as Pie"}
          isLoved={favorites.has(recipe.id)}
          canEdit={isAdmin || isEditor || recipe.author_id === currentUserId}
          rating={recipe.average_rating || 0}
          commentsCount={recipe._count?.comments || 0}
          onLoveClick={() => onLoveClick(recipe.id)}
          onClick={() => onRecipeClick(recipe.id)}
          onEditClick={() => onEditClick?.(recipe.id)}
        />
      ))}
    </div>
  );
};