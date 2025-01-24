import { Heart, Edit } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { RecipeRating } from "./recipe/RecipeRating";

interface RecipeCardProps {
  id: string;
  title: string;
  description: string;
  image: string;
  author: string;
  cookTime: string;
  difficulty: string;
  isLoved?: boolean;
  canEdit?: boolean;
  currentUserId?: string | null;
  onLoveClick?: () => void;
  onEditClick?: () => void;
  onClick?: () => void;
}

export const RecipeCard = ({
  id,
  title,
  description,
  image,
  author,
  cookTime,
  difficulty,
  isLoved = false,
  canEdit = false,
  currentUserId,
  onLoveClick,
  onEditClick,
  onClick,
}: RecipeCardProps) => {
  const handleClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    onClick?.();
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.log("Image failed to load:", image);
    const img = e.target as HTMLImageElement;
    img.src = "/placeholder.svg";
    img.onerror = null; // Prevent infinite loop if placeholder also fails
  };

  return (
    <div 
      className="recipe-card group vintage-paper cursor-pointer transform transition-all duration-300 hover:-translate-y-1"
      onClick={handleClick}
    >
      <div className="relative overflow-hidden">
        <img 
          src={image || "/placeholder.svg"}
          alt={title}
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
          onError={handleImageError}
        />
        <div className="absolute right-2 top-2 flex gap-2">
          {canEdit && (
            <Button
              variant="ghost"
              size="icon"
              className="bg-white/90 hover:bg-white z-10"
              onClick={(e) => {
                e.stopPropagation();
                onEditClick?.();
              }}
            >
              <Edit className="h-5 w-5 text-gray-500" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="bg-white/90 hover:bg-white z-10"
            onClick={(e) => {
              e.stopPropagation();
              onLoveClick?.();
            }}
          >
            <Heart className={cn("h-5 w-5", isLoved ? "fill-red-500 text-red-500" : "text-gray-500")} />
          </Button>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <div className="recipe-card-content p-4">
        <h3 className="mb-2 text-xl font-semibold font-display text-accent group-hover:text-[#FEC6A1] transition-colors duration-300 heading-underline">
          {title}
        </h3>
        <p className="mb-4 text-sm text-gray-600 line-clamp-2">{description}</p>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span className="font-script text-lg">By {author}</span>
            <div className="flex gap-4">
              <span className="font-script text-base">{cookTime}</span>
              <span className="font-script text-base text-[#FEC6A1]">{difficulty}</span>
            </div>
          </div>
          <RecipeRating 
            recipeId={id} 
            userId={currentUserId} 
            className="pt-2"
          />
        </div>
      </div>
    </div>
  );
};