import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { UserRecipesList } from "@/components/dashboard/UserRecipesList";
import { useRecipeUser } from "@/hooks/recipe/useRecipeUser";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useRecipeUser();
  const [activeTab, setActiveTab] = useState("created");

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-accent">My Dashboard</h1>
        <Button variant="ghost" onClick={() => navigate("/")}>
          <Home className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
      </div>

      <DashboardStats userId={user.id} />

      <div className="mt-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white">
            <TabsTrigger value="created">My Recipes</TabsTrigger>
            <TabsTrigger value="liked">Saved Recipes</TabsTrigger>
          </TabsList>
          <TabsContent value="created" className="mt-6">
            <UserRecipesList
              userId={user.id}
              type="created"
              currentUserId={user.id}
            />
          </TabsContent>
          <TabsContent value="liked" className="mt-6">
            <UserRecipesList
              userId={user.id}
              type="liked"
              currentUserId={user.id}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;