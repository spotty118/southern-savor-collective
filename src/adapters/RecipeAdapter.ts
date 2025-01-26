import { Recipe } from "@/types/recipe";
import { Tables } from "@/integrations/supabase/types";

export interface LegacyRecipeFormat {
  id: string;
  title: string;
  description: string | null;
  ingredients: {
    amount: string;
    unit: string;
    item: string;
    [key: string]: string;
  }[];
  instructions: string[];
  cook_time: unknown;
  difficulty: string | null;
  image_url: string | null;
  default_servings: number | null;
  author: {
    username: string | null;
  };
  categories: Tables<"categories">[];
}

export const adaptRecipeToLegacy = (recipe: Recipe): LegacyRecipeFormat => {
  return {
    id: recipe.id,
    title: recipe.title,
    description: recipe.description,
    ingredients: recipe.ingredients,
    instructions: recipe.instructions,
    cook_time: recipe.cookTime.value,
    difficulty: recipe.difficulty,
    image_url: recipe.imageUrl,
    default_servings: recipe.defaultServings,
    author: {
      username: recipe.author.username
    },
    categories: recipe.categories as Tables<"categories">[]
  };
};