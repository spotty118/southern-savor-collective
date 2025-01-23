import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

interface RecipeFiltersProps {
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
}

export const RecipeFilters = ({ selectedFilter, onFilterChange }: RecipeFiltersProps) => {
  const [categories, setCategories] = useState<Tables<"categories">[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from("categories")
          .select("*")
          .order("name");

        if (error) throw error;
        setCategories(data || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return <div className="flex justify-center py-4">Loading categories...</div>;
  }

  const filters = ["All Y'all", ...(categories?.map(cat => cat.name) || [])];
  
  return (
    <div className="flex items-center justify-center gap-4 flex-wrap px-4 mb-8">
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