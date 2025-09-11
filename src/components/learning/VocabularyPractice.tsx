'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  CheckCircle,
  XCircle,
  RotateCcw,
  Play,
  Pause,
  Volume2,
  Target,
  Trophy,
  Star
} from 'lucide-react';
import { VocabularyWord } from '@/types/vocabulary';

export interface VocabularyQuestion {
  id: string;
  type: 'multiple-choice' | 'fill-blank' | 'translation' | 'matching' | 'word-order';
  question: string;
  correctAnswer: string;
  options?: string[];
  word: VocabularyWord;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
}

interface VocabularyPracticeProps {
  words: VocabularyWord[];
  onComplete: (score: number, totalQuestions: number, timeSpent: number) => void;
  onExit: () => void;
}

export const VocabularyPractice: React.FC<VocabularyPracticeProps> = ({
  words,
  onComplete,
  onExit
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<VocabularyQuestion[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [pauseStartTime, setPauseStartTime] = useState<Date | null>(null);
  const [totalPauseTime, setTotalPauseTime] = useState(0);

  // Generate questions from vocabulary words
  useEffect(() => {
    if (words.length === 0) return;

    const generatedQuestions: VocabularyQuestion[] = [];

    words.forEach((word, index) => {
      // Multiple choice question
      generatedQuestions.push({
        id: `mc-${index}`,
        type: 'multiple-choice',
        question: `What does "${word.german}" mean in English?`,
        correctAnswer: word.english,
        options: generateOptions(word.english, words),
        word,
        difficulty: getDifficulty(word),
        points: getDifficultyPoints(word)
      });

      // Fill in the blank question
      if (word.example) {
        const blankedExample = word.example.replace(word.german, '_____');
        generatedQuestions.push({
          id: `fb-${index}`,
          type: 'fill-blank',
          question: `Fill in the blank: "${blankedExample}"`,
          correctAnswer: word.german,
          word,
          difficulty: getDifficulty(word),
          points: getDifficultyPoints(word)
        });
      }

      // Translation question
      generatedQuestions.push({
        id: `tr-${index}`,
        type: 'translation',
        question: `Translate "${word.english}" to German`,
        correctAnswer: word.german,
        word,
        difficulty: getDifficulty(word),
        points: getDifficultyPoints(word)
      });
    });

    // Shuffle questions
    setQuestions(generatedQuestions.sort(() => Math.random() - 0.5));
    setStartTime(new Date());
  }, [words]);

  const getDifficulty = (word: VocabularyWord): 'easy' | 'medium' | 'hard' => {
    const difficulty = word.difficulty_level || 'A1';
    if (difficulty === 'A1' || difficulty === 'A2') return 'easy';
    if (difficulty === 'B1' || difficulty === 'B2') return 'medium';
    return 'hard';
  };

  const getDifficultyPoints = (word: VocabularyWord): number => {
    const difficulty = getDifficulty(word);
    switch (difficulty) {
      case 'easy': return 10;
      case 'medium': return 20;
      case 'hard': return 30;
      default: return 10;
    }
  };

  const generateOptions = (correctAnswer: string, allWords: VocabularyWord[]): string[] => {
    const options = [correctAnswer];
    const otherWords = allWords
      .filter(w => w.english !== correctAnswer)
      .map(w => w.english)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    options.push(...otherWords);
    return options.sort(() => Math.random() - 0.5);
  };

  const handleAnswer = useCallback((answer: string) => {
    if (isAnswered) return;

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = answer.toLowerCase().trim() === currentQuestion.correctAnswer.toLowerCase().trim();

    setUserAnswers(prev => ({ ...prev, [currentQuestion.id]: answer }));
    setIsAnswered(true);

    if (isCorrect) {
      setScore(prev => prev + currentQuestion.points);
      setStreak(prev => {
        const newStreak = prev + 1;
        setMaxStreak(prevMax => Math.max(prevMax, newStreak));
        return newStreak;
      });
    } else {
      setStreak(0);
    }
  }, [currentQuestionIndex, questions, isAnswered]);

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setIsAnswered(false);
    } else {
      // Practice completed
      const endTime = new Date();
      const timeSpent = startTime ?
        (endTime.getTime() - startTime.getTime() - totalPauseTime) / 1000 : 0;

      onComplete(score, questions.length, timeSpent);
    }
  };

  const handlePause = () => {
    if (isPaused) {
      // Resume
      if (pauseStartTime) {
        const pauseDuration = new Date().getTime() - pauseStartTime.getTime();
        setTotalPauseTime(prev => prev + pauseDuration);
        setPauseStartTime(null);
      }
      setIsPaused(false);
    } else {
      // Pause
      setPauseStartTime(new Date());
      setIsPaused(true);
    }
  };

  const getCurrentQuestion = () => questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  if (questions.length === 0) {
    return (
      <div className="text-center py-8">
        <p>Loading questions...</p>
      </div>
    );
  }

  const currentQuestion = getCurrentQuestion();
  const userAnswer = userAnswers[currentQuestion.id];
  const isCorrect = userAnswer &&
    userAnswer.toLowerCase().trim() === currentQuestion.correctAnswer.toLowerCase().trim();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Vocabulary Practice</h2>
          <p className="text-muted-foreground">
            Question {currentQuestionIndex + 1} of {questions.length}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handlePause}>
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            {isPaused ? 'Resume' : 'Pause'}
          </Button>
          <Button variant="outline" onClick={onExit}>
            Exit
          </Button>
        </div>
      </div>

      {/* Progress and Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{score}</div>
            <div className="text-sm text-muted-foreground">Points</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{streak}</div>
            <div className="text-sm text-muted-foreground">Current Streak</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{maxStreak}</div>
            <div className="text-sm text-muted-foreground">Best Streak</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {Math.round((score / (questions.length * 30)) * 100)}%
            </div>
            <div className="text-sm text-muted-foreground">Accuracy</div>
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

      {/* Question Card */}
      <Card className="min-h-[400px]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">{currentQuestion.question}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge className={getDifficultyBadgeColor(currentQuestion.difficulty)}>
                {currentQuestion.difficulty}
              </Badge>
              <Badge variant="outline">
                {currentQuestion.points} pts
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Question Type Specific UI */}
          {currentQuestion.type === 'multiple-choice' && (
            <div className="space-y-3">
              {currentQuestion.options?.map((option, index) => (
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

          {(currentQuestion.type === 'fill-blank' || currentQuestion.type === 'translation') && (
            <div className="space-y-4">
              <Input
                placeholder="Type your answer..."
                value={userAnswer || ''}
                onChange={(e) => setUserAnswers(prev => ({
                  ...prev,
                  [currentQuestion.id]: e.target.value
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
                  The correct answer is: <strong>{currentQuestion.correctAnswer}</strong>
                </p>
              )}

              {currentQuestion.word.example && (
                <p className="text-sm mt-2 italic">
                  Example: "{currentQuestion.word.example}"
                </p>
              )}
            </div>
          )}

          {/* Navigation */}
          {isAnswered && (
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAnswered(false);
                  setUserAnswers(prev => ({ ...prev, [currentQuestion.id]: '' }));
                }}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Try Again
              </Button>

              <Button onClick={handleNext}>
                {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Practice'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const getDifficultyBadgeColor = (difficulty: string) => {
  switch (difficulty) {
    case 'easy': return 'bg-green-100 text-green-800 border-green-200';
    case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'hard': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getButtonVariant = (option: string, userAnswer: string, isAnswered: boolean) => {
  if (!isAnswered) return 'outline';

  // This would need to be implemented based on the correct answer
  // For now, just show the selected answer
  return userAnswer === option ? 'default' : 'outline';
};

