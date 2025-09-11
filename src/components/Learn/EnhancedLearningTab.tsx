'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BookOpen,
  Headphones,
  Mic,
  PenTool,
  Target,
  Trophy,
  Play,
  Clock,
  Star,
  TrendingUp,
  Award,
  BarChart3
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLearningActivities } from '@/hooks/useLearningActivities';
import { useEnhancedVocabulary } from '@/hooks/useEnhancedVocabulary';
import { InteractiveContent, LearningActivity } from '@/components/learning/InteractiveContent';
import { VocabularyPractice } from '@/components/learning/VocabularyPractice';
import { GrammarPractice } from '@/components/learning/GrammarPractice';
import { ListeningPractice } from '@/components/learning/ListeningPractice';
import { SpeakingPractice } from '@/components/learning/SpeakingPractice';
import { WritingPractice } from '@/components/learning/WritingPractice';
import { ActivityResults, ActivityResult } from '@/components/learning/ActivityResults';

export const EnhancedLearningTab: React.FC = () => {
  const { user } = useAuth();
  const { words, categories } = useEnhancedVocabulary();
  const {
    activities,
    stats,
    loading: activitiesLoading,
    error: activitiesError,
    saveActivityProgress,
    generateVocabularyQuestions,
    generateGrammarExercises
  } = useLearningActivities(user?.id || '');

  const [currentActivity, setCurrentActivity] = useState<LearningActivity | null>(null);
  const [currentPractice, setCurrentPractice] = useState<{
    type: string;
    component: React.ReactNode;
  } | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [currentResult, setCurrentResult] = useState<ActivityResult | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Handle activity start
  const handleActivityStart = (activity: LearningActivity) => {
    setCurrentActivity(activity);

    switch (activity.type) {
      case 'vocabulary':
        if (words.length > 0) {
          const questions = generateVocabularyQuestions(words, 10);
          setCurrentPractice({
            type: 'vocabulary',
            component: (
              <VocabularyPractice
                words={words}
                onComplete={(score, totalQuestions, timeSpent) => {
                  handleActivityComplete(activity, score, totalQuestions, timeSpent);
                }}
                onExit={() => setCurrentPractice(null)}
              />
            )
          });
        } else {
          // Handle no words available
          alert('No vocabulary words available. Please add some words first.');
        }
        break;

      case 'grammar':
        const exercises = generateGrammarExercises(activity.difficulty);
        setCurrentPractice({
          type: 'grammar',
          component: (
            <GrammarPractice
              exercises={exercises}
              onComplete={(score, totalExercises, timeSpent) => {
                handleActivityComplete(activity, score, totalExercises, timeSpent);
              }}
              onExit={() => setCurrentPractice(null)}
            />
          )
        });
        break;

      case 'listening':
        // Sample listening exercise
        const listeningExercise = {
          id: 'listening-1',
          title: 'Basic Greetings',
          difficulty: 'A1' as const,
          audioUrl: '/audio/greetings.mp3',
          transcript: 'Hallo! Wie geht es dir? Mir geht es gut, danke!',
          questions: [
            {
              id: 'q1',
              type: 'multiple-choice' as const,
              question: 'What does "Hallo" mean?',
              correctAnswer: 'Hello',
              options: ['Hello', 'Goodbye', 'Thank you', 'Please'],
              points: 10
            }
          ],
          duration: 30,
          points: 20
        };

        setCurrentPractice({
          type: 'listening',
          component: (
            <ListeningPractice
              exercise={listeningExercise}
              onComplete={(score, timeSpent) => {
                handleActivityComplete(activity, score, 1, timeSpent);
              }}
              onExit={() => setCurrentPractice(null)}
            />
          )
        });
        break;

      case 'speaking':
        const speakingExercise = {
          id: 'speaking-1',
          title: 'Greetings Pronunciation',
          difficulty: 'A1' as const,
          prompt: 'Practice saying basic German greetings',
          targetPhrase: 'Hallo, wie geht es dir?',
          pronunciation: 'HAH-loh, vee GAYT es DEER',
          instructions: ['Listen to the model', 'Record your pronunciation', 'Compare and improve'],
          tips: ['Pay attention to the "ch" sound', 'Practice the "r" sound', 'Focus on intonation'],
          points: 25
        };

        setCurrentPractice({
          type: 'speaking',
          component: (
            <SpeakingPractice
              exercise={speakingExercise}
              onComplete={(score, timeSpent) => {
                handleActivityComplete(activity, score, timeSpent);
              }}
              onExit={() => setCurrentPractice(null)}
            />
          )
        });
        break;

      case 'writing':
        const writingExercise = {
          id: 'writing-1',
          title: 'Write a Greeting',
          difficulty: 'A1' as const,
          type: 'sentence' as const,
          prompt: 'Write a simple greeting in German',
          instructions: ['Use basic vocabulary', 'Keep it simple', 'Check your spelling'],
          requirements: ['Minimum 5 words', 'Use proper greeting', 'Include a question'],
          examples: ['Hallo! Wie geht es dir?', 'Guten Tag! Wie heißen Sie?'],
          wordCount: { min: 5, target: 8, max: 15 },
          points: 20
        };

        setCurrentPractice({
          type: 'writing',
          component: (
            <WritingPractice
              exercise={writingExercise}
              onComplete={(score, timeSpent, wordCount) => {
                handleActivityComplete(activity, score, 1, timeSpent, wordCount);
              }}
              onExit={() => setCurrentPractice(null)}
            />
          )
        });
        break;

      default:
        // Handle mixed or other types
        break;
    }
  };

  // Handle activity completion
  const handleActivityComplete = async (
    activity: LearningActivity,
    score: number,
    totalQuestions: number,
    timeSpent: number,
    wordCount?: number
  ) => {
    // Calculate accuracy
    const accuracy = Math.round((score / (totalQuestions * 30)) * 100);

    // Create result
    const result: ActivityResult = {
      id: `result-${Date.now()}`,
      activityType: activity.type,
      title: activity.title,
      score,
      maxScore: totalQuestions * 30,
      accuracy,
      timeSpent,
      questionsAnswered: totalQuestions,
      totalQuestions: totalQuestions,
      wordCount,
      completedAt: new Date(),
      achievements: [
        {
          id: 'completion',
          name: 'Activity Complete',
          description: `Completed ${activity.title}`,
          icon: '🎯',
          unlocked: true,
          points: 10
        }
      ],
      feedback: [
        `You scored ${score} out of ${totalQuestions * 30} points`,
        `Accuracy: ${accuracy}%`,
        `Time spent: ${Math.round(timeSpent / 60)} minutes`
      ],
      recommendations: [
        'Keep practicing regularly',
        'Review difficult concepts',
        'Try more challenging activities'
      ]
    };

    // Save progress to database
    if (user?.id) {
      await saveActivityProgress({
        user_id: user.id,
        activity_id: activity.id,
        activity_type: activity.type,
        score,
        max_score: totalQuestions * 30,
        accuracy,
        time_spent: timeSpent,
        completed_at: new Date().toISOString(),
        metadata: {
          wordCount,
          questionsAnswered: totalQuestions
        }
      });
    }

    // Show results
    setCurrentResult(result);
    setShowResults(true);
    setCurrentPractice(null);
    setCurrentActivity(null);
  };

  // Handle activity exit
  const handleActivityExit = () => {
    setCurrentActivity(null);
    setCurrentPractice(null);
  };

  // Handle results actions
  const handleRetry = () => {
    setShowResults(false);
    setCurrentResult(null);
  };

  const handleContinue = () => {
    setShowResults(false);
    setCurrentResult(null);
  };

  const handleGoHome = () => {
    setShowResults(false);
    setCurrentResult(null);
    setActiveTab('overview');
  };

  // If there's an active practice, show it
  if (currentPractice) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            {currentActivity?.title} - {currentPractice.type.charAt(0).toUpperCase() + currentPractice.type.slice(1)} Practice
          </h2>
          <Button variant="outline" onClick={() => setCurrentPractice(null)}>
            Exit Practice
          </Button>
        </div>
        {currentPractice.component}
      </div>
    );
  }

  // If showing results, show them
  if (showResults && currentResult) {
    return (
      <ActivityResults
        result={currentResult}
        onRetry={handleRetry}
        onContinue={handleContinue}
        onGoHome={handleGoHome}
      />
    );
  }

  // Main learning interface
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Enhanced Learning Center</h1>
        <p className="text-muted-foreground mb-8">
          Master German through interactive exercises and personalized learning paths
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Quick Stats */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.totalActivities}</div>
                  <div className="text-sm text-muted-foreground">Total Activities</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.completedActivities}</div>
                  <div className="text-sm text-muted-foreground">Completed</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">{stats.totalScore}</div>
                  <div className="text-sm text-muted-foreground">Total Points</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">{stats.currentStreak}</div>
                  <div className="text-sm text-muted-foreground">Day Streak</div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Learning Paths */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Recommended Learning Paths
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Beginner Path (A1-A2)</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Start with basic vocabulary and grammar fundamentals
                  </p>
                  <Button size="sm" onClick={() => setActiveTab('activities')}>
                    Start Learning
                  </Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Intermediate Path (B1-B2)</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Build on your foundation with more complex concepts
                  </p>
                  <Button size="sm" variant="outline" disabled>
                    Coming Soon
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activities.slice(0, 3).map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 border-b last:border-b-0">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getActivityIcon(activity.type)}</span>
                    <div>
                      <h4 className="font-medium">{activity.title}</h4>
                      <p className="text-sm text-muted-foreground">{activity.description}</p>
                    </div>
                  </div>
                  <Button size="sm" onClick={() => handleActivityStart(activity)}>
                    {activity.isCompleted ? 'Review' : 'Start'}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activities Tab */}
        <TabsContent value="activities" className="space-y-6">
          <InteractiveContent
            activities={activities}
            onActivityStart={handleActivityStart}
            onActivityComplete={handleActivityComplete}
            currentActivity={currentActivity}
          />
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress" className="space-y-6">
          {stats ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Learning Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Completion Rate */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Overall Completion</span>
                      <span>{Math.round((stats.completedActivities / stats.totalActivities) * 100)}%</span>
                    </div>
                    <Progress
                      value={(stats.completedActivities / stats.totalActivities) * 100}
                      className="h-3"
                    />
                  </div>

                  {/* Accuracy */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Average Accuracy</span>
                      <span>{stats.averageAccuracy}%</span>
                    </div>
                    <Progress value={stats.averageAccuracy} className="h-3" />
                  </div>

                  {/* Time Spent */}
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {Math.round(stats.totalTimeSpent / 60)}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Minutes Learning</div>
                  </div>
                </CardContent>
              </Card>

              {/* Streak Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Learning Streaks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{stats.currentStreak}</div>
                      <div className="text-sm text-blue-700">Current Streak</div>
                    </div>

                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{stats.longestStreak}</div>
                      <div className="text-sm text-purple-700">Longest Streak</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="text-center py-8">
              <p>Loading progress data...</p>
            </div>
          )}
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-6">
          {stats?.achievements ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stats.achievements.map((achievement) => (
                <Card key={achievement.id} className={achievement.unlocked ? 'bg-yellow-50 border-yellow-200' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{achievement.icon}</div>
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
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p>Loading achievements...</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
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
