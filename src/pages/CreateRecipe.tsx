import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

const CreateRecipe = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("Classic Baked Macaroni and Cheese");
  const [description, setDescription] = useState("A comforting Southern classic with perfectly cooked macaroni in a rich, creamy cheese sauce, baked until golden and bubbly.");
  const [cookTime, setCookTime] = useState("35 minutes");
  const [difficulty, setDifficulty] = useState("Medium");
  const [imageUrl, setImageUrl] = useState("");
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { item: "elbow macaroni", amount: "8", unit: "oz" },
    { item: "milk", amount: "2", unit: "cups" },
    { item: "butter", amount: "2", unit: "Tbsp" },
    { item: "all-purpose flour", amount: "2", unit: "Tbsp" },
    { item: "salt", amount: "1/2", unit: "tsp" },
    { item: "black pepper", amount: "1/4", unit: "tsp" },
    { item: "extra sharp Cheddar cheese", amount: "10", unit: "oz" },
    { item: "ground red pepper", amount: "1/4", unit: "tsp" },
  ]);
  const [instructions, setInstructions] = useState([
    "Preheat oven to 400°F. Prepare pasta according to package directions. Grease a 2-qt. baking dish with cooking spray.",
    "Microwave milk at HIGH for 1 1/2 minutes. Melt butter in a large skillet or Dutch oven over medium-low heat; whisk in flour until smooth. Cook, whisking constantly, 1 minute.",
    "Gradually whisk in warm milk, and cook, whisking constantly, 5 minutes or until thickened.",
    "Whisk in salt, black pepper, 1 cup shredded cheese, and, if desired, red pepper until smooth.",
    "Stir in hot cooked pasta. Spoon pasta mixture into prepared dish; top with remaining cheese.",
    "Bake at 400°F for 20 minutes or until golden and bubbly."
  ]);
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

  const handleAddIngredient = () => {
    setIngredients([...ingredients, { item: "", amount: "", unit: "" }]);
  };

  const handleRemoveIngredient = (index: number) => {
    const newIngredients = ingredients.filter((_, i) => i !== index);
    setIngredients(newIngredients);
  };

  const handleIngredientChange = (index: number, field: keyof Ingredient, value: string) => {
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
          description: "You need to be logged in to create recipes",
        });
        navigate("/auth");
        return;
      }

      const { data: recipe, error: recipeError } = await supabase
        .from("recipes")
        .insert({
          title,
          description,
          cook_time: cookTime,
          difficulty,
          image_url: imageUrl,
          ingredients: ingredients as unknown as Json,
          instructions: instructions as unknown as Json,
          author_id: user.id,
        })
        .select()
        .single();

      if (recipeError) throw recipeError;

      if (selectedCategories.length > 0 && recipe) {
        const { error: categoryError } = await supabase
          .from("recipe_categories")
          .insert(
            selectedCategories.map(categoryId => ({
              recipe_id: recipe.id,
              category_id: categoryId
            }))
          );

        if (categoryError) throw categoryError;
      }

      toast({
        title: "Success!",
        description: "Your recipe has been created",
      });
      navigate("/");
    } catch (error: any) {
      console.error("Error creating recipe:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FDE1D3] to-[#FDFCFB] px-4 py-8">
      <div className="container mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-accent-foreground font-display">
            Share Your Recipe
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
            ingredients={ingredients}
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
            {loading ? "Creating..." : "Share Recipe"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CreateRecipe;