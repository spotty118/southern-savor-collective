import { Heart } from "lucide-react";
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
  onLoveClick?: () => void;
}

export const RecipeCard = ({
  title,
  description,
  image,
  author,
  cookTime,
  difficulty,
  isLoved = false,
  onLoveClick,
}: RecipeCardProps) => {
  return (
    <div className="recipe-card group bg-white/80 backdrop-blur-sm">
      <div className="relative">
        <img src={image} alt={title} className="transition-transform duration-300 group-hover:scale-105" />
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 bg-white/90 hover:bg-white"
          onClick={onLoveClick}
        >
          <Heart className={cn("h-5 w-5", isLoved ? "fill-red-500 text-red-500" : "text-gray-500")} />
        </Button>
      </div>
      <div className="recipe-card-content">
        <h3 className="mb-2 text-xl font-semibold font-display text-accent">{title}</h3>
        <p className="mb-4 text-sm text-gray-600 line-clamp-2">{description}</p>
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span className="italic">By {author}</span>
          <div className="flex gap-4">
            <span>{cookTime}</span>
            <span className="text-[#FEC6A1] font-medium">{difficulty}</span>
          </div>
        </div>
      </div>
    </div>
  );
};