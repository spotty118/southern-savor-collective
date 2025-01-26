import React from 'react';
import { useRecipeData } from '@/hooks/recipe/useRecipeData';
import { RecipeErrorBoundary } from './RecipeErrorBoundary';
import { RecipeDetailContent } from './RecipeDetailContent';
import { RecipeDetailSkeleton } from './detail/RecipeDetailSkeleton';
import { adaptRecipeToLegacy } from '@/adapters/RecipeAdapter';
import { useRecipeUser } from '@/hooks/recipe/useRecipeUser';
import { recipeService } from '@/services/RecipeService';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

interface RecipeDetailContainerProps {
  id: string;
}

export const RecipeDetailContainer: React.FC<RecipeDetailContainerProps> = ({ id }) => {
  const navigate = useNavigate();
  const [enhancing, setEnhancing] = React.useState(false);
  const { recipe, loading, error } = useRecipeData(id);
  const { user, isAdmin, isEditor } = useRecipeUser();

  // Show loading skeleton while fetching data
  if (loading) {
    return <RecipeDetailSkeleton />;
  }

  // Show error state if there's an error
  if (error) {
    throw error; // This will be caught by the error boundary
  }

  // Show not found state if no recipe
  if (!recipe) {
    return null;
  }

  const handleDelete = async () => {
    try {
      await recipeService.deleteRecipe(recipe.id);
      toast({
        title: "Success",
        description: "Recipe deleted successfully",
      });
      navigate('/dashboard');
    } catch (error) {
      console.error('Error deleting recipe:', error);
      toast({
        title: "Error",
        description: "Failed to delete recipe",
        variant: "destructive",
      });
    }
  };

  const handleEdit = () => {
    navigate(`/recipe/${recipe.id}/edit`);
  };

  const handleEnhanceInstructions = async () => {
    if (!recipe.instructions.length) return;

    setEnhancing(true);
    try {
      const enhancedContent = await recipeService.enhanceRecipe(
        recipe.id,
        recipe.instructions.join('\n'),
        'instructions'
      );

      toast({
        title: "Success",
        description: "Instructions enhanced successfully",
      });

      return enhancedContent;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to enhance instructions",
        variant: "destructive",
      });
    } finally {
      setEnhancing(false);
    }
  };

  return (
    <RecipeErrorBoundary>
      <RecipeDetailContent 
        recipe={adaptRecipeToLegacy(recipe)}
        currentUserId={user?.id ?? null}
        isAdmin={isAdmin}
        isEditor={isEditor}
        isRecipeOwner={user?.id === recipe.author.id}
        onDelete={handleDelete}
        onEdit={handleEdit}
        onEnhanceInstructions={handleEnhanceInstructions}
        enhancing={enhancing}
      />
    </RecipeErrorBoundary>
  );
};