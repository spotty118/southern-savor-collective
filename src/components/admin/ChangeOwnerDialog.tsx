import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

interface ChangeOwnerDialogProps {
  open: boolean;
  onClose: () => void;
  recipeId: string;  // Add recipeId prop
}

export const ChangeOwnerDialog = ({ open, onClose, recipeId }: ChangeOwnerDialogProps) => {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  const createNewUser = async (username: string): Promise<string> => {
    try {
      console.log("Creating/finding user with username:", username);
      
      // First check if a profile with this username already exists
      const { data: existingProfile, error: profileError } = await supabase
        .from("profiles")
        .select()
        .eq('username', username.trim())
        .maybeSingle();

      if (profileError) {
        console.error("Error checking existing profile:", profileError);
        throw profileError;
      }

      // If profile exists, return its ID
      if (existingProfile) {
        console.log("Found existing profile:", existingProfile);
        return existingProfile.id;
      }

      // If no existing profile, create new user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: `${username.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}@temp.com`,
        password: crypto.randomUUID(),
        options: {
          data: {
            username: username.trim(),
            full_name: username.trim(),
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Failed to create auth user");

      console.log("Created auth user with metadata:", authData.user);

      // Wait a moment for the handle_new_user trigger to complete
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Verify the profile was created with the correct data
      const { data: newProfile, error: newProfileError } = await supabase
        .from("profiles")
        .select()
        .eq('id', authData.user.id)
        .maybeSingle();

      if (newProfileError) throw newProfileError;
      if (!newProfile) throw new Error("Profile was not created");

      console.log("Verified profile creation:", newProfile);
      return newProfile.id;
    } catch (error) {
      console.error("Error in createNewUser:", error);
      throw error;
    }
  };

  const handleSubmit = async () => {
    if (!username.trim()) {
      toast({
        title: "Error",
        description: "Please enter a username",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const userId = await createNewUser(username);
      console.log("User created/found with ID:", userId);
      
      // Update the recipe's author_id
      const { error: updateError } = await supabase
        .from("recipes")
        .update({ author_id: userId })
        .eq("id", recipeId);

      if (updateError) {
        throw updateError;
      }

      toast({
        title: "Success",
        description: "Recipe ownership successfully transferred",
      });
      
      // Reload the page to reflect the changes
      window.location.reload();
    } catch (error: any) {
      console.error("Error transferring ownership:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to transfer ownership",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Owner</DialogTitle>
        </DialogHeader>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter username"
          className="input w-full px-3 py-2 border rounded-md"
        />
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Processing..." : "Select/Create User"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};