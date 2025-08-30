'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Tag, BookOpen, Target, MessageSquare } from "lucide-react";
import { VocabularyWord, VocabularyCategory, FilterDifficulty } from "@/types/vocabulary";

interface EnhancedWordFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    german: string;
    english: string;
    example?: string;
    difficulty_level?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
    category_ids?: string[];
    notes?: string;
    tags?: string[];
  }) => Promise<boolean>;
  editingWord?: VocabularyWord | null;
  categories?: VocabularyCategory[];
}

const difficultyLevels: { value: FilterDifficulty; label: string; description: string }[] = [
  { value: 'A1', label: 'A1 - Beginner', description: 'Basic vocabulary and simple phrases' },
  { value: 'A2', label: 'A2 - Elementary', description: 'Everyday expressions and basic communication' },
  { value: 'B1', label: 'B1 - Intermediate', description: 'Familiar topics and personal experiences' },
  { value: 'B2', label: 'B2 - Upper Intermediate', description: 'Complex ideas and detailed explanations' },
  { value: 'C1', label: 'C1 - Advanced', description: 'Academic and professional language' },
  { value: 'C2', label: 'C2 - Mastery', description: 'Native-like fluency and precision' },
];

export const EnhancedWordForm = ({
  isOpen,
  onClose,
  onSubmit,
  editingWord,
  categories = []
}: EnhancedWordFormProps) => {
  const [formData, setFormData] = useState({
    german: editingWord?.german || "",
    english: editingWord?.english || "",
    example: editingWord?.example || "",
    difficulty_level: editingWord?.difficulty_level || 'A1' as const,
    category_ids: [] as string[],
    notes: editingWord?.notes || "",
    tags: editingWord?.tags || [] as string[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTag, setNewTag] = useState("");

  useEffect(() => {
    if (editingWord) {
      setFormData({
        german: editingWord.german || "",
        english: editingWord.english || "",
        example: editingWord.example || "",
        difficulty_level: editingWord.difficulty_level || 'A1',
        category_ids: [], // TODO: Extract from word-category relationships
        notes: editingWord.notes || "",
        tags: editingWord.tags || [],
      });
    } else {
      setFormData({
        german: "",
        english: "",
        example: "",
        difficulty_level: 'A1',
        category_ids: [],
        notes: "",
        tags: [],
      });
    }
    setErrors({});
  }, [editingWord, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.german.trim()) {
      newErrors.german = 'German word is required';
    }

    if (!formData.english.trim()) {
      newErrors.english = 'English translation is required';
    }

    if (formData.example && formData.example.length > 500) {
      newErrors.example = 'Example sentence is too long (max 500 characters)';
    }

    if (formData.notes && formData.notes.length > 1000) {
      newErrors.notes = 'Notes are too long (max 1000 characters)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    const success = await onSubmit({
      german: formData.german.trim(),
      english: formData.english.trim(),
      example: formData.example.trim() || undefined,
      difficulty_level: formData.difficulty_level,
      category_ids: formData.category_ids.length > 0 ? formData.category_ids : undefined,
      notes: formData.notes.trim() || undefined,
      tags: formData.tags.length > 0 ? formData.tags : undefined,
    });

    if (success) {
      handleClose();
    }
    setIsSubmitting(false);
  };

  const handleClose = () => {
    setFormData({
      german: "",
      english: "",
      example: "",
      difficulty_level: 'A1',
      category_ids: [],
      notes: "",
      tags: [],
    });
    setErrors({});
    setNewTag("");
    onClose();
  };

  const handleCategoryToggle = (categoryId: string) => {
    setFormData(prev => ({
      ...prev,
      category_ids: prev.category_ids.includes(categoryId)
        ? prev.category_ids.filter(id => id !== categoryId)
        : [...prev.category_ids, categoryId]
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.target === e.currentTarget) {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            {editingWord ? "Edit Word" : "Add New Word"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Word Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="german" className="flex items-center gap-2">
                <span>German Word</span>
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="german"
                value={formData.german}
                onChange={(e) => {
                  setFormData({ ...formData, german: e.target.value });
                  if (errors.german) setErrors({ ...errors, german: '' });
                }}
                placeholder="Enter German word"
                className={errors.german ? 'border-red-500' : ''}
              />
              {errors.german && (
                <p className="text-sm text-red-600">{errors.german}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="english" className="flex items-center gap-2">
                <span>English Translation</span>
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="english"
                value={formData.english}
                onChange={(e) => {
                  setFormData({ ...formData, english: e.target.value });
                  if (errors.english) setErrors({ ...errors, english: '' });
                }}
                placeholder="Enter English translation"
                className={errors.english ? 'border-red-500' : ''}
              />
              {errors.english && (
                <p className="text-sm text-red-600">{errors.english}</p>
              )}
            </div>
          </div>

          {/* Difficulty Level */}
          <div className="space-y-2">
            <Label htmlFor="difficulty" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Difficulty Level
            </Label>
            <Select
              value={formData.difficulty_level}
              onValueChange={(value: FilterDifficulty) =>
                setFormData({ ...formData, difficulty_level: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {difficultyLevels.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    <div className="flex flex-col">
                      <span className="font-medium">{level.label}</span>
                      <span className="text-sm text-muted-foreground">{level.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Example Sentence */}
          <div className="space-y-2">
            <Label htmlFor="example">Example Sentence (Optional)</Label>
            <Textarea
              id="example"
              value={formData.example}
              onChange={(e) => {
                setFormData({ ...formData, example: e.target.value });
                if (errors.example) setErrors({ ...errors, example: '' });
              }}
              placeholder="Enter an example sentence using this word"
              rows={3}
              maxLength={500}
              className={errors.example ? 'border-red-500' : ''}
            />
            {errors.example && (
              <p className="text-sm text-red-600">{errors.example}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {formData.example.length}/500 characters
            </p>
          </div>

          {/* Categories */}
          {categories.length > 0 && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Categories
              </Label>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Badge
                    key={category.id}
                    variant={formData.category_ids.includes(category.id) ? "default" : "outline"}
                    className={`cursor-pointer transition-colors ${formData.category_ids.includes(category.id)
                        ? 'bg-brand-accent text-white'
                        : 'hover:bg-brand-accent/10'
                      }`}
                    onClick={() => handleCategoryToggle(category.id)}
                    style={{
                      backgroundColor: formData.category_ids.includes(category.id)
                        ? category.color
                        : undefined,
                      borderColor: category.color,
                    }}
                  >
                    {category.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Tags
            </Label>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add a tag"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddTag}
                disabled={!newTag.trim()}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Notes (Optional)
            </Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => {
                setFormData({ ...formData, notes: e.target.value });
                if (errors.notes) setErrors({ ...errors, notes: '' });
              }}
              placeholder="Add personal notes, mnemonics, or additional context"
              rows={3}
              maxLength={1000}
              className={errors.notes ? 'border-red-500' : ''}
            />
            {errors.notes && (
              <p className="text-sm text-red-600">{errors.notes}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {formData.notes.length}/1000 characters
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-brand-accent hover:bg-brand-accent/90"
            >
              {isSubmitting ? "Saving..." : (editingWord ? "Update Word" : "Add Word")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
