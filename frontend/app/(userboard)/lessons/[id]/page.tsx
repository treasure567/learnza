"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Button from "@/app/components/ui/button";
import Card from "@/app/components/ui/card";
import { apiFetch } from "@/lib/api";

interface Lesson {
  _id: string;
  title: string;
  description: string;
  difficulty: string;
  estimatedTime: number;
  userRequest: string;
  createdAt: string;
  updatedAt: string;
}

// Web Speech API types
interface SpeechRecognitionEvent extends Event {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

export default function LessonDetail() {
  const params = useParams();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInteracting, setIsInteracting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "beginner":
        return "text-green-500";
      case "intermediate":
        return "text-yellow-500";
      case "advanced":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const response = await apiFetch<Lesson>(`/lesson/${params.id}`);
        if (response.status && response.data) {
          setLesson(response.data);
        }
      } catch (error) {
        console.error("Error fetching lesson:", error);
        setError("Failed to load lesson");
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchLesson();
    }

    // Initialize speech recognition
    if (typeof window !== "undefined") {
      const SpeechRecognitionConstructor =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (SpeechRecognitionConstructor) {
        recognitionRef.current = new SpeechRecognitionConstructor();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;

        recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
          const transcript = event.results[0][0].transcript;
          setTranscript(transcript);
          handleSendMessage(transcript);
        };

        recognitionRef.current.onerror = (
          event: SpeechRecognitionErrorEvent
        ) => {
          console.error("Speech recognition error:", event.error);
          setError("Failed to recognize speech");
          setIsRecording(false);
        };

        recognitionRef.current.onend = () => {
          setIsRecording(false);
        };
      }
    }

    // Initialize audio player
    audioRef.current = new Audio();
    audioRef.current.onplay = () => setIsPlaying(true);
    audioRef.current.onended = () => setIsPlaying(false);
    audioRef.current.onerror = () => {
      setError("Failed to play audio response");
      setIsPlaying(false);
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [params.id]);

  const handleStartRecording = () => {
    setError(null);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (error) {
        console.error("Failed to start recording:", error);
        setError("Failed to start recording");
      }
    } else {
      setError("Speech recognition is not supported in your browser");
    }
  };

  const handleStopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
  };

  const handleSendMessage = async (message: string) => {
    try {
      const response = await apiFetch<{ audioUrl: string }>(
        "/lessons/interact",
        {
          method: "POST",
          body: {
            message,
            lessonId: lesson?._id,
          },
        }
      );

      if (response.status && response.data?.audioUrl) {
        if (audioRef.current) {
          audioRef.current.src = response.data.audioUrl;
          await audioRef.current.play();
        }
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      setError("Failed to get AI response");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl">Lesson not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-light rounded-[24px] p-6 space-y-6 animate-float shadow-lg">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">{lesson.title}</h1>
          <div className="flex items-center gap-4 text-sm">
            <span className={getDifficultyColor(lesson.difficulty)}>
              {lesson.difficulty.charAt(0).toUpperCase() +
                lesson.difficulty.slice(1)}
            </span>
            <span>{formatTime(lesson.estimatedTime)}</span>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            {lesson.description}
          </p>
          <div className="text-sm text-gray-500">
            <p>Generated from: {lesson.userRequest}</p>
            <p>Created: {new Date(lesson.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="pt-6">
          <Button
            onClick={() => setIsInteracting(true)}
            className="w-full"
            disabled={isInteracting}
          >
            Start Voice Interaction
          </Button>
        </div>

        {isInteracting && (
          <div className="mt-6 p-4 border rounded-lg space-y-4">
            <div className="text-center space-y-4">
              <Button
                onClick={
                  isRecording ? handleStopRecording : handleStartRecording
                }
                className={`w-full ${
                  isRecording ? "bg-red-500 hover:bg-red-600" : ""
                }`}
                disabled={isPlaying}
              >
                {isRecording ? "Stop Recording" : "Start Recording"}
              </Button>
              <p className="text-sm">
                {isRecording
                  ? "Listening..."
                  : isPlaying
                  ? "Playing response..."
                  : "Click to start speaking"}
              </p>
              {transcript && (
                <p className="text-sm text-gray-600">
                  Last message: {transcript}
                </p>
              )}
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
