"use client";

import { apiFetch } from "@/lib/api";
import { useLesson } from "@/lib/hooks/useLesson";
import Button from "@/app/components/ui/button";
import { useParams, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  BookOpen,
  Clock,
  User,
  Calendar,
  Mic,
  StopCircle,
  Loader2,
  Brain,
} from "lucide-react";
import WaveSurfer from "wavesurfer.js";

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
  const router = useRouter();
  const lessonId = params.id as string; // We can use this directly since it's read-only

  const { data: lesson, isLoading, error } = useLesson(lessonId);
  const [isInteracting, setIsInteracting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [chatHistory, setChatHistory] = useState<
    Array<{ type: "user" | "ai"; message: string }>
  >([]);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const waveformRef = useRef<WaveSurfer | null>(null);
  const waveformContainerRef = useRef<HTMLDivElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Initialize waveform
  useEffect(() => {
    if (waveformContainerRef.current && !waveformRef.current) {
      waveformRef.current = WaveSurfer.create({
        container: waveformContainerRef.current,
        waveColor: "#4f46e5",
        progressColor: "#818cf8",
        cursorColor: "#312e81",
        barWidth: 2,
        barGap: 3,
        height: 60,
        barRadius: 3,
        normalize: true,
        interact: false,
      });
    }

    return () => {
      if (waveformRef.current) {
        waveformRef.current.destroy();
        waveformRef.current = null;
      }
    };
  }, []);

  // Initialize audio recording and visualization
  const initializeAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Create MediaRecorder
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      // Handle audio data
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // Create audio analyzer for visualization
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyzer = audioContext.createAnalyser();
      analyzer.fftSize = 256;
      source.connect(analyzer);

      // Update waveform
      const dataArray = new Uint8Array(analyzer.frequencyBinCount);
      const updateWaveform = () => {
        if (isRecording && waveformRef.current) {
          analyzer.getByteTimeDomainData(dataArray);
          const normalizedData = Array.from(dataArray).map(
            (value) => (value - 128) / 128
          );
          // @ts-ignore
          waveformRef.current.loadDecodedBuffer({
            getChannelData: () => normalizedData,
          } as unknown as AudioBuffer);
          requestAnimationFrame(updateWaveform);
        }
      };

      mediaRecorderRef.current.onstart = () => {
        updateWaveform();
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/wav",
        });
        if (waveformRef.current) {
          const audioUrl = URL.createObjectURL(audioBlob);
          waveformRef.current.load(audioUrl);
        }
        audioChunksRef.current = [];
      };
    } catch (error) {
      console.error("Error accessing microphone:", error);
      setErrorMessage("Failed to access microphone");
    }
  };

  // Set lessonId from params
  useEffect(() => {
    if (params?.id) {
      // setLessonId(params.id as string); // This line is removed as lessonId is now directly used
    }
  }, [params?.id]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "beginner":
        return "text-green-500 bg-green-100 dark:bg-green-900/30 dark:text-green-400";
      case "intermediate":
        return "text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "advanced":
        return "text-red-500 bg-red-100 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "text-gray-500 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  // Initialize speech recognition and audio player
  useEffect(() => {
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
          setErrorMessage("Failed to recognize speech");
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
      setErrorMessage("Failed to play audio response");
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
  }, []);

  const handleStartRecording = async () => {
    setErrorMessage(null);
    if (!mediaRecorderRef.current) {
      await initializeAudioRecording();
    }

    if (recognitionRef.current && mediaRecorderRef.current) {
      try {
        recognitionRef.current.start();
        mediaRecorderRef.current.start();
        setIsRecording(true);
      } catch (error) {
        console.error("Failed to start recording:", error);
        setErrorMessage("Failed to start recording");
      }
    } else {
      setErrorMessage(
        "Speech recognition or audio recording is not supported in your browser"
      );
    }
  };

  const handleStopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const handleSendMessage = async (message: string) => {
    try {
      setIsProcessing(true);
      // Add user message to chat history
      setChatHistory((prev) => [...prev, { type: "user", message }]);

      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const token = localStorage.getItem("token"); // Get token from storage

      const response = await fetch(`${API_URL}/lessons/interact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          message,
          lessonId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Check if response is audio (MP3)
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("audio/")) {
        // Handle audio response
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);

        // Add AI response to chat history
        setChatHistory((prev) => [
          ...prev,
          { type: "ai", message: "AI Response" },
        ]);

        if (audioRef.current) {
          audioRef.current.src = audioUrl;

          if (waveformRef.current) {
            waveformRef.current.load(audioUrl);
          }

          await audioRef.current.play();
        }
      } else {
        // Try to parse as JSON (fallback)
        const jsonResponse = await response.json();
        if (jsonResponse.status && jsonResponse.data?.audioUrl) {
          // Add AI response to chat history
          setChatHistory((prev) => [
            ...prev,
            { type: "ai", message: "AI Response" },
          ]);

          if (audioRef.current) {
            audioRef.current.src = jsonResponse.data.audioUrl;

            if (waveformRef.current) {
              waveformRef.current.load(jsonResponse.data.audioUrl);
            }

            await audioRef.current.play();
          }
        } else {
          throw new Error("Invalid response format");
        }
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      setErrorMessage("Failed to get AI response");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-lg font-medium text-gray-600 dark:text-gray-300">
            Loading lesson...
          </p>
        </div>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="relative">
            <div className="w-24 h-24 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <BookOpen className="w-12 h-12 text-red-500 dark:text-red-400" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Lesson Not Found
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {error?.message ||
                "The lesson you are looking for does not exist or has been removed."}
            </p>
          </div>
          <div className="space-y-3">
            <Button onClick={() => router.back()} className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
            <Button
              variant="secondary"
              onClick={() => router.push("/lessons")}
              className="w-full"
            >
              Browse All Lessons
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header with Navigation */}
        <div className="mb-8 flex items-center space-x-4">
          <Button
            variant="secondary"
            onClick={() => router.back()}
            className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Lessons
          </Button>
          <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />
          <h1 className="text-xl font-medium text-gray-600 dark:text-gray-400">
            Interactive Lesson
          </h1>
        </div>

        {/* Lesson Details Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                {lesson.title}
              </h1>
              <div className="flex items-center gap-4 text-sm">
                <span
                  className={`px-3 py-1.5 rounded-full text-xs font-medium ${getDifficultyColor(
                    lesson.difficulty
                  )}`}
                >
                  {lesson.difficulty.charAt(0).toUpperCase() +
                    lesson.difficulty.slice(1)}
                </span>
                <div className="flex items-center text-gray-500 dark:text-gray-400">
                  <Clock className="w-4 h-4 mr-1.5" />
                  {formatTime(lesson.estimatedTime)}
                </div>
              </div>
            </div>
          </div>

          <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed mb-6">
            {lesson.description}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400 border-t dark:border-gray-700 pt-6">
            <div className="flex items-center">
              <User className="w-4 h-4 mr-2 text-gray-400" />
              <span>Generated from: {lesson.userRequest}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-gray-400" />
              <span>
                Created: {new Date(lesson.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Voice Interaction Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-8">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Voice Interaction
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                Have a natural conversation with your AI tutor about this lesson
              </p>

              {!isInteracting ? (
                <Button
                  onClick={() => setIsInteracting(true)}
                  className="w-full max-w-md bg-indigo-600 hover:bg-indigo-700 text-white"
                  size="lg"
                >
                  <Mic className="w-5 h-5 mr-2" />
                  Start Voice Interaction
                </Button>
              ) : (
                <div className="space-y-6">
                  {/* Waveform and Recording Controls */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                    <div
                      ref={waveformContainerRef}
                      className="mb-4 bg-white dark:bg-gray-800 rounded-lg p-4"
                    />

                    <Button
                      onClick={
                        isRecording ? handleStopRecording : handleStartRecording
                      }
                      className={`w-full max-w-md transition-all duration-200 ${
                        isRecording
                          ? "bg-red-500 hover:bg-red-600 animate-pulse"
                          : "bg-indigo-600 hover:bg-indigo-700"
                      }`}
                      size="lg"
                      disabled={isPlaying || isProcessing}
                    >
                      {isRecording ? (
                        <>
                          <StopCircle className="w-5 h-5 mr-2" />
                          Stop Recording
                        </>
                      ) : (
                        <>
                          <Mic className="w-5 h-5 mr-2" />
                          Start Recording
                        </>
                      )}
                    </Button>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
                      {isRecording ? (
                        <span className="text-red-500 dark:text-red-400 flex items-center justify-center">
                          <span className="w-2 h-2 bg-red-500 rounded-full animate-ping mr-2" />
                          Recording in progress...
                        </span>
                      ) : isProcessing ? (
                        <span className="text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing your request...
                        </span>
                      ) : isPlaying ? (
                        <span className="text-green-600 dark:text-green-400 flex items-center justify-center">
                          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2" />
                          Playing response...
                        </span>
                      ) : (
                        "Click to start speaking"
                      )}
                    </p>
                  </div>

                  {/* Chat History */}
                  {chatHistory.length > 0 && (
                    <div className="border dark:border-gray-700 rounded-xl overflow-hidden">
                      <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-3 border-b dark:border-gray-700">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          Conversation History
                        </h3>
                      </div>
                      <div className="divide-y dark:divide-gray-700">
                        {chatHistory.map((chat, index) => (
                          <div
                            key={index}
                            className={`flex items-start p-4 ${
                              chat.type === "ai"
                                ? "bg-gray-50 dark:bg-gray-700/30"
                                : ""
                            }`}
                          >
                            <div
                              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                                chat.type === "ai"
                                  ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                              }`}
                            >
                              {chat.type === "ai" ? (
                                <Brain className="w-4 h-4" />
                              ) : (
                                <User className="w-4 h-4" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-900 dark:text-gray-100">
                                {chat.message}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {errorMessage && (
                    <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4">
                      <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
                        <span className="w-2 h-2 bg-red-500 rounded-full mr-2" />
                        {errorMessage}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
