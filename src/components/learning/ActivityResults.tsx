'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Trophy,
  Star,
  Target,
  Clock,
  TrendingUp,
  Award,
  Share2,
  Download,
  RotateCcw,
  Home,
  BookOpen
} from 'lucide-react';

export interface ActivityResult {
  id: string;
  activityType: 'vocabulary' | 'grammar' | 'listening' | 'speaking' | 'writing' | 'mixed';
  title: string;
  score: number;
  maxScore: number;
  accuracy: number;
  timeSpent: number; // in seconds
  questionsAnswered?: number;
  totalQuestions?: number;
  wordCount?: number;
  attempts?: number;
  maxAttempts?: number;
  completedAt: Date;
  achievements: Achievement[];
  feedback: string[];
  recommendations: string[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  points: number;
}

interface ActivityResultsProps {
  result: ActivityResult;
  onRetry: () => void;
  onContinue: () => void;
  onGoHome: () => void;
}

export const ActivityResults: React.FC<ActivityResultsProps> = ({
  result,
  onRetry,
  onContinue,
  onGoHome
}) => {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    if (percentage >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 90) return { text: 'Excellent', color: 'bg-green-100 text-green-800 border-green-200' };
    if (percentage >= 80) return { text: 'Great', color: 'bg-blue-100 text-blue-800 border-blue-200' };
    if (percentage >= 70) return { text: 'Good', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
    if (percentage >= 60) return { text: 'Fair', color: 'bg-orange-100 text-orange-800 border-orange-200' };
    return { text: 'Needs Improvement', color: 'bg-red-100 text-red-800 border-red-200' };
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'vocabulary': return '📚';
      case 'grammar': return '✏️';
      case 'listening': return '🎧';
      case 'speaking': return '🎤';
      case 'writing': return '✍️';
      case 'mixed': return '🎯';
      default: return '📖';
    }
  };

  const scoreBadge = getScoreBadge(result.score, result.maxScore);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-3xl font-bold mb-2">Activity Complete!</h1>
        <p className="text-muted-foreground">
          Great job completing "{result.title}"
        </p>
      </div>

      {/* Score Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl flex items-center justify-center gap-2">
            <span className="text-4xl">{getActivityIcon(result.activityType)}</span>
            {result.title}
          </CardTitle>
        </CardHeader>

        <CardContent className="text-center space-y-4">
          {/* Main Score */}
          <div className="space-y-2">
            <div className={`text-6xl font-bold ${getScoreColor(result.score, result.maxScore)}`}>
              {result.score}
            </div>
            <div className="text-xl text-muted-foreground">
              out of {result.maxScore} points
            </div>
            <Badge className={`text-lg px-4 py-2 ${scoreBadge.color}`}>
              {scoreBadge.text}
            </Badge>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{Math.round((result.score / result.maxScore) * 100)}%</span>
            </div>
            <Progress
              value={(result.score / result.maxScore) * 100}
              className="h-3"
            />
          </div>
        </CardContent>
      </Card>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{result.accuracy}%</div>
            <div className="text-sm text-muted-foreground">Accuracy</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {formatTime(result.timeSpent)}
            </div>
            <div className="text-sm text-muted-foreground">Time Spent</div>
          </CardContent>
        </Card>

        {result.questionsAnswered && (
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {result.questionsAnswered}/{result.totalQuestions}
              </div>
              <div className="text-sm text-muted-foreground">Questions</div>
            </CardContent>
          </Card>
        )}

        {result.wordCount && (
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{result.wordCount}</div>
              <div className="text-sm text-muted-foreground">Words</div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Achievements */}
      {result.achievements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-600" />
              Achievements Unlocked
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`p-4 rounded-lg border-2 ${achievement.unlocked
                      ? 'bg-yellow-50 border-yellow-200'
                      : 'bg-gray-50 border-gray-200 opacity-50'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <h4 className={`font-semibold ${achievement.unlocked ? 'text-yellow-800' : 'text-gray-600'
                        }`}>
                        {achievement.name}
                      </h4>
                      <p className={`text-sm ${achievement.unlocked ? 'text-yellow-700' : 'text-gray-500'
                        }`}>
                        {achievement.description}
                      </p>
                      {achievement.unlocked && (
                        <div className="flex items-center gap-2 mt-2">
                          <Star className="w-4 h-4 text-yellow-600" />
                          <span className="text-sm font-medium text-yellow-700">
                            +{achievement.points} points
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Feedback */}
      {result.feedback.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              Performance Feedback
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="space-y-2">
              {result.feedback.map((item, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <p className="text-sm">{item}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {result.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Recommendations
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="space-y-2">
              {result.recommendations.map((item, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">💡</span>
                  <p className="text-sm">{item}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button onClick={onRetry} variant="outline" className="flex items-center gap-2">
          <RotateCcw className="w-4 h-4" />
          Try Again
        </Button>

        <Button onClick={onContinue} className="flex items-center gap-2">
          <BookOpen className="w-4 h-4" />
          Continue Learning
        </Button>

        <Button onClick={onGoHome} variant="outline" className="flex items-center gap-2">
          <Home className="w-4 h-4" />
          Go Home
        </Button>
      </div>

      {/* Additional Actions */}
      <div className="flex justify-center gap-4">
        <Button variant="ghost" size="sm" className="flex items-center gap-2">
          <Share2 className="w-4 h-4" />
          Share Result
        </Button>

        <Button variant="ghost" size="sm" className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Download Certificate
        </Button>
      </div>

      {/* Completion Time */}
      <div className="text-center text-sm text-muted-foreground">
        Completed on {result.completedAt.toLocaleDateString()} at {result.completedAt.toLocaleTimeString()}
      </div>
    </div>
  );
};

