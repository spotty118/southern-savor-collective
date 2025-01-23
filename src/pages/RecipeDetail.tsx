import * as React from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { Home, Heart, Wand2 } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import type { Database } from "@/integrations/supabase/types"

type RecipeRow = Database['public']['Tables']['recipes']['Row']
type AISuggestionRow = Database['public']['Tables']['recipe_ai_suggestions']['Row']

interface Ingredient {
  item: string;
  unit: string;
  amount: number;
}

const isIngredient = (item: unknown): item is Ingredient => {
  if (!item || typeof item !== 'object') return false;
  
  const candidate = item as Record<string, unknown>;
  return (
    'item' in candidate &&
    'unit' in candidate &&
    'amount' in candidate &&
    typeof candidate.item === 'string' &&
    typeof candidate.unit === 'string' &&
    typeof candidate.amount === 'number'
  );
};

interface RecipeData extends Omit<RecipeRow, 'ingredients' | 'instructions'> {
  ingredients: Ingredient[];
  instructions: string[];
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

        // Validate and convert ingredients array
        const ingredients = Array.isArray(data.ingredients)
          ? data.ingredients.filter(isIngredient)
          : [];

        // Validate instructions array
        const instructions = Array.isArray(data.instructions)
          ? data.instructions.filter((item): item is string => typeof item === 'string')
          : [];

        // Type assert and format the data
        const formattedData: RecipeData = {
          ...data,
          ingredients,
          instructions,
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
        <div className="mb-6 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="flex items-center gap-2 hover:bg-[hsl(var(--vintage-cream))]"
          >
            <Home className="h-4 w-4" />
            Back to Home
          </Button>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="bg-white/90 hover:bg-white"
              onClick={handleLoveClick}
            >
              <Heart
                className={`h-5 w-5 ${
                  isLoved ? "fill-red-500 text-red-500" : "text-gray-500"
                }`}
              />
            </Button>
            {isRecipeOwner && (
              <Button
                variant="ghost"
                size="icon"
                className="bg-white/90 hover:bg-white"
                onClick={() => enhanceRecipe("description")}
                disabled={enhancing}
              >
                <Wand2 className="h-5 w-5 text-[#FEC6A1]" />
              </Button>
            )}
          </div>
        </div>

        <div className="vintage-paper rounded-lg shadow-lg overflow-hidden">
          <img
            src={
              recipe.image_url ||
              "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"
            }
            alt={recipe.title}
            className="w-full h-96 object-cover"
          />
          <div className="p-8">
            <h1 className="text-4xl font-display text-accent-foreground mb-4 heading-underline">
              {recipe.title}
            </h1>
            <p className="text-gray-600 mb-6 font-script text-xl">
              By {recipe.author?.username || "Anonymous"}
            </p>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 mb-8">{recipe.description}</p>

              <div className="mb-8">
                <h2 className="text-2xl font-display text-accent-foreground mb-4 heading-underline">
                  Ingredients
                </h2>
                <ul className="list-disc pl-6 space-y-2 marker:text-[#FEC6A1]">
                  {recipe.ingredients.map((ingredient, index) => (
                    <li key={index} className="text-gray-700">
                      {`${ingredient.amount} ${ingredient.unit} ${ingredient.item}`}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-display text-accent-foreground heading-underline">
                    Instructions
                  </h2>
                  {isRecipeOwner && (
                    <Button
                      variant="ghost"
                      onClick={() => enhanceRecipe("instructions")}
                      disabled={enhancing}
                      className="flex items-center gap-2 hover:bg-[hsl(var(--vintage-cream))]"
                    >
                      <Wand2 className="h-4 w-4" />
                      Enhance with AI
                    </Button>
                  )}
                </div>
                <ol className="list-decimal pl-6 space-y-4">
                  {recipe.instructions.map((instruction, index) => (
                    <li key={index} className="text-gray-700">
                      {instruction}
                    </li>
                  ))}
                </ol>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500 border-t pt-4">
                <span className="font-script text-lg">Cook Time: {String(recipe.cook_time)}</span>
                <span className="font-script text-lg text-[#FEC6A1]">
                  Difficulty: {recipe.difficulty}
                </span>
              </div>
            </div>
          </div>
        </div>

        <Dialog open={showAiDialog} onOpenChange={setShowAiDialog}>
          <DialogContent className="vintage-paper">
            <DialogHeader>
              <DialogTitle className="font-display">AI Enhanced Version</DialogTitle>
              <DialogDescription>
                Here's an AI-enhanced version of your recipe content. Would you
                like to apply these changes?
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 space-y-4">
              <div className="p-4 bg-white/50 rounded-lg">
                <h3 className="font-display font-medium mb-2">Enhanced Content:</h3>
                <p className="text-gray-700">{aiSuggestion?.enhanced_content}</p>
              </div>
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowAiDialog(false)}
                  className="hover:bg-[hsl(var(--vintage-cream))] hover:text-accent-foreground"
                >
                  Keep Original
                </Button>
                <Button
                  onClick={async () => {
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
                  }}
                >
                  Apply Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default RecipeDetail;
