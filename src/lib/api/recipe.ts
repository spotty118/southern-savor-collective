import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

// API Response schemas
const IngredientSchema = z.object({
  amount: z.string(),
  unit: z.string(),
  item: z.string()
});

const EnhancementResponseSchema = z.object({
  enhancedContent: z.array(z.string())
});

export type Ingredient = z.infer<typeof IngredientSchema>;

export class RecipeAPI {
  private static instance: RecipeAPI;
  private retryCount = 3;
  private retryDelay = 1000; // ms

  private constructor() {}

  static getInstance(): RecipeAPI {
    if (!RecipeAPI.instance) {
      RecipeAPI.instance = new RecipeAPI();
    }
    return RecipeAPI.instance;
  }

  private async retry<T>(fn: () => Promise<T>): Promise<T> {
    let lastError: Error | null = null;
    
    for (let i = 0; i < this.retryCount; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        if (i < this.retryCount - 1) {
          await new Promise(resolve => setTimeout(resolve, this.retryDelay * Math.pow(2, i)));
        }
      }
    }

    throw lastError || new Error('Operation failed after retries');
  }

  async enhanceInstructions(
    instructions: string[],
    ingredients?: Ingredient[]
  ): Promise<string[]> {
    const { data, error } = await this.retry(() =>
      supabase.functions.invoke<z.infer<typeof EnhancementResponseSchema>>('enhance-recipe', {
        body: {
          content: instructions,
          type: 'instructions',
          ingredients
        }
      })
    );

    if (error) {
      throw new Error(`Enhancement failed: ${error.message}`);
    }

    try {
      const validatedResponse = EnhancementResponseSchema.parse(data);
      return validatedResponse.enhancedContent;
    } catch (error) {
      throw new Error('Invalid response format from enhancement service');
    }
  }

  async validateIngredients(ingredients: unknown): Promise<Ingredient[]> {
    try {
      return z.array(IngredientSchema).parse(ingredients);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Invalid ingredients format: ${error.errors.map(e => e.message).join(', ')}`);
      }
      throw error;
    }
  }

  // Add rate limiting check
  private checkRateLimit(): boolean {
    const now = Date.now();
    const rateLimitKey = 'recipe_api_rate_limit';
    const rateLimitWindow = 60 * 1000; // 1 minute
    const maxRequests = 10;

    const rateLimit = localStorage.getItem(rateLimitKey);
    const parsedLimit = rateLimit ? JSON.parse(rateLimit) : { count: 0, timestamp: now };

    if (now - parsedLimit.timestamp > rateLimitWindow) {
      // Reset rate limit if window has passed
      parsedLimit.count = 1;
      parsedLimit.timestamp = now;
    } else if (parsedLimit.count >= maxRequests) {
      return false;
    } else {
      parsedLimit.count++;
    }

    localStorage.setItem(rateLimitKey, JSON.stringify(parsedLimit));
    return true;
  }

  // Middleware to check rate limit before making API calls
  private async withRateLimit<T>(operation: () => Promise<T>): Promise<T> {
    if (!this.checkRateLimit()) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
    return operation();
  }

  // Public methods should use rate limiting
  public async enhanceRecipeWithRateLimit(
    instructions: string[],
    ingredients?: Ingredient[]
  ): Promise<string[]> {
    return this.withRateLimit(() => this.enhanceInstructions(instructions, ingredients));
  }
}

// Export singleton instance
export const recipeAPI = RecipeAPI.getInstance();