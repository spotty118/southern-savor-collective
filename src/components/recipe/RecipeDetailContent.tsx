import { Button } from "@/components/ui/button";
import { Wand2 } from "lucide-react";

interface RecipeDetailContentProps {
  recipe: {
    title: string;
    author?: {
      username: string | null;
    };
    description: string;
    ingredients: Array<{
      amount: string;
      unit: string;
      item: string;
    }>;
    instructions: string[];
    cook_time: string;
    difficulty: string;
    image_url?: string;
  };
  isRecipeOwner: boolean;
  onEnhanceInstructions: () => void;
  enhancing: boolean;
}

export const RecipeDetailContent = ({
  recipe,
  isRecipeOwner,
  onEnhanceInstructions,
  enhancing,
}: RecipeDetailContentProps) => {
  return (
    <div className="vintage-paper rounded-lg shadow-lg overflow-hidden">
      <img
        src={
          recipe.image_url ||
          "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"
        }
        alt={recipe.title}
        className="w-full h-96 object-cover"
      />
      <div className="p-8">
        <h1 className="text-4xl font-display text-accent-foreground mb-4 heading-underline">
          {recipe.title}
        </h1>
        <p className="text-gray-600 mb-6 font-script text-xl">
          By {recipe.author?.username || "Anonymous"}
        </p>
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-700 mb-8">{recipe.description}</p>

          <div className="mb-8">
            <h2 className="text-2xl font-display text-accent-foreground mb-4 heading-underline">
              Ingredients
            </h2>
            <ul className="list-disc pl-6 space-y-2 marker:text-[#FEC6A1]">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index} className="text-gray-700">
                  {`${ingredient.amount} ${ingredient.unit} ${ingredient.item}`}
                </li>
              ))}
            </ul>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-display text-accent-foreground heading-underline">
                Instructions
              </h2>
              {isRecipeOwner && (
                <Button
                  variant="ghost"
                  onClick={onEnhanceInstructions}
                  disabled={enhancing}
                  className="flex items-center gap-2 hover:bg-[hsl(var(--vintage-cream))]"
                >
                  <Wand2 className="h-4 w-4" />
                  Enhance with AI
                </Button>
              )}
            </div>
            <ol className="list-decimal pl-6 space-y-4">
              {recipe.instructions.map((instruction, index) => (
                <li key={index} className="text-gray-700">
                  {instruction}
                </li>
              ))}
            </ol>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-500 border-t pt-4">
            <span className="font-script text-lg">
              Cook Time: {String(recipe.cook_time)}
            </span>
            <span className="font-script text-lg text-[#FEC6A1]">
              Difficulty: {recipe.difficulty}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};