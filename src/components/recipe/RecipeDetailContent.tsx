import { useState } from "react";
import { RecipeScaling } from "./RecipeScaling";
import { RecipeVersionHistory } from "./RecipeVersionHistory";
import { IngredientsList } from "./IngredientsList";
import { InstructionsList } from "./InstructionsList";
import { Separator } from "@/components/ui/separator";

interface RecipeDetailContentProps {
  recipe: {
    id: string;
    title: string;
    description: string;
    cook_time: string;
    difficulty: string;
    ingredients: {
      amount: string;
      unit: string;
      item: string;
    }[];
    instructions: string[];
    author_id: string;
    default_servings: number;
    image_url: string | null;
  };
  currentUserId?: string | null;
}

export const RecipeDetailContent = ({
  recipe,
  currentUserId,
}: RecipeDetailContentProps) => {
  const [currentIngredients, setCurrentIngredients] = useState(recipe.ingredients);
  const [currentVersion, setCurrentVersion] = useState(recipe);

  const handleVersionSelect = (version: any) => {
    setCurrentVersion({
      ...recipe,
      title: version.title,
      description: version.description || "",
      ingredients: version.ingredients,
      instructions: version.instructions,
      cook_time: version.cook_time || "",
      difficulty: version.difficulty || "",
      image_url: version.image_url,
    });
    setCurrentIngredients(version.ingredients);
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold font-display text-accent">
          {currentVersion.title}
        </h1>
        <p className="text-gray-600">{currentVersion.description}</p>
      </div>

      {currentUserId && recipe.author_id === currentUserId && (
        <RecipeVersionHistory
          recipeId={recipe.id}
          currentVersion={currentVersion}
          onVersionSelect={handleVersionSelect}
        />
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold font-display text-accent">
              Ingredients
            </h2>
            <p className="text-sm text-gray-500">
              Cooking time: {currentVersion.cook_time}
            </p>
          </div>
          <RecipeScaling
            recipeId={recipe.id}
            defaultServings={recipe.default_servings}
            ingredients={currentIngredients}
            currentUserId={currentUserId}
            onIngredientsScale={setCurrentIngredients}
          />
        </div>

        <div className="pl-4">
          {currentIngredients.map((ingredient, index) => (
            <div key={index} className="text-gray-600">
              {ingredient.amount} {ingredient.unit} {ingredient.item}
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h2 className="text-xl font-semibold font-display text-accent">
          Instructions
        </h2>
        <div className="space-y-4">
          {currentVersion.instructions.map((instruction, index) => (
            <div key={index} className="flex gap-4">
              <span className="font-bold text-accent">{index + 1}.</span>
              <p className="text-gray-600">{instruction}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};