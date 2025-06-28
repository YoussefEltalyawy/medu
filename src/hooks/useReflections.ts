import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase";
import type { Database } from "@/types/database.types";
import { toast } from "sonner";

type Reflection = Database["public"]["Tables"]["reflections"]["Row"];
type ReflectionInsert = Database["public"]["Tables"]["reflections"]["Insert"];

export function useReflections() {
  const supabase = createClient();
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReflections = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in");
      const { data, error } = await supabase
        .from("reflections")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setReflections(data || []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch reflections");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const createReflection = async (reflection: Omit<ReflectionInsert, "user_id">) => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in");
      const { error } = await supabase
        .from("reflections")
        .insert([{ ...reflection, user_id: user.id }]);
      if (error) throw error;
      
      // Add activity for the reflection
      await supabase
        .from("activities")
        .insert({
          user_id: user.id,
          type: "reflection_added",
          content: `Added a journal entry (${reflection.study_time} minutes of study time)`,
          time: new Date().toISOString()
        });
      
      toast.success("Journal entry saved successfully!");
      return true;
    } catch (err: any) {
      setError(err.message || "Failed to create reflection");
      toast.error("Failed to save journal entry");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getTodaysReflection = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      const { data, error } = await supabase
        .from("reflections")
        .select("*")
        .eq("user_id", user.id)
        .eq("date", today)
        .single();
      
      if (error && error.code !== "PGRST116") throw error;
      return data;
    } catch (err: any) {
      console.error("Error fetching today's reflection:", err);
      return null;
    }
  }, [supabase]);

  return {
    reflections,
    loading,
    error,
    fetchReflections,
    createReflection,
    getTodaysReflection,
  };
} 