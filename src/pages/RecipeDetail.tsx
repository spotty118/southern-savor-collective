import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { RecipeDetailHeader } from "@/components/recipe/RecipeDetailHeader";
import { RecipeDetailContent } from "@/components/recipe/RecipeDetailContent";
import { AIEnhancementDialog } from "@/components/recipe/AIEnhancementDialog";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type RecipeRow = Database['public']['Tables']['recipes']['Row']
type AISuggestionRow = Database['public']['Tables']['recipe_ai_suggestions']['Row']

interface Ingredient {
  item: string;
  unit: string;
  amount: number | string; // Updated to accept both number and string
}

const isIngredient = (item: unknown): item is Ingredient => {
  if (typeof item !== 'object' || item === null) return false;
  const ingredient = item as Record<string, unknown>;
  return (
    typeof ingredient.item === 'string' &&
    typeof ingredient.unit === 'string' &&
    (typeof ingredient.amount === 'string' || typeof ingredient.amount === 'number')
  );
};

interface RecipeData extends Omit<RecipeRow, 'ingredients' | 'instructions' | 'cook_time'> {
  ingredients: Ingredient[];
  instructions: string[];
  cook_time: string;
  author?: {
    username: string | null;
  };
}

type User = {
  id: string;
};

const RecipeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState<RecipeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isLoved, setIsLoved] = useState(false);
  const [showAiDialog, setShowAiDialog] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<Partial<AISuggestionRow> | null>(null);

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

        if (error) {
          console.error("Error fetching recipe:", error);
          throw error;
        }

        // Parse and validate ingredients
        const rawIngredients = data.ingredients as unknown[];
        const validatedIngredients = rawIngredients.filter((item): item is Ingredient => {
          if (!isIngredient(item)) {
            console.warn('Invalid ingredient found:', item);
            return false;
          }
          return true;
        });

        // Format the data
        const formattedData: RecipeData = {
          ...data,
          ingredients: validatedIngredients,
          instructions: Array.isArray(data.instructions) 
            ? data.instructions.filter((item): item is string => typeof item === 'string')
            : [],
          cook_time: data.cook_time?.toString() || '',
          author: data.author as { username: string | null }
        };

        setRecipe(formattedData);

        // Check if recipe is loved by current user
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

      const suggestion: Omit<AISuggestionRow, 'id' | 'created_at'> = {
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

  const isRecipeOwner = user && recipe && user.id === recipe.author_id;

  if (loading) {
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
  }

  if (!recipe) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FDE1D3] to-[#FDFCFB] p-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-display text-accent-foreground">
            Recipe not found
          </h1>
          <Button onClick={() => navigate("/")} className="mt-4">
            <Home className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </div>
    );
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
