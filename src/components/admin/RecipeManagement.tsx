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
import { ChangeOwnerDialog } from "./ChangeOwnerDialog";
import { RecipeTable } from "./RecipeTable";

interface Recipe {
  id: string;
  title: string;
  author: { 
    id: string;
    username: string | null;
    full_name: string | null;
  } | null;
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
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [showOwnerDialog, setShowOwnerDialog] = useState(false);
  
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

  const handleChangeOwner = (recipeId: string) => {
    console.log("Changing owner for recipe:", recipeId);
    const recipe = recipes.find(r => r.id === recipeId);
    
    if (!recipe) {
      console.error("Recipe not found:", recipeId);
      toast({
        title: "Error",
        description: "Recipe not found",
        variant: "destructive",
      });
      return;
    }

    setSelectedRecipe(recipe);
    setShowOwnerDialog(true);
  };

  const handleUpdateOwner = async (newOwnerId: string) => {
    if (!selectedRecipe || !isAdmin) {
      console.error("Cannot update owner: missing recipe or not admin");
      throw new Error("Unauthorized or invalid recipe");
    }

    console.log("Updating owner", {
      recipeId: selectedRecipe.id,
      newOwnerId,
      currentOwnerId: selectedRecipe.author?.id || null
    });

    const { error } = await supabase
      .from("recipes")
      .update({ 
        author_id: newOwnerId,
        updated_at: new Date().toISOString()
      })
      .eq("id", selectedRecipe.id);

    if (error) {
      console.error("Error updating recipe owner:", error);
      throw error;
    }

    setShowOwnerDialog(false);
    setSelectedRecipe(null);

    // Reload the page to refresh the recipes list
    window.location.reload();
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
          onChangeOwner={handleChangeOwner}
          onDelete={handleDeleteRecipe}
        />
        {showOwnerDialog && (
          <ChangeOwnerDialog
            open={showOwnerDialog}
            onClose={() => {
              setShowOwnerDialog(false);
              setSelectedRecipe(null);
            }}
          />
        )}
      </CardContent>
    </Card>
  );
};