import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import type { Database } from "@/integrations/supabase/types";
import type { AISuggestionRow } from "@/types/supabase";

type RecipeRow = Database['public']['Tables']['recipes']['Row'];

interface Ingredient {
  item: string;
  unit: string;
  amount: string;
}

interface RecipeData extends Omit<RecipeRow, 'ingredients' | 'instructions' | 'cook_time'> {
  ingredients: Ingredient[];
  instructions: string[];
  cook_time: string;
  author?: {
    username: string | null;
  };
}

export const useRecipeDetail = (id: string | undefined) => {
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState<RecipeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [isLoved, setIsLoved] = useState(false);
  const [showAiDialog, setShowAiDialog] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<Partial<AISuggestionRow> | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditor, setIsEditor] = useState(false);

  useEffect(() => {
    const fetchUserRoles = async () => {
      if (!user) return;
      
      try {
        const { data: roles, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        if (error) throw error;

        if (roles) {
          setIsAdmin(roles.some(role => role.role === 'admin'));
          setIsEditor(roles.some(role => role.role === 'editor'));
        }
      } catch (error) {
        console.error('Error fetching user roles:', error);
      }
    };

    fetchUserRoles();
  }, [user]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const { data, error } = await supabase
          .from("recipes")
          .select(`
            *,
            author:profiles(username)
          `)
          .eq("id", id)
          .single();

        if (error) throw error;

        // Type guard to ensure ingredients is an array and has the correct shape
        const ingredients = Array.isArray(data.ingredients) 
          ? data.ingredients.map(ingredient => {
              if (typeof ingredient === 'object' && ingredient !== null) {
                const typedIngredient = ingredient as Record<string, unknown>;
                return {
                  amount: String(typedIngredient.amount || ''),
                  unit: String(typedIngredient.unit || ''),
                  item: String(typedIngredient.item || '')
                };
              }
              return { amount: '', unit: '', item: '' };
            })
          : [];

        const formattedData: RecipeData = {
          ...data,
          ingredients,
          instructions: Array.isArray(data.instructions) 
            ? data.instructions.filter((item): item is string => typeof item === 'string')
            : [],
          cook_time: data.cook_time?.toString() || '',
          author: data.author as { username: string | null }
        };

        setRecipe(formattedData);

        if (user) {
          const { data: favoriteData, error: favoriteError } = await supabase
            .from("favorites")
            .select("*")
            .eq("recipe_id", id)
            .eq("user_id", user.id)
            .maybeSingle();

          if (favoriteError) {
            console.error("Error fetching favorite status:", favoriteError);
            return;
          }

          setIsLoved(!!favoriteData);
        }
      } catch (error) {
        console.error("Error in fetchRecipe:", error);
        if (error instanceof Error) {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id, user]);

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
  };
};