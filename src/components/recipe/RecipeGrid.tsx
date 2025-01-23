import { RecipeCard } from "@/components/RecipeCard";
import { Tables } from "@/integrations/supabase/types";

interface RecipeGridProps {
  recipes: (Tables<"recipes"> & { author: { username: string | null } })[];
  favorites: Set<string>;
  onLoveClick: (recipeId: string) => void;
  onRecipeClick: (recipeId: string) => void;
}

const difficultyMapping: { [key: string]: string } = {
  "Easy": "Easy as Pie",
  "Medium": "Sunday Supper Simple",
  "Hard": "Down-Home Challenge"
};

export const RecipeGrid = ({ recipes, favorites, onLoveClick, onRecipeClick }: RecipeGridProps) => {
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
          onLoveClick={() => onLoveClick(recipe.id)}
          onClick={() => onRecipeClick(recipe.id)}
        />
      ))}
    </div>
  );
};