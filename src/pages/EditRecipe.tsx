import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

interface Ingredient {
  item: string;
  amount: number;
  unit: string;
  [key: string]: string | number; // Add index signature to match Json type
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
  const [ingredients, setIngredients] = useState<Ingredient[]>([{ item: "", amount: 0, unit: "" }]);
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
          // Type assertion to handle the Json to Ingredient[] conversion
          setIngredients((recipe.ingredients as Ingredient[]) || [{ item: "", amount: 0, unit: "" }]);
          setInstructions((recipe.instructions as string[]) || [""]);
          
          const { data: categoryData, error: categoryError } = await supabase
            .from("recipe_categories")
            .select("category_id")
            .eq("recipe_id", id);

          if (categoryError) throw categoryError;
          
          setSelectedCategories(categoryData?.map(c => c.category_id) || []);
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

  const handleAddIngredient = () => {
    setIngredients([...ingredients, { item: "", amount: 0, unit: "" }]);
  };

  const handleRemoveIngredient = (index: number) => {
    const newIngredients = ingredients.filter((_, i) => i !== index);
    setIngredients(newIngredients);
  };

  const handleIngredientChange = (index: number, field: keyof Ingredient, value: string | number) => {
    const newIngredients = [...ingredients];
    if (field === 'amount') {
      newIngredients[index][field] = Number(value) || 0;
    } else {
      newIngredients[index][field as 'item' | 'unit'] = value as string;
    }
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
          description: "You need to be logged in to edit recipes",
        });
        navigate("/auth");
        return;
      }

      // Update recipe with type assertion for ingredients
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

      // Delete existing category associations
      const { error: deleteError } = await supabase
        .from("recipe_categories")
        .delete()
        .eq("recipe_id", id);

      if (deleteError) throw deleteError;

      // Insert new category associations
      if (selectedCategories.length > 0) {
        const { error: categoryError } = await supabase
          .from("recipe_categories")
          .insert(
            selectedCategories.map(categoryId => ({
              recipe_id: id,
              category_id: categoryId
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
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Share the story behind your recipe"
            />
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
              <div key={index} className="flex flex-col gap-2">
                <div className="grid grid-cols-3 gap-2">
                  <Input
                    value={ingredient.amount}
                    type="number"
                    onChange={(e) => handleIngredientChange(index, 'amount', e.target.value)}
                    placeholder="Amount"
                  />
                  <Input
                    value={ingredient.unit}
                    onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                    placeholder="Unit (e.g., cups)"
                  />
                  <Input
                    value={ingredient.item}
                    onChange={(e) => handleIngredientChange(index, 'item', e.target.value)}
                    placeholder="Ingredient name"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemoveIngredient(index)}
                  disabled={ingredients.length === 1}
                  className="self-end"
                >
                  <Minus className="h-4 w-4" />
                  Remove
                </Button>
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
                <Textarea
                  value={instruction}
                  onChange={(e) => handleInstructionChange(index, e.target.value)}
                  placeholder={`Step ${index + 1}`}
                />
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
