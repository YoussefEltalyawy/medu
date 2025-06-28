import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { VocabularyWord } from "@/types/vocabulary";

interface WordFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { german: string; english: string; example?: string }) => Promise<boolean>;
  editingWord?: VocabularyWord | null;
}

export const WordForm = ({ isOpen, onClose, onSubmit, editingWord }: WordFormProps) => {
  const [formData, setFormData] = useState({
    german: editingWord?.german || "",
    english: editingWord?.english || "",
    example: editingWord?.example || "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.german.trim()) newErrors.german = 'German word is required';
    if (!formData.english.trim()) newErrors.english = 'English translation is required';
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
    });

    if (success) {
      setFormData({ german: "", english: "", example: "" });
      setErrors({});
      onClose();
    }
    setIsSubmitting(false);
  };

  const handleClose = () => {
    setFormData({ german: "", english: "", example: "" });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{editingWord ? "Edit Word" : "Add New Word"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              German <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.german}
              onChange={(e) => {
                setFormData({ ...formData, german: e.target.value });
                if (errors.german) setErrors({ ...errors, german: '' });
              }}
              placeholder="Enter German word"
              className={errors.german ? 'border-red-500' : ''}
            />
            {errors.german && (
              <p className="mt-1 text-sm text-red-600">{errors.german}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              English <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.english}
              onChange={(e) => {
                setFormData({ ...formData, english: e.target.value });
                if (errors.english) setErrors({ ...errors, english: '' });
              }}
              placeholder="Enter English translation"
              className={errors.english ? 'border-red-500' : ''}
            />
            {errors.english && (
              <p className="mt-1 text-sm text-red-600">{errors.english}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Example (optional)
            </label>
            <Input
              value={formData.example}
              onChange={(e) => setFormData({ ...formData, example: e.target.value })}
              placeholder="Enter an example sentence"
            />
          </div>
          <div className="flex justify-end pt-2">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !formData.german.trim() || !formData.english.trim()}
              className="bg-[#082408] text-white px-4 py-2 rounded-full hover:bg-opacity-90"
            >
              {isSubmitting ? "Saving..." : editingWord ? "Save Changes" : "Add Word"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
