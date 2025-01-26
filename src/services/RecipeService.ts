import { Recipe, RecipeId, UpdateRecipeDTO } from "@/types/recipe";
import { recipeRepository, RecipeRepository } from "@/repositories/RecipeRepository";

interface CacheEntry {
  data: Recipe;
  timestamp: number;
}

export class RecipeService {
  private cache = new Map<string, CacheEntry>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_CACHE_SIZE = 100;

  constructor(private repository = recipeRepository) {}

  private isCacheValid(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp < this.CACHE_TTL;
  }

  private setCache(id: RecipeId, data: Recipe): void {
    // Remove oldest entry if cache is full
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(id, {
      data,
      timestamp: Date.now()
    });
  }

  private getFromCache(id: RecipeId): Recipe | null {
    const entry = this.cache.get(id);
    if (entry && this.isCacheValid(entry)) {
      return entry.data;
    }
    if (entry) {
      this.cache.delete(id);
    }
    return null;
  }

  async getRecipe(id: RecipeId): Promise<Recipe> {
    // Try to get from cache first
    const cachedRecipe = this.getFromCache(id);
    if (cachedRecipe) {
      return cachedRecipe;
    }

    // Fetch from repository if not in cache
    const recipe = await this.repository.fetchRecipe(id);
    this.setCache(id, recipe);
    return recipe;
  }

  async updateRecipe(id: RecipeId, data: UpdateRecipeDTO): Promise<void> {
    await this.repository.updateRecipe(id, data);
    
    // Invalidate cache after update
    this.cache.delete(id);
  }

  async deleteRecipe(id: RecipeId): Promise<void> {
    await this.repository.deleteRecipe(id);
    this.invalidateCache(id);
  }

  async enhanceRecipe(id: RecipeId, content: string, type: 'instructions' | 'description'): Promise<string> {
    const recipe = await this.getRecipe(id);
    
    try {
      const enhancedContent = await this.repository.enhanceRecipeContent(id, content, type);
      
      // Update the recipe with enhanced content
      if (type === 'instructions') {
        await this.updateRecipe(id, {
          instructions: enhancedContent.split('\n').filter(Boolean)
        });
      } else {
        await this.updateRecipe(id, {
          description: enhancedContent
        });
      }

      return enhancedContent;
    } catch (error) {
      console.error('Error enhancing recipe:', error);
      throw new Error('Failed to enhance recipe content');
    }
  }

  async toggleRecipeLove(id: RecipeId, userId: string): Promise<boolean> {
    const isLoved = await this.repository.toggleRecipeLove(id, userId);
    return isLoved;
  }

  clearCache(): void {
    this.cache.clear();
  }

  invalidateCache(id: RecipeId): void {
    this.cache.delete(id);
  }
}

// Create a singleton instance
export const recipeService = new RecipeService();