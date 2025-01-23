import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Loader2, Users, BookOpen, Home } from "lucide-react";

const Admin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRecipes: 0,
  });
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminAndLoadStats = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate("/auth");
          return;
        }

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

        // Get statistics
        const [usersResponse, recipesResponse] = await Promise.all([
          supabase.from("profiles").select("id", { count: "exact" }),
          supabase.from("recipes").select("id", { count: "exact" }),
        ]);

        setStats({
          totalUsers: usersResponse.count || 0,
          totalRecipes: recipesResponse.count || 0,
        });
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

    checkAdminAndLoadStats();
  }, [navigate]);

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
      <Button 
        variant="ghost" 
        onClick={() => navigate("/")}
        className="mb-6"
      >
        <Home className="mr-2 h-4 w-4" />
        Back to Home
      </Button>
      <h1 className="mb-8 text-3xl font-bold">Admin Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recipes</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRecipes}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;