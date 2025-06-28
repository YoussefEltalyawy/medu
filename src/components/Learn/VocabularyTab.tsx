"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, CheckCircle, Clock, BookOpen } from "lucide-react";
import { useVocabulary } from "@/hooks/useVocabulary";
import { FilterStatus, VocabularyWord } from "@/types/vocabulary";
import { StatusCard } from "@/components/vocabulary/StatusCard";
import { FilterButtons } from "@/components/vocabulary/FilterButtons";
import { WordForm } from "@/components/vocabulary/WordForm";
import { WordCard } from "@/components/vocabulary/WordCard";
import { DeleteConfirmDialog } from "@/components/vocabulary/DeleteConfirmDialog";
import { LoadingState } from "@/components/vocabulary/LoadingState";
import { ErrorState } from "@/components/vocabulary/ErrorState";
import { EmptyState } from "@/components/vocabulary/EmptyState";

const VocabularyTab: React.FC = () => {
  const {
    words,
    loading,
    error,
    addWord,
    updateWord,
    updateWordStatus,
    deleteWord,
    fetchWords,
    getReviewStats,
    setError,
  } = useVocabulary();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingWord, setEditingWord] = useState<VocabularyWord | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [wordToDelete, setWordToDelete] = useState<string | null>(null);

  const stats = getReviewStats();
  const filteredWords = filterStatus === "all" 
    ? words 
    : words.filter((word) => word.status === filterStatus);

  const handleAddWord = async (data: { german: string; english: string; example?: string }) => {
    const success = await addWord(data);
    return success;
  };

  const handleEditWord = async (data: { german: string; english: string; example?: string }) => {
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
          bgColor="bg-[#082408]"
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

      {/* Controls */}
      <div className="flex justify-between items-center mb-6">
        <Button 
          onClick={() => setIsFormOpen(true)}
          className="bg-[#082408] text-white px-4 py-2 rounded-full hover:bg-opacity-90"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add New Word
        </Button>

        <FilterButtons 
          currentFilter={filterStatus}
          onFilterChange={setFilterStatus}
        />
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
              onStatusChange={updateWordStatus}
            />
          ))
        )}
      </div>

      {/* Dialogs */}
      <WordForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSubmit={editingWord ? handleEditWord : handleAddWord}
        editingWord={editingWord}
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