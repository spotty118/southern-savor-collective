import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface DashboardStatsProps {
  userId: string;
}

export const DashboardStats = ({ userId }: DashboardStatsProps) => {
  const [stats, setStats] = useState({
    totalLikes: 0,
    totalRatings: 0,
    totalRecipes: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        console.log("Fetching dashboard stats for user:", userId);
        
        const [favoritesData, ratingsData, recipesData] = await Promise.all([
          supabase
            .from("favorites")
            .select("*", { count: "exact" })
            .eq("user_id", userId),
          supabase
            .from("ratings")
            .select("*", { count: "exact" })
            .eq("user_id", userId),
          supabase
            .from("recipes")
            .select("*", { count: "exact" })
            .eq("author_id", userId),
        ]);

        console.log("Stats data:", {
          favorites: favoritesData.count,
          ratings: ratingsData.count,
          recipes: recipesData.count,
        });

        setStats({
          totalLikes: favoritesData.count || 0,
          totalRatings: ratingsData.count || 0,
          totalRecipes: recipesData.count || 0,
        });
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchStats();
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="flex justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Saved Recipes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalLikes}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ratings Given</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalRatings}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Recipes Created</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalRecipes}</div>
        </CardContent>
      </Card>
    </div>
  );
};