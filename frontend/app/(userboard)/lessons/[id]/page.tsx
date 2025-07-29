"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Button from "@/app/components/ui/button";
import { useLesson, useLessonInteraction } from "@/lib/hooks/useLesson";
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
  const lessonId = params.id as string;

  const { data: lesson, isLoading, error } = useLesson(lessonId);
  const lessonInteraction = useLessonInteraction();

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

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "beginner":
        return "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800";
      case "intermediate":
        return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800";
      case "advanced":
        return "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800";
      default:
        return "text-gray-600 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200 dark:border-gray-800";
    }
  };

  // Initialize waveform
  useEffect(() => {
    if (waveformContainerRef.current && !waveformRef.current) {
      waveformRef.current = WaveSurfer.create({
        container: waveformContainerRef.current,
        waveColor: "#2A9D8F",
        progressColor: "#E9C46A",
        cursorColor: "#F4A261",
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
      setChatHistory((prev) => [...prev, { type: "user", message }]);

      const result = await lessonInteraction.mutateAsync({
        message,
        lessonId,
      });

      if (result.status) {
        // Handle successful response
        setChatHistory((prev) => [
          ...prev,
          { type: "ai", message: "AI Response" },
        ]);

        // If there's audio URL in the response, play it
        const responseData = result.data as { audioUrl?: string };
        if (responseData?.audioUrl) {
          if (audioRef.current) {
            audioRef.current.src = responseData.audioUrl;

            if (waveformRef.current) {
              waveformRef.current.load(responseData.audioUrl);
            }

            await audioRef.current.play();
          }
        }
      } else {
        // Handle backend error
        setErrorMessage(result.message || "Failed to get AI response");
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      setErrorMessage("Failed to get AI response");
    } finally {
      setIsProcessing(false);
    }
  };

  // Initialize audio recording and visualization
  const initializeAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyzer = audioContext.createAnalyser();
      analyzer.fftSize = 256;
      source.connect(analyzer);

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-light dark:bg-dark flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
          <p className="text-lg font-medium text-text dark:text-text-light">
            Loading lesson...
          </p>
        </div>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="min-h-screen bg-light dark:bg-dark flex items-center justify-center px-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="relative">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 rounded-2xl flex items-center justify-center">
              <BookOpen className="w-12 h-12 text-red-500 dark:text-red-400" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-text dark:text-text-light">
              Lesson Not Found
            </h1>
            <p className="text-text-muted">
              {error?.message ||
                "The lesson you are looking for does not exist or has been removed."}
            </p>
          </div>
          <div className="space-y-3">
            <Button
              onClick={() => router.back()}
              className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary-dark hover:to-secondary-dark text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
            <Button
              variant="secondary"
              onClick={() => router.push("/lessons")}
              className="w-full border border-light-border dark:border-dark-border"
            >
              Browse All Lessons
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light dark:bg-dark">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header with Navigation */}
        <div className="mb-8 flex items-center space-x-4">
          <Button
            variant="secondary"
            onClick={() => router.back()}
            className="hover:bg-light-surface dark:hover:bg-dark-surface transition-colors border border-light-border dark:border-dark-border"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Lessons
          </Button>
          <div className="h-6 w-px bg-light-border dark:bg-dark-border" />
          <h1 className="text-xl font-medium text-text-muted">
            Interactive Lesson
          </h1>
        </div>

        {/* Lesson Details Card */}
        <div className="bg-light-surface dark:bg-dark-surface rounded-3xl shadow-lg border border-light-border dark:border-dark-border p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-text dark:text-text-light mb-3">
                {lesson.title}
              </h1>
              <div className="flex items-center gap-4 text-sm">
                <span
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border ${getDifficultyColor(
                    lesson.difficulty
                  )}`}
                >
                  {lesson.difficulty.charAt(0).toUpperCase() +
                    lesson.difficulty.slice(1)}
                </span>
                <div className="flex items-center text-text-muted">
                  <Clock className="w-4 h-4 mr-1.5" />
                  {formatTime(lesson.estimatedTime)}
                </div>
              </div>
            </div>
          </div>

          <p className="text-text dark:text-text-light text-lg leading-relaxed mb-6">
            {lesson.description}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-text-muted border-t border-light-border dark:border-dark-border pt-6">
            <div className="flex items-center">
              <User className="w-4 h-4 mr-2 text-text-muted" />
              <span>Generated from: {lesson.userRequest}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-text-muted" />
              <span>
                Created: {new Date(lesson.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Voice Interaction Section */}
        <div className="bg-light-surface dark:bg-dark-surface rounded-3xl shadow-lg border border-light-border dark:border-dark-border overflow-hidden">
          <div className="p-8">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-2xl font-semibold text-text dark:text-text-light mb-3">
                Voice Interaction
              </h2>
              <p className="text-text-muted mb-8">
                Have a natural conversation with your AI tutor about this lesson
              </p>

              {!isInteracting ? (
                <Button
                  onClick={() => setIsInteracting(true)}
                  className="w-full max-w-md bg-gradient-to-r from-primary to-secondary hover:from-primary-dark hover:to-secondary-dark text-white shadow-lg"
                  size="lg"
                >
                  <Mic className="w-5 h-5 mr-2" />
                  Start Voice Interaction
                </Button>
              ) : (
                <div className="space-y-6">
                  {/* Waveform and Recording Controls */}
                  <div className="bg-light dark:bg-dark rounded-2xl p-6 border border-light-border dark:border-dark-border">
                    <div
                      ref={waveformContainerRef}
                      className="mb-4 bg-light-surface dark:bg-dark-surface rounded-xl p-4"
                    />

                    <Button
                      onClick={
                        isRecording ? handleStopRecording : handleStartRecording
                      }
                      className={`w-full max-w-md transition-all duration-200 ${
                        isRecording
                          ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 animate-pulse"
                          : "bg-gradient-to-r from-primary to-secondary hover:from-primary-dark hover:to-secondary-dark"
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

                    <p className="text-sm text-text-muted mt-3">
                      {isRecording ? (
                        <span className="text-red-500 dark:text-red-400 flex items-center justify-center">
                          <span className="w-2 h-2 bg-red-500 rounded-full animate-ping mr-2" />
                          Recording in progress...
                        </span>
                      ) : isProcessing ? (
                        <span className="text-primary dark:text-primary-dark flex items-center justify-center">
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing your request...
                        </span>
                      ) : isPlaying ? (
                        <span className="text-accent dark:text-accent-dark flex items-center justify-center">
                          <span className="w-2 h-2 bg-accent rounded-full animate-pulse mr-2" />
                          Playing response...
                        </span>
                      ) : (
                        "Click to start speaking"
                      )}
                    </p>
                  </div>

                  {/* Chat History */}
                  {chatHistory.length > 0 && (
                    <div className="border border-light-border dark:border-dark-border rounded-2xl overflow-hidden bg-light-surface dark:bg-dark-surface">
                      <div className="bg-light dark:bg-dark px-4 py-3 border-b border-light-border dark:border-dark-border">
                        <h3 className="text-sm font-medium text-text dark:text-text-light">
                          Conversation History
                        </h3>
                      </div>
                      <div className="divide-y divide-light-border dark:divide-dark-border">
                        {chatHistory.map((chat, index) => (
                          <div
                            key={index}
                            className={`flex items-start p-4 ${
                              chat.type === "ai"
                                ? "bg-light/50 dark:bg-dark/50"
                                : ""
                            }`}
                          >
                            <div
                              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                                chat.type === "ai"
                                  ? "bg-gradient-to-br from-primary to-secondary text-white"
                                  : "bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border"
                              }`}
                            >
                              {chat.type === "ai" ? (
                                <Brain className="w-4 h-4" />
                              ) : (
                                <User className="w-4 h-4" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-text dark:text-text-light">
                                {chat.message}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {errorMessage && (
                    <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-2xl p-4">
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
