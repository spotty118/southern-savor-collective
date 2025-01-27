import { useState } from "react";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CollectionDialogProps {
  recipeId: string;
  userId: string;
}

export const CollectionDialog = ({ recipeId, userId }: CollectionDialogProps) => {
  const [collections, setCollections] = useState<any[]>([]);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [newCollectionDescription, setNewCollectionDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const fetchCollections = async () => {
    try {
      console.log("Fetching collections for user:", userId);
      const { data, error } = await supabase
        .from("collections")
        .select("*")
        .eq("user_id", userId);

      if (error) throw error;
      console.log("Fetched collections:", data);
      setCollections(data || []);
    } catch (error: any) {
      console.error("Error fetching collections:", error);
      toast({
        title: "Error",
        description: "Failed to load collections",
        variant: "destructive",
      });
    }
  };

  const createCollection = async () => {
    if (!newCollectionName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a collection name",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      console.log("Creating new collection:", {
        name: newCollectionName,
        description: newCollectionDescription,
        user_id: userId
      });

      const { data: collection, error: collectionError } = await supabase
        .from("collections")
        .insert({
          name: newCollectionName,
          description: newCollectionDescription,
          user_id: userId,
        })
        .select()
        .single();

      if (collectionError) throw collectionError;

      if (collection) {
        console.log("Collection created:", collection);
        await addToCollection(collection.id);
        setNewCollectionName("");
        setNewCollectionDescription("");
        await fetchCollections();
        
        toast({
          title: "Success",
          description: "Collection created and recipe added",
        });
      }
    } catch (error: any) {
      console.error("Error creating collection:", error);
      toast({
        title: "Error",
        description: "Failed to create collection",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addToCollection = async (collectionId: string) => {
    try {
      console.log("Adding recipe to collection:", {
        collection_id: collectionId,
        recipe_id: recipeId
      });

      const { error } = await supabase
        .from("recipe_collections")
        .insert({
          collection_id: collectionId,
          recipe_id: recipeId,
        });

      if (error) {
        // Check if it's a duplicate entry error
        if (error.code === '23505') {
          toast({
            title: "Info",
            description: "Recipe is already in this collection",
          });
          return;
        }
        throw error;
      }

      toast({
        title: "Success",
        description: "Recipe added to collection",
      });
      setOpen(false);
    } catch (error: any) {
      console.error("Error adding to collection:", error);
      toast({
        title: "Error",
        description: "Failed to add recipe to collection",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="bg-white/90 hover:bg-white"
          onClick={() => {
            fetchCollections();
          }}
        >
          <Plus className="h-4 w-4 text-gray-500" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save to Collection</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Create New Collection</h3>
            <div className="space-y-2">
              <Label htmlFor="name">Collection Name</Label>
              <Input
                id="name"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                placeholder="e.g., Family Favorites"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={newCollectionDescription}
                onChange={(e) => setNewCollectionDescription(e.target.value)}
                placeholder="Describe your collection..."
              />
            </div>
            <Button
              onClick={createCollection}
              disabled={loading}
              className="w-full"
            >
              Create & Add Recipe
            </Button>
          </div>

          {collections.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Existing Collections</h3>
              <div className="grid gap-2">
                {collections.map((collection) => (
                  <Button
                    key={collection.id}
                    variant="outline"
                    onClick={() => addToCollection(collection.id)}
                    className="w-full justify-start"
                  >
                    {collection.name}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
