import { Json } from "@/integrations/supabase/types";

export interface Recipe {
  id: string;
  title: string;
  description: string | null;
  ingredients: Json;
  instructions: Json;
  cook_time: unknown;
  difficulty: string | null;
  image_url: string | null;
  author: {
    id: string;
    username: string | null;
    full_name: string | null;
  } | null;
  categories: Category[];
  author_id: string | null;
  created_at: string;
  updated_at: string;
  default_servings: number | null;
  location_name: string | null;
  location_coords: unknown | null;
}

export interface RecipeWithExtras extends Omit<Recipe, 'author'> {
  author: {
    username: string | null;
  };
}

export interface Ingredient {
  amount: string;
  unit: string;
  item: string;
  [key: string]: string;
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string | null;
  status: string;
  author_id: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  tags: string[];
  meta_description: string | null;
  is_ai_generated: boolean | null;
  author: {
    username: string | null;
  } | null;
}

export interface AdminStatsProps {
  recipes: Recipe[];
  users: any[];
}

export interface UserManagementProps {
  users: any[];
  onDeleteUser: (userId: string) => Promise<void>;
}

export interface RecipeCategoryInput {
  recipe_id: string;
  category_id: string;
}