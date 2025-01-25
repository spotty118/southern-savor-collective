import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ChangeOwnerDialogProps {
  open: boolean;
  onClose: () => void;
}

const ChangeOwnerDialog = ({ open, onClose }: ChangeOwnerDialogProps) => {
  const [username, setUsername] = useState("");

  const createNewUser = async (username: string): Promise<string> => {
    try {
      console.log("Creating new user with username:", username);
      
      // Create auth user with metadata including username and full_name
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: `${username.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}@temp.com`,
        password: crypto.randomUUID(),
        options: {
          data: {
            username: username.trim(),
            full_name: username.trim(), // Using username as full_name for now
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Failed to create auth user");

      console.log("Created auth user with metadata:", authData.user);

      // Wait a moment for the handle_new_user trigger to complete
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Verify the profile was created with the correct data
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select()
        .eq('id', authData.user.id)
        .single();

      if (profileError) throw profileError;
      if (!profile) throw new Error("Profile was not created");

      console.log("Verified profile creation:", profile);
      return profile.id;
    } catch (error) {
      console.error("Error creating new user:", error);
      throw error;
    }
  };

  const handleSubmit = async () => {
    try {
      const userId = await createNewUser(username);
      console.log("New user created with ID:", userId);
      onClose();
    } catch (error) {
      console.error("Error creating user:", error);
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
          className="input"
        />
        <div className="flex justify-end mt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Create User</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChangeOwnerDialog;
