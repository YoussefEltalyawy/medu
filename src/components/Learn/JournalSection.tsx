"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { BookOpen, Plus } from "lucide-react";
import { useReflections } from "@/hooks/useReflections";
import { useForm } from "react-hook-form";
import type { Database } from "@/types/database.types";

type ReflectionInsert = Omit<Database["public"]["Tables"]["reflections"]["Insert"], "user_id">;

const JournalSection: React.FC = () => {
  const { reflections, loading, error, fetchReflections, createReflection } = useReflections();
  const [dialogOpen, setDialogOpen] = useState(false);
  const form = useForm<ReflectionInsert>({ defaultValues: { content: "", study_time: 0 } });

  useEffect(() => {
    fetchReflections();
  }, [fetchReflections]);

  const onSubmit = async (data: ReflectionInsert) => {
    if (!data.content || !data.study_time) return;
    await createReflection(data.content, data.study_time);
    setDialogOpen(false);
    form.reset();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Your Journal</h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#082408] text-white rounded-full"><Plus className="mr-2 w-4 h-4" /> Add Entry</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Journal Entry</DialogTitle>
              <DialogDescription>Reflect on your study sessions.</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField name="content" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="What did you study today?" required />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField name="study_time" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Study Time (minutes)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} placeholder="Study time (minutes)" required />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <DialogFooter>
                  <Button type="submit" className="bg-[#082408] text-white rounded-full flex-1">Add Entry</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="space-y-4">
        {loading ? (
          <div className="text-center text-gray-500">Loading journal...</div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : reflections.length === 0 ? (
          <div className="text-center text-gray-500">No journal entries yet.</div>
        ) : reflections.map(ref => (
          <Card key={ref.id} className="p-6 bg-white shadow-sm rounded-xl border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-5 h-5 text-[#4E4211]" />
              <span className="font-bold">{ref.date || ref.created_at?.slice(0, 10)}</span>
              <span className="ml-auto text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">{ref.study_time} min</span>
            </div>
            <div className="text-gray-700 whitespace-pre-line">{ref.content}</div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default JournalSection; 