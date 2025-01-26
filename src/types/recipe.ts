export type RecipeId = string & { readonly __brand: unique symbol };
export type UserId = string & { readonly __brand: unique symbol };

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface Ingredient {
  amount: string;
  unit: string;
  item: string;
  [key: string]: string; // Add index signature for JSON compatibility
}

export interface CookTime {
  value: number;
  unit: 'minutes' | 'hours';
}

export interface Author {
  id: UserId;
  username: string | null;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface Recipe {
  id: RecipeId;
  title: string;
  description: string | null;
  ingredients: Ingredient[];
  instructions: string[];
  cookTime: CookTime;
  difficulty: DifficultyLevel | null;
  imageUrl: string | null;
  defaultServings: number;
  author: Author;
  categories: Category[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateRecipeDTO {
  title?: string;
  description?: string | null;
  ingredients?: Ingredient[];
  instructions?: string[];
  cookTime?: CookTime;
  difficulty?: DifficultyLevel | null;
  imageUrl?: string | null;
  defaultServings?: number;
  categories?: string[]; // category ids
}

export enum RecipeErrorCode {
  NOT_FOUND = 'RECIPE_NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
}

export class RecipeError extends Error {
  constructor(
    message: string,
    public code: RecipeErrorCode,
    public context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'RecipeError';
  }
}