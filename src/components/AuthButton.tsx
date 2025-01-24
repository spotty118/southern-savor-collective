import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const AuthButton = ({ user }: { user: any }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      navigate("/auth");
    }
  };

  return user ? (
    <Button onClick={handleLogout} variant="outline">
      Logout
    </Button>
  ) : (
    <Button onClick={() => navigate("/auth")} variant="default">
      Login
    </Button>
  );
};