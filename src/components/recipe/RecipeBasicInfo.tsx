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
import { RecipeImageUpload } from "@/components/recipe/RecipeImageUpload";

interface RecipeTime {
  hours?: number;
  minutes: number;
}

interface RecipeBasicInfoProps {
  title: string;
  setTitle: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  cookTime: RecipeTime | null;
  setCookTime: (value: RecipeTime) => void;
  difficulty: string;
  setDifficulty: (value: string) => void;
  imageUrl: string;
  setImageUrl: (value: string) => void;
  defaultServings: number;
  setDefaultServings: (value: number) => void;
  onDescriptionEnhancement: (enhanced: string[]) => void;
  isEditing?: boolean;
}

const formatCookTime = (time: RecipeTime | null): string => {
  if (!time) return "";
  const hours = time.hours ? `${time.hours} hour${time.hours > 1 ? 's' : ''} ` : '';
  const minutes = time.minutes ? `${time.minutes} minute${time.minutes > 1 ? 's' : ''}` : '';
  return `${hours}${minutes}`.trim();
};

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
  defaultServings,
  setDefaultServings,
  onDescriptionEnhancement,
  isEditing = false,
}: RecipeBasicInfoProps) => {
  if (!isEditing) {
    return (
      <>
        <div className="space-y-2">
          <label className="text-sm font-medium">Recipe Title</label>
          <p className="text-gray-700">{title}</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Description</label>
          <p className="text-gray-700">{description}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Cooking Time</label>
            <p className="text-gray-700">{formatCookTime(cookTime)}</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Default Servings</label>
            <p className="text-gray-700">{defaultServings}</p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Difficulty</label>
          <p className="text-gray-700">{difficulty}</p>
        </div>

        {imageUrl && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Recipe Image</label>
            <img
              src={imageUrl}
              alt="Recipe"
              className="rounded-md max-h-48 object-cover"
            />
          </div>
        )}
      </>
    );
  }

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

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Cooking Time</label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Input
                type="number"
                min="0"
                max="24"
                value={cookTime?.hours || ""}
                onChange={(e) => setCookTime({
                  hours: parseInt(e.target.value) || 0,
                  minutes: cookTime?.minutes || 0
                })}
                placeholder="Hours"
              />
            </div>
            <div>
              <Input
                type="number"
                min="0"
                max="59"
                value={cookTime?.minutes || ""}
                onChange={(e) => setCookTime({
                  hours: cookTime?.hours || 0,
                  minutes: parseInt(e.target.value) || 0
                })}
                placeholder="Minutes"
              />
            </div>
          </div>
          <span className="text-xs text-gray-500">Enter hours and minutes</span>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Default Servings</label>
          <Input
            type="number"
            min="1"
            value={defaultServings}
            onChange={(e) => setDefaultServings(parseInt(e.target.value) || 4)}
            placeholder="Number of servings"
          />
        </div>
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

      <RecipeImageUpload imageUrl={imageUrl} setImageUrl={setImageUrl} />
    </>
  );
};