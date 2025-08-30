"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, CheckCircle, Clock, BookOpen } from "lucide-react";
import { useEnhancedVocabulary } from "@/hooks/useEnhancedVocabulary";
import { FilterStatus, FilterDifficulty, VocabularyWord } from "@/types/vocabulary";
import { StatusCard } from "@/components/vocabulary/StatusCard";
import { FilterButtons } from "@/components/vocabulary/FilterButtons";
import { EnhancedWordForm } from "@/components/vocabulary/EnhancedWordForm";
import { WordCard } from "@/components/vocabulary/WordCard";
import { DeleteConfirmDialog } from "@/components/vocabulary/DeleteConfirmDialog";
import { LoadingState } from "@/components/vocabulary/LoadingState";
import { ErrorState } from "@/components/vocabulary/ErrorState";
import { EmptyState } from "@/components/vocabulary/EmptyState";

const VocabularyTab: React.FC = () => {
  const {
    words,
    dueWords,
    categories,
    loading,
    error,
    addWord,
    updateWord,
    reviewWord,
    deleteWord,
    fetchWords,
    getReviewStats,
    filterWords,
    setError,
  } = useEnhancedVocabulary();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingWord, setEditingWord] = useState<VocabularyWord | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [filterDifficulty, setFilterDifficulty] = useState<FilterDifficulty>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [wordToDelete, setWordToDelete] = useState<string | null>(null);

  const stats = getReviewStats();
  const filteredWords = filterWords(filterStatus, filterDifficulty, "all", searchQuery);

  const handleAddWord = async (data: {
    german: string;
    english: string;
    example?: string;
    difficulty_level?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
    category_ids?: string[];
    notes?: string;
    tags?: string[];
  }) => {
    const success = await addWord(data);
    return success;
  };

  const handleEditWord = async (data: {
    german: string;
    english: string;
    example?: string;
    difficulty_level?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
    category_ids?: string[];
    notes?: string;
    tags?: string[];
  }) => {
    if (!editingWord) return false;
    const success = await updateWord(editingWord.id, data);
    if (success) {
      setEditingWord(null);
    }
    return success;
  };

  const handleEdit = (word: VocabularyWord) => {
    setEditingWord(word);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    setWordToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (wordToDelete) {
      await deleteWord(wordToDelete);
    }
    setDeleteDialogOpen(false);
    setWordToDelete(null);
  };

  // Handle status change for words (simplified version for the enhanced system)
  const handleStatusChange = async (id: string, newStatus: 'learning' | 'familiar' | 'mastered') => {
    try {
      // Find the word to update
      const wordToUpdate = words.find(w => w.id === id);
      if (!wordToUpdate) return;

      // Prepare update data
      const updateData: Partial<VocabularyWord> = {
        status: newStatus,
      };

      // Reset SRS data when status changes to 'learning'
      if (newStatus === 'learning') {
        updateData.ease_factor = 2.5;
        updateData.interval_days = 1;
        updateData.repetitions = 0;
        updateData.next_review = new Date().toISOString();
        updateData.last_reviewed = new Date().toISOString();
      }

      // Update the word
      const success = await updateWord(id, updateData);

      if (success) {
        // Refresh the words list
        await fetchWords();
      }
    } catch (error) {
      console.error('Error updating word status:', error);
      setError('Failed to update word status');
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingWord(null);
  };

  const handleRetry = () => {
    setError(null);
    fetchWords();
  };

  if (loading) return <LoadingState message="Loading vocabulary..." />;
  if (error) return <ErrorState error={error} onRetry={handleRetry} />;

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold mb-6">Vocabulary Tracker</h2>

      {/* Progress Cards */}
      <div className="grid grid-cols-3 gap-6 mb-8 h-24 sm:h-28 md:h-32 lg:h-36">
        <StatusCard
          title="Mastered"
          count={stats.mastered}
          icon={CheckCircle}
          bgColor="bg-brand-accent"
          textColor="text-[#e6f2e6]"
        />
        <StatusCard
          title="Familiar"
          count={stats.familiar}
          icon={Clock}
          bgColor="bg-[#4E4211]"
          textColor="text-[#f5f0dc]"
        />
        <StatusCard
          title="Learning"
          count={stats.learning}
          icon={BookOpen}
          bgColor="bg-[#240808]"
          textColor="text-[#f2e6e6]"
        />
      </div>

      {/* Enhanced Controls */}
      <div className="space-y-4 mb-6">
        {/* Search and Add */}
        <div className="flex justify-between items-center">
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Search words..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          <Button
            onClick={() => setIsFormOpen(true)}
            className="bg-brand-accent text-white px-4 py-2 rounded-full hover:bg-opacity-90 ml-4"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add New Word
          </Button>
        </div>

        {/* Enhanced Filters */}
        <div className="flex flex-wrap gap-4 items-center">
          <FilterButtons
            currentFilter={filterStatus}
            onFilterChange={setFilterStatus}
          />

          {/* Difficulty Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Difficulty:</span>
            <Select value={filterDifficulty} onValueChange={(value: FilterDifficulty) => setFilterDifficulty(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="A1">A1 - Beginner</SelectItem>
                <SelectItem value="A2">A2 - Elementary</SelectItem>
                <SelectItem value="B1">B1 - Intermediate</SelectItem>
                <SelectItem value="B2">B2 - Upper Int.</SelectItem>
                <SelectItem value="C1">C1 - Advanced</SelectItem>
                <SelectItem value="C2">C2 - Mastery</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Due Words Counter */}
          {dueWords.length > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-orange-500" />
              <span className="text-orange-600 font-medium">
                {dueWords.filter(w => w.reviewStatus === 'overdue').length} overdue,
                {dueWords.filter(w => w.reviewStatus === 'due_today').length} due today
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Words List */}
      <div className="space-y-4">
        {filteredWords.length === 0 ? (
          <EmptyState hasWords={words.length > 0} filter={filterStatus} />
        ) : (
          filteredWords.map((word) => (
            <WordCard
              key={word.id}
              word={word}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
            />
          ))
        )}
      </div>

      {/* Dialogs */}
      <EnhancedWordForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSubmit={editingWord ? handleEditWord : handleAddWord}
        editingWord={editingWord}
        categories={categories}
      />

      <DeleteConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default VocabularyTab;