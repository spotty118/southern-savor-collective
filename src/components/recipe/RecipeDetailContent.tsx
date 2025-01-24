import React from "react";
import { Button } from "@/components/ui/button";
import { PrintRecipe } from "@/components/recipe/PrintRecipe";

interface RecipeDetailContentProps {
  recipe: {
    title: string;
    description: string;
    cook_time: string;
    difficulty: string;
    ingredients: Array<{ amount: string; unit: string; item: string }>;
    instructions: string[];
    author_id: string;
  };
  currentUserId: string | null;
  isAdmin: boolean;
  isEditor: boolean;
  onDelete: () => void;
  onEdit: () => void;
}

export const RecipeDetailContent = ({
  recipe,
  currentUserId,
  isAdmin,
  isEditor,
  onDelete,
  onEdit,
}: RecipeDetailContentProps) => {
  const handleDeleteClick = () => {
    if (window.confirm("Are you sure you want to delete this recipe?")) {
      onDelete();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-start mb-6">
        <h1 className="text-3xl font-display font-bold">{recipe.title}</h1>
        <div className="flex gap-2">
          <PrintRecipe
            title={recipe.title}
            description={recipe.description || ""}
            cookTime={recipe.cook_time?.toString() || ""}
            difficulty={recipe.difficulty || ""}
            ingredients={recipe.ingredients as Array<{ amount: string; unit: string; item: string }>}
            instructions={recipe.instructions as string[]}
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
        
        <h2 className="text-xl font-semibold">Ingredients</h2>
        <ul className="list-disc pl-5">
          {recipe.ingredients.map((ingredient, index) => (
            <li key={index}>
              {ingredient.amount} {ingredient.unit} {ingredient.item}
            </li>
          ))}
        </ul>
        
        <h2 className="text-xl font-semibold">Instructions</h2>
        <ol className="list-decimal pl-5">
          {recipe.instructions.map((instruction, index) => (
            <li key={index}>{instruction}</li>
          ))}
        </ol>
      </div>
    </div>
  );
};
