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