import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminStats } from "@/components/admin/AdminStats";
import { UserManagement } from "@/components/admin/UserManagement";
import { RecipeManagement } from "@/components/admin/RecipeManagement";
import { toast } from "@/hooks/use-toast";
import type { Recipe } from "@/types/recipe";

export default function Admin() {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("*")
          .order("created_at", { ascending: false });

        if (profilesError) throw profilesError;
        setUsers(profilesData || []);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast({
          title: "Error",
          description: "Failed to load users",
          variant: "destructive",
        });
      }
    };

    const fetchRecipes = async () => {
      try {
        const { data: recipesData, error: recipesError } = await supabase
          .from("recipes")
          .select(`
            *,
            author:profiles(id, username)
          `)
          .order("created_at", { ascending: false });

        if (recipesError) throw recipesError;
        setRecipes(recipesData as Recipe[] || []);
      } catch (error) {
        console.error("Error fetching recipes:", error);
        toast({
          title: "Error",
          description: "Failed to load recipes",
          variant: "destructive",
        });
      }
    };

    const checkAdminStatus = async () => {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        setUser(currentUser);

        if (currentUser) {
          const { data: roles } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", currentUser.id)
            .single();

          setIsAdmin(roles?.role === "admin");
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
      }
    };

    checkAdminStatus();
    fetchUsers();
    fetchRecipes();
  }, []);

  const handleDeleteUser = async (userId: string) => {
    try {
      const { error } = await supabase.functions.invoke("delete-user", {
        body: { userId },
      });

      if (error) throw error;

      setUsers(users.filter((user) => user.id !== userId));
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRecipe = (recipeId: string) => {
    setRecipes(recipes.filter((recipe) => recipe.id !== recipeId));
  };

  if (!user || !isAdmin) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Unauthorized</h1>
        <p>You must be an admin to view this page.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      
      <AdminStats users={users} recipes={recipes} />
      
      <UserManagement 
        users={users}
        onDeleteUser={handleDeleteUser}
      />
      
      <RecipeManagement
        recipes={recipes}
        onDeleteRecipe={handleDeleteRecipe}
        currentUserId={user.id}
        isAdmin={isAdmin}
      />
    </div>
  );
}