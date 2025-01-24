import { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { AIEnhanceButton } from "@/components/recipe/AIEnhanceButton";
import { RecipeBasicInfo } from "@/components/recipe/RecipeBasicInfo";
import { RecipeCategories } from "@/components/recipe/RecipeCategories";
import { RecipeRating } from "@/components/recipe/RecipeRating";
import { PrintRecipe } from "@/components/recipe/PrintRecipe";
import { Trash2, Edit } from "lucide-react";

interface Ingredient {
  amount: string;
  unit: string;
  item: string;
}

interface RecipeDetailContentProps {
  recipe: Tables<"recipes"> & {
    author: { username: string | null };
    categories: Tables<"categories">[];
  };
  currentUserId: string | null;
  isAdmin?: boolean;
  isEditor?: boolean;
  onDelete?: () => void;
  onEdit?: () => void;
  isRecipeOwner?: boolean;
  onEnhanceInstructions?: () => void;
  enhancing?: boolean;
}

export const RecipeDetailContent = ({
  recipe,
  currentUserId,
  isAdmin,
  isEditor,
  onDelete,
  onEdit,
  isRecipeOwner,
  onEnhanceInstructions,
  enhancing,
}: RecipeDetailContentProps) => {
  const canModify = isAdmin || isEditor || isRecipeOwner;

  // Type guard to check if value is an Ingredient
  const isIngredient = (value: unknown): value is Ingredient => {
    if (!value || typeof value !== 'object') return false;
    const ing = value as Record<string, unknown>;
    return typeof ing.amount === 'string' && 
           typeof ing.unit === 'string' && 
           typeof ing.item === 'string';
  };

  // Parse ingredients from JSON
  const ingredients = Array.isArray(recipe.ingredients) 
    ? recipe.ingredients.filter(isIngredient)
    : [];

  // Parse instructions from JSON
  const instructions = Array.isArray(recipe.instructions)
    ? recipe.instructions.filter((i): i is string => typeof i === 'string')
    : [];

  // Extract basic recipe info for PrintRecipe component
  const printRecipeProps = {
    title: recipe.title,
    description: recipe.description || "",
    cookTime: recipe.cook_time?.toString() || "",
    difficulty: recipe.difficulty || "",
    ingredients,
    instructions
  };

  // Extract basic recipe info for RecipeBasicInfo component
  const basicInfoProps = {
    title: recipe.title,
    setTitle: () => {}, // Read-only in detail view
    description: recipe.description || "",
    setDescription: () => {}, // Read-only in detail view
    cookTime: recipe.cook_time?.toString() || "",
    setCookTime: () => {}, // Read-only in detail view
    difficulty: recipe.difficulty || "",
    setDifficulty: () => {}, // Read-only in detail view
    imageUrl: recipe.image_url || "",
    setImageUrl: () => {}, // Read-only in detail view
    defaultServings: recipe.default_servings || 4,
    setDefaultServings: () => {}, // Read-only in detail view
    onDescriptionEnhancement: () => {}, // Not used in detail view
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">{recipe.title}</h1>
          <p className="text-gray-600">{recipe.description}</p>
        </div>
        
        {canModify && (
          <div className="flex gap-2">
            {onEdit && (
              <Button
                onClick={onEdit}
                variant="outline"
                size="icon"
                className="h-8 w-8"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                onClick={onDelete}
                variant="outline"
                size="icon"
                className="h-8 w-8 text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>

      <RecipeBasicInfo {...basicInfoProps} />
      
      <RecipeCategories 
        categories={recipe.categories}
        selectedCategories={[]} // Read-only in detail view
        setSelectedCategories={() => {}} // Read-only in detail view
      />
      
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Ingredients</h2>
          </div>
          <ul className="list-disc list-inside space-y-2">
            {ingredients.map((ingredient, index) => (
              <li key={index} className="text-gray-700">
                {ingredient.amount} {ingredient.unit} {ingredient.item}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Instructions</h2>
            {currentUserId && onEnhanceInstructions && (
              <AIEnhanceButton
                content={instructions}
                type="instructions"
                onEnhanced={onEnhanceInstructions}
                disabled={enhancing}
              />
            )}
          </div>
          <ol className="list-decimal list-inside space-y-4">
            {instructions.map((instruction, index) => (
              <li
                key={index}
                className="text-gray-700 leading-relaxed pl-2"
                style={{ textIndent: "-1.5rem", paddingLeft: "1.5rem" }}
              >
                {instruction}
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t">
        <RecipeRating 
          recipeId={recipe.id} 
          userId={currentUserId} 
        />
        <PrintRecipe {...printRecipeProps} />
      </div>
    </div>
  );
};