import { CookingPot, CakeSlice, Plus, User, Settings, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthButton } from "@/components/AuthButton";
import { useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";

interface RecipeHeaderProps {
  user: any;
  isAdmin: boolean;
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
}

export const RecipeHeader = ({ user, isAdmin, selectedFilter, onFilterChange }: RecipeHeaderProps) => {
  const navigate = useNavigate();
  
  const filters = [
    "All Y'all",
    "Comfort Food",
    "BBQ & Grilling",
    "Soul Food",
    "Country Breakfast",
    "Sweet Tea & Drinks",
    "Pies & Desserts"
  ];
  
  return (
    <div className="mb-12 bg-gradient-to-b from-[#FDE1D3] to-transparent pb-6">
      <div className="container mx-auto">
        <div className="flex items-center justify-between py-4 px-6">
          <div className="flex items-center gap-2">
            <CookingPot className="h-6 w-6 text-[#FEC6A1]" />
            <h2 className="text-xl font-display text-accent">Southern Comfort</h2>
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <>
                <Button 
                  onClick={() => navigate("/create-recipe")}
                  className="bg-[#FEC6A1] text-accent hover:bg-[#FDE1D3] transform transition-transform duration-200 hover:scale-105"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Share Your Recipe
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate("/profile")}
                  className="border-[#FEC6A1] text-accent hover:bg-[#FDE1D3]"
                >
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Button>
                {isAdmin && (
                  <Button 
                    variant="outline" 
                    onClick={() => navigate("/admin")}
                    className="border-[#FEC6A1] text-accent hover:bg-[#FDE1D3]"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Admin
                  </Button>
                )}
              </>
            )}
            <AuthButton user={user} />
          </div>
        </div>

        <div className="text-center max-w-3xl mx-auto mt-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <CookingPot className="h-8 w-8 text-[#FEC6A1]" />
            <h1 className="text-4xl font-bold text-accent font-display md:text-5xl lg:text-6xl">
              Southern Comfort Recipes
            </h1>
            <CakeSlice className="h-8 w-8 text-[#FEC6A1]" />
          </div>
          <p className="text-lg text-gray-700 font-light italic">
            "Where every recipe tells a story and every meal brings folks together"
          </p>
          <div className="mt-4 text-sm text-gray-600">
            From Grandma's kitchen to yours - sharing the flavors of the South
          </div>
        </div>

        <Separator className="my-8 bg-[#FEC6A1]/20" />

        <div className="flex items-center justify-center gap-4 flex-wrap px-4">
          {filters.map((filter) => (
            <Button
              key={filter}
              variant={selectedFilter === filter ? "default" : "outline"}
              onClick={() => onFilterChange(filter)}
              className={`
                rounded-full px-6 transition-all duration-200
                ${selectedFilter === filter 
                  ? 'bg-[#FEC6A1] text-accent hover:bg-[#FDE1D3]' 
                  : 'border-[#FEC6A1] text-accent hover:bg-[#FDE1D3]'
                }
              `}
            >
              {filter}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};