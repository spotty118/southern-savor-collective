import { useParams } from "react-router-dom";
import { RecipeDetailHeader } from "@/components/recipe/RecipeDetailHeader";
import { RecipeDetailContent } from "@/components/recipe/RecipeDetailContent";
import { AIEnhancementDialog } from "@/components/recipe/AIEnhancementDialog";
import { RecipeDetailSkeleton } from "@/components/recipe/detail/RecipeDetailSkeleton";
import { RecipeNotFound } from "@/components/recipe/detail/RecipeNotFound";
import { useRecipeDetail } from "@/components/recipe/detail/useRecipeDetail";

const RecipeDetail = () => {
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
  } = useRecipeDetail(id);

  if (loading) {
    return <RecipeDetailSkeleton />;
  }

  if (!recipe) {
    return <RecipeNotFound />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FDE1D3] to-[#FDFCFB] p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <RecipeDetailHeader
          isLoved={isLoved}
          onLoveClick={handleLoveClick}
          isRecipeOwner={isRecipeOwner}
          onEnhanceClick={() => enhanceRecipe("description")}
          enhancing={enhancing}
        />

        <RecipeDetailContent
          recipe={recipe}
          currentUserId={user?.id || null}
          isAdmin={isAdmin}
          isEditor={isEditor}
          onDelete={handleDelete}
          onEdit={handleEdit}
          isRecipeOwner={isRecipeOwner}
          onEnhanceInstructions={() => enhanceRecipe("instructions")}
          enhancing={enhancing}
        />

        <AIEnhancementDialog
          open={showAiDialog}
          onOpenChange={setShowAiDialog}
          enhancedContent={aiSuggestion?.enhanced_content}
          onApplyChanges={handleApplyChanges}
        />
      </div>
    </div>
  );
};

export default RecipeDetail;