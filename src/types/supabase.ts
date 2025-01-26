export interface AISuggestionRow {
  id: string;
  recipe_id: string;
  original_content: string;
  enhanced_content: string;
  content_type: string;
  created_at: string;
  user_id: string;
  is_applied: boolean;
}

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          name: string;
          description: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['categories']['Row'], 'created_at'>;
        Update: Partial<Database['public']['Tables']['categories']['Row']>;
      };
      recipes: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          ingredients: any[];
          instructions: string[];
          cook_time: unknown;
          difficulty: string | null;
          image_url: string | null;
          default_servings: number | null;
          author_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['recipes']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['recipes']['Row']>;
      };
      recipe_categories: {
        Row: {
          recipe_id: string;
          category_id: string;
        };
        Insert: Database['public']['Tables']['recipe_categories']['Row'];
        Update: Database['public']['Tables']['recipe_categories']['Row'];
      };
      recipe_loves: {
        Row: {
          recipe_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['recipe_loves']['Row'], 'created_at'>;
        Update: Partial<Database['public']['Tables']['recipe_loves']['Row']>;
      };
      profiles: {
        Row: {
          id: string;
          username: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at'>;
        Update: Partial<Database['public']['Tables']['profiles']['Row']>;
      };
    };
  };
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];