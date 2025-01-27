import { useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { RecipeDetailHeader } from "@/components/recipe/RecipeDetailHeader";
import { RecipeDetailContent } from "@/components/recipe/RecipeDetailContent";
import { AIEnhancementDialog } from "@/components/recipe/AIEnhancementDialog";
import { RecipeDetailSkeleton } from "@/components/recipe/detail/RecipeDetailSkeleton";
import { RecipeNotFound } from "@/components/recipe/detail/RecipeNotFound";
import { useRecipeDetail } from "@/components/recipe/detail/useRecipeDetail";

const RecipeDetail = () => {
  const [isEditMode, setIsEditMode] = useState(false);
  const { id } = useParams();
  const {
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
  } = useRecipeDetail(id);

  if (loading) {
    return <RecipeDetailSkeleton />;
  }

  if (!recipe) {
    return <RecipeNotFound />;
  }

  const canModify = isAdmin || isEditor || isRecipeOwner;
  const toggleEditMode = () => {
    setIsEditMode(prev => !prev);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FDE1D3] to-[#FDFCFB] p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <RecipeDetailHeader
          isLoved={isLoved}
          onLoveClick={handleLoveClick}
          isRecipeOwner={isRecipeOwner}
          onEnhanceClick={() => enhanceRecipe("description")}
          enhancing={enhancing}
          canModify={canModify}
          isEditMode={isEditMode}
          onToggleEditMode={toggleEditMode}
        />

        <RecipeDetailContent
          recipe={{
            ...recipe,
            author: recipe.author || { username: null },
          }}
          currentUserId={user?.id || null}
          isAdmin={isAdmin}
          isEditor={isEditor}
          onDelete={handleDelete}
          onEdit={handleEdit}
          isRecipeOwner={isRecipeOwner}
          onEnhanceInstructions={() => enhanceRecipe("instructions")}
          enhancing={enhancing}
          isEditMode={isEditMode}
        />

        <AIEnhancementDialog
          open={showAiDialog}
          onOpenChange={setShowAiDialog}
          enhancedContent={aiSuggestion?.enhanced_content}
          onApplyChanges={handleApplyChanges}
        />

        {recipe.location_name && (
          <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Location</h2>
            <p className="text-gray-700">{recipe.location_name}</p>
            <Button onClick={shareRecipeLocation}>Share Location</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipeDetail;