import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface RecipeEmptyStateProps {
  selectedFilter: string;
  user: any;
}

export const RecipeEmptyState = ({ selectedFilter, user }: RecipeEmptyStateProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="text-center py-12 bg-white/50 rounded-lg shadow-sm backdrop-blur-sm">
      <p className="text-lg text-gray-700 mb-4">
        {selectedFilter === "All Y'all" 
          ? "No recipes found in the cookbook yet"
          : `No ${selectedFilter.toLowerCase()} recipes found`}
      </p>
      {user && selectedFilter === "All Y'all" && (
        <Button 
          onClick={() => navigate("/create-recipe")} 
          className="bg-[#FEC6A1] text-accent hover:bg-[#FDE1D3] transform transition-transform duration-200 hover:scale-105"
        >
          Share Your First Recipe
        </Button>
      )}
    </div>
  );
};