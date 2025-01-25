import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

interface User {
  id: string;
  username: string;
}

interface ChangeOwnerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (newOwnerId: string) => Promise<void>;
  currentOwnerId: string | null;
}

export const ChangeOwnerDialog = ({
  isOpen,
  onClose,
  onConfirm,
  currentOwnerId,
}: ChangeOwnerDialogProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [newUsername, setNewUsername] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"existing" | "new">("existing");

  useEffect(() => {
    const fetchUsers = async () => {
      if (!isOpen) return;
      
      console.log("Fetching users for owner change dialog");
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, username")
          .order("username");

        if (error) throw error;
        
        const validUsers = (data || []).filter(
          (user): user is User => 
            user && 
            typeof user.id === 'string' && 
            typeof user.username === 'string'
        );
        
        console.log("Fetched users:", validUsers.length);
        setUsers(validUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast({
          title: "Error",
          description: "Failed to load users",
          variant: "destructive",
        });
      }
    };

    if (isOpen) {
      fetchUsers();
      setSelectedUserId("");
      setNewUsername("");
      setActiveTab("existing");
    }
  }, [isOpen]);

  const createNewUser = async (username: string): Promise<string> => {
    // Generate a UUID for the new user
    const newUserId = crypto.randomUUID();
    
    try {
      // First create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: `${username.toLowerCase().replace(/\s+/g, '_')}@temp.com`,
        password: crypto.randomUUID(), // Generate a random password
      });

      if (authError) throw authError;
      
      if (!authData.user) {
        throw new Error("Failed to create auth user");
      }

      // Create profile using the auth user's ID
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .insert([
          {
            id: authData.user.id,
            username: username.trim(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (profileError) throw profileError;
      if (!profile) throw new Error("Failed to create profile");

      console.log("Created new user:", profile);
      return profile.id;
    } catch (error) {
      console.error("Error creating new user:", error);
      throw error;
    }
  };

  const handleConfirm = async () => {
    if (activeTab === "existing" && !selectedUserId) {
      toast({
        title: "Error",
        description: "Please select a user",
        variant: "destructive",
      });
      return;
    }

    if (activeTab === "new" && !newUsername.trim()) {
      toast({
        title: "Error",
        description: "Please enter a username",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      if (activeTab === "new") {
        const newUserId = await createNewUser(newUsername);
        console.log("Created new user with ID:", newUserId);
        await onConfirm(newUserId);
      } else {
        console.log("Updating recipe owner", { selectedUserId, currentOwnerId });
        await onConfirm(selectedUserId);
      }
      
      onClose();
      toast({
        title: "Success",
        description: "Recipe owner updated successfully",
      });
    } catch (error) {
      console.error("Error updating recipe owner:", error);
      toast({
        title: "Error",
        description: "Failed to update recipe owner",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Recipe Owner</DialogTitle>
          <DialogDescription>
            Select an existing user or create a new one to be the recipe owner.
          </DialogDescription>
        </DialogHeader>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "existing" | "new")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="existing">Existing User</TabsTrigger>
            <TabsTrigger value="new">New User</TabsTrigger>
          </TabsList>
          <TabsContent value="existing" className="py-4">
            <Select
              value={selectedUserId}
              onValueChange={setSelectedUserId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select new owner" />
              </SelectTrigger>
              <SelectContent>
                {users
                  .filter(user => !currentOwnerId || user.id !== currentOwnerId)
                  .map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.username || 'Unnamed User'}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </TabsContent>
          <TabsContent value="new" className="py-4">
            <Input
              placeholder="Enter new username"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
            />
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={
              isLoading || 
              (activeTab === "existing" && !selectedUserId) || 
              (activeTab === "new" && !newUsername.trim())
            }
          >
            {isLoading ? "Updating..." : "Update Owner"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};