'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  CheckCircle,
  XCircle,
  RotateCcw,
  PenTool,
  BookOpen,
  Lightbulb,
  Target,
  Clock,
  Save,
  Eye,
  EyeOff
} from 'lucide-react';

export interface WritingExercise {
  id: string;
  title: string;
  difficulty: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  type: 'sentence' | 'paragraph' | 'story' | 'email' | 'essay' | 'dialogue';
  prompt: string;
  instructions: string[];
  requirements: string[];
  examples: string[];
  wordCount: {
    min: number;
    target: number;
    max: number;
  };
  timeLimit?: number; // in minutes
  points: number;
}

interface WritingPracticeProps {
  exercise: WritingExercise;
  onComplete: (score: number, timeSpent: number, wordCount: number) => void;
  onExit: () => void;
}

export const WritingPractice: React.FC<WritingPracticeProps> = ({
  exercise,
  onComplete,
  onExit
}) => {
  const [userText, setUserText] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<string[]>([]);
  const [showExamples, setShowExamples] = useState(false);
  const [showRequirements, setShowRequirements] = useState(false);
  const [startTime, setStartTime] = useState<Date>(new Date());
  const [timeSpent, setTimeSpent] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  useEffect(() => {
    setStartTime(new Date());

    // Start timer if there's a time limit
    if (exercise.timeLimit) {
      const timer = setInterval(() => {
        setTimeSpent(prev => {
          const newTime = prev + 1;
          if (newTime >= exercise.timeLimit! * 60) {
            setIsTimerRunning(false);
            clearInterval(timer);
            return exercise.timeLimit! * 60;
          }
          return newTime;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [exercise.timeLimit]);

  const wordCount = userText.trim().split(/\s+/).filter(word => word.length > 0).length;
  const isWordCountValid = wordCount >= exercise.wordCount.min && wordCount <= exercise.wordCount.max;
  const isTargetReached = wordCount >= exercise.wordCount.target;

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleSubmit = () => {
    if (!userText.trim()) return;

    // Calculate score based on various factors
    let calculatedScore = exercise.points;

    // Word count scoring
    if (isTargetReached) {
      calculatedScore += 10; // Bonus for reaching target
    } else if (isWordCountValid) {
      calculatedScore += 5; // Partial bonus for valid range
    } else {
      calculatedScore -= 10; // Penalty for not meeting minimum
    }

    // Time scoring (if applicable)
    if (exercise.timeLimit) {
      const timeEfficiency = (exercise.timeLimit * 60 - timeSpent) / (exercise.timeLimit * 60);
      if (timeEfficiency > 0.5) {
        calculatedScore += 5; // Bonus for efficient time usage
      }
    }

    // Generate feedback
    const feedbackItems: string[] = [];

    if (isTargetReached) {
      feedbackItems.push('✅ Great job reaching the target word count!');
    } else if (isWordCountValid) {
      feedbackItems.push('⚠️ You met the minimum word count, but try to reach the target for better practice.');
    } else {
      feedbackItems.push('❌ Your text is too short. Please add more content to meet the minimum requirement.');
    }

    if (exercise.timeLimit && timeSpent < exercise.timeLimit * 60) {
      feedbackItems.push('⏱️ Good time management!');
    }

    // Content quality feedback (simplified)
    if (userText.includes('.') && userText.includes(',')) {
      feedbackItems.push('📝 Good use of punctuation!');
    }

    if (userText.split('.').length > 2) {
      feedbackItems.push('📖 Well-structured writing with multiple sentences!');
    }

    setScore(Math.max(0, calculatedScore));
    setFeedback(feedbackItems);
    setIsSubmitted(true);
  };

  const handleComplete = () => {
    const endTime = new Date();
    const totalTimeSpent = (endTime.getTime() - startTime.getTime()) / 1000;
    onComplete(score, totalTimeSpent, wordCount);
  };

  const handleReset = () => {
    setUserText('');
    setIsSubmitted(false);
    setScore(0);
    setFeedback([]);
    setTimeSpent(0);
    setIsTimerRunning(true);
    setStartTime(new Date());
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

  const getExerciseTypeIcon = (type: string) => {
    switch (type) {
      case 'sentence': return '📝';
      case 'paragraph': return '📄';
      case 'story': return '📚';
      case 'email': return '📧';
      case 'essay': return '📖';
      case 'dialogue': return '💬';
      default: return '✍️';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Writing Practice</h2>
          <p className="text-muted-foreground">
            Improve your German writing skills
          </p>
        </div>

        <Button variant="outline" onClick={onExit}>
          Exit
        </Button>
      </div>

      {/* Exercise Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{getExerciseTypeIcon(exercise.type)}</span>
              <div>
                <CardTitle className="text-xl">{exercise.title}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {exercise.type.charAt(0).toUpperCase() + exercise.type.slice(1)} Writing Exercise
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getDifficultyColor(exercise.difficulty)}>
                {exercise.difficulty}
              </Badge>
              <Badge variant="outline">
                {exercise.points} pts
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">Instructions:</h4>
            <ul className="space-y-1">
              {exercise.instructions.map((instruction, index) => (
                <li key={index} className="text-sm text-blue-700">• {instruction}</li>
              ))}
            </ul>
          </div>

          {/* Writing Prompt */}
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Writing Prompt:</h3>
            <p className="text-lg leading-relaxed">{exercise.prompt}</p>
          </div>

          {/* Requirements */}
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-yellow-800">Requirements:</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowRequirements(!showRequirements)}
              >
                {showRequirements ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showRequirements ? 'Hide' : 'Show'}
              </Button>
            </div>

            {showRequirements && (
              <ul className="space-y-1">
                {exercise.requirements.map((requirement, index) => (
                  <li key={index} className="text-sm text-yellow-700">• {requirement}</li>
                ))}
              </ul>
            )}

            <div className="mt-3 pt-3 border-t border-yellow-200">
              <div className="flex items-center gap-4 text-sm">
                <span className="text-yellow-700">
                  Word count: <strong>{wordCount}</strong> / {exercise.wordCount.target}
                </span>
                <span className={`px-2 py-1 rounded text-xs ${isWordCountValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                  {isWordCountValid ? 'Valid' : 'Invalid'} range
                </span>
              </div>
              <div className="mt-2">
                <Progress
                  value={(wordCount / exercise.wordCount.max) * 100}
                  className="h-2"
                />
                <p className="text-xs text-yellow-600 mt-1">
                  Target: {exercise.wordCount.min}-{exercise.wordCount.max} words
                </p>
              </div>
            </div>
          </div>

          {/* Examples */}
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-green-800">Examples:</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowExamples(!showExamples)}
              >
                {showExamples ? 'Hide' : 'Show'} Examples
              </Button>
            </div>

            {showExamples && (
              <div className="space-y-2">
                {exercise.examples.map((example, index) => (
                  <div key={index} className="bg-white p-3 rounded border">
                    <p className="text-sm text-green-700 italic">"{example}"</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Writing Area */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Your Writing:</h4>
              {exercise.timeLimit && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4" />
                  <span className={isTimerRunning ? 'text-green-600' : 'text-red-600'}>
                    {formatTime(timeSpent)} / {exercise.timeLimit}:00
                  </span>
                </div>
              )}
            </div>

            <Textarea
              placeholder="Start writing here..."
              value={userText}
              onChange={(e) => setUserText(e.target.value)}
              className="min-h-[200px] text-lg p-4 resize-none"
              disabled={isSubmitted}
            />

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Word count: {wordCount}</span>
              <span>Characters: {userText.length}</span>
            </div>
          </div>

          {/* Action Buttons */}
          {!isSubmitted ? (
            <div className="flex justify-between">
              <Button variant="outline" onClick={handleReset}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>

              <Button
                onClick={handleSubmit}
                disabled={!userText.trim() || !isWordCountValid}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <PenTool className="w-4 h-4 mr-2" />
                Submit Writing
              </Button>
            </div>
          ) : (
            <div className="flex justify-between">
              <Button variant="outline" onClick={handleReset}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Try Again
              </Button>

              <Button onClick={handleComplete} className="bg-green-600 hover:bg-green-700">
                Complete Exercise
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Feedback and Results */}
      {isSubmitted && (
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Writing Submitted!
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Score */}
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{score}</div>
              <div className="text-sm text-green-700">Points Earned</div>
            </div>

            {/* Feedback */}
            <div className="space-y-2">
              <h4 className="font-medium text-green-800">Feedback:</h4>
              {feedback.map((item, index) => (
                <p key={index} className="text-sm text-green-700">{item}</p>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-xl font-bold text-blue-600">{wordCount}</div>
                <div className="text-xs text-blue-700">Words Written</div>
              </div>

              <div className="text-center">
                <div className="text-xl font-bold text-purple-600">
                  {exercise.timeLimit ? formatTime(timeSpent) : 'N/A'}
                </div>
                <div className="text-xs text-purple-700">Time Spent</div>
              </div>

              <div className="text-center">
                <div className="text-xl font-bold text-orange-600">
                  {Math.round((wordCount / exercise.wordCount.target) * 100)}%
                </div>
                <div className="text-xs text-orange-700">Target Reached</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress and Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{score}</div>
            <div className="text-sm text-muted-foreground">Points</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{wordCount}</div>
            <div className="text-sm text-muted-foreground">Words</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {exercise.timeLimit ? formatTime(timeSpent) : 'N/A'}
            </div>
            <div className="text-sm text-muted-foreground">Time</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

