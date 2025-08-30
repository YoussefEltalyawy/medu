"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  User as UserIcon,
  Mail,
  Calendar,
  Globe,
  BookOpen,
  Target,
  Clock,
  Trophy,
  Settings,
  LogOut,
  Edit3,
  Star,
  TrendingUp,
  Award,
  Activity,
  Plus
} from "lucide-react";
import { useLanguagePreference } from "@/contexts/LanguagePreferenceContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useUserStats } from "@/hooks/useUserStats";
import LanguageSelector from "@/components/Settings/LanguageSelector";
import ProfileEditModal from "@/components/Shared/ProfileEditModal";

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
  joinDate: string;
  totalStudyTime: number;
  streakDays: number;
  achievements: number;
}

interface ContentPreferences {
  contentType?: "movies" | "tv" | "both";
  difficultyLevel?: "beginner" | "intermediate" | "advanced";
  learningIntensity?: "casual" | "regular" | "intensive";
  favoriteGenres?: string[];
  subtitlePreference?: "native" | "target" | "both";
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const { userLanguage } = useLanguagePreference();

  // Use real data hooks
  const { profile: userProfile, loading: profileLoading, error: profileError, updateProfile } = useUserProfile();
  const { stats: userStats, loading: statsLoading, error: statsError, fetchStats } = useUserStats();

  // Transform database data to profile format
  const [profileData, setProfileData] = useState<ProfileData>({
    displayName: "New User",
    nativeLanguage: "English",
    experienceLevel: "beginner",
    targetLanguage: "Spanish",
    contentType: "both",
    difficultyLevel: "beginner",
    learningIntensity: "casual",
    weeklyStudyTime: 0,
    favoriteGenres: [],
    subtitlePreference: "both",
    joinDate: new Date().toISOString(),
    totalStudyTime: 0,
    streakDays: 0,
    achievements: 0
  });

