import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Tables, Json } from "@/integrations/supabase/types";
import { RecipeBasicInfo, RecipeTime } from "@/components/recipe/RecipeBasicInfo";
import { RecipeCategories } from "@/components/recipe/RecipeCategories";
import { IngredientsList } from "@/components/recipe/IngredientsList";
import { InstructionsList } from "@/components/recipe/InstructionsList";
import { z } from "zod";

// Validation schemas
const RecipeTimeSchema = z.object({
  hours: z.number().min(0).max(24).optional(),
  minutes: z.number().min(0).max(59)
});

const IngredientSchema = z.object({
  item: z.string().min(1, "Ingredient name is required"),
  amount: z.string().min(1, "Amount is required"),
  unit: z.string().min(1, "Unit is required")
});

const RecipeSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  description: z.string().min(10, "Description must be at least 10 characters").max(1000, "Description is too long"),
  cookTime: RecipeTimeSchema,
  difficulty: z.string().min(1, "Difficulty is required"),
  imageUrl: z.string().url("Invalid image URL").optional(),
  ingredients: z.array(IngredientSchema).min(1, "At least one ingredient is required"),
  instructions: z.array(z.string().min(1, "Instruction step cannot be empty")).min(1, "At least one instruction is required"),
  defaultServings: z.number().min(1, "Servings must be at least 1").max(50, "Servings cannot exceed 50"),
  categories: z.array(z.string()).optional()
});

type RecipeFormData = z.infer<typeof RecipeSchema>;

interface Ingredient {
  item: string;
  amount: string;
  unit: string;
  [key: string]: string;
}

const CreateRecipe = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [cookTime, setCookTime] = useState<RecipeTime>({ minutes: 0 });
  const [difficulty, setDifficulty] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { item: "", amount: "", unit: "" }
  ]);
  const [instructions, setInstructions] = useState<string[]>([""]);
  const [categories, setCategories] = useState<Tables<"categories">[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [defaultServings, setDefaultServings] = useState<number>(4);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Please login",
          description: "You need to be logged in to create recipes",
        });
        navigate("/auth");
      }
    };

    checkAuth();
  }, [navigate]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from("categories")
          .select("*")
          .order("name");

        if (error) throw error;
        console.log("Fetched categories:", data);
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

  const validateForm = (): { isValid: boolean; errors: string[] } => {
    try {
      const formData: RecipeFormData = {
        title,
        description,
        cookTime,
        difficulty,
        imageUrl: imageUrl || undefined,
        ingredients,
        instructions: instructions.filter(Boolean),
        defaultServings,
        categories: selectedCategories
      };

      RecipeSchema.parse(formData);
      return { isValid: true, errors: [] };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => err.message);
        return { isValid: false, errors };
      }
      return { isValid: false, errors: ["An unexpected error occurred"] };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = validateForm();
    if (!validation.isValid) {
      validation.errors.forEach(error => {
        toast({
          title: "Validation Error",
          description: error,
          variant: "destructive",
        });
      });
      return;
    }

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

      // Create the recipe
      const { data: recipe, error: recipeError } = await supabase
        .from("recipes")
        .insert({
          title,
          description,
          cook_time: cookTime,
          difficulty,
          image_url: imageUrl,
          ingredients: ingredients as unknown as Json,
          instructions: instructions.filter(Boolean) as Json,
          default_servings: defaultServings,
        })
        .select()
        .single();

      if (recipeError) throw recipeError;

      // Add categories if selected
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
        description: error.message || "Failed to create recipe",
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

        <form 
          onSubmit={handleSubmit} 
          className="space-y-6 bg-white rounded-lg shadow-md p-6 border border-[#FEC6A1]/20"
        >
          <div className="space-y-6 font-medium">
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
              defaultServings={defaultServings}
              setDefaultServings={setDefaultServings}
              onDescriptionEnhancement={(enhanced) => {
                if (enhanced.length > 0) {
                  setDescription(enhanced[0]);
                }
              }}
              isEditing={true}
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
          </div>

          <Button
            type="submit"
            className="w-full bg-[#FEC6A1] text-accent-foreground hover:bg-[#FDE1D3] font-semibold"
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