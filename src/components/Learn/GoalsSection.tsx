"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Plus, Minus, Target, Pencil, Trash2, Trophy, Calendar, TrendingUp } from "lucide-react";
import { useGoals } from "@/hooks/useGoals";
import { useForm } from "react-hook-form";
import type { Database } from "@/types/database.types";

type GoalInsert = Database["public"]["Tables"]["goals"]["Insert"];

const GoalsSection: React.FC = () => {
  const { goals, templates, loading, error, fetchGoals, fetchTemplates, createGoal, updateGoal, incrementGoal, decrementGoal } = useGoals();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<string | null>(null);
  const form = useForm<GoalInsert>({ defaultValues: { title: "", target: 1, unit: "", description: "" } });
  const editForm = useForm<GoalInsert>({});

  useEffect(() => {
    fetchGoals();
    fetchTemplates();
  }, [fetchGoals, fetchTemplates]);

  const onSubmit = async (data: GoalInsert) => {
    const { title, target, unit, description, template_id } = data;
    if (!title || !target || !unit) return;
    await createGoal({ title, target, unit, description, template_id });
    setDialogOpen(false);
    form.reset();
  };

  const onEdit = async (id: string, data: GoalInsert) => {
    await updateGoal(id, data);
    setEditDialogOpen(null);
    editForm.reset();
  };

  const onDelete = async (id: string) => {
    // Soft delete: set status to archived
    await updateGoal(id, { status: "archived" });
    setDeleteDialogOpen(null);
  };

  const activeGoals = goals.filter(goal => goal.status !== "archived");
  const completedGoals = activeGoals.filter(goal => (goal.current || 0) >= goal.target);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col gap-4">
        <div className="space-y-2">
          <h3 className="text-3xl font-bold flex items-center gap-3">
            Your Goals
          </h3>

          <div className="flex flex-row justify-between">
            <p className="text-gray-600">Track your progress and achieve your aspirations</p>
            <div className="flex gap-3 items-center">
              <div className="bg-blue-50 rounded-full px-4 py-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-blue-600 font-medium">Active: {activeGoals.length}</span>
                </div>
              </div>

              <div className="bg-green-600 rounded-full px-4 py-2">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-green-60" />
                  <span className="text-sm text-green-60 font-medium">Completed: {completedGoals.length}</span>
                </div>
              </div>

              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-brand-accent hover:bg-green-700 text-white rounded-full px-6 py-2 font-semibold transition-colors">
                    <Plus className="mr-2 w-4 h-4" />
                    Add New Goal
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-gray-900">Add New Goal</DialogTitle>
                    <DialogDescription className="text-gray-600">
                      Set a new target and start tracking your progress today.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField name="template_id" control={form.control} render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold text-gray-700">Template (optional)</FormLabel>
                          <FormControl>
                            <select {...field} className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-[#082408] focus:ring-2 focus:ring-[#082408]/10 transition-all">
                              <option value="">Select a template</option>
                              {templates.map(t => (
                                <option key={t.id} value={t.id}>{t.title}</option>
                              ))}
                            </select>
                          </FormControl>
                        </FormItem>
                      )} />
                      <FormField name="title" control={form.control} render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold text-gray-700">Title</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter goal title" required className="border-2 border-gray-200 rounded-xl p-3 focus:border-[#082408] focus:ring-2 focus:ring-[#082408]/10" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField name="description" control={form.control} render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold text-gray-700">Description</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="Describe your goal..." rows={3} className="border-2 border-gray-200 rounded-xl p-3 focus:border-[#082408] focus:ring-2 focus:ring-[#082408]/10" />
                          </FormControl>
                        </FormItem>
                      )} />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField name="target" control={form.control} render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-semibold text-gray-700">Target</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} placeholder="100" required className="border-2 border-gray-200 rounded-xl p-3 focus:border-[#082408] focus:ring-2 focus:ring-[#082408]/10" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField name="unit" control={form.control} render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-semibold text-gray-700">Unit</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="pages, hours..." required className="border-2 border-gray-200 rounded-xl p-3 focus:border-[#082408] focus:ring-2 focus:ring-[#082408]/10" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                      <DialogFooter>
                        <Button type="submit" className="w-full bg-brand-accent hover:bg-green-700 text-white rounded-xl py-3 font-semibold transition-colors">
                          Create Goal
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>


          </div>

          {/* Stats Cards and Add Goal Button */}

        </div>

        {/* Goals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          {loading ? (
            <div className="col-span-full flex justify-center items-center py-16">
              <div className="text-center space-y-4">
                <div className="w-12 h-12 border-4 border-[#082408] border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-gray-500 text-lg">Loading your goals...</p>
              </div>
            </div>
          ) : error ? (
            <div className="col-span-full text-center py-16">
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md mx-auto">
                <p className="text-red-600 font-medium">{error}</p>
              </div>
            </div>
          ) : activeGoals.length === 0 ? (
            <div className="col-span-full text-center py-16">
              <div className="space-y-4">
                <Target className="w-16 h-16 text-gray-300 mx-auto" />
                <h4 className="text-xl font-semibold text-gray-500">No goals yet</h4>
                <p className="text-gray-400">Start your journey by adding your first goal!</p>
              </div>
            </div>
          ) : activeGoals.map(goal => {
            const progress = Math.min(100, Math.round(((goal.current || 0) / goal.target) * 100));
            const isComplete = (goal.current || 0) >= goal.target;

            return (
              <Card key={goal.id} className={`p-6 space-y-4 rounded-2xl border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${isComplete
                ? 'bg-card border-[#5E7850]/20 dark:border-[#1d1d1d]'
                : 'bg-card border-[#5E7850]/20 dark:border-[#1d1d1d]'
                }`}>

                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {isComplete ? (
                        <Trophy className="w-5 h-5 text-[#082408] flex-shrink-0" />
                      ) : (
                        <Target className="w-5 h-5 text-brand-accent flex-shrink-0" />
                      )}
                      <h4 className="font-bold text-lg truncate">{goal.title}</h4>
                    </div>
                    {goal.deadline && (
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {goal.deadline}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-2">
                    <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-gray-100 rounded-full" onClick={() => setEditDialogOpen(goal.id)}>
                      <Pencil className="w-4 h-4 text-gray-600" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-red-50 rounded-full" onClick={() => setDeleteDialogOpen(goal.id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${isComplete
                      ? 'bg-green-50 text-green-600'
                      : goal.status === 'active'
                        ? 'bg-blue-50 text-blue-600'
                        : 'bg-gray-100 text-gray-700'
                      }`}>
                      {isComplete ? 'Completed' : goal.status}
                    </span>
                  </div>
                </div>

                {/* Description */}
                {goal.description && (
                  <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                    {goal.description}
                  </p>
                )}

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="opacity-50 font-medium">Progress</span>
                    <span className="font-bold opacity-50">{progress}%</span>
                  </div>
                  <div className="w-full bg-[#1d1d1d] rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${isComplete
                        ? "bg-brand-accent"
                        : "bg-brand-accent"
                        }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span>0</span>
                    <span className="font-semibold opacity-40">
                      {goal.current || 0} of {goal.target} {goal.unit}
                    </span>
                    <span>{goal.target}</span>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-3 pt-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => decrementGoal(goal.id)}
                    className="h-10 w-10 rounded-xl border-2 hover:bg-red-50 hover:border-red-300 transition-colors"
                    disabled={(goal.current || 0) === 0}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>

                  <div className="bg-card rounded-full px-6 py-2 min-w-[4rem] text-center border">
                    <span className="text-lg font-bold">{goal.current || 0}</span>
                  </div>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => incrementGoal(goal.id)}
                    className="h-10 w-10 rounded-xl border-2 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                    disabled={isComplete}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {/* Edit Dialog */}
                <Dialog open={editDialogOpen === goal.id} onOpenChange={open => setEditDialogOpen(open ? goal.id : null)}>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-bold">Edit Goal</DialogTitle>
                      <DialogDescription>Update your goal details below.</DialogDescription>
                    </DialogHeader>
                    <Form {...editForm}>
                      <form onSubmit={editForm.handleSubmit(data => onEdit(goal.id, data))} className="space-y-4">
                        <FormField name="title" control={editForm.control} defaultValue={goal.title} render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-semibold">Title</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Title" required className="border-2 rounded-xl p-3" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField name="description" control={editForm.control} defaultValue={goal.description || ""} render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-semibold">Description</FormLabel>
                            <FormControl>
                              <Textarea {...field} placeholder="Description" className="border-2 rounded-xl p-3" rows={3} />
                            </FormControl>
                          </FormItem>
                        )} />
                        <div className="grid grid-cols-2 gap-4">
                          <FormField name="target" control={editForm.control} defaultValue={goal.target} render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-semibold">Target</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} placeholder="Target" required className="border-2 rounded-xl p-3" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField name="unit" control={editForm.control} defaultValue={goal.unit} render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-semibold">Unit</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Unit" required className="border-2 rounded-xl p-3" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                        </div>
                        <DialogFooter className="gap-2">
                          <Button type="button" variant="outline" onClick={() => setEditDialogOpen(null)} className="rounded-xl flex-1">
                            Cancel
                          </Button>
                          <Button type="submit" className="bg-brand-accent text-white rounded-xl flex-1">
                            Save Changes
                          </Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>

                {/* Delete Dialog */}
                <Dialog open={deleteDialogOpen === goal.id} onOpenChange={open => setDeleteDialogOpen(open ? goal.id : null)}>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-bold text-red-600">Delete Goal</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to delete "{goal.title}"? This action cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                      <Button type="button" variant="outline" onClick={() => setDeleteDialogOpen(null)} className="rounded-xl flex-1">
                        Cancel
                      </Button>
                      <Button className="bg-red-600 hover:bg-red-700 text-white rounded-xl flex-1" onClick={() => onDelete(goal.id)}>
                        Delete Goal
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default GoalsSection;