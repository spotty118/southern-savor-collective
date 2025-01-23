import { Button } from "@/components/ui/button";

interface RecipeFiltersProps {
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
}

export const RecipeFilters = ({ selectedFilter, onFilterChange }: RecipeFiltersProps) => {
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
  );
};