import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, FolderPlus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Database } from "@/types/supabase";

type Collection = Database["public"]["Tables"]["collections"]["Row"];

interface RecipeCollectionsProps {
  userId: string;
  onCollectionClick?: (collectionId: string) => void;
  disableActions?: boolean;
}

export const RecipeCollections = ({
  userId,
  onCollectionClick,
  disableActions = false,
}: RecipeCollectionsProps) => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchCollections();
  }, [userId]);

  const fetchCollections = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("collections")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setCollections(data || []);
    } catch (error: any) {
      console.error("Error fetching collections:", error);
      toast({
        title: "Error",
        description: "Failed to load collections",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollectionName.trim()) return;

    setCreating(true);
    try {
      const { error } = await supabase.from("collections").insert({
        name: newCollectionName.trim(),
        user_id: userId,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Collection created successfully",
      });

      setNewCollectionName("");
      fetchCollections();
    } catch (error: any) {
      console.error("Error creating collection:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const deleteCollection = async (collectionId: string) => {
    try {
      const { error } = await supabase
        .from("collections")
        .delete()
        .eq("id", collectionId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Collection deleted successfully",
      });

      fetchCollections();
    } catch (error: any) {
      console.error("Error deleting collection:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <form onSubmit={createCollection} className="flex gap-2">
        <Input
          value={newCollectionName}
          onChange={(e) => setNewCollectionName(e.target.value)}
          placeholder="New collection name"
          disabled={creating}
        />
        <Button type="submit" disabled={creating || !newCollectionName.trim()}>
          {creating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FolderPlus className="h-4 w-4" />
          )}
          <span className="ml-2">Create</span>
        </Button>
      </form>

      <div className="space-y-2">
        {collections.map((collection) => (
          <div
            key={collection.id}
            className="flex items-center justify-between rounded-lg border p-3"
          >
            <span>{collection.name}</span>
            <div className="flex items-center gap-2">
              {onCollectionClick && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onCollectionClick(collection.id)}
                  disabled={disableActions}
                >
                  Select
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteCollection(collection.id)}
                disabled={disableActions}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        {collections.length === 0 && (
          <p className="text-center text-sm text-gray-500">
            No collections created yet
          </p>
        )}
      </div>
    </div>
  );
};
