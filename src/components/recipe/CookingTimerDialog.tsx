import { useState, useEffect } from "react";
import { Timer } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CookingTimerDialogProps {
  recipeId: string;
}

interface Timer {
  id: string;
  step_index: number;
  duration: string;
  label: string;
}

export const CookingTimerDialog = ({ recipeId }: CookingTimerDialogProps) => {
  const [timers, setTimers] = useState<Timer[]>([]);
  const [activeTimers, setActiveTimers] = useState<{ [key: string]: NodeJS.Timeout }>({});
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchTimers = async () => {
      try {
        const { data, error } = await supabase
          .from("cooking_timers")
          .select("*")
          .eq("recipe_id", recipeId);

        if (error) throw error;
        setTimers(data || []);
      } catch (error: any) {
        console.error("Error fetching timers:", error);
        toast({
          title: "Error",
          description: "Failed to load timers",
          variant: "destructive",
        });
      }
    };

    if (open) {
      fetchTimers();
    }
  }, [recipeId, open]);

  const startTimer = (timer: Timer) => {
    if (activeTimers[timer.id]) {
      clearTimeout(activeTimers[timer.id]);
      const newActiveTimers = { ...activeTimers };
      delete newActiveTimers[timer.id];
      setActiveTimers(newActiveTimers);
      return;
    }

    const durationInMs = parseDuration(timer.duration);
    const timeoutId = setTimeout(() => {
      toast({
        title: "Timer Complete!",
        description: `${timer.label} is ready!`,
      });
      const newActiveTimers = { ...activeTimers };
      delete newActiveTimers[timer.id];
      setActiveTimers(newActiveTimers);
    }, durationInMs);

    setActiveTimers(prev => ({
      ...prev,
      [timer.id]: timeoutId
    }));
  };

  const parseDuration = (duration: string): number => {
    const matches = duration.match(/(\d+):(\d+):(\d+)/);
    if (!matches) return 0;
    const [, hours, minutes, seconds] = matches;
    return (parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(seconds)) * 1000;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="bg-white/90 hover:bg-white z-10"
        >
          <Timer className="h-5 w-5 text-gray-500" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cooking Timers</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {timers.map((timer) => (
            <div key={timer.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium">{timer.label}</h4>
                <p className="text-sm text-gray-500">{timer.duration}</p>
              </div>
              <Button
                variant={activeTimers[timer.id] ? "destructive" : "default"}
                onClick={() => startTimer(timer)}
              >
                {activeTimers[timer.id] ? "Stop" : "Start"} Timer
              </Button>
            </div>
          ))}
          {timers.length === 0 && (
            <p className="text-center text-gray-500">No timers set for this recipe</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};