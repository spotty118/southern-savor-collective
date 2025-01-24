import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Version {
  id: string;
  version_number: number;
  title: string;
  description: string | null;
  ingredients: any[];
  instructions: string[];
  cook_time: string | null;
  difficulty: string | null;
  image_url: string | null;
  created_at: string;
  created_by: {
    username: string | null;
  };
}

interface RecipeVersionHistoryProps {
  recipeId: string;
  currentVersion: {
    title: string;
    description: string | null;
    ingredients: any[];
    instructions: string[];
    cook_time: string | null;
    difficulty: string | null;
    image_url: string | null;
  };
  onVersionSelect: (version: Version) => void;
}

export const RecipeVersionHistory = ({
  recipeId,
  currentVersion,
  onVersionSelect,
}: RecipeVersionHistoryProps) => {
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const fetchVersions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("recipe_versions")
        .select(`
          *,
          created_by:profiles(username)
        `)
        .eq("recipe_id", recipeId)
        .order("version_number", { ascending: false });

      if (error) throw error;
      setVersions(data);
      setShowHistory(true);
    } catch (error) {
      console.error("Error fetching recipe versions:", error);
      toast({
        title: "Error",
        description: "Failed to load recipe versions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createVersion = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.from("recipe_versions").insert({
        recipe_id: recipeId,
        title: currentVersion.title,
        description: currentVersion.description,
        ingredients: currentVersion.ingredients,
        instructions: currentVersion.instructions,
        cook_time: currentVersion.cook_time,
        difficulty: currentVersion.difficulty,
        image_url: currentVersion.image_url,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Recipe version saved successfully",
      });

      await fetchVersions();
    } catch (error) {
      console.error("Error creating recipe version:", error);
      toast({
        title: "Error",
        description: "Failed to save recipe version",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (showHistory) {
              setShowHistory(false);
            } else {
              fetchVersions();
            }
          }}
          disabled={loading}
        >
          <Clock className="mr-2 h-4 w-4" />
          {showHistory ? "Hide Version History" : "Show Version History"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={createVersion}
          disabled={loading}
        >
          Save Current Version
        </Button>
      </div>

      {showHistory && (
        <ScrollArea className="h-[300px] rounded-md border p-4">
          <div className="space-y-4">
            {versions.map((version) => (
              <div
                key={version.id}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/10 cursor-pointer"
                onClick={() => onVersionSelect(version)}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      Version {version.version_number}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      by {version.created_by?.username || "Anonymous"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(version.created_at), "PPpp")}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};