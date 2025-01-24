import { Button } from "@/components/ui/button";
import { Tables } from "@/integrations/supabase/types";

interface RecipeCategoriesProps {
  categories: Tables<"categories">[];
  selectedCategories: string[];
  setSelectedCategories: (categories: string[]) => void;
}

export const RecipeCategories = ({
  categories,
  selectedCategories,
  setSelectedCategories,
}: RecipeCategoriesProps) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Categories</label>
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category.id}
            type="button"
            variant={selectedCategories.includes(category.id) ? "default" : "outline"}
            onClick={() => {
              setSelectedCategories(prev =>
                prev.includes(category.id)
                  ? prev.filter(id => id !== category.id)
                  : [...prev, category.id]
              );
            }}
            className={`
              rounded-full px-4 py-2 text-sm
              ${selectedCategories.includes(category.id)
                ? 'bg-[#FEC6A1] text-accent hover:bg-[#FDE1D3]'
                : 'border-[#FEC6A1] text-accent hover:bg-[#FDE1D3]'
              }
            `}
          >
            {category.name}
          </Button>
        ))}
      </div>
    </div>
  );
};