  // Helper function to extract content preferences
  const extractContentPreferences = (contentPrefs: any): ContentPreferences => {
    if (!contentPrefs || typeof contentPrefs !== 'object') {
      return {};
    }

    return {
      contentType: contentPrefs.contentType || "both",
      difficultyLevel: contentPrefs.difficultyLevel || "beginner",
      learningIntensity: contentPrefs.learningIntensity || "casual",
      favoriteGenres: Array.isArray(contentPrefs.favoriteGenres) ? contentPrefs.favoriteGenres : [],
      subtitlePreference: contentPrefs.subtitlePreference || "both"
    };
  };

  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();
        if (error) throw error;
        setUser(user);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, [router, supabase]);

  // Update profile data when real data is loaded - simplified to prevent infinite loops
  useEffect(() => {
    if (userProfile && userStats && !profileLoading && !statsLoading) {
      const contentPrefs = extractContentPreferences(userProfile.content_preferences);

      setProfileData(prev => {
        const newData = {
          displayName: userProfile.display_name || "New User",
          nativeLanguage: userProfile.native_language || "English",
          experienceLevel: (userProfile.experience_level as any) || "beginner",
          targetLanguage: userProfile.target_language || userLanguage || "Spanish",
          contentType: contentPrefs.contentType || "both",
          difficultyLevel: contentPrefs.difficultyLevel || "beginner",
          learningIntensity: contentPrefs.learningIntensity || "casual",
          weeklyStudyTime: userProfile.weekly_study_time || 0,
          favoriteGenres: contentPrefs.favoriteGenres || [],
          subtitlePreference: contentPrefs.subtitlePreference || "both",
          joinDate: user?.created_at || new Date().toISOString(),
          totalStudyTime: userStats.total_study_time || 0,
          streakDays: userStats.current_streak || 0,
          achievements: userStats.words_learned || 0
        };

        // Only update if data actually changed to prevent infinite loops
        if (JSON.stringify(prev) !== JSON.stringify(newData)) {
          return newData;
        }
        return prev;
      });
    }
  }, [userProfile?.id, userStats?.user_id, userLanguage, user?.id, profileLoading, statsLoading]);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const handleSaveProfile = async (updatedData: ProfileData) => {
    try {
      if (!user) throw new Error("User not authenticated");

      // Update users table using the hook
      await updateProfile({
        display_name: updatedData.displayName,
        native_language: updatedData.nativeLanguage,
        experience_level: updatedData.experienceLevel,
        target_language: updatedData.targetLanguage,
        weekly_study_time: updatedData.weeklyStudyTime,
        content_preferences: {
          contentType: updatedData.contentType,
          difficultyLevel: updatedData.difficultyLevel,
          learningIntensity: updatedData.learningIntensity,
          favoriteGenres: updatedData.favoriteGenres,
          subtitlePreference: updatedData.subtitlePreference
        }
      });

      // Update user_stats table
      const supabase = createClient();
      const { error: statsError } = await supabase
        .from('user_stats')
        .upsert({
          user_id: user.id,
          total_study_time: updatedData.totalStudyTime,
          current_streak: updatedData.streakDays,
          words_learned: updatedData.achievements,
          updated_at: new Date().toISOString()
        });

      if (statsError) throw statsError;

      // Update local state
      setProfileData(updatedData);

      // Refresh stats
      await fetchStats();

      console.log("Profile updated successfully:", updatedData);
    } catch (error) {
      console.error("Failed to update profile:", error);
      throw error;
    }
  };

  const getExperienceColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'advanced': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'intermediate': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'advanced': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Debug logging
  console.log('Profile Page Debug:', {
    loading,
    profileLoading,
    statsLoading,
    userProfile: !!userProfile,
    userStats: !!userStats,
    profileError,
    statsError
  });

  // Show loading state while fetching data
  if (loading || profileLoading || statsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#11434E] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 font-medium">Loading your profile...</p>
          <p className="text-sm text-gray-500 mt-2">
            Auth: {loading ? 'Loading...' : 'Ready'} |
            Profile: {profileLoading ? 'Loading...' : 'Ready'} |
            Stats: {statsLoading ? 'Loading...' : 'Ready'}
          </p>
        </div>
      </div>
    );
  }

  // Show error state
  if (profileError || statsError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Settings className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Profile Loading Error</h2>
          <p className="text-gray-600 mb-4">
            {profileError || statsError || "Failed to load your profile data"}
          </p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-[#11434E] hover:bg-[#082408] text-white"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Your Profile</h1>
          <p className="text-lg text-gray-600">Manage your learning journey and preferences</p>
        </div>

        {error && (
          <div className="max-w-2xl mx-auto mb-8 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center space-x-2 animate-fade-in">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="font-medium">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 profile-section-stagger">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm profile-card-hover animate-profile-card-enter">
              <CardHeader className="text-center pb-4">
                <div className="w-24 h-24 bg-gradient-to-br from-[#11434E] to-[#082408] rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserIcon className="w-12 h-12 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  {profileData.displayName}
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Learning {profileData.targetLanguage} since {new Date(profileData.joinDate).getFullYear()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3 text-gray-700">
                  <Mail className="w-4 h-4 text-[#11434E]" />
                  <span className="text-sm">{user?.email}</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-700">
                  <Globe className="w-4 h-4 text-[#11434E]" />
                  <span className="text-sm">Native: {profileData.nativeLanguage}</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-700">
                  <Target className="w-4 h-4 text-[#11434E]" />
                  <span className="text-sm">Target: {profileData.targetLanguage}</span>
                </div>
                <Button
                  onClick={() => setIsEditModalOpen(true)}
                  variant="outline"
                  className="w-full border-[#11434E] text-[#11434E] hover:bg-[#11434E] hover:text-white transition-colors"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm profile-card-hover animate-profile-stats-grow">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-[#11434E]" />
                  Learning Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Study Time</span>
                  <span className="font-semibold text-gray-900 animate-count-up">{profileData.totalStudyTime}h</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Current Streak</span>
                  <span className="font-semibold text-gray-900 animate-count-up">{profileData.streakDays} days</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Words Learned</span>
                  <span className="font-semibold text-gray-900 animate-count-up">{profileData.achievements}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Settings & Preferences */}
          <div className="lg:col-span-2 space-y-6">
            {/* Learning Preferences */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm profile-card-hover">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
                  <BookOpen className="w-6 h-6 mr-3 text-[#11434E]" />
                  Learning Preferences
                </CardTitle>
                <CardDescription>
                  Customize your learning experience and content discovery
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Experience Level */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700">Experience Level</label>
                  <Badge className={`px-3 py-1 text-sm font-medium border profile-badge-hover ${getExperienceColor(profileData.experienceLevel)}`}>
                    {profileData.experienceLevel.charAt(0).toUpperCase() + profileData.experienceLevel.slice(1)}
                  </Badge>
                </div>

                {/* Content Preferences */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-700">Content Type</label>
                    <Badge className="px-3 py-1 text-sm font-medium bg-[#11434E]/10 text-[#11434E] border-[#11434E]/20 profile-badge-hover">
                      {profileData.contentType === 'both' ? 'Movies & TV' : profileData.contentType}
                    </Badge>
                  </div>
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-700">Difficulty Level</label>
                    <Badge className={`px-3 py-1 text-sm font-medium border profile-badge-hover ${getDifficultyColor(profileData.difficultyLevel)}`}>
                      {profileData.difficultyLevel.charAt(0).toUpperCase() + profileData.difficultyLevel.slice(1)}
                    </Badge>
                  </div>
                </div>

                {/* Weekly Study Time */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700">Weekly Study Time</label>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-[#11434E]" />
                    <span className="text-sm text-gray-900">{profileData.weeklyStudyTime} minutes per week</span>
                  </div>
                </div>

                {/* Favorite Genres */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700">Favorite Genres</label>
                  {profileData.favoriteGenres.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {profileData.favoriteGenres.map((genre) => (
                        <Badge key={genre} variant="secondary" className="px-3 py-1 profile-badge-hover">
                          {genre}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 border-2 border-dashed border-gray-300 rounded-lg">
                      <Plus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No genres selected yet</p>
                      <p className="text-xs text-gray-400">Edit your profile to add favorite genres</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Language Settings */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm profile-card-hover">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
                  <Globe className="w-6 h-6 mr-3 text-[#11434E]" />
                  Language Settings
                </CardTitle>
                <CardDescription>
                  Configure your language preferences for content discovery
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LanguageSelector />
              </CardContent>
            </Card>

            {/* Account Actions */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm profile-card-hover">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
                  <Settings className="w-6 h-6 mr-3 text-[#11434E]" />
                  Account Actions
                </CardTitle>
                <CardDescription>
                  Manage your account and security settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={handleSignOut}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
                <p className="text-xs text-gray-500 text-center">
                  You'll be redirected to the login page after signing out
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Section - Achievements & Progress */}
        <div className="mt-12 animate-fade-in delay-500">
          <Card className="border-0 shadow-xl bg-gradient-to-r from-[#11434E] to-[#082408] text-white profile-card-hover">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-white flex items-center justify-center">
                <Trophy className="w-8 h-8 mr-3 text-[#DAF0DA] animate-profile-badge-pulse" />
                Your Learning Journey
              </CardTitle>
              <CardDescription className="text-[#DAF0DA]">
                Track your progress and celebrate your achievements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-[#DAF0DA]/20 rounded-full flex items-center justify-center mx-auto mb-3 animate-profile-achievement-shine">
                    <TrendingUp className="w-8 h-8 text-[#DAF0DA]" />
                  </div>
                  <h3 className="text-lg font-semibold mb-1">Progress</h3>
                  <p className="text-[#DAF0DA] text-sm">Keep up the great work!</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-[#DAF0DA]/20 rounded-full flex items-center justify-center mx-auto mb-3 animate-profile-achievement-shine">
                    <Star className="w-8 h-8 text-[#DAF0DA]" />
                  </div>
                  <h3 className="text-lg font-semibold mb-1">Streak</h3>
                  <p className="text-[#DAF0DA] text-sm">{profileData.streakDays} days strong!</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Profile Edit Modal */}
      <ProfileEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        profileData={profileData}
        onSave={handleSaveProfile}
      />
    </div>
  );
}
