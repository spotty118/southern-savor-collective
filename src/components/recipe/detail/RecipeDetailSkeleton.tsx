import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const RecipeDetailSkeleton = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FDE1D3] to-[#FDFCFB] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-white/50 rounded w-3/4" />
          <div className="h-64 bg-white/50 rounded" />
          <div className="space-y-2">
            <div className="h-4 bg-white/50 rounded w-1/2" />
            <div className="h-4 bg-white/50 rounded w-3/4" />
          </div>
        </div>
      </div>
    </div>
  );
};