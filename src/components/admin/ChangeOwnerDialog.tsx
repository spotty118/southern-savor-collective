import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
}

interface ChangeOwnerDialogProps {
  open: boolean;
  onClose: () => void;
  recipeId: string;
}

export const ChangeOwnerDialog = ({ open, onClose, recipeId }: ChangeOwnerDialogProps) => {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [existingUsers, setExistingUsers] = useState<Profile[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [mode, setMode] = useState<"select" | "create">("select");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, username, full_name")
          .order("username");

        if (error) throw error;
        setExistingUsers(data || []);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast({
          title: "Error",
          description: "Failed to fetch existing users",
          variant: "destructive",
        });
      }
    };

    fetchUsers();
  }, []);

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
    if (mode === "create" && !username.trim()) {
      toast({
        title: "Error",
        description: "Please enter a username",
        variant: "destructive",
      });
      return;
    }

    if (mode === "select" && !selectedUserId) {
      toast({
        title: "Error",
        description: "Please select a user",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const userId = mode === "create" 
        ? await createNewUser(username)
        : selectedUserId;

      console.log("User selected/created with ID:", userId);
      
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
        
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button 
              variant={mode === "select" ? "default" : "outline"}
              onClick={() => setMode("select")}
              className="flex-1"
            >
              Select Existing
            </Button>
            <Button 
              variant={mode === "create" ? "default" : "outline"}
              onClick={() => setMode("create")}
              className="flex-1"
            >
              Create New
            </Button>
          </div>

          {mode === "select" ? (
            <Select onValueChange={setSelectedUserId} value={selectedUserId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a user" />
              </SelectTrigger>
              <SelectContent>
                {existingUsers.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.username || user.full_name || "Unnamed User"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              className="input w-full px-3 py-2 border rounded-md"
            />
          )}

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Processing..." : "Change Owner"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};