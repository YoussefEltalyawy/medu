import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Save, User, Globe, Target, BookOpen, Clock } from "lucide-react";

interface ProfileData {
  displayName: string;
  nativeLanguage: string;
  experienceLevel: "beginner" | "intermediate" | "advanced";
  targetLanguage: string;
  contentType: "movies" | "tv" | "both";
  difficultyLevel: "beginner" | "intermediate" | "advanced";
  learningIntensity: "casual" | "regular" | "intensive";
  weeklyStudyTime: number;
  favoriteGenres: string[];
  subtitlePreference: "native" | "target" | "both";
}

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileData: ProfileData;
  onSave: (data: ProfileData) => void;
}

const availableGenres = [
  "Action", "Adventure", "Animation", "Comedy", "Crime", "Documentary",
  "Drama", "Family", "Fantasy", "Horror", "Mystery", "Romance",
  "Sci-Fi", "Thriller", "War", "Western"
];

const availableLanguages = [
  "English", "Spanish", "French", "German", "Italian", "Portuguese",
  "Russian", "Japanese", "Korean", "Chinese", "Arabic", "Hindi"
];

export default function ProfileEditModal({
  isOpen,
  onClose,
  profileData,
  onSave
}: ProfileEditModalProps) {
  const [formData, setFormData] = useState<ProfileData>(profileData);
  const [isSaving, setIsSaving] = useState(false);

  // Update form data when profileData changes
  useEffect(() => {
    setFormData(profileData);
  }, [profileData]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error("Failed to save profile:", error);
      // You could add a toast notification here for better UX
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenreToggle = (genre: string) => {
    setFormData(prev => ({
      ...prev,
      favoriteGenres: prev.favoriteGenres.includes(genre)
        ? prev.favoriteGenres.filter(g => g !== genre)
        : [...prev.favoriteGenres, genre]
    }));
  };

  const handleInputChange = (field: keyof ProfileData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center">
            <User className="w-6 h-6 mr-3 text-[#11434E]" />
            Edit Profile
          </DialogTitle>
          <DialogDescription>
            Update your profile information and learning preferences
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
              Basic Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={formData.displayName}
                  onChange={(e) => handleInputChange("displayName", e.target.value)}
                  placeholder="Enter your display name"
                  className="auth-form-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nativeLanguage">Native Language</Label>
                <Select
                  value={formData.nativeLanguage}
                  onValueChange={(value) => handleInputChange("nativeLanguage", value)}
                >
                  <SelectTrigger className="auth-form-input">
                    <SelectValue placeholder="Select native language" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableLanguages.map((language) => (
                      <SelectItem key={language} value={language}>
                        {language}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Learning Preferences */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 flex items-center">
              <BookOpen className="w-5 h-5 mr-2 text-[#11434E]" />
              Learning Preferences
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="targetLanguage">Target Language</Label>
                <Select
                  value={formData.targetLanguage}
                  onValueChange={(value) => handleInputChange("targetLanguage", value)}
                >
                  <SelectTrigger className="auth-form-input">
                    <SelectValue placeholder="Select target language" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableLanguages.map((language) => (
                      <SelectItem key={language} value={language}>
                        {language}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="experienceLevel">Experience Level</Label>
                <Select
                  value={formData.experienceLevel}
                  onValueChange={(value) => handleInputChange("experienceLevel", value as any)}
                >
                  <SelectTrigger className="auth-form-input">
                    <SelectValue placeholder="Select experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contentType">Content Type</Label>
                <Select
                  value={formData.contentType}
                  onValueChange={(value) => handleInputChange("contentType", value as any)}
                >
                  <SelectTrigger className="auth-form-input">
                    <SelectValue placeholder="Select content type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="movies">Movies</SelectItem>
                    <SelectItem value="tv">TV Shows</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="difficultyLevel">Difficulty Level</Label>
                <Select
                  value={formData.difficultyLevel}
                  onValueChange={(value) => handleInputChange("difficultyLevel", value as any)}
                >
                  <SelectTrigger className="auth-form-input">
                    <SelectValue placeholder="Select difficulty level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="learningIntensity">Learning Intensity</Label>
                <Select
                  value={formData.learningIntensity}
                  onValueChange={(value) => handleInputChange("learningIntensity", value as any)}
                >
                  <SelectTrigger className="auth-form-input">
                    <SelectValue placeholder="Select learning intensity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="regular">Regular</SelectItem>
                    <SelectItem value="intensive">Intensive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="weeklyStudyTime">Weekly Study Time (minutes)</Label>
                <Input
                  id="weeklyStudyTime"
                  type="number"
                  value={formData.weeklyStudyTime}
                  onChange={(e) => handleInputChange("weeklyStudyTime", parseInt(e.target.value) || 0)}
                  placeholder="Enter study time in minutes"
                  className="auth-form-input"
                  min="0"
                  step="15"
                />
              </div>
            </div>
          </div>

          {/* Favorite Genres */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
              Favorite Genres
            </h3>

            <div className="space-y-3">
              <Label>Select your favorite genres</Label>
              <div className="flex flex-wrap gap-2">
                {availableGenres.map((genre) => (
                  <Badge
                    key={genre}
                    variant={formData.favoriteGenres.includes(genre) ? "default" : "secondary"}
                    className={`cursor-pointer transition-all duration-200 ${formData.favoriteGenres.includes(genre)
                      ? "bg-[#11434E] text-white hover:bg-[#082408]"
                      : "hover:bg-gray-100"
                      }`}
                    onClick={() => handleGenreToggle(genre)}
                  >
                    {genre}
                  </Badge>
                ))}
              </div>
              <p className="text-sm text-gray-500">
                Selected: {formData.favoriteGenres.length} genres
              </p>
            </div>
          </div>

          {/* Subtitle Preferences */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
              Subtitle Preferences
            </h3>

            <div className="space-y-2">
              <Label htmlFor="subtitlePreference">Subtitle Language</Label>
              <Select
                value={formData.subtitlePreference}
                onValueChange={(value) => handleInputChange("subtitlePreference", value as any)}
              >
                <SelectTrigger className="auth-form-input">
                  <SelectValue placeholder="Select subtitle preference" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="native">Native Language</SelectItem>
                  <SelectItem value="target">Target Language</SelectItem>
                  <SelectItem value="both">Both Languages</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-[#11434E] hover:bg-[#082408] text-white auth-button"
          >
            {isSaving ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Saving...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </div>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
