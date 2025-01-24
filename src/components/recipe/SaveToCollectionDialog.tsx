import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FolderPlus, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { RecipeCollections } from "./RecipeCollections";
import { Database } from "@/types/supabase";

type Collection = Database["public"]["Tables"]["collections"]["Row"];

interface SaveToCollectionDialogProps {
  recipeId: string;
  userId: string;
}

export const SaveToCollectionDialog = ({
  recipeId,
  userId,
}: SaveToCollectionDialogProps) => {
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);

  const saveToCollection = async (collectionId: string) => {
    setSaving(true);
    try {
      // Check if recipe is already in collection
      const { data: existing, error: checkError } = await supabase
        .from("collection_recipes")
        .select("*")
        .eq("collection_id", collectionId)
        .eq("recipe_id", recipeId)
        .single();

      if (checkError && checkError.code !== "PGRST116") throw checkError;

      if (existing) {
        toast({
          title: "Already saved",
          description: "This recipe is already in this collection",
        });
        return;
      }

      const { error } = await supabase.from("collection_recipes").insert({
        collection_id: collectionId,
        recipe_id: recipeId,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Recipe saved to collection",
      });
      setOpen(false);
    } catch (error: any) {
      console.error("Error saving to collection:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <FolderPlus className="mr-2 h-4 w-4" />
          Save to Collection
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save to Collection</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <RecipeCollections
            userId={userId}
            onCollectionClick={saveToCollection}
            disableActions={saving}
          />
          {saving && (
            <div className="mt-4 flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
