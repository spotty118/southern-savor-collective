import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RecipeTable } from "./RecipeTable";

interface Recipe {
  id: string;
  title: string;
  author: { 
    id: string;
    username: string | null;
  };
  created_at: string;
}

interface RecipeManagementProps {
  recipes: Recipe[];
  onDeleteRecipe: (recipeId: string) => void;
  currentUserId: string;
  isAdmin: boolean;
}

export const RecipeManagement = ({ 
  recipes, 
  onDeleteRecipe, 
  currentUserId, 
  isAdmin 
}: RecipeManagementProps) => {
  const navigate = useNavigate();
  const [shareableLink, setShareableLink] = useState<string>("");
  
  const handleDeleteRecipe = async (recipeId: string) => {
    try {
      const { error } = await supabase
        .from("recipes")
        .delete()
        .eq("id", recipeId);

      if (error) throw error;

      onDeleteRecipe(recipeId);
      toast({
        title: "Success",
        description: "Recipe deleted successfully",
      });
    } catch (error: any) {
      console.error("Error deleting recipe:", error);
      toast({
        title: "Error",
        description: "Failed to delete recipe",
        variant: "destructive",
      });
    }
  };

  const generateShareableLink = (recipeId: string) => {
    setShareableLink("");
    const link = `${window.location.origin}/recipe/${recipeId}`;
    setShareableLink(link);
    navigator.clipboard.writeText(link);
    toast({
      title: "Link Copied!",
      description: "Shareable link has been copied to your clipboard",
    });
  };

  const handleAddNewRecipe = () => {
    setShareableLink("");
    navigate("/create-recipe");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Recipe Management</span>
          <Button 
            variant="outline" 
            onClick={handleAddNewRecipe}
          >
            Add New Recipe
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <RecipeTable
          recipes={recipes}
          currentUserId={currentUserId}
          isAdmin={isAdmin}
          onShare={generateShareableLink}
          onView={(id) => navigate(`/recipe/${id}`)}
          onEdit={(id) => navigate(`/recipe/${id}/edit`)}
          onDelete={handleDeleteRecipe}
        />
      </CardContent>
    </Card>
  );
};