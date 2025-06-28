import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase";
import type { Database } from "@/types/database.types";
import { toast } from "sonner";

type Goal = Database["public"]["Tables"]["goals"]["Row"];
type GoalInsert = Database["public"]["Tables"]["goals"]["Insert"];
type GoalTemplate = Database["public"]["Tables"]["goal_templates"]["Row"];

export function useGoals() {
  const supabase = createClient();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [templates, setTemplates] = useState<GoalTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGoals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in");
      const { data, error } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setGoals(data || []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch goals");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("goal_templates")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: true });
      if (error) throw error;
      setTemplates(data || []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch templates");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const createGoal = async (goal: Omit<GoalInsert, "user_id">) => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in");
      const { error } = await supabase
        .from("goals")
        .insert([{ ...goal, user_id: user.id }]);
      if (error) throw error;
      await fetchGoals();
      return true;
    } catch (err: any) {
      setError(err.message || "Failed to create goal");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateGoal = async (id: string, updates: Partial<Goal>) => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from("goals")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
      await fetchGoals();
      return true;
    } catch (err: any) {
      setError(err.message || "Failed to update goal");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Optimistic increment
  const incrementGoal = async (id: string) => {
    const goal = goals.find(g => g.id === id);
    if (!goal) return false;
    const optimistic = { ...goal, current: (goal.current || 0) + 1 };
    setGoals(prev => prev.map(g => g.id === id ? optimistic : g));
    try {
      const { error } = await supabase
        .from("goals")
        .update({ current: optimistic.current })
        .eq("id", id);
      if (error) throw error;
      // Optionally refetch
      // await fetchGoals();
      return true;
    } catch (err: any) {
      setGoals(prev => prev.map(g => g.id === id ? goal : g));
      toast.error("Failed to update goal");
      return false;
    }
  };

  // Optimistic decrement
  const decrementGoal = async (id: string) => {
    const goal = goals.find(g => g.id === id);
    if (!goal) return false;
    const optimistic = { ...goal, current: Math.max(0, (goal.current || 0) - 1) };
    setGoals(prev => prev.map(g => g.id === id ? optimistic : g));
    try {
      const { error } = await supabase
        .from("goals")
        .update({ current: optimistic.current })
        .eq("id", id);
      if (error) throw error;
      // Optionally refetch
      // await fetchGoals();
      return true;
    } catch (err: any) {
      setGoals(prev => prev.map(g => g.id === id ? goal : g));
      toast.error("Failed to update goal");
      return false;
    }
  };

  return {
    goals,
    templates,
    loading,
    error,
    fetchGoals,
    fetchTemplates,
    createGoal,
    updateGoal,
    incrementGoal,
    decrementGoal,
  };
} 