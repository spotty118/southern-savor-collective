import { Database as OriginalDatabase } from "@/integrations/supabase/types";

export type Database = Omit<OriginalDatabase, "public"> & {
  public: Omit<OriginalDatabase["public"], "Tables"> & {
    Tables: OriginalDatabase["public"]["Tables"] & {
      collections: {
        Row: {
          id: string;
          name: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          user_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "collections_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      collection_recipes: {
        Row: {
          collection_id: string;
          recipe_id: string;
          created_at: string;
        };
        Insert: {
          collection_id: string;
          recipe_id: string;
          created_at?: string;
        };
        Update: {
          collection_id?: string;
          recipe_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "collection_recipes_collection_id_fkey";
            columns: ["collection_id"];
            isOneToOne: false;
            referencedRelation: "collections";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "collection_recipes_recipe_id_fkey";
            columns: ["recipe_id"];
            isOneToOne: false;
            referencedRelation: "recipes";
            referencedColumns: ["id"];
          }
        ];
      };
    };
  };
};
