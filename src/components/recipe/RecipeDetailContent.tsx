import { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { AIEnhanceButton } from "@/components/recipe/AIEnhanceButton";
import { RecipeBasicInfo } from "@/components/recipe/RecipeBasicInfo";
import { RecipeCategories } from "@/components/recipe/RecipeCategories";
import { RecipeRating } from "@/components/recipe/RecipeRating";
import { PrintRecipe } from "@/components/recipe/PrintRecipe";
import { Trash2, Edit } from "lucide-react";

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

      <RecipeBasicInfo recipe={recipe} />
      
      <RecipeCategories categories={recipe.categories} />
      
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Ingredients</h2>
          </div>
          <ul className="list-disc list-inside space-y-2">
            {recipe.ingredients.map((ingredient: any, index: number) => (
              <li key={index} className="text-gray-700">
                {ingredient.amount} {ingredient.unit} {ingredient.item}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Instructions</h2>
            {currentUserId && (
              <AIEnhanceButton
                onClick={onEnhanceInstructions}
                loading={enhancing}
              />
            )}
          </div>
          <ol className="list-decimal list-inside space-y-4">
            {recipe.instructions.map((instruction: string, index: number) => (
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
        <RecipeRating recipeId={recipe.id} currentUserId={currentUserId} />
        <PrintRecipe recipe={recipe} />
      </div>
    </div>
  );
};