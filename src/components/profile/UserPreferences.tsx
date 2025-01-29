import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface UserPreferencesProps {
  userId: string;
}

interface UserPreferences {
  cooking_skill_level: string;
  dietary_preferences: string[];
  favorite_cuisines: string[];
  social_links: Record<string, string>;
}

export const UserPreferences = ({ userId }: UserPreferencesProps) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences>({
    cooking_skill_level: "",
    dietary_preferences: [],
    favorite_cuisines: [],
    social_links: {},
  });

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const { data, error } = await supabase
          .from("user_preferences")
          .select("*")
          .eq("user_id", userId)
          .single();

        if (error) throw error;

        if (data) {
          setPreferences({
            cooking_skill_level: data.cooking_skill_level || "",
            dietary_preferences: (data.dietary_preferences as string[]) || [],
            favorite_cuisines: (data.favorite_cuisines as string[]) || [],
            social_links: (data.social_links as Record<string, string>) || {},
          });
        }
      } catch (error: any) {
        console.error("Error loading preferences:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, [userId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("user_preferences")
        .upsert({
          user_id: userId,
          ...preferences,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your preferences have been updated",
      });
    } catch (error: any) {
      console.error("Error saving preferences:", error);
      toast({
        title: "Error",
        description: "Failed to save preferences",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium">Cooking Skill Level</label>
        <Select
          value={preferences.cooking_skill_level}
          onValueChange={(value) =>
            setPreferences({ ...preferences, cooking_skill_level: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select your cooking skill level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
            <SelectItem value="professional">Professional</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Social Media Links</label>
        <div className="space-y-2">
          <Input
            placeholder="Instagram"
            value={preferences.social_links.instagram || ""}
            onChange={(e) =>
              setPreferences({
                ...preferences,
                social_links: {
                  ...preferences.social_links,
                  instagram: e.target.value,
                },
              })
            }
          />
          <Input
            placeholder="Twitter"
            value={preferences.social_links.twitter || ""}
            onChange={(e) =>
              setPreferences({
                ...preferences,
                social_links: {
                  ...preferences.social_links,
                  twitter: e.target.value,
                },
              })
            }
          />
        </div>
      </div>

      <Button onClick={handleSave} disabled={saving}>
        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save Preferences
      </Button>
    </div>
  );
};