import { Home, Heart, Wand2, Edit, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface RecipeDetailHeaderProps {
  isLoved: boolean;
  onLoveClick: () => void;
  isRecipeOwner: boolean;
  onEnhanceClick: () => void;
  enhancing: boolean;
  canModify: boolean;
  isEditMode: boolean;
  onToggleEditMode: () => void;
}

export const RecipeDetailHeader = ({
  isLoved,
  onLoveClick,
  isRecipeOwner,
  onEnhanceClick,
  enhancing,
  canModify,
  isEditMode,
  onToggleEditMode,
}: RecipeDetailHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="mb-6 flex items-center justify-between">
      <Button
        variant="ghost"
        onClick={() => navigate("/")}
        className="flex items-center gap-2 hover:bg-[hsl(var(--vintage-cream))]"
      >
        <Home className="h-4 w-4" />
        Back to Home
      </Button>
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="bg-white/90 hover:bg-white"
          onClick={onLoveClick}
        >
          <Heart
            className={`h-5 w-5 ${
              isLoved ? "fill-red-500 text-red-500" : "text-gray-500"
            }`}
          />
        </Button>
        {isRecipeOwner && isEditMode && (
          <Button
            variant="ghost"
            size="icon"
            className="bg-white/90 hover:bg-white"
            onClick={onEnhanceClick}
            disabled={enhancing}
          >
            <Wand2 className="h-5 w-5 text-[#FEC6A1]" />
          </Button>
        )}
        {canModify && (
          <Button
            variant="ghost"
            size="icon"
            className="bg-white/90 hover:bg-white"
            onClick={onToggleEditMode}
          >
            {isEditMode ? (
              <X className="h-5 w-5 text-gray-500" />
            ) : (
              <Edit className="h-5 w-5 text-gray-500" />
            )}
          </Button>
        )}
      </div>
    </div>
  );
};