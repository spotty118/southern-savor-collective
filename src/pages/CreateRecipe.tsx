import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Home, Plus, Minus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Tables, Json } from "@/integrations/supabase/types";
import { AIEnhanceButton } from "@/components/recipe/AIEnhanceButton";

interface Ingredient {
  item: string;
  amount: string;
  unit: string;
  [key: string]: string; // Index signature for Json compatibility // Index signature for Json compatibility
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

  const handleDescriptionEnhancement = (enhanced: string[]) => {
    if (enhanced.length > 0) {
      setDescription(enhanced[0]);
    }
  };

  const handleInstructionsEnhancement = (enhanced: string[]) => {
    if (enhanced.length > 0) {
      setInstructions(enhanced);
    }
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

      // Insert recipe
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

      // Insert recipe categories
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
          <div className="space-y-2">
            <label className="text-sm font-medium">Recipe Title</label>
            <Input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter your recipe title"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <div className="space-y-2">
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Share the story behind your recipe"
              />
              <AIEnhanceButton
                content={[description]}
                type="description"
                onEnhanced={handleDescriptionEnhancement}
                disabled={!description}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Cooking Time</label>
            <Input
              value={cookTime}
              onChange={(e) => setCookTime(e.target.value)}
              placeholder="e.g., 1 hour 30 minutes"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Difficulty</label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger>
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Easy">Easy as Pie</SelectItem>
                <SelectItem value="Medium">Sunday Supper Simple</SelectItem>
                <SelectItem value="Hard">Down-Home Challenge</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Image URL</label>
            <Input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Enter image URL"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Categories</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  type="button"
                  variant={selectedCategories.includes(category.id) ? "default" : "outline"}
                  onClick={() => {
                    setSelectedCategories(prev =>
                      prev.includes(category.id)
                        ? prev.filter(id => id !== category.id)
                        : [...prev, category.id]
                    );
                  }}
                  className={`
                    rounded-full px-4 py-2 text-sm
                    ${selectedCategories.includes(category.id)
                      ? 'bg-[#FEC6A1] text-accent hover:bg-[#FDE1D3]'
                      : 'border-[#FEC6A1] text-accent hover:bg-[#FDE1D3]'
                    }
                  `}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-sm font-medium">Ingredients</label>
            {ingredients.map((ingredient, index) => (
              <div key={index} className="grid grid-cols-4 gap-2">
                <Input
                  className="col-span-2"
                  value={ingredient.item}
                  onChange={(e) => handleIngredientChange(index, "item", e.target.value)}
                  placeholder="Ingredient name"
                />
                <Input
                  value={ingredient.amount}
                  onChange={(e) => handleIngredientChange(index, "amount", e.target.value)}
                  placeholder="Amount"
                />
                <div className="flex gap-2">
                  <Input
                    value={ingredient.unit}
                    onChange={(e) => handleIngredientChange(index, "unit", e.target.value)}
                    placeholder="Unit"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => handleRemoveIngredient(index)}
                    disabled={ingredients.length === 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={handleAddIngredient}
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Ingredient
            </Button>
          </div>

          <div className="space-y-4">
            <label className="text-sm font-medium">Instructions</label>
            {instructions.map((instruction, index) => (
              <div key={index} className="flex gap-2">
                <div className="flex-1 space-y-2">
                  <Textarea
                    value={instruction}
                    onChange={(e) => handleInstructionChange(index, e.target.value)}
                    placeholder={`Step ${index + 1}`}
                  />
                  <AIEnhanceButton
                    content={instructions}
                    type="instructions"
                    onEnhanced={handleInstructionsEnhancement}
                    disabled={!instruction}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleRemoveInstruction(index)}
                  disabled={instructions.length === 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <div className="flex justify-between items-center">
              <Button
                type="button"
                variant="outline"
                onClick={handleAddInstruction}
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Step
              </Button>
            </div>
          </div>

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
  );
};

export default CreateRecipe;
