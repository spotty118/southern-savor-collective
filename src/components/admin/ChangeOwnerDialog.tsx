import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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

interface User {
  id: string;
  username: string;
}

interface ChangeOwnerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (newOwnerId: string) => Promise<void>;
  currentOwnerId: string;
}

export const ChangeOwnerDialog = ({
  isOpen,
  onClose,
  onConfirm,
  currentOwnerId,
}: ChangeOwnerDialogProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

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
        
        // Filter out null usernames and ensure all required fields are present
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
    }
  }, [isOpen]);

  const handleConfirm = async () => {
    if (!selectedUserId) {
      toast({
        title: "Error",
        description: "Please select a new owner",
        variant: "destructive",
      });
      return;
    }

    if (!currentOwnerId) {
      console.error("Current owner ID is missing");
      toast({
        title: "Error",
        description: "Current owner information is missing",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log("Updating recipe owner", { selectedUserId, currentOwnerId });
      await onConfirm(selectedUserId);
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

  // Only render dialog content if we have a valid currentOwnerId
  if (!currentOwnerId) {
    console.error("ChangeOwnerDialog rendered without currentOwnerId");
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Recipe Owner</DialogTitle>
          <DialogDescription>
            Select a new owner for this recipe. This action can only be performed by administrators.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Select
            value={selectedUserId}
            onValueChange={setSelectedUserId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select new owner" />
            </SelectTrigger>
            <SelectContent>
              {users
                .filter(user => user.id !== currentOwnerId)
                .map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.username || 'Unnamed User'}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={!selectedUserId || isLoading}
          >
            {isLoading ? "Updating..." : "Update Owner"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};