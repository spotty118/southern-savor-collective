import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useRecipeUser = () => {
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditor, setIsEditor] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const fetchUserRoles = async () => {
      if (!user) return;
      
      try {
        const { data: roles, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        if (error) throw error;

        if (roles) {
          setIsAdmin(roles.some(role => role.role === 'admin'));
          setIsEditor(roles.some(role => role.role === 'editor'));
        }
      } catch (error) {
        console.error('Error fetching user roles:', error);
      }
    };

    fetchUserRoles();
  }, [user]);

  return { user, isAdmin, isEditor };
};