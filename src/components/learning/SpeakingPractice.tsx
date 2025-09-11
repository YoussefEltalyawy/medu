'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle,
  XCircle,
  RotateCcw,
  Mic,
  MicOff,
  Play,
  Pause,
  Volume2,
  VolumeX,
  RotateCcw as Rewind,
  SkipForward,
  Target,
  Trophy,
  Star,
  Clock
} from 'lucide-react';

export interface SpeakingExercise {
  id: string;
  title: string;
  difficulty: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  prompt: string;
  targetPhrase: string;
  pronunciation: string;
  audioUrl?: string; // For model pronunciation
  instructions: string[];
  tips: string[];
  points: number;
}

interface SpeakingPracticeProps {
  exercise: SpeakingExercise;
  onComplete: (score: number, timeSpent: number) => void;
  onExit: () => void;
}

export const SpeakingPractice: React.FC<SpeakingPracticeProps> = ({
  exercise,
  onComplete,
  onExit
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [startTime, setStartTime] = useState<Date>(new Date());
  const [hasStarted, setHasStarted] = useState(false);
  const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null);
  const [recordingUrl, setRecordingUrl] = useState<string>('');
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [maxAttempts] = useState(3);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

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

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setRecordingBlob(blob);
        setRecordingUrl(URL.createObjectURL(blob));
        setAttempts(prev => prev + 1);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setHasStarted(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      // Stop all tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    }
  };

  const playRecording = () => {
    if (recordingUrl) {
      const audio = new Audio(recordingUrl);
      audio.play();
    }
  };

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

  const handleSubmit = () => {
    if (recordingBlob) {
      // Simulate scoring based on attempts
      const baseScore = exercise.points;
      const attemptPenalty = Math.max(0, attempts - 1) * 5;
      const finalScore = Math.max(0, baseScore - attemptPenalty);

      setScore(finalScore);

      // Complete the exercise
      const endTime = new Date();
      const timeSpent = (endTime.getTime() - startTime.getTime()) / 1000;
      onComplete(finalScore, timeSpent);
    }
  };

  const handleRetry = () => {
    if (attempts < maxAttempts) {
      setRecordingBlob(null);
      setRecordingUrl('');
      // Reset recording state
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
          <h2 className="text-2xl font-bold">Speaking Practice</h2>
          <p className="text-muted-foreground">
            Practice pronunciation and speaking skills
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
              <Mic className="w-6 h-6 text-blue-600" />
              <div>
                <CardTitle className="text-xl">{exercise.title}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Target: "{exercise.targetPhrase}"
                </p>
              </div>
            </div>
            <Badge className={getDifficultyColor(exercise.difficulty)}>
              {exercise.difficulty}
            </Badge>
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

          {/* Target Phrase */}
          <div className="bg-muted p-4 rounded-lg text-center">
            <h3 className="text-lg font-semibold mb-2">Practice this phrase:</h3>
            <p className="text-2xl font-bold text-primary">{exercise.targetPhrase}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Pronunciation: {exercise.pronunciation}
            </p>
          </div>

          {/* Model Audio (if available) */}
          {exercise.audioUrl && (
            <div className="space-y-4">
              <h4 className="font-medium">Listen to the model pronunciation:</h4>

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
              <div className="flex items-center gap-3 justify-center">
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

              {/* Hidden Audio Element */}
              <audio
                ref={audioRef}
                src={exercise.audioUrl}
                preload="metadata"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
            </div>
          )}

          {/* Recording Section */}
          <div className="space-y-4">
            <h4 className="font-medium">Record your pronunciation:</h4>

            <div className="flex items-center justify-center gap-4">
              {!isRecording ? (
                <Button
                  size="lg"
                  onClick={startRecording}
                  className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600"
                >
                  <Mic className="w-8 h-8" />
                </Button>
              ) : (
                <Button
                  size="lg"
                  onClick={stopRecording}
                  className="w-16 h-16 rounded-full bg-gray-500 hover:bg-gray-600"
                >
                  <MicOff className="w-8 h-8" />
                </Button>
              )}
            </div>

            <p className="text-center text-sm text-muted-foreground">
              {isRecording ? 'Recording... Click to stop' : 'Click to start recording'}
            </p>
          </div>

          {/* Recording Playback */}
          {recordingUrl && (
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
              <h4 className="font-medium text-green-800 mb-3">Your recording:</h4>

              <div className="flex items-center gap-4 mb-3">
                <Button onClick={playRecording} variant="outline">
                  <Play className="w-4 h-4 mr-2" />
                  Play Recording
                </Button>

                <span className="text-sm text-muted-foreground">
                  Attempts: {attempts}/{maxAttempts}
                </span>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
                  Submit Recording
                </Button>

                {attempts < maxAttempts && (
                  <Button onClick={handleRetry} variant="outline">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-yellow-800">Pronunciation Tips:</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTips(!showTips)}
              >
                {showTips ? 'Hide' : 'Show'} Tips
              </Button>
            </div>

            {showTips && (
              <ul className="space-y-1">
                {exercise.tips.map((tip, index) => (
                  <li key={index} className="text-sm text-yellow-700">• {tip}</li>
                ))}
              </ul>
            )}
          </div>
        </CardContent>
      </Card>

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
            <div className="text-2xl font-bold text-green-600">{attempts}</div>
            <div className="text-sm text-muted-foreground">Attempts</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round((attempts / maxAttempts) * 100)}%
            </div>
            <div className="text-sm text-muted-foreground">Progress</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

