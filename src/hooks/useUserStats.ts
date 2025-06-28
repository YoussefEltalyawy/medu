import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase";
import type { Database } from "@/types/database.types";

type UserStats = Database["public"]["Tables"]["user_stats"]["Row"];

export function useUserStats() {
  const supabase = createClient();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in");
      const { data, error } = await supabase
        .from("user_stats")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (error && error.code !== "PGRST116") throw error;
      setStats(data || null);
    } catch (err: any) {
      setError(err.message || "Failed to fetch stats");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  return {
    stats,
    loading,
    error,
    fetchStats,
  };
} 