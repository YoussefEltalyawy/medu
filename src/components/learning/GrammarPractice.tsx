'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  CheckCircle,
  XCircle,
  RotateCcw,
  BookOpen,
  Lightbulb,
  HelpCircle,
  Target,
  Trophy
} from 'lucide-react';

export interface GrammarExercise {
  id: string;
  type: 'multiple-choice' | 'fill-blank' | 'sentence-construction' | 'error-correction' | 'translation';
  topic: string;
  difficulty: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  question: string;
  correctAnswer: string;
  options?: string[];
  explanation: string;
  rules: string[];
  examples: string[];
  points: number;
}

interface GrammarPracticeProps {
  exercises: GrammarExercise[];
  onComplete: (score: number, totalExercises: number, timeSpent: number) => void;
  onExit: () => void;
}

export const GrammarPractice: React.FC<GrammarPracticeProps> = ({
  exercises,
  onComplete,
  onExit
}) => {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [startTime, setStartTime] = useState<Date>(new Date());

  const currentExercise = exercises[currentExerciseIndex];
  const progress = ((currentExerciseIndex + 1) / exercises.length) * 100;
  const userAnswer = userAnswers[currentExercise.id];
  const isCorrect = userAnswer &&
    userAnswer.toLowerCase().trim() === currentExercise.correctAnswer.toLowerCase().trim();

  useEffect(() => {
    setStartTime(new Date());
  }, []);

  const handleAnswer = (answer: string) => {
    if (isAnswered) return;

    setUserAnswers(prev => ({ ...prev, [currentExercise.id]: answer }));
    setIsAnswered(true);

    if (isCorrect) {
      setScore(prev => prev + currentExercise.points);
    }
  };

  const handleNext = () => {
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
      setIsAnswered(false);
      setShowExplanation(false);
    } else {
      // Practice completed
      const endTime = new Date();
      const timeSpent = (endTime.getTime() - startTime.getTime()) / 1000;
      onComplete(score, exercises.length, timeSpent);
    }
  };

  const handleShowExplanation = () => {
    setShowExplanation(true);
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
      case 'multiple-choice': return '📝';
      case 'fill-blank': return '✏️';
      case 'sentence-construction': return '🏗️';
      case 'error-correction': return '🔍';
      case 'translation': return '🌐';
      default: return '📚';
    }
  };

  if (!currentExercise) {
    return (
      <div className="text-center py-8">
        <p>Loading exercises...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Grammar Practice</h2>
          <p className="text-muted-foreground">
            Exercise {currentExerciseIndex + 1} of {exercises.length}
          </p>
        </div>

        <Button variant="outline" onClick={onExit}>
          Exit
        </Button>
      </div>

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
            <div className="text-2xl font-bold text-green-600">
              {Math.round((score / (exercises.length * 20)) * 100)}%
            </div>
            <div className="text-sm text-muted-foreground">Accuracy</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round((currentExerciseIndex + 1) / exercises.length * 100)}%
            </div>
            <div className="text-sm text-muted-foreground">Progress</div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Exercise Card */}
      <Card className="min-h-[500px]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{getExerciseTypeIcon(currentExercise.type)}</span>
              <div>
                <CardTitle className="text-xl">{currentExercise.topic}</CardTitle>
                <p className="text-sm text-muted-foreground">{currentExercise.question}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getDifficultyColor(currentExercise.difficulty)}>
                {currentExercise.difficulty}
              </Badge>
              <Badge variant="outline">
                {currentExercise.points} pts
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Exercise Type Specific UI */}
          {currentExercise.type === 'multiple-choice' && (
            <div className="space-y-3">
              {currentExercise.options?.map((option, index) => (
                <Button
                  key={index}
                  variant={getButtonVariant(option, userAnswer, isAnswered)}
                  className="w-full justify-start h-auto p-4 text-left"
                  onClick={() => handleAnswer(option)}
                  disabled={isAnswered}
                >
                  <span className="mr-3 text-lg font-mono">{String.fromCharCode(65 + index)}.</span>
                  {option}
                </Button>
              ))}
            </div>
          )}

          {(currentExercise.type === 'fill-blank' || currentExercise.type === 'translation') && (
            <div className="space-y-4">
              <Input
                placeholder="Type your answer..."
                value={userAnswer || ''}
                onChange={(e) => setUserAnswers(prev => ({
                  ...prev,
                  [currentExercise.id]: e.target.value
                }))}
                disabled={isAnswered}
                className="text-lg p-4"
              />

              {!isAnswered && (
                <Button
                  onClick={() => handleAnswer(userAnswer || '')}
                  disabled={!userAnswer?.trim()}
                  className="w-full"
                >
                  Submit Answer
                </Button>
              )}
            </div>
          )}

          {currentExercise.type === 'sentence-construction' && (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Available words:</p>
                <div className="flex flex-wrap gap-2">
                  {currentExercise.options?.map((word, index) => (
                    <Badge key={index} variant="outline" className="cursor-pointer">
                      {word}
                    </Badge>
                  ))}
                </div>
              </div>

              <Textarea
                placeholder="Construct your sentence..."
                value={userAnswer || ''}
                onChange={(e) => setUserAnswers(prev => ({
                  ...prev,
                  [currentExercise.id]: e.target.value
                }))}
                disabled={isAnswered}
                className="text-lg p-4 min-h-[100px]"
              />

              {!isAnswered && (
                <Button
                  onClick={() => handleAnswer(userAnswer || '')}
                  disabled={!userAnswer?.trim()}
                  className="w-full"
                >
                  Submit Answer
                </Button>
              )}
            </div>
          )}

          {currentExercise.type === 'error-correction' && (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                <p className="text-sm text-red-800 mb-2">Sentence with error:</p>
                <p className="text-lg font-mono">{currentExercise.question}</p>
              </div>

              <Input
                placeholder="Type the corrected sentence..."
                value={userAnswer || ''}
                onChange={(e) => setUserAnswers(prev => ({
                  ...prev,
                  [currentExercise.id]: e.target.value
                }))}
                disabled={isAnswered}
                className="text-lg p-4"
              />

              {!isAnswered && (
                <Button
                  onClick={() => handleAnswer(userAnswer || '')}
                  disabled={!userAnswer?.trim()}
                  className="w-full"
                >
                  Submit Answer
                </Button>
              )}
            </div>
          )}

          {/* Answer Feedback */}
          {isAnswered && (
            <div className={`p-4 rounded-lg border-2 ${isCorrect
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-red-50 border-red-200 text-red-800'
              }`}>
              <div className="flex items-center gap-2 mb-2">
                {isCorrect ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                <span className="font-semibold">
                  {isCorrect ? 'Correct!' : 'Incorrect'}
                </span>
              </div>

              {!isCorrect && (
                <p className="text-sm">
                  The correct answer is: <strong>{currentExercise.correctAnswer}</strong>
                </p>
              )}
            </div>
          )}

          {/* Grammar Rules and Examples */}
          {isAnswered && (
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <h4 className="font-semibold text-blue-800">Grammar Rules</h4>
              </div>

              <div className="space-y-2 mb-4">
                {currentExercise.rules.map((rule, index) => (
                  <p key={index} className="text-sm text-blue-700">• {rule}</p>
                ))}
              </div>

              <div className="space-y-2">
                <h5 className="font-medium text-blue-800">Examples:</h5>
                {currentExercise.examples.map((example, index) => (
                  <p key={index} className="text-sm text-blue-700 italic">"{example}"</p>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          {isAnswered && (
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAnswered(false);
                  setUserAnswers(prev => ({ ...prev, [currentExercise.id]: '' }));
                }}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Try Again
              </Button>

              <Button onClick={handleNext}>
                {currentExerciseIndex < exercises.length - 1 ? 'Next Exercise' : 'Finish Practice'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const getButtonVariant = (option: string, userAnswer: string, isAnswered: boolean) => {
  if (!isAnswered) return 'outline';
  return userAnswer === option ? 'default' : 'outline';
};

