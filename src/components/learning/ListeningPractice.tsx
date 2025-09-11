'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  VolumeX,
  RotateCcw as Rewind,
  SkipForward,
  Headphones,
  Target,
  Clock
} from 'lucide-react';

export interface ListeningExercise {
  id: string;
  title: string;
  difficulty: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  audioUrl: string;
  transcript: string;
  questions: ListeningQuestion[];
  duration: number; // in seconds
  points: number;
}

export interface ListeningQuestion {
  id: string;
  type: 'multiple-choice' | 'fill-blank' | 'true-false' | 'comprehension';
  question: string;
  correctAnswer: string;
  options?: string[];
  points: number;
}

interface ListeningPracticeProps {
  exercise: ListeningExercise;
  onComplete: (score: number, totalQuestions: number, timeSpent: number) => void;
  onExit: () => void;
}

export const ListeningPractice: React.FC<ListeningPracticeProps> = ({
  exercise,
  onComplete,
  onExit
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [startTime, setStartTime] = useState<Date>(new Date());
  const [hasStarted, setHasStarted] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const currentQuestion = exercise.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / exercise.questions.length) * 100;
  const userAnswer = userAnswers[currentQuestion.id];
  const isCorrect = userAnswer &&
    userAnswer.toLowerCase().trim() === currentQuestion.correctAnswer.toLowerCase().trim();

  useEffect(() => {
    setStartTime(new Date());
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      const audio = audioRef.current;

      const updateTime = () => setCurrentTime(audio.currentTime);
      const updateDuration = () => setDuration(audio.duration);
      const handleEnded = () => setIsPlaying(false);

      audio.addEventListener('timeupdate', updateTime);
      audio.addEventListener('loadedmetadata', updateDuration);
      audio.addEventListener('ended', handleEnded);

      return () => {
        audio.removeEventListener('timeupdate', updateTime);
        audio.removeEventListener('loadedmetadata', updateDuration);
        audio.removeEventListener('ended', handleEnded);
      };
    }
  }, []);

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
        setHasStarted(true);
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const handleRewind = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, currentTime - 10);
    }
  };

  const handleForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(duration, currentTime + 10);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (answer: string) => {
    if (isAnswered) return;

    setUserAnswers(prev => ({ ...prev, [currentQuestion.id]: answer }));
    setIsAnswered(true);

    if (isCorrect) {
      setScore(prev => prev + currentQuestion.points);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < exercise.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setIsAnswered(false);
    } else {
      // Exercise completed
      const endTime = new Date();
      const timeSpent = (endTime.getTime() - startTime.getTime()) / 1000;
      onComplete(score, exercise.questions.length, timeSpent);
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Listening Practice</h2>
          <p className="text-muted-foreground">
            Question {currentQuestionIndex + 1} of {exercise.questions.length}
          </p>
        </div>

        <Button variant="outline" onClick={onExit}>
          Exit
        </Button>
      </div>

      {/* Audio Player */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Headphones className="w-6 h-6 text-blue-600" />
              <div>
                <CardTitle className="text-xl">{exercise.title}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Duration: {formatTime(exercise.duration)}
                </p>
              </div>
            </div>
            <Badge className={getDifficultyColor(exercise.difficulty)}>
              {exercise.difficulty}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Audio Controls */}
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={handleRewind}
              disabled={!hasStarted}
            >
              <Rewind className="w-4 h-4" />
            </Button>

            <Button
              size="lg"
              onClick={handlePlayPause}
              disabled={!hasStarted}
              className="w-16 h-16 rounded-full"
            >
              {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={handleForward}
              disabled={!hasStarted}
            >
              <SkipForward className="w-4 h-4" />
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleMute}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>

            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          {/* Transcript Toggle */}
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={() => setShowTranscript(!showTranscript)}
              className="text-sm"
            >
              {showTranscript ? 'Hide' : 'Show'} Transcript
            </Button>
          </div>

          {/* Transcript */}
          {showTranscript && (
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">Transcript:</h4>
              <p className="text-sm leading-relaxed">{exercise.transcript}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        src={exercise.audioUrl}
        preload="metadata"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

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
              {Math.round((score / (exercise.questions.length * 20)) * 100)}%
            </div>
            <div className="text-sm text-muted-foreground">Accuracy</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(progress)}%
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

      {/* Question Card */}
      <Card className="min-h-[400px]">
        <CardHeader>
          <CardTitle className="text-xl">{currentQuestion.question}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {currentQuestion.points} pts
            </Badge>
            <Badge variant="outline">
              {currentQuestion.type}
            </Badge>
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

          {currentQuestion.type === 'true-false' && (
            <div className="space-y-3">
              {['True', 'False'].map((option) => (
                <Button
                  key={option}
                  variant={getButtonVariant(option, userAnswer, isAnswered)}
                  className="w-full justify-start h-auto p-4 text-left"
                  onClick={() => handleAnswer(option)}
                  disabled={isAnswered}
                >
                  {option}
                </Button>
              ))}
            </div>
          )}

          {(currentQuestion.type === 'fill-blank' || currentQuestion.type === 'comprehension') && (
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
                {currentQuestionIndex < exercise.questions.length - 1 ? 'Next Question' : 'Finish Exercise'}
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

