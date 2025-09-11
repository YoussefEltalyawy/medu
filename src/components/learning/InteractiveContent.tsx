'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BookOpen,
  Headphones,
  Mic,
  PenTool,
  Target,
  Trophy,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { VocabularyWord } from '@/types/vocabulary';

export interface LearningActivity {
  id: string;
  type: 'vocabulary' | 'grammar' | 'listening' | 'speaking' | 'writing' | 'mixed';
  title: string;
  description: string;
  difficulty: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  estimatedTime: number; // in minutes
  isCompleted: boolean;
  progress: number; // 0-100
  words?: VocabularyWord[];
  instructions?: string[];
  audioUrl?: string;
  imageUrl?: string;
}

interface InteractiveContentProps {
  activities: LearningActivity[];
  onActivityStart: (activity: LearningActivity) => void;
  onActivityComplete: (activityId: string, score: number) => void;
  currentActivity?: LearningActivity | null;
}

export const InteractiveContent: React.FC<InteractiveContentProps> = ({
  activities,
  onActivityStart,
  onActivityComplete,
  currentActivity
}) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  const filteredActivities = activities.filter(activity => {
    const difficultyMatch = selectedDifficulty === 'all' || activity.difficulty === selectedDifficulty;
    const typeMatch = selectedType === 'all' || activity.type === selectedType;
    return difficultyMatch && typeMatch;
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'vocabulary': return <BookOpen className="w-6 h-6" />;
      case 'grammar': return <PenTool className="w-6 h-6" />;
      case 'listening': return <Headphones className="w-6 h-6" />;
      case 'speaking': return <Mic className="w-6 h-6" />;
      case 'writing': return <PenTool className="w-6 h-6" />;
      case 'mixed': return <Target className="w-6 h-6" />;
      default: return <BookOpen className="w-6 h-6" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'A1': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'A2': return 'bg-green-100 text-green-800 border-green-200';
      case 'B1': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'B2': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'C1': return 'bg-red-100 text-red-800 border-red-200';
      case 'C2': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'vocabulary': return 'bg-blue-500';
      case 'grammar': return 'bg-green-500';
      case 'listening': return 'bg-purple-500';
      case 'speaking': return 'bg-orange-500';
      case 'writing': return 'bg-red-500';
      case 'mixed': return 'bg-indigo-500';
      default: return 'bg-gray-500';
    }
  };

  if (currentActivity) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{currentActivity.title}</h2>
            <p className="text-muted-foreground">{currentActivity.description}</p>
          </div>
          <Button
            variant="outline"
            onClick={() => onActivityComplete(currentActivity.id, 0)}
          >
            Exit Activity
          </Button>
        </div>

        <div className="bg-card p-6 rounded-lg border">
          <div className="flex items-center gap-4 mb-4">
            {getActivityIcon(currentActivity.type)}
            <div>
              <h3 className="text-lg font-semibold">Activity in Progress</h3>
              <p className="text-sm text-muted-foreground">
                {currentActivity.instructions?.[0] || 'Complete the activity to continue'}
              </p>
            </div>
          </div>

          <Progress value={currentActivity.progress} className="h-2" />
          <p className="text-sm text-muted-foreground mt-2">
            Progress: {currentActivity.progress}%
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">Interactive Learning Activities</h2>
        <p className="text-muted-foreground mb-8">
          Choose from a variety of engaging activities to improve your German skills
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 justify-center">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Difficulty:</span>
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-3 py-1 border rounded-md text-sm"
          >
            <option value="all">All Levels</option>
            <option value="A1">A1 - Beginner</option>
            <option value="A2">A2 - Elementary</option>
            <option value="B1">B1 - Intermediate</option>
            <option value="B2">B2 - Upper Int.</option>
            <option value="C1">C1 - Advanced</option>
            <option value="C2">C2 - Mastery</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Type:</span>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-1 border rounded-md text-sm"
          >
            <option value="all">All Types</option>
            <option value="vocabulary">Vocabulary</option>
            <option value="grammar">Grammar</option>
            <option value="listening">Listening</option>
            <option value="speaking">Speaking</option>
            <option value="writing">Writing</option>
            <option value="mixed">Mixed</option>
          </select>
        </div>
      </div>

      {/* Activities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredActivities.map((activity) => (
          <Card
            key={activity.id}
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => onActivityStart(activity)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${getTypeColor(activity.type)}`}>
                  {getActivityIcon(activity.type)}
                </div>
                <Badge className={getDifficultyColor(activity.difficulty)}>
                  {activity.difficulty}
                </Badge>
              </div>
              <CardTitle className="text-lg">{activity.title}</CardTitle>
            </CardHeader>

            <CardContent className="pt-0">
              <p className="text-muted-foreground mb-4">{activity.description}</p>

              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1">
                  <Target className="w-4 h-4" />
                  {activity.estimatedTime} min
                </span>

                {activity.isCompleted ? (
                  <span className="flex items-center gap-1 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    Completed
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-blue-600">
                    <Play className="w-4 h-4" />
                    Start
                  </span>
                )}
              </div>

              {activity.progress > 0 && !activity.isCompleted && (
                <div className="mt-3">
                  <Progress value={activity.progress} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {activity.progress}% complete
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredActivities.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No activities found</h3>
          <p className="text-muted-foreground">
            Try adjusting your filters to see more learning activities.
          </p>
        </div>
      )}
    </div>
  );
};

