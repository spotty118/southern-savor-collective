import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Tables, Json } from "@/integrations/supabase/types";
import { RecipeBasicInfo } from "@/components/recipe/RecipeBasicInfo";
import { RecipeCategories } from "@/components/recipe/RecipeCategories";
import { IngredientsList } from "@/components/recipe/IngredientsList";
import { InstructionsList } from "@/components/recipe/InstructionsList";

interface Ingredient {
  item: string;
  amount: string;
  unit: string;
  [key: string]: string;
}

const EditRecipe = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [cookTime, setCookTime] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { item: "", amount: "", unit: "" },
  ]);
  const [instructions, setInstructions] = useState<string[]>([""]);
  const [categories, setCategories] = useState<Tables<"categories">[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from("categories")
          .select("*")
          .order("name");

        if (error) throw error;
        setCategories(data || []);
      } catch (error: any) {
        console.error("Error fetching categories:", error);
        toast({
          title: "Error",
          description: "Failed to load categories",
          variant: "destructive",
        });
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const { data: recipe, error } = await supabase
          .from("recipes")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;

        if (recipe) {
          setTitle(recipe.title || "");
          setDescription(recipe.description || "");
          setCookTime(recipe.cook_time?.toString() || "");
          setDifficulty(recipe.difficulty || "");
          setImageUrl(recipe.image_url || "");
          setIngredients((recipe.ingredients as Ingredient[]) || [
            { item: "", amount: "", unit: "" },
          ]);
          setInstructions((recipe.instructions as string[]) || [""]);

          const { data: categoryData, error: categoryError } = await supabase
            .from("recipe_categories")
            .select("category_id")
            .eq("recipe_id", id);

          if (categoryError) throw categoryError;

          setSelectedCategories(categoryData?.map((c) => c.category_id) || []);
        }
      } catch (error: any) {
        console.error("Error fetching recipe:", error);
        toast({
          title: "Error",
          description: "Failed to load recipe",
          variant: "destructive",
        });
        navigate("/");
      }
    };

    if (id) {
      fetchRecipe();
    }
  }, [id, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast({
          title: "Please login",
          description: "You need to be logged in to edit recipes",
        });
        navigate("/auth");
        return;
      }

      const { error: recipeError } = await supabase
        .from("recipes")
        .update({
          title,
          description,
          cook_time: cookTime,
          difficulty,
          image_url: imageUrl,
          ingredients: ingredients as Json,
          instructions: instructions.filter(Boolean) as Json,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (recipeError) throw recipeError;

      const { error: deleteError } = await supabase
        .from("recipe_categories")
        .delete()
        .eq("recipe_id", id);

      if (deleteError) throw deleteError;

      if (selectedCategories.length > 0) {
        const { error: categoryError } = await supabase
          .from("recipe_categories")
          .insert(
            selectedCategories.map((categoryId) => ({
              recipe_id: id,
              category_id: categoryId,
            }))
          );

        if (categoryError) throw categoryError;
      }

      toast({
        title: "Success!",
        description: "Your recipe has been updated",
      });
      navigate(`/recipe/${id}`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddIngredient = () => {
    setIngredients([...ingredients, { item: "", amount: "", unit: "" }]);
  };

  const handleRemoveIngredient = (index: number) => {
    const newIngredients = ingredients.filter((_, i) => i !== index);
    setIngredients(newIngredients);
  };

  const handleIngredientChange = (
    index: number,
    field: keyof Ingredient,
    value: string
  ) => {
    const newIngredients = [...ingredients];
    newIngredients[index][field] = value;
    setIngredients(newIngredients);
  };

  const handleAddInstruction = () => {
    setInstructions([...instructions, ""]);
  };

  const handleRemoveInstruction = (index: number) => {
    const newInstructions = instructions.filter((_, i) => i !== index);
    setInstructions(newInstructions);
  };

  const handleInstructionChange = (index: number, value: string) => {
    const newInstructions = [...instructions];
    newInstructions[index] = value;
    setInstructions(newInstructions);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FDE1D3] to-[#FDFCFB] px-4 py-8">
      <div className="container mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-accent-foreground font-display">
            Edit Recipe
          </h1>
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            Back to Home
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <RecipeBasicInfo
            title={title}
            setTitle={setTitle}
            description={description}
            setDescription={setDescription}
            cookTime={cookTime}
            setCookTime={setCookTime}
            difficulty={difficulty}
            setDifficulty={setDifficulty}
            imageUrl={imageUrl}
            setImageUrl={setImageUrl}
            onDescriptionEnhancement={(enhanced) => {
              if (enhanced.length > 0) {
                setDescription(enhanced[0]);
              }
            }}
          />

          <RecipeCategories
            categories={categories}
            selectedCategories={selectedCategories}
            setSelectedCategories={setSelectedCategories}
          />

          <IngredientsList
            ingredients={ingredients}
            onAddIngredient={handleAddIngredient}
            onRemoveIngredient={handleRemoveIngredient}
            onIngredientChange={handleIngredientChange}
          />

          <InstructionsList
            instructions={instructions}
            onAddInstruction={handleAddInstruction}
            onRemoveInstruction={handleRemoveInstruction}
            onInstructionChange={handleInstructionChange}
            onInstructionsEnhancement={(enhanced) => {
              if (enhanced.length > 0) {
                setInstructions(enhanced);
              }
            }}
          />

          <Button
            type="submit"
            className="w-full bg-[#FEC6A1] text-accent-foreground hover:bg-[#FDE1D3]"
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Recipe"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default EditRecipe;