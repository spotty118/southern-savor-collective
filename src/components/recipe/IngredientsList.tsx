import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Minus } from "lucide-react";

interface Ingredient {
  item: string;
  amount: string;
  unit: string;
  [key: string]: string;
}

interface IngredientsListProps {
  ingredients: Ingredient[];
  onAddIngredient: () => void;
  onRemoveIngredient: (index: number) => void;
  onIngredientChange: (index: number, field: keyof Ingredient, value: string) => void;
}

export const IngredientsList = ({
  ingredients,
  onAddIngredient,
  onRemoveIngredient,
  onIngredientChange,
}: IngredientsListProps) => {
  return (
    <div className="space-y-4">
      <label className="text-sm font-medium">Ingredients</label>
      {ingredients.map((ingredient, index) => (
        <div key={index} className="grid grid-cols-4 gap-2">
          <Input
            className="col-span-2"
            value={ingredient.item}
            onChange={(e) => onIngredientChange(index, "item", e.target.value)}
            placeholder="Ingredient name"
          />
          <Input
            value={ingredient.amount}
            onChange={(e) => onIngredientChange(index, "amount", e.target.value)}
            placeholder="Amount"
          />
          <div className="flex gap-2">
            <Input
              value={ingredient.unit}
              onChange={(e) => onIngredientChange(index, "unit", e.target.value)}
              placeholder="Unit"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => onRemoveIngredient(index)}
              disabled={ingredients.length === 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        onClick={onAddIngredient}
        className="w-full"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Ingredient
      </Button>
    </div>
  );
};