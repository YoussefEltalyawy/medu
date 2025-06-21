"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Squircle } from "corner-smoothing";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Pencil, Trash2, Plus, BookOpen, Clock, CheckCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface VocabularyWord {
  id: string;
  german: string;
  english: string;
  example: string | null;
  status: "learning" | "familiar" | "mastered";
  isOptimistic?: boolean; // Flag for optimistic updates
}

const VocabularyTab: React.FC = () => {
  const [words, setWords] = useState<VocabularyWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newWord, setNewWord] = useState({
    german: "",
    english: "",
    example: "",
  });
  const [isAddingWord, setIsAddingWord] = useState(false);
  const [editingWordId, setEditingWordId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<
    "all" | "learning" | "familiar" | "mastered"
  >("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [wordToDelete, setWordToDelete] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const supabase = createClient();

  // Generate temporary ID for optimistic updates
  const generateTempId = () => `temp_${Date.now()}_${Math.random()}`;

  // Fetch all vocabulary words
  const fetchWords = useCallback(async () => {
    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("You must be logged in to view your vocabulary");
        return;
      }

      // Get all vocabulary words for the user
      const { data, error } = await supabase
        .from("vocabulary_words")
        .select("id, german, english, example, status")
        .eq("user_id", user.id)
        .order("german", { ascending: true });

      if (error) throw error;

      if (!data) {
        setWords([]);
      } else {
        // Filter out any optimistic entries when fresh data comes in
        setWords((prev) => [
          ...data,
          ...prev.filter((word) => word.isOptimistic),
        ]);
      }
    } catch (err) {
      console.error("Error fetching vocabulary:", err);
      setError("Failed to load vocabulary words");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // Validate form fields
  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!newWord.german.trim()) errors.german = 'German word is required';
    if (!newWord.english.trim()) errors.english = 'English translation is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Add a new word to vocabulary with optimistic update
  const addWord = async () => {
    if (!validateForm()) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You must be logged in to add words");
      return;
    }

    // Create optimistic word entry
    const tempId = generateTempId();
    const optimisticWord: VocabularyWord = {
      id: tempId,
      german: newWord.german,
      english: newWord.english,
      example: newWord.example || null,
      status: "learning",
      isOptimistic: true,
    };

    // Store current form state for potential rollback
    const currentFormState = { ...newWord };

    try {
      // Optimistic update - add word immediately to UI
      setWords((prev) => [...prev, optimisticWord]);

      // Reset form immediately
      setNewWord({ german: "", english: "", example: "" });
      setIsAddingWord(false);

      // Background database update
      const { data, error } = await supabase
        .from("vocabulary_words")
        .insert([
          {
            user_id: user.id,
            german: optimisticWord.german,
            english: optimisticWord.english,
            example: optimisticWord.example,
            status: optimisticWord.status,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Replace optimistic entry with real data
      setWords((prev) =>
        prev.map((word) =>
          word.id === tempId ? { ...data, isOptimistic: false } : word
        )
      );
    } catch (err) {
      console.error("Error adding word:", err);

      // Revert optimistic update on error
      setWords((prev) => prev.filter((word) => word.id !== tempId));
      setError("Failed to add word");

      // Restore form state
      setNewWord({
        german: currentFormState.german,
        english: currentFormState.english,
        example: currentFormState.example || "",
      });
      setIsAddingWord(true);
    }
  };

  // Update word status with optimistic update
  const updateWordStatus = async (
    id: string,
    newStatus: "learning" | "familiar" | "mastered"
  ) => {
    // Store original status for potential rollback
    const originalWord = words.find((word) => word.id === id);
    if (!originalWord) return;

    // Optimistic update - change status immediately
    setWords((prev) =>
      prev.map((word) =>
        word.id === id
          ? { ...word, status: newStatus, isOptimistic: true }
          : word
      )
    );

    try {
      const { error } = await supabase
        .from("vocabulary_words")
        .update({
          status: newStatus,
          last_reviewed: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      // Mark as no longer optimistic
      setWords((prev) =>
        prev.map((word) =>
          word.id === id ? { ...word, isOptimistic: false } : word
        )
      );
    } catch (err) {
      console.error("Error updating word status:", err);

      // Revert optimistic update on error
      setWords((prev) =>
        prev.map((word) =>
          word.id === id ? { ...originalWord, isOptimistic: false } : word
        )
      );
      setError("Failed to update word status");
    }
  };

  // Delete a word with optimistic update
  const deleteWord = async (id: string) => {
    setDeleteDialogOpen(false);
    setWordToDelete(null);
    
    // Store original word for potential rollback
    const originalWord = words.find((word) => word.id === id);
    if (!originalWord) return;

    // Optimistic update - remove word immediately
    setWords((prev) => prev.filter((word) => word.id !== id));

    try {
      const { error } = await supabase
        .from("vocabulary_words")
        .delete()
        .eq("id", id);

      if (error) throw error;
    } catch (err) {
      console.error("Error deleting word:", err);

      // Revert optimistic update on error
      setWords((prev) => [...prev, originalWord]);
      setError("Failed to delete word");
    }
  };

  // Edit a word
  const startEditingWord = (word: VocabularyWord) => {
    setEditingWordId(word.id);
    setNewWord({
      german: word.german,
      english: word.english,
      example: word.example || "",
    });
    setIsAddingWord(true);
  };

  // Save edited word with optimistic update
  const saveEditedWord = async () => {
    if (!validateForm()) return;
    
    // Close the dialog after saving
    setIsAddingWord(false);

    if (!editingWordId) return;

    // Store original word for potential rollback
    const originalWord = words.find((word) => word.id === editingWordId);
    if (!originalWord) return;

    // Store current form state for potential rollback
    const currentFormState = { ...newWord };
    const currentEditingId = editingWordId;

    try {
      // Optimistic update - change word data immediately
      setWords((prev) =>
        prev.map((word) =>
          word.id === editingWordId
            ? {
                ...word,
                german: newWord.german,
                english: newWord.english,
                example: newWord.example || null,
                isOptimistic: true,
              }
            : word
        )
      );

      // Reset form immediately
      setNewWord({ german: "", english: "", example: "" });
      setIsAddingWord(false);
      setEditingWordId(null);

      const { error } = await supabase
        .from("vocabulary_words")
        .update({
          german: currentFormState.german,
          english: currentFormState.english,
          example: currentFormState.example || null,
        })
        .eq("id", currentEditingId);

      if (error) throw error;

      // Mark as no longer optimistic
      setWords((prev) =>
        prev.map((word) =>
          word.id === currentEditingId ? { ...word, isOptimistic: false } : word
        )
      );
    } catch (err) {
      console.error("Error updating word:", err);

      // Revert optimistic update on error
      setWords((prev) =>
        prev.map((word) =>
          word.id === currentEditingId
            ? { ...originalWord, isOptimistic: false }
            : word
        )
      );
      setError("Failed to update word");

      // Restore form state
      setNewWord({
        german: currentFormState.german,
        english: currentFormState.english,
        example: currentFormState.example,
      });
      setIsAddingWord(true);
      setEditingWordId(currentEditingId);
    }
  };

  // Filter words by status
  const filteredWords =
    filterStatus === "all"
      ? words
      : words.filter((word) => word.status === filterStatus);

  // Calculate word counts by status
  const masteredCount = words.filter(
    (word) => word.status === "mastered"
  ).length;
  const familiarCount = words.filter(
    (word) => word.status === "familiar"
  ).length;
  const learningCount = words.filter(
    (word) => word.status === "learning"
  ).length;

  useEffect(() => {
    fetchWords();
  }, [fetchWords]);

  if (loading) {
    return <div className="text-center py-8">Loading vocabulary...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">{error}</p>
        <Button
          onClick={() => {
            setError(null);
            fetchWords();
          }}
          className="bg-[#082408] text-white px-4 py-2 rounded-full hover:bg-opacity-90"
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold mb-6">Vocabulary Tracker</h2>
      {/* Progress Cards */}
      <div className="grid grid-cols-3 gap-6 mb-8 h-24 sm:h-28 md:h-32 lg:h-36">
        <Squircle
          cornerRadius={20}
          className="bg-[#082408] text-[#e6f2e6] p-6 relative overflow-hidden before:bg-[#082408] h-full"
        >
          <div className="relative z-10 h-full flex flex-col">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Mastered</h3>
              <CheckCircle className="w-5 h-5 text-[#e6f2e6]" />
            </div>
            <div className="mt-auto text-right">
              <div className="text-3xl font-bold">{masteredCount} Words</div>
            </div>
          </div>
        </Squircle>

        <Squircle
          cornerRadius={20}
          className="bg-[#4E4211] text-[#f5f0dc] p-6 relative overflow-hidden before:bg-[#4E4211] h-full"
        >
          <div className="relative z-10 h-full flex flex-col">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Familiar</h3>
              <Clock className="w-5 h-5 text-[#f5f0dc]" />
            </div>
            <div className="mt-auto text-right">
              <div className="text-3xl font-bold">{familiarCount} Words</div>
            </div>
          </div>
        </Squircle>

        <Squircle
          cornerRadius={20}
          className="bg-[#240808] text-[#f2e6e6] p-6 relative overflow-hidden before:bg-[#240808] h-full"
        >
          <div className="relative z-10 h-full flex flex-col">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Learning</h3>
              <BookOpen className="w-5 h-5 text-[#f2e6e6]" />
            </div>
            <div className="mt-auto text-right">
              <div className="text-3xl font-bold">{learningCount} Words</div>
            </div>
          </div>
        </Squircle>
      </div>

      {/* Add Word Button and Filter Controls */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Dialog
            open={isAddingWord}
            onOpenChange={(open) => {
              setIsAddingWord(open);
              if (!open) {
                setEditingWordId(null);
                setNewWord({ german: "", english: "", example: "" });
                setFormErrors({});
              }
            }}
          >
            <DialogTrigger asChild>
              <Button className="bg-[#082408] text-white px-4 py-2 rounded-full hover:bg-opacity-90">
                <Plus className="mr-2 h-4 w-4" />
                Add New Word
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{editingWordId ? "Edit Word" : "Add New Word"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    German <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="german"
                    value={newWord.german}
                    onChange={(e) => {
                      setNewWord({ ...newWord, german: e.target.value });
                      if (formErrors.german) {
                        setFormErrors({ ...formErrors, german: '' });
                      }
                    }}
                    placeholder="Enter German word"
                    className={`w-full ${formErrors.german ? 'border-red-500' : ''}`}
                  />
                  {formErrors.german && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.german}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    English <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="english"
                    value={newWord.english}
                    onChange={(e) => {
                      setNewWord({ ...newWord, english: e.target.value });
                      if (formErrors.english) {
                        setFormErrors({ ...formErrors, english: '' });
                      }
                    }}
                    placeholder="Enter English translation"
                    className={`w-full ${formErrors.english ? 'border-red-500' : ''}`}
                  />
                  {formErrors.english && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.english}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Example (optional)
                  </label>
                  <Input
                    id="example"
                    value={newWord.example || ""}
                    onChange={(e) =>
                      setNewWord({ ...newWord, example: e.target.value })
                    }
                    placeholder="Enter an example sentence"
                    className="w-full"
                  />
                </div>
                <div className="flex justify-end pt-2">
                  <Button
                    onClick={editingWordId ? saveEditedWord : addWord}
                    className="bg-[#082408] text-white px-4 py-2 rounded-full hover:bg-opacity-90"
                    disabled={!newWord.german.trim() || !newWord.english.trim()}
                  >
                    {editingWordId ? "Save Changes" : "Add Word"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-3 py-1 rounded-full text-sm ${
              filterStatus === "all"
                ? "bg-[#082408] text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterStatus("learning")}
            className={`px-3 py-1 rounded-full text-sm ${
              filterStatus === "learning"
                ? "bg-[#240808] text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Learning
          </button>
          <button
            onClick={() => setFilterStatus("familiar")}
            className={`px-3 py-1 rounded-full text-sm ${
              filterStatus === "familiar"
                ? "bg-[#4E4211] text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Familiar
          </button>
          <button
            onClick={() => setFilterStatus("mastered")}
            className={`px-3 py-1 rounded-full text-sm ${
              filterStatus === "mastered"
                ? "bg-[#082408] text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Mastered
          </button>
        </div>
      </div>

      {/* Vocabulary Words List */}
      <div className="space-y-4">
        {filteredWords.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {words.length === 0
              ? "No vocabulary words found. Add your first word!"
              : `No ${filterStatus} words found.`}
          </div>
        ) : (
          filteredWords.map((word) => (
            <div
              key={word.id}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {word.german}
                  </h3>
                  <p className="text-gray-600 mb-2">{word.english}</p>
                  {word.example && (
                    <p className="text-gray-500 italic text-sm">
                      &quot;{word.example}&quot;
                    </p>
                  )}
                </div>
                <div className="ml-4 flex items-center space-x-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => startEditingWord(word)}
                          disabled={word.isOptimistic}
                          className="h-8 w-8 p-0"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Edit</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setWordToDelete(word.id);
                            setDeleteDialogOpen(true);
                          }}
                          disabled={word.isOptimistic}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Delete</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <span
                        className={`px-3 py-1 text-sm font-medium rounded-full cursor-pointer ${
                          word.status === "learning"
                            ? "bg-red-100 text-red-800"
                            : word.status === "familiar"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {word.status.charAt(0).toUpperCase() + word.status.slice(1)}
                      </span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                      <DropdownMenuItem onClick={() => updateWordStatus(word.id, "learning")}>
                        <span className="px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full">
                          Learning
                        </span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => updateWordStatus(word.id, "familiar")}>
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
                          Familiar
                        </span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => updateWordStatus(word.id, "mastered")}>
                        <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                          Mastered
                        </span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the word from your vocabulary.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => wordToDelete && deleteWord(wordToDelete)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default VocabularyTab;
