"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StatusCard } from "@/components/vocabulary/StatusCard";
import { Plus, BarChart2, BookOpen, Target, Calendar, CheckCircle, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase";
import type { Database } from "@/types/database.types";
import AnalyticsSection from "./AnalyticsSection";
import GoalsSection from "./GoalsSection";
import JournalSection from "./JournalSection";

// Types

type Goal = Database["public"]["Tables"]["goals"]["Row"];
type GoalInsert = Database["public"]["Tables"]["goals"]["Insert"];
type GoalTemplate = Database["public"]["Tables"]["goal_templates"]["Row"];
type Reflection = Database["public"]["Tables"]["reflections"]["Row"];
type UserStats = Database["public"]["Tables"]["user_stats"]["Row"];

// Custom hook for progress data
function useProgress() {
  const supabase = createClient();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [goalTemplates, setGoalTemplates] = useState<GoalTemplate[]>([]);
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all data
  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in");

      // Fetch goals
      const { data: goalsData, error: goalsError } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (goalsError) throw goalsError;
      setGoals(goalsData || []);

      // Fetch goal templates
      const { data: templatesData, error: templatesError } = await supabase
        .from("goal_templates")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: true });
      if (templatesError) throw templatesError;
      setGoalTemplates(templatesData || []);

      // Fetch reflections
      const { data: reflectionsData, error: reflectionsError } = await supabase
        .from("reflections")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false });
      if (reflectionsError) throw reflectionsError;
      setReflections(reflectionsData || []);

      // Fetch user stats
      const { data: statsData, error: statsError } = await supabase
        .from("user_stats")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (statsError && statsError.code !== "PGRST116") throw statsError;
      setUserStats(statsData || null);
    } catch (err: any) {
      setError(err.message || "Failed to load progress data");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // Create goal
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
      await fetchAll();
      return true;
    } catch (err: any) {
      setError(err.message || "Failed to create goal");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Create reflection
  const createReflection = async (content: string, study_time: number) => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in");
      const { error } = await supabase
        .from("reflections")
        .insert([{ content, study_time, user_id: user.id }]);
      if (error) throw error;
      await fetchAll();
      return true;
    } catch (err: any) {
      setError(err.message || "Failed to add journal entry");
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    goals,
    goalTemplates,
    reflections,
    userStats,
    loading,
    error,
    createGoal,
    createReflection,
    refetch: fetchAll,
  };
}

// --- UI ---

const ProgressTab: React.FC = () => {
  const {
    goals,
    goalTemplates,
    reflections,
    userStats,
    loading,
    error,
    createGoal,
    createReflection,
    refetch,
  } = useProgress();

  // Dialog state
  const [goalDialogOpen, setGoalDialogOpen] = useState(false);
  const [journalDialogOpen, setJournalDialogOpen] = useState(false);
  const [goalForm, setGoalForm] = useState<Partial<GoalInsert>>({});
  const [journalForm, setJournalForm] = useState<{ content: string; study_time: number }>({ content: "", study_time: 0 });
  const [tab, setTab] = useState("analytics");

  // Handlers
  const handleGoalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalForm.title || !goalForm.target || !goalForm.unit) return;
    const success = await createGoal(goalForm as Omit<GoalInsert, "user_id">);
    if (success) {
      setGoalDialogOpen(false);
      setGoalForm({});
    }
  };
  const handleJournalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!journalForm.content || !journalForm.study_time) return;
    const success = await createReflection(journalForm.content, journalForm.study_time);
    if (success) {
      setJournalDialogOpen(false);
      setJournalForm({ content: "", study_time: 0 });
    }
  };

  // --- UI ---
  if (loading) return <div className="text-center py-8">Loading progress...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold mb-6">Progress & Goals</h2>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="analytics"><BarChart2 className="mr-2 w-4 h-4" /> Analytics</TabsTrigger>
          <TabsTrigger value="goals"><Target className="mr-2 w-4 h-4" /> Goals</TabsTrigger>
          <TabsTrigger value="journal"><BookOpen className="mr-2 w-4 h-4" /> Journal</TabsTrigger>
        </TabsList>
        <TabsContent value="analytics">
          <AnalyticsSection />
        </TabsContent>
        <TabsContent value="goals">
          <GoalsSection />
        </TabsContent>
        <TabsContent value="journal">
          <JournalSection />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProgressTab;
