import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { PrintRecipe } from "@/components/recipe/PrintRecipe";
import { RecipeScaling } from "@/components/recipe/RecipeScaling";

interface RecipeDetailContentProps {
  recipe: {
    id: string;
    title: string;
    description: string;
    cook_time: string;
    difficulty: string;
    ingredients: Array<{ amount: string; unit: string; item: string }>;
    instructions: string[];
    author_id: string;
    default_servings: number;
    image_url?: string;
  };
  currentUserId: string | null;
  isAdmin: boolean;
  isEditor: boolean;
  onDelete: () => void;
  onEdit: () => void;
  isRecipeOwner: boolean;
  onEnhanceInstructions: () => Promise<void>;
  enhancing: boolean;
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
  const [scaledIngredients, setScaledIngredients] = useState(recipe.ingredients);
  const [scaledInstructions, setScaledInstructions] = useState(recipe.instructions);
  
  const handleDeleteClick = () => {
    if (window.confirm("Are you sure you want to delete this recipe?")) {
      onDelete();
    }
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error("Recipe image failed to load:", recipe.image_url);
    const img = e.target as HTMLImageElement;
    img.src = "/placeholder.svg";
  };

  // Log the image URL to help with debugging
  console.log("Recipe detail image URL:", recipe.image_url);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-start mb-6">
        <div className="space-y-4 w-full">
          <h1 className="text-3xl font-display font-bold">{recipe.title}</h1>
          {recipe.image_url && (
            <div className="relative w-full h-[400px] rounded-lg overflow-hidden">
              <img
                src={recipe.image_url}
                alt={recipe.title}
                className="w-full h-full object-cover"
                onError={handleImageError}
                loading="lazy"
              />
            </div>
          )}
        </div>
        <div className="flex gap-2 ml-4">
          <PrintRecipe
            title={recipe.title}
            description={recipe.description || ""}
            cookTime={recipe.cook_time?.toString() || ""}
            difficulty={recipe.difficulty || ""}
            ingredients={scaledIngredients}
            instructions={scaledInstructions}
          />
          {(currentUserId === recipe.author_id || isAdmin || isEditor) && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={onEdit}>
                Edit Recipe
              </Button>
              <Button variant="destructive" onClick={handleDeleteClick}>
                Delete Recipe
              </Button>
            </div>
          )}
        </div>
      </div>
      
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Description</h2>
        <p>{recipe.description}</p>
        
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Ingredients</h2>
          <RecipeScaling
            recipeId={recipe.id}
            defaultServings={recipe.default_servings || 4}
            ingredients={recipe.ingredients}
            instructions={recipe.instructions}
            currentUserId={currentUserId}
            onIngredientsScale={setScaledIngredients}
            onInstructionsScale={setScaledInstructions}
          />
        </div>
        
        <ul className="list-disc pl-5">
          {scaledIngredients.map((ingredient, index) => (
            <li key={index}>
              {ingredient.amount} {ingredient.unit} {ingredient.item}
            </li>
          ))}
        </ul>
        
        <h2 className="text-xl font-semibold">Instructions</h2>
        <ol className="list-decimal pl-5">
          {scaledInstructions.map((instruction, index) => (
            <li key={index}>{instruction}</li>
          ))}
        </ol>
      </div>
    </div>
  );
};