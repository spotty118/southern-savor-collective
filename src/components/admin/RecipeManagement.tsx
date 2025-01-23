import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Share2, BookX, Edit2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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

export const RecipeManagement = ({ recipes, onDeleteRecipe, currentUserId, isAdmin }: RecipeManagementProps) => {
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
    const link = `${window.location.origin}/recipe/${recipeId}`;
    setShareableLink(link);
    navigator.clipboard.writeText(link);
    toast({
      title: "Link Copied!",
      description: "Shareable link has been copied to your clipboard",
    });
  };

  const canEditRecipe = (authorId: string) => {
    return isAdmin || currentUserId === authorId;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recipe Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Recipe
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Author
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recipes.map((recipe) => (
                <tr key={recipe.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {recipe.title}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {recipe.author?.username || "Anonymous"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(recipe.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => generateShareableLink(recipe.id)}
                      >
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                      {canEditRecipe(recipe.author?.id) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/recipe/${recipe.id}/edit`)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Edit2 className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      )}
                      {(isAdmin || currentUserId === recipe.author?.id) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteRecipe(recipe.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <BookX className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};