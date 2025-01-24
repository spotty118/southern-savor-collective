import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Minus } from "lucide-react";
import { AIEnhanceButton } from "@/components/recipe/AIEnhanceButton";

interface InstructionsListProps {
  instructions: string[];
  ingredients: Array<{ amount: string; unit: string; item: string; }>;
  onAddInstruction: () => void;
  onRemoveInstruction: (index: number) => void;
  onInstructionChange: (index: number, value: string) => void;
  onInstructionsEnhancement: (enhanced: string[]) => void;
}

export const InstructionsList = ({
  instructions,
  ingredients,
  onAddInstruction,
  onRemoveInstruction,
  onInstructionChange,
  onInstructionsEnhancement,
}: InstructionsListProps) => {
  return (
    <div className="space-y-4">
      <label className="text-sm font-medium">Instructions</label>
      {instructions.map((instruction, index) => (
        <div key={index} className="flex gap-2">
          <div className="flex-1">
            <Textarea
              value={instruction}
              onChange={(e) => onInstructionChange(index, e.target.value)}
              placeholder={`Step ${index + 1}`}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => onRemoveInstruction(index)}
            disabled={instructions.length === 1}
          >
            <Minus className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <div className="flex justify-between items-center">
        <Button
          type="button"
          variant="outline"
          onClick={onAddInstruction}
          className="w-full"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Step
        </Button>
        <AIEnhanceButton
          content={instructions}
          type="instructions"
          onEnhanced={onInstructionsEnhancement}
          disabled={instructions.some(i => !i.trim())}
          ingredients={ingredients}
        />
      </div>
    </div>
  );
};