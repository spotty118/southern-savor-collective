import { useNavigate } from "react-router-dom";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";

interface AuthButtonProps {
  user: User | null;
}

export const AuthButton = ({ user }: AuthButtonProps) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear any sensitive data from localStorage
      localStorage.removeItem('lastRoute');
      
      navigate("/auth");
    } catch (error) {
      if (error instanceof Error) {
        toast({
          title: "Logout Failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Prevent navigation if logout is in progress
  const handleLogin = () => {
    if (!isLoading) {
      navigate("/auth");
    }
  };

  return (
    <Button
      onClick={user ? handleLogout : handleLogin}
      variant={user ? "outline" : "default"}
      disabled={isLoading}
    >
      {isLoading ? "Processing..." : user ? "Logout" : "Login"}
    </Button>
  );
};