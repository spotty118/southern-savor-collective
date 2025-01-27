import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import type { AISuggestionRow } from "@/types/supabase";

export const useRecipeActions = (
  id: string | undefined,
  user: { id: string } | null,
  recipe: any | null,
  setRecipe: (recipe: any) => void
) => {
  const navigate = useNavigate();
  const [isLoved, setIsLoved] = useState(false);
  const [showAiDialog, setShowAiDialog] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<Partial<AISuggestionRow> | null>(null);

  const handleLoveClick = async () => {
    if (!user) {
      toast({
        title: "Please login",
        description: "You need to be logged in to favorite recipes",
      });
      navigate("/auth");
      return;
    }

    try {
      if (isLoved) {
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("recipe_id", id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("favorites")
          .insert({
            user_id: user.id,
            recipe_id: id,
          });

        if (error) throw error;
      }
      setIsLoved(!isLoved);
    } catch (error) {
      console.error("Error handling favorite:", error);
      if (error instanceof Error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  };

  const enhanceRecipe = async (type: 'instructions' | 'description') => {
    if (!user || !recipe) {
      toast({
        title: "Please login",
        description: "You need to be logged in to use AI enhancement",
      });
      navigate("/auth");
      return;
    }

    setEnhancing(true);
    try {
      const content = type === 'instructions' 
        ? recipe.instructions.join('\n') 
        : recipe.description;

      const { data, error } = await supabase.functions.invoke('enhance-recipe', {
        body: { content, type },
      });

      if (error) throw error;

      const suggestion = {
        recipe_id: id!,
        user_id: user.id,
        original_content: content ?? '',
        enhanced_content: data.enhancedContent,
        content_type: type,
        is_applied: false
      };

      const { error: dbError } = await supabase
        .from('recipe_ai_suggestions')
        .insert(suggestion);

      if (dbError) throw dbError;

      setAiSuggestion(suggestion);
      setShowAiDialog(true);
    } catch (error) {
      console.error("Error enhancing recipe:", error);
      if (error instanceof Error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setEnhancing(false);
    }
  };

  const handleApplyChanges = async () => {
    try {
      if (!recipe || !aiSuggestion || !aiSuggestion.enhanced_content) return;

      const updates =
        aiSuggestion.content_type === "instructions"
          ? {
              instructions: aiSuggestion.enhanced_content
                .split("\n")
                .filter(Boolean),
            }
          : { description: aiSuggestion.enhanced_content };

      const { error } = await supabase
        .from("recipes")
        .update(updates)
        .eq("id", recipe.id);

      if (error) throw error;

      await supabase
        .from("recipe_ai_suggestions")
        .update({ is_applied: true })
        .eq("id", aiSuggestion.id);

      setRecipe({ ...recipe, ...updates });
      setShowAiDialog(false);
      toast({
        title: "Success",
        description: "Recipe updated with AI suggestions",
      });
    } catch (error) {
      if (error instanceof Error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  };

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from("recipes")
        .delete()
        .eq("id", recipe?.id);

      if (error) throw error;

      navigate("/");
      toast({
        title: "Success",
        description: "Recipe deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting recipe:", error);
      if (error instanceof Error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  };

  const handleEdit = () => {
    navigate(`/recipe/${id}/edit`);
  };

  return {
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
  };
};