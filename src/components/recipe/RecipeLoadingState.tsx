import { CookingPot } from "lucide-react";

export const RecipeLoadingState = () => {
  return (
    <div className="text-center py-12">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <CookingPot className="h-12 w-12 text-[#FEC6A1]" />
        <p className="text-accent">Loading our family recipes...</p>
      </div>
    </div>
  );
};