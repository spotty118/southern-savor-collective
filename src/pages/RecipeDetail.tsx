import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Home, Heart, Wand2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface Ingredient {
  item: string;
  unit: string;
  amount: number;
}

const RecipeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isLoved, setIsLoved] = useState(false);
  const [showAiDialog, setShowAiDialog] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<any>(null);

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

        // Ensure ingredients and instructions are arrays
        const formattedData = {
          ...data,
          ingredients: Array.isArray(data.ingredients) ? data.ingredients : [],
          instructions: Array.isArray(data.instructions) ? data.instructions : []
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
      } catch (error: any) {
        console.error("Error in fetchRecipe:", error);
        toast({
          title: "Error",
          description: "Failed to load recipe",
          variant: "destructive",
        });
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
    } catch (error: any) {
      console.error("Error handling favorite:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const enhanceRecipe = async (type: 'instructions' | 'description') => {
    if (!user) {
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
        recipe_id: id,
        user_id: user.id,
        original_content: content,
        enhanced_content: data.enhancedContent,
        content_type: type,
      };

      const { error: dbError } = await supabase
        .from('recipe_ai_suggestions')
        .insert(suggestion);

      if (dbError) throw dbError;

      setAiSuggestion(suggestion);
      setShowAiDialog(true);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to enhance recipe",
        variant: "destructive",
      });
    } finally {
      setEnhancing(false);
    }
  };

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
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="flex items-center gap-2"
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
            {user && (
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

        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden">
          <img
            src={
              recipe.image_url ||
              "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"
            }
            alt={recipe.title}
            className="w-full h-96 object-cover"
          />
          <div className="p-8">
            <h1 className="text-4xl font-display text-accent-foreground mb-4">
              {recipe.title}
            </h1>
            <p className="text-gray-600 mb-6 italic">
              By {recipe.author?.username || "Anonymous"}
            </p>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 mb-8">{recipe.description}</p>

              <div className="mb-8">
                <h2 className="text-2xl font-display text-accent-foreground mb-4">
                  Ingredients
                </h2>
                <ul className="list-disc pl-6 space-y-2">
                  {recipe.ingredients.map((ingredient: Ingredient, index: number) => (
                    <li key={index} className="text-gray-700">
                      {`${ingredient.amount} ${ingredient.unit} ${ingredient.item}`}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-display text-accent-foreground">
                    Instructions
                  </h2>
                  {user && (
                    <Button
                      variant="ghost"
                      onClick={() => enhanceRecipe("instructions")}
                      disabled={enhancing}
                      className="flex items-center gap-2"
                    >
                      <Wand2 className="h-4 w-4" />
                      Enhance with AI
                    </Button>
                  )}
                </div>
                <ol className="list-decimal pl-6 space-y-4">
                  {recipe.instructions.map((instruction: string, index: number) => (
                    <li key={index} className="text-gray-700">
                      {instruction}
                    </li>
                  ))}
                </ol>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500 border-t pt-4">
                <span>Cook Time: {recipe.cook_time}</span>
                <span className="text-[#FEC6A1] font-medium">
                  Difficulty: {recipe.difficulty}
                </span>
              </div>
            </div>
          </div>
        </div>

        <Dialog open={showAiDialog} onOpenChange={setShowAiDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>AI Enhanced Version</DialogTitle>
              <DialogDescription>
                Here's an AI-enhanced version of your recipe content. Would you
                like to apply these changes?
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium mb-2">Enhanced Content:</h3>
                <p className="text-gray-700">{aiSuggestion?.enhanced_content}</p>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowAiDialog(false)}>
                  Keep Original
                </Button>
                <Button
                  onClick={async () => {
                    try {
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
                    } catch (error: any) {
                      toast({
                        title: "Error",
                        description: error.message,
                        variant: "destructive",
                      });
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