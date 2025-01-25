import { Share2, BookX, Edit2, Eye, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface RecipeActionButtonsProps {
  recipeId: string;
  authorId: string;
  currentUserId: string;
  isAdmin: boolean;
  onShare: (recipeId: string) => void;
  onView: (recipeId: string) => void;
  onEdit: (recipeId: string) => void;
  onChangeOwner: (recipeId: string) => void;
  onDelete: (recipeId: string) => void;
}

export const RecipeActionButtons = ({
  recipeId,
  authorId,
  currentUserId,
  isAdmin,
  onShare,
  onView,
  onEdit,
  onChangeOwner,
  onDelete,
}: RecipeActionButtonsProps) => {
  const canEditRecipe = isAdmin || currentUserId === authorId;

  return (
    <div className="flex gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onShare(recipeId)}
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Share Recipe</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onView(recipeId)}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>View Recipe</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {canEditRecipe && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(recipeId)}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Edit Recipe</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {isAdmin && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onChangeOwner(recipeId)}
              >
                <UserCog className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Change Owner</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {(isAdmin || currentUserId === authorId) && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(recipeId)}
              >
                <BookX className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Delete Recipe</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};