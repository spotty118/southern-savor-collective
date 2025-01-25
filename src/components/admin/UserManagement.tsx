import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { UserCog, Mail, Edit2, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface UserProfile {
  id: string;
  username: string | null;
  full_name: string | null;
  created_at: string;
  email: string;
}

interface UserManagementProps {
  users: UserProfile[];
}

export const UserManagement = ({ users }: UserManagementProps) => {
  const navigate = useNavigate();
  const [resetPasswordDialog, setResetPasswordDialog] = useState(false);
  const [deleteUserDialog, setDeleteUserDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [localUsers, setLocalUsers] = useState(users);

  const handleResetPassword = async () => {
    if (!selectedUser) return;

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        selectedUser.email,
        {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        }
      );

      if (error) throw error;

      toast({
        title: "Password Reset Email Sent",
        description: "The user will receive instructions to reset their password.",
      });
      setResetPasswordDialog(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      console.log('Starting user deletion process for:', selectedUser.id);

      // First, delete all recipes authored by the user
      const { error: recipesError } = await supabase
        .from('recipes')
        .delete()
        .eq('author_id', selectedUser.id);

      if (recipesError) {
        console.error('Error deleting recipes:', recipesError);
        throw recipesError;
      }

      // Then delete all recipe versions created by the user
      const { error: versionsError } = await supabase
        .from('recipe_versions')
        .delete()
        .eq('created_by', selectedUser.id);

      if (versionsError) {
        console.error('Error deleting recipe versions:', versionsError);
        throw versionsError;
      }

      // Then delete from profiles (this will cascade to user_roles and other related tables)
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', selectedUser.id);

      if (profileError) {
        console.error('Error deleting profile:', profileError);
        throw profileError;
      }

      // Call the edge function to delete the auth user
      const { error: deleteError } = await supabase.functions.invoke('delete-user', {
        body: { userId: selectedUser.id }
      });

      if (deleteError) {
        console.error('Error calling delete-user function:', deleteError);
        throw deleteError;
      }

      // Update local state to remove the deleted user
      setLocalUsers(prevUsers => prevUsers.filter(user => user.id !== selectedUser.id));

      toast({
        title: "Success",
        description: "User deleted successfully",
      });

      setDeleteUserDialog(false);
      setSelectedUser(null);
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSendEmail = async (email: string) => {
    // This is a placeholder for email functionality
    toast({
      title: "Email Feature",
      description: "Email functionality will be implemented soon!",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {localUsers.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {user.full_name || user.username || "No name"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.username || "No username"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user);
                          setResetPasswordDialog(true);
                        }}
                      >
                        <UserCog className="h-4 w-4 mr-2" />
                        Reset Password
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSendEmail(user.email)}
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Email User
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/admin/users/${user.id}/edit`)}
                      >
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user);
                          setDeleteUserDialog(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Dialog open={resetPasswordDialog} onOpenChange={setResetPasswordDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reset User Password</DialogTitle>
              <DialogDescription>
                Are you sure you want to send a password reset email to{" "}
                {selectedUser?.full_name || selectedUser?.username}?
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => setResetPasswordDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleResetPassword}>Send Reset Email</Button>
            </div>
          </DialogContent>
        </Dialog>

        <AlertDialog open={deleteUserDialog} onOpenChange={setDeleteUserDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete User</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this user? This action cannot be undone.
                User: {selectedUser?.full_name || selectedUser?.username}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeleteUserDialog(false)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteUser}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
};