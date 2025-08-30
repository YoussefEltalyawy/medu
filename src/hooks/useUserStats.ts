import { useState, useCallback, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import type { Database } from "@/types/database.types";

type UserStats = Database["public"]["Tables"]["user_stats"]["Row"];

export function useUserStats() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    console.log('useUserStats fetchStats called');
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Auth user in useUserStats:', user?.id);

      if (!user) {
        console.log('No user in useUserStats, setting loading to false');
        setLoading(false);
        setStats(null);
        return;
      }

      console.log('Fetching stats for user:', user.id);
      const { data, error } = await supabase
        .from("user_stats")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      console.log('Stats data fetched:', data);
      setStats(data || null);
    } catch (err: any) {
      console.error('Error in useUserStats:', err);
      setError(err.message || "Failed to fetch stats");
    } finally {
      console.log('Setting useUserStats loading to false');
      setLoading(false);
    }
  }, []);

  // Fetch stats when component mounts
  useEffect(() => {
    console.log('useUserStats useEffect triggered');
    fetchStats();
  }, []);

  return {
    stats,
    loading,
    error,
    fetchStats,
  };
} 