import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AIEnhanceButton } from "@/components/recipe/AIEnhanceButton";

interface RecipeBasicInfoProps {
  title: string;
  setTitle: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  cookTime: string;
  setCookTime: (value: string) => void;
  difficulty: string;
  setDifficulty: (value: string) => void;
  imageUrl: string;
  setImageUrl: (value: string) => void;
  onDescriptionEnhancement: (enhanced: string[]) => void;
}

export const RecipeBasicInfo = ({
  title,
  setTitle,
  description,
  setDescription,
  cookTime,
  setCookTime,
  difficulty,
  setDifficulty,
  imageUrl,
  setImageUrl,
  onDescriptionEnhancement,
}: RecipeBasicInfoProps) => {
  return (
    <>
      <div className="space-y-2">
        <label className="text-sm font-medium">Recipe Title</label>
        <Input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter your recipe title"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Description</label>
        <div className="space-y-2">
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Share the story behind your recipe"
          />
          <AIEnhanceButton
            content={[description]}
            type="description"
            onEnhanced={onDescriptionEnhancement}
            disabled={!description}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Cooking Time</label>
        <Input
          value={cookTime}
          onChange={(e) => setCookTime(e.target.value)}
          placeholder="e.g., 1 hour 30 minutes"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Difficulty</label>
        <Select value={difficulty} onValueChange={setDifficulty}>
          <SelectTrigger>
            <SelectValue placeholder="Select difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Easy">Easy as Pie</SelectItem>
            <SelectItem value="Medium">Sunday Supper Simple</SelectItem>
            <SelectItem value="Hard">Down-Home Challenge</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Image URL</label>
        <Input
          type="url"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="Enter image URL"
        />
      </div>
    </>
  );
};