import { supabase } from "@/integrations/supabase/client";
import { Recipe, RecipeId, RecipeError, RecipeErrorCode, UpdateRecipeDTO } from "@/types/recipe";

interface RawRecipeData {
  id: string;
  title: string;
  description: string | null;
  ingredients: unknown;
  instructions: unknown;
  cook_time: unknown;
  difficulty: string | null;
  image_url: string | null;
  default_servings: number | null;
  author: {
    username: string | null;
  };
  categories: Array<{ categories: { id: string; name: string; description?: string } }>;
  author_id: string;
  created_at: string;
  updated_at: string;
}

export class RecipeRepository {
  private validateIngredients(data: unknown): data is Recipe['ingredients'] {
    if (!Array.isArray(data)) return false;
    return data.every(item => 
      typeof item === 'object' &&
      item !== null &&
      typeof item.amount === 'string' &&
      typeof item.unit === 'string' &&
      typeof item.item === 'string'
    );
  }

  private validateInstructions(data: unknown): data is string[] {
    if (!Array.isArray(data)) return false;
    return data.every(item => typeof item === 'string');
  }

  private parseCookTime(data: unknown): Recipe['cookTime'] {
    if (typeof data === 'number') {
      return {
        value: data,
        unit: 'minutes'
      };
    }
    if (typeof data === 'string') {
      const value = parseInt(data, 10);
      return {
        value: isNaN(value) ? 0 : value,
        unit: 'minutes'
      };
    }
    return {
      value: 0,
      unit: 'minutes'
    };
  }

  private transformRawToRecipe(data: RawRecipeData): Recipe {
    const ingredients = this.validateIngredients(data.ingredients) 
      ? data.ingredients 
      : [];

    const instructions = this.validateInstructions(data.instructions)
      ? data.instructions
      : [];

    return {
      id: data.id as RecipeId,
      title: data.title,
      description: data.description,
      ingredients,
      instructions,
      cookTime: this.parseCookTime(data.cook_time),
      difficulty: data.difficulty as Recipe['difficulty'],
      imageUrl: data.image_url,
      defaultServings: data.default_servings || 4,
      author: {
        id: data.author_id as Recipe['author']['id'],
        username: data.author.username
      },
      categories: data.categories.map(cat => cat.categories),
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  async fetchRecipe(id: RecipeId): Promise<Recipe> {
    try {
      const { data, error } = await supabase
        .from("recipes")
        .select(`
          *,
          author:profiles(username),
          categories:recipe_categories(categories(*))
        `)
        .eq("id", id)
        .single();

      if (error) {
        throw new RecipeError(
          error.message,
          RecipeErrorCode.SERVER_ERROR,
          { originalError: error }
        );
      }

      if (!data) {
        throw new RecipeError(
          `Recipe with id ${id} not found`,
          RecipeErrorCode.NOT_FOUND
        );
      }

      return this.transformRawToRecipe(data as RawRecipeData);
    } catch (error) {
      if (error instanceof RecipeError) {
        throw error;
      }
      throw new RecipeError(
        'An unexpected error occurred',
        RecipeErrorCode.SERVER_ERROR,
        { originalError: error }
      );
    }
  }

  async updateRecipe(id: RecipeId, data: UpdateRecipeDTO): Promise<void> {
    try {
      const { error } = await supabase
        .from("recipes")
        .update({
          title: data.title,
          description: data.description,
          ingredients: data.ingredients,
          instructions: data.instructions,
          cook_time: data.cookTime?.value,
          difficulty: data.difficulty,
          image_url: data.imageUrl,
          default_servings: data.defaultServings,
          updated_at: new Date().toISOString()
        })
        .eq("id", id);

      if (error) {
        throw new RecipeError(
          error.message,
          RecipeErrorCode.SERVER_ERROR,
          { originalError: error }
        );
      }

      if (data.categories) {
        // Update categories
        await this.updateRecipeCategories(id, data.categories);
      }
    } catch (error) {
      if (error instanceof RecipeError) {
        throw error;
      }
      throw new RecipeError(
        'An unexpected error occurred while updating the recipe',
        RecipeErrorCode.SERVER_ERROR,
        { originalError: error }
      );
    }
  }

  private async updateRecipeCategories(id: RecipeId, categoryIds: string[]): Promise<void> {
    const { error: deleteError } = await supabase
      .from("recipe_categories")
      .delete()
      .eq("recipe_id", id);

    if (deleteError) {
      throw new RecipeError(
        'Failed to update recipe categories',
        RecipeErrorCode.SERVER_ERROR,
        { originalError: deleteError }
      );
    }

    const categoryData = categoryIds.map(categoryId => ({
      recipe_id: id,
      category_id: categoryId
    }));

    const { error: insertError } = await supabase
      .from("recipe_categories")
      .insert(categoryData);

    if (insertError) {
      throw new RecipeError(
        'Failed to update recipe categories',
        RecipeErrorCode.SERVER_ERROR,
        { originalError: insertError }
      );
    }
  }

  async deleteRecipe(id: RecipeId): Promise<void> {
    try {
      // Delete recipe categories first
      const { error: categoriesError } = await supabase
        .from("recipe_categories")
        .delete()
        .eq("recipe_id", id);

      if (categoriesError) {
        throw new RecipeError(
          'Failed to delete recipe categories',
          RecipeErrorCode.SERVER_ERROR,
          { originalError: categoriesError }
        );
      }

      // Delete the recipe
      const { error } = await supabase
        .from("recipes")
        .delete()
        .eq("id", id);

      if (error) {
        throw new RecipeError(
          'Failed to delete recipe',
          RecipeErrorCode.SERVER_ERROR,
          { originalError: error }
        );
      }
    } catch (error) {
      if (error instanceof RecipeError) {
        throw error;
      }
      throw new RecipeError(
        'An unexpected error occurred while deleting the recipe',
        RecipeErrorCode.SERVER_ERROR,
        { originalError: error }
      );
    }
  }

  async enhanceRecipeContent(id: RecipeId, content: string, type: 'instructions' | 'description'): Promise<string> {
    try {
      const response = await fetch(`/api/enhance-recipe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, content, type })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.enhancedContent;
    } catch (error) {
      throw new RecipeError(
        'Failed to enhance recipe content',
        RecipeErrorCode.SERVER_ERROR,
        { originalError: error }
      );
    }
  }

  async toggleRecipeLove(id: RecipeId, userId: string): Promise<boolean> {
    try {
      // Check if the user has already loved this recipe
      const { data: existingLove, error: checkError } = await supabase
        .from("recipe_loves")
        .select()
        .eq("recipe_id", id)
        .eq("user_id", userId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        throw checkError;
      }

      if (existingLove) {
        // Unlike the recipe
        const { error: deleteError } = await supabase
          .from("recipe_loves")
          .delete()
          .eq("recipe_id", id)
          .eq("user_id", userId);

        if (deleteError) {
          throw deleteError;
        }

        return false;
      } else {
        // Like the recipe
        const { error: insertError } = await supabase
          .from("recipe_loves")
          .insert({ recipe_id: id, user_id: userId });

        if (insertError) {
          throw insertError;
        }

        return true;
      }
    } catch (error) {
      throw new RecipeError(
        'Failed to toggle recipe love',
        RecipeErrorCode.SERVER_ERROR,
        { originalError: error }
      );
    }
  }
}

export const recipeRepository = new RecipeRepository();