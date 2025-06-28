import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase";
import type { Database } from "@/types/database.types";

type Activity = Database["public"]["Tables"]["activities"]["Row"];

export interface FilteredActivity {
  id: string;
  content: string;
  count: number;
  latestTime: string;
  type: string;
}

export function useActivities() {
  const supabase = createClient();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<FilteredActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = useCallback(async (limit?: number) => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in");
      
      let query = supabase
        .from("activities")
        .select("*")
        .eq("user_id", user.id)
        .neq("type", "content_unwatched") // Exclude unwatched activities
        .order("time", { ascending: false });
      
      if (limit) {
        query = query.limit(limit);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      setActivities(data || []);
      filterDuplicateActivities(data || []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch activities");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const fetchThisWeeksActivities = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in");
      
      // Get the start of this week (Monday)
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay() + 1); // Monday
      startOfWeek.setHours(0, 0, 0, 0);
      
      const { data, error } = await supabase
        .from("activities")
        .select("*")
        .eq("user_id", user.id)
        .neq("type", "content_unwatched") // Exclude unwatched activities
        .gte("time", startOfWeek.toISOString())
        .order("time", { ascending: false });
      
      if (error) throw error;
      
      setActivities(data || []);
      filterDuplicateActivities(data || []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch activities");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const filterDuplicateActivities = (activities: Activity[]) => {
    const activityGroups = new Map<string, Activity[]>();
    
    activities.forEach(activity => {
      // Create a key based on the activity content (normalized)
      const normalizedContent = activity.content.toLowerCase().trim();
      const key = `${activity.type}:${normalizedContent}`;
      
      if (!activityGroups.has(key)) {
        activityGroups.set(key, []);
      }
      activityGroups.get(key)!.push(activity);
    });
    
    const filtered: FilteredActivity[] = [];
    
    activityGroups.forEach((group, key) => {
      const [type, content] = key.split(':', 2);
      const latestActivity = group[0]; // Already sorted by time desc
      
      filtered.push({
        id: latestActivity.id,
        content: latestActivity.content,
        count: group.length,
        latestTime: latestActivity.time,
        type: latestActivity.type
      });
    });
    
    // Sort by latest time
    filtered.sort((a, b) => new Date(b.latestTime).getTime() - new Date(a.latestTime).getTime());
    
    setFilteredActivities(filtered);
  };

  return {
    activities,
    filteredActivities,
    loading,
    error,
    fetchActivities,
    fetchThisWeeksActivities,
  };
} 