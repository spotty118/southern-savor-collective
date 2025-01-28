import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useState } from "react";

export const DeleteAccountDialog = () => {
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      console.log("Starting account deletion process");

      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) {
        throw new Error("No user found");
      }

      // Delete profile (this will cascade to all related data)
      const { error: deleteError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", user.id);

      if (deleteError) throw deleteError;

      // Delete the auth user
      const { error: authError } = await supabase.auth.signOut();
      if (authError) throw authError;

      console.log("Account successfully deleted");
      toast({
        title: "Account Deleted",
        description: "Your account and all associated data have been deleted.",
      });
      navigate("/");
    } catch (error: any) {
      console.error("Error deleting account:", error);
      toast({
        title: "Error",
        description: "Failed to delete account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">Delete Account</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your account
            and remove all of your data from our servers, including:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Your profile information</li>
              <li>All recipes you've created</li>
              <li>All your comments and ratings</li>
              <li>Your favorite recipes</li>
              <li>Your recipe scaling preferences</li>
            </ul>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteAccount}
            className="bg-red-500 hover:bg-red-600"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Account"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};