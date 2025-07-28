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
      const response = await apiFetch<{ audioUrl: string }>(
        "/lessons/interact",
        {
          method: "POST",
          body: {
            message,
            lessonId, // Using the ID directly from params
          },
        }
      );

      if (response.status && response.data?.audioUrl) {
        if (audioRef.current) {
          audioRef.current.src = response.data.audioUrl;

          // Load response audio into waveform
          if (waveformRef.current) {
            waveformRef.current.load(response.data.audioUrl);
          }

          await audioRef.current.play();
        }
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      setErrorMessage("Failed to get AI response");
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
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="secondary"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Lessons
          </Button>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {lesson.title}
                </h1>
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(
                      lesson.difficulty
                    )}`}
                  >
                    {lesson.difficulty.charAt(0).toUpperCase() +
                      lesson.difficulty.slice(1)}
                  </span>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {formatTime(lesson.estimatedTime)}
                  </div>
                </div>
              </div>
            </div>

            <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed mb-6">
              {lesson.description}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center">
                <User className="w-4 h-4 mr-2" />
                <span>Generated from: {lesson.userRequest}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                <span>
                  Created: {new Date(lesson.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Voice Interaction */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="text-center space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Voice Interaction
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Start a conversation with your lesson using voice commands
              </p>
            </div>

            {!isInteracting ? (
              <Button
                onClick={() => setIsInteracting(true)}
                className="w-full max-w-md"
                size="lg"
              >
                Start Voice Interaction
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="max-w-2xl mx-auto bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div ref={waveformContainerRef} className="mb-4" />

                  <Button
                    onClick={
                      isRecording ? handleStopRecording : handleStartRecording
                    }
                    className={`w-full ${
                      isRecording ? "bg-red-500 hover:bg-red-600" : ""
                    }`}
                    size="lg"
                    disabled={isPlaying}
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
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {isRecording
                    ? "Listening..."
                    : isPlaying
                    ? "Playing response..."
                    : "Click to start speaking"}
                </p>

                {transcript && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                      Last message:
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {transcript}
                    </p>
                  </div>
                )}

                {errorMessage && (
                  <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <p className="text-sm text-red-600 dark:text-red-400">
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
  );
}
