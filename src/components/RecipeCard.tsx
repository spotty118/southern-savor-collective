import { Heart, Edit, MapPin } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { RecipeRating } from "./recipe/RecipeRating";
import { CollectionDialog } from "./recipe/CollectionDialog";

interface RecipeCardProps {
  id: string;
  title: string;
  description: string;
  image: string;
  author: string;
  cookTime: string;
  difficulty: string;
  locationName?: string;
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
  locationName,
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
    console.error("Image failed to load:", image);
    const img = e.target as HTMLImageElement;
    img.src = "/placeholder.svg";
  };

  return (
    <div 
      className="recipe-card group vintage-paper cursor-pointer transform transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]"
      onClick={handleClick}
    >
      <div className="relative overflow-hidden">
        <img 
          src={image || "/placeholder.svg"}
          alt={title}
          className="w-full h-52 object-cover transition-transform duration-300 group-hover:scale-105"
          onError={handleImageError}
          loading="lazy"
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
          {currentUserId && (
            <CollectionDialog recipeId={id} userId={currentUserId} />
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <div className="recipe-card-content p-6">
        <h3 className="mb-3 text-xl font-display font-semibold text-accent group-hover:text-[#FEC6A1] transition-colors duration-300 heading-underline">
          {title}
        </h3>
        <p className="mb-5 text-gray-600 line-clamp-2 leading-relaxed font-['Crimson_Pro'] text-base">
          {description}
        </p>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-gray-600">
            <span className="font-script text-xl tracking-wide">From {author || "Anonymous"}'s Kitchen</span>
            <div className="flex gap-6">
              <span className="font-['Crimson_Pro'] text-base">{cookTime}</span>
              <span className="font-['Crimson_Pro'] text-base text-[#FEC6A1]">{difficulty}</span>
            </div>
          </div>
          {locationName && (
            <div className="flex items-center gap-2 text-gray-500 mt-2">
              <MapPin className="h-4 w-4" />
              <span className="text-sm">{locationName}</span>
            </div>
          )}
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