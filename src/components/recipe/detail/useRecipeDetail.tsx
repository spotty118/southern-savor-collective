import { useRecipeUser } from "@/hooks/recipe/useRecipeUser";
import { useRecipeData } from "@/hooks/recipe/useRecipeData";
import { useRecipeActions } from "@/hooks/recipe/useRecipeActions";

export const useRecipeDetail = (id: string | undefined) => {
  const { user, isAdmin, isEditor } = useRecipeUser();
  const { recipe, loading, setRecipe } = useRecipeData(id);
  const {
    isLoved,
    showAiDialog,
    enhancing,
    aiSuggestion,
    setShowAiDialog,
    handleLoveClick,
    enhanceRecipe,
    handleApplyChanges,
    handleDelete,
    handleEdit,
    shareRecipeLocation,
  } = useRecipeActions(id, user, recipe, setRecipe);

  const isRecipeOwner = user && recipe && user.id === recipe.author_id;

  return {
    recipe,
    loading,
    user,
    isLoved,
    showAiDialog,
    enhancing,
    aiSuggestion,
    isAdmin,
    isEditor,
    isRecipeOwner,
    handleLoveClick,
    enhanceRecipe,
    handleApplyChanges,
    handleDelete,
    handleEdit,
    setShowAiDialog,
    shareRecipeLocation,
  };
};