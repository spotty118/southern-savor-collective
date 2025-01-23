import { Heart, Edit, Star, MessageSquare } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

interface RecipeCardProps {
  title: string;
  description: string;
  image: string;
  author: string;
  cookTime: string;
  difficulty: string;
  isLoved?: boolean;
  canEdit?: boolean;
  rating?: number;
  commentsCount?: number;
  onLoveClick?: () => void;
  onEditClick?: () => void;
  onClick?: () => void;
}

export const RecipeCard = ({
  title,
  description,
  image,
  author,
  cookTime,
  difficulty,
  isLoved = false,
  canEdit = false,
  rating = 0,
  commentsCount = 0,
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

  return (
    <div 
      className="recipe-card group bg-white/80 backdrop-blur-sm cursor-pointer transform transition-all duration-300 hover:-translate-y-1"
      onClick={handleClick}
    >
      <div className="relative overflow-hidden">
        <img 
          src={image} 
          alt={title} 
          className="transition-transform duration-300 group-hover:scale-105" 
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
      <div className="recipe-card-content">
        <h3 className="mb-2 text-xl font-semibold font-display text-accent group-hover:text-[#FEC6A1] transition-colors duration-300">
          {title}
        </h3>
        <p className="mb-4 text-sm text-gray-600 line-clamp-2">{description}</p>
        <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
          <span className="italic">By {author}</span>
          <div className="flex gap-4">
            <span>{cookTime}</span>
            <span className="text-[#FEC6A1] font-medium">{difficulty}</span>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm border-t pt-2">
          <div className="flex items-center gap-1">
            <Star className={cn("h-4 w-4", rating > 0 ? "fill-yellow-400 text-yellow-400" : "text-gray-300")} />
            <span className="text-gray-600">{rating > 0 ? rating.toFixed(1) : "No ratings"}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-500">
            <MessageSquare className="h-4 w-4" />
            <span>{commentsCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
};