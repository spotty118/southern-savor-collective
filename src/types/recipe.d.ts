export interface Recipe {
  id: string;
  title: string;
  description: string | null;
  ingredients: Ingredient[];
  instructions: string[];
  cook_time: unknown;
  difficulty: string | null;
  image_url: string | null;
  author: {
    id: string;
    username: string | null;
    full_name: string | null;
  };
  categories: Category[];
  author_id: string;
  created_at: string;
  updated_at: string;
  default_servings: number;
}

export interface Ingredient {
  amount: string;
  unit: string;
  item: string;
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
  excerpt: string;
  status: string;
  author_id: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  published_at: string;
  tags: string[];
  meta_description: string | null;
  is_ai_generated: boolean;
  author: {
    username: string | null;
  };
}