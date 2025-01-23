import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Home, Loader2 } from "lucide-react";
import { AdminStats } from "@/components/admin/AdminStats";
import { UserManagement } from "@/components/admin/UserManagement";
import { RecipeManagement } from "@/components/admin/RecipeManagement";

const Admin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRecipes: 0,
  });
  const [users, setUsers] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>("");

  useEffect(() => {
    const checkAdminAndLoadData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate("/auth");
          return;
        }

        setCurrentUserId(session.user.id);

        // Check if user is admin
        const { data: roleData, error: roleError } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .eq("role", "admin")
          .single();

        if (roleError || !roleData) {
          navigate("/");
          toast({
            title: "Access Denied",
            description: "You don't have permission to view this page",
            variant: "destructive",
          });
          return;
        }

        setIsAdmin(true);

        // Fetch users
        const { data: userData, error: userError } = await supabase
          .from("profiles")
          .select("*")
          .order("created_at", { ascending: false });

        if (userError) throw userError;
        setUsers(userData);
        setStats(prev => ({ ...prev, totalUsers: userData.length }));

        // Fetch recipes
        const { data: recipeData, error: recipeError } = await supabase
          .from("recipes")
          .select(`
            id,
            title,
            created_at,
            author:profiles(username)
          `)
          .order("created_at", { ascending: false });

        if (recipeError) throw recipeError;
        setRecipes(recipeData);
        setStats(prev => ({ ...prev, totalRecipes: recipeData.length }));

      } catch (error: any) {
        console.error("Error loading admin data:", error);
        toast({
          title: "Error",
          description: "Failed to load admin dashboard",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    checkAdminAndLoadData();
  }, [navigate]);

  const handleDeleteRecipe = (recipeId: string) => {
    setRecipes(recipes.filter(recipe => recipe.id !== recipeId));
    setStats(prev => ({ ...prev, totalRecipes: prev.totalRecipes - 1 }));
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Y'all Eat Admin Dashboard</h1>
        <Button 
          variant="ghost" 
          onClick={() => navigate("/")}
          className="flex items-center gap-2"
        >
          <Home className="h-4 w-4" />
          Back to Home
        </Button>
      </div>

      <AdminStats totalUsers={stats.totalUsers} totalRecipes={stats.totalRecipes} />

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="recipes">Recipes</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <UserManagement users={users} />
        </TabsContent>

        <TabsContent value="recipes">
          <RecipeManagement 
            recipes={recipes}
            onDeleteRecipe={handleDeleteRecipe}
            currentUserId={currentUserId}
            isAdmin={isAdmin}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;