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
import { z } from "zod";
import { toast } from "@/hooks/use-toast";

// Validation schemas
const RecipeTimeSchema = z.object({
  hours: z.number().min(0).max(24).optional(),
  minutes: z.number().min(0).max(59)
});

export type RecipeTime = z.infer<typeof RecipeTimeSchema>;

const DifficultyEnum = z.enum(["Easy", "Medium", "Hard"]);
export type Difficulty = z.infer<typeof DifficultyEnum>;

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

const validateCookTime = (hours: number | undefined, minutes: number): boolean => {
  try {
    RecipeTimeSchema.parse({ hours, minutes });
    return true;
  } catch (error) {
    if (error instanceof z.ZodError) {
      error.errors.forEach(err => {
        toast({
          title: "Invalid cooking time",
          description: err.message,
          variant: "destructive",
        });
      });
    }
    return false;
  }
};

const validateServings = (servings: number): boolean => {
  if (servings < 1 || servings > 50) {
    toast({
      title: "Invalid servings",
      description: "Servings must be between 1 and 50",
      variant: "destructive",
    });
    return false;
  }
  return true;
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
  const handleCookTimeChange = (field: keyof RecipeTime, value: string) => {
    const numValue = parseInt(value) || 0;
    const newTime = {
      hours: field === 'hours' ? numValue : cookTime?.hours || 0,
      minutes: field === 'minutes' ? numValue : cookTime?.minutes || 0
    };

    if (validateCookTime(newTime.hours, newTime.minutes)) {
      setCookTime(newTime);
    }
  };

  const handleServingsChange = (value: string) => {
    const numValue = parseInt(value) || 4;
    if (validateServings(numValue)) {
      setDefaultServings(numValue);
    }
  };

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
              onError={() => {
                toast({
                  title: "Error",
                  description: "Failed to load recipe image",
                  variant: "destructive",
                });
              }}
            />
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="recipe-title">Recipe Title</label>
        <Input
          id="recipe-title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter your recipe title"
          maxLength={100}
          aria-label="Recipe title"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="recipe-description">Description</label>
        <div className="space-y-2">
          <Textarea
            id="recipe-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Share the story behind your recipe"
            maxLength={1000}
            aria-label="Recipe description"
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
                onChange={(e) => handleCookTimeChange('hours', e.target.value)}
                placeholder="Hours"
                aria-label="Cooking time hours"
              />
            </div>
            <div>
              <Input
                type="number"
                min="0"
                max="59"
                value={cookTime?.minutes || ""}
                onChange={(e) => handleCookTimeChange('minutes', e.target.value)}
                placeholder="Minutes"
                aria-label="Cooking time minutes"
              />
            </div>
          </div>
          <span className="text-xs text-gray-500">Enter hours (0-24) and minutes (0-59)</span>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="recipe-servings">Default Servings</label>
          <Input
            id="recipe-servings"
            type="number"
            min="1"
            max="50"
            value={defaultServings}
            onChange={(e) => handleServingsChange(e.target.value)}
            placeholder="Number of servings"
            aria-label="Default servings"
          />
          <span className="text-xs text-gray-500">Enter servings (1-50)</span>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Difficulty</label>
        <Select value={difficulty} onValueChange={setDifficulty}>
          <SelectTrigger aria-label="Recipe difficulty">
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