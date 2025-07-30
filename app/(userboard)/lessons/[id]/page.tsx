"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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
  Sparkles,
  Volume2,
  VolumeX,
  Wand2,
  Waves,
} from "lucide-react";
import WaveSurfer from "wavesurfer.js";
import { lessonsApi } from "@/lib/api";
import { useAuthStore } from "@/lib/store/auth";

// Web Speech API types remain the same
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

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const pulseAnimation = {
  scale: [1, 1.05, 1],
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: "easeInOut",
  },
};

const waveAnimation = {
  opacity: [0.3, 1, 0.3],
  scale: [1, 1.1, 1],
  transition: {
    duration: 1.5,
    repeat: Infinity,
    ease: "easeInOut",
  },
};

// Add these types
type StreamResponse = {
  ok: boolean;
  status: number;
  body: ReadableStream<Uint8Array>;
};

export default function LessonDetail() {
  const params = useParams();
  const router = useRouter();
  const lessonId = params.id as string;

  const { data: lesson, isLoading, error } = useLesson(lessonId);
  const lessonInteraction = useLessonInteraction();

  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResponse, setLastResponse] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const waveformRef = useRef<WaveSurfer | null>(null);
  const waveformContainerRef = useRef<HTMLDivElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const mediaSourceRef = useRef<MediaSource | null>(null);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "beginner":
        return "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800";
      case "intermediate":
        return "text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800";
      case "advanced":
        return "text-rose-600 bg-rose-100 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800";
      default:
        return "text-gray-600 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200 dark:border-gray-800";
    }
  };

  // Initialize waveform
  useEffect(() => {
    if (waveformContainerRef.current && !waveformRef.current) {
      waveformRef.current = WaveSurfer.create({
        container: waveformContainerRef.current,
        waveColor: "var(--color-primary)",
        progressColor: "var(--color-secondary)",
        cursorColor: "var(--color-accent)",
        barWidth: 3,
        barGap: 3,
        height: 80,
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

        recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
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

  const stopAllAudioAndRecording = () => {
    // Stop any ongoing recording
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        // Ignore errors when stopping
      }
    }

    // Stop MediaRecorder if it's recording
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      try {
        mediaRecorderRef.current.stop();
        // Clear the MediaRecorder to force re-initialization
        mediaRecorderRef.current = null;
      } catch (error) {
        // Ignore errors when stopping
      }
    }

    // Stop any playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    // Reset states
    setIsRecording(false);
    setIsAISpeaking(false);
  };

  const handleStartRecording = async () => {
    try {
      setErrorMessage(null);
      
      // First, stop any ongoing audio/recording
      stopAllAudioAndRecording();

      // Wait a brief moment to ensure everything is stopped
      await new Promise(resolve => setTimeout(resolve, 100));

      // Initialize audio recording
      await initializeAudioRecording();

      if (recognitionRef.current && mediaRecorderRef.current) {
        recognitionRef.current.start();
        mediaRecorderRef.current.start();
        setIsRecording(true);
      } else {
        setErrorMessage(
          "Speech recognition is not supported in your browser"
        );
      }
    } catch (error) {
      console.error("Failed to start recording:", error);
      setErrorMessage("Failed to start recording");
      setIsRecording(false);
      // Clear MediaRecorder on error
      mediaRecorderRef.current = null;
    }
  };

  const handleStopRecording = () => {
    stopAllAudioAndRecording();
  };

  const playAudioStream = async (response: StreamResponse) => {
    try {
      setIsAISpeaking(true);

      // Stop any ongoing recording first
      stopAllAudioAndRecording();

      // Create new MediaSource
      const mediaSource = new MediaSource();
      mediaSourceRef.current = mediaSource;

      // Create audio element if it doesn't exist
      if (!audioRef.current) {
        audioRef.current = new Audio();
      }

      // Set up audio source
      audioRef.current.src = URL.createObjectURL(mediaSource);

      // Handle source open
      mediaSource.addEventListener('sourceopen', async () => {
        const sourceBuffer = mediaSource.addSourceBuffer('audio/mpeg');
        const reader = response.body.getReader();

        const appendBuffer = async ({ done, value }: { done: boolean; value?: Uint8Array }) => {
          if (done) {
            mediaSource.endOfStream();
            return;
          }

          if (value) {
            // Wait for the buffer to be ready before appending more data
            sourceBuffer.addEventListener('updateend', () => {
              reader.read().then(appendBuffer);
            }, { once: true });

            // Create a new ArrayBuffer from the Uint8Array
            const arrayBuffer = new ArrayBuffer(value.byteLength);
            new Uint8Array(arrayBuffer).set(value);
            sourceBuffer.appendBuffer(arrayBuffer);
          }
        };

        // Start reading the stream
        reader.read().then(appendBuffer);
      });

      // Handle audio end
      audioRef.current.addEventListener('ended', () => {
        console.log('Audio playback ended');
        setIsAISpeaking(false);
        
        if (mediaSourceRef.current) {
          URL.revokeObjectURL(audioRef.current?.src || '');
          mediaSourceRef.current = null;
        }

        handleStartRecording();
      }, { once: true }); 

      await audioRef.current.play();

    } catch (error) {
      console.error('Error playing audio stream:', error);
      setErrorMessage('Failed to play AI response');
      setIsAISpeaking(false);

      // Cleanup on error
      if (mediaSourceRef.current) {
        URL.revokeObjectURL(audioRef.current?.src || '');
        mediaSourceRef.current = null;
      }

      // Try to start recording again even if there was an error
      handleStartRecording();
    }
  };

  const handleSendMessage = async (message: string) => {
    try {
      setIsProcessing(true);
      setTranscript(message);

      // Get API URL and token
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const token = useAuthStore.getState().getToken();

      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_URL}/lessons/interact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message,
          lessonId,
        }),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      await playAudioStream(response as StreamResponse);

    } catch (error) {
      console.error('Failed to send message:', error);
      setErrorMessage('Failed to get AI response');
    } finally {
      setIsProcessing(false);
    }
  };

  // Initialize audio recording and visualization
  const initializeAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Create new MediaRecorder instance
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
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        if (waveformRef.current) {
          const audioUrl = URL.createObjectURL(audioBlob);
          waveformRef.current.load(audioUrl);
        }
        audioChunksRef.current = [];
        // Stop all tracks in the stream
        stream.getTracks().forEach(track => track.stop());
      };

    } catch (error) {
      console.error("Error accessing microphone:", error);
      setErrorMessage("Failed to access microphone");
      mediaRecorderRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      stopAllAudioAndRecording();
      if (mediaSourceRef.current) {
        URL.revokeObjectURL(audioRef.current?.src || '');
        mediaSourceRef.current = null;
      }
    };
  }, []);

  if (isLoading) {
    return (
      <motion.div 
        className="min-h-screen bg-light dark:bg-dark flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-center space-y-4">
          <motion.div 
            className="w-20 h-20 mx-auto bg-gradient-to-br from-primary via-secondary to-accent rounded-3xl flex items-center justify-center"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 className="w-10 h-10 text-white" />
          </motion.div>
          <motion.p 
            className="text-lg font-medium text-text dark:text-text-light"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Loading your lesson...
          </motion.p>
        </div>
      </motion.div>
    );
  }

  if (error || !lesson) {
    return (
      <motion.div 
        className="min-h-screen bg-light dark:bg-dark flex items-center justify-center px-4"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="text-center space-y-8 max-w-md">
          <div className="relative">
            <div className="absolute inset-0 bg-red-500/10 dark:bg-red-500/5 blur-2xl rounded-full" />
            <motion.div 
              className="relative w-32 h-32 mx-auto bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 rounded-3xl flex items-center justify-center"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <BookOpen className="w-16 h-16 text-red-500 dark:text-red-400" />
            </motion.div>
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-bold text-text dark:text-text-light">
              Lesson Not Found
            </h1>
            <p className="text-text-muted text-lg">
              {error?.message || "The lesson you're looking for doesn't exist or has been removed."}
            </p>
          </div>
          <div className="space-y-3">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={() => router.back()}
                className="w-full bg-gradient-to-r from-primary via-secondary to-accent text-white shadow-lg"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Go Back
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="secondary"
                onClick={() => router.push("/lessons")}
                className="w-full border border-light-border dark:border-dark-border"
              >
                Browse All Lessons
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen bg-light dark:bg-dark"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <motion.div 
          className="mb-8 flex items-center space-x-4"
          variants={fadeIn}
          initial="initial"
          animate="animate"
        >
          <Button
            variant="secondary"
            onClick={() => router.back()}
            className="hover:bg-light-surface dark:hover:bg-dark-surface transition-colors border border-light-border dark:border-dark-border rounded-xl"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Lessons
          </Button>
          <div className="h-6 w-px bg-light-border dark:bg-dark-border" />
          <h1 className="text-xl font-medium text-text-muted">
            Interactive Voice Lesson
          </h1>
        </motion.div>

        {/* Lesson Details */}
        <motion.div 
          className="bg-light-surface dark:bg-dark-surface rounded-3xl shadow-lg border border-light-border dark:border-dark-border p-8 mb-8"
          variants={fadeIn}
          initial="initial"
          animate="animate"
        >
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent mb-3">
                {lesson.title}
              </h1>
              <div className="flex items-center gap-4 text-sm">
                <span className={`px-3 py-1.5 rounded-full text-xs font-medium border ${getDifficultyColor(lesson.difficulty)}`}>
                  {lesson.difficulty.charAt(0).toUpperCase() + lesson.difficulty.slice(1)}
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
              <span>Created: {new Date(lesson.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </motion.div>

        {/* Voice Interaction Interface */}
        <motion.div 
          className="bg-light-surface dark:bg-dark-surface rounded-3xl shadow-lg border border-light-border dark:border-dark-border overflow-hidden"
          variants={fadeIn}
          initial="initial"
          animate="animate"
        >
          <div className="p-8">
            <div className="max-w-4xl mx-auto">
              {/* Main Interaction Area */}
              <div className="text-center mb-12">
                <motion.div
                  className="relative w-32 h-32 mx-auto mb-6"
                  animate={isRecording ? pulseAnimation : {}}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 rounded-full blur-2xl" />
                  <motion.button
                    className={`relative w-full h-full rounded-full flex items-center justify-center transition-all duration-300 ${
                      isRecording
                        ? "bg-gradient-to-r from-red-500 to-red-600 shadow-lg shadow-red-500/20"
                        : isAISpeaking
                        ? "bg-gradient-to-r from-primary via-secondary to-accent shadow-lg shadow-primary/20"
                        : "bg-gradient-to-r from-primary via-secondary to-accent shadow-lg shadow-primary/20"
                    }`}
                    onClick={isRecording ? handleStopRecording : handleStartRecording}
                    disabled={isPlaying || isProcessing || isAISpeaking}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isRecording ? (
                      <StopCircle className="w-12 h-12 text-white" />
                    ) : isAISpeaking ? (
                      <motion.div
                        animate={waveAnimation}
                        className="relative"
                      >
                        <Waves className="w-12 h-12 text-white" />
                        <div className="absolute inset-0 bg-white/20 blur-sm rounded-full" />
                      </motion.div>
                    ) : (
                      <Mic className="w-12 h-12 text-white" />
                    )}
                  </motion.button>
                </motion.div>

                <AnimatePresence mode="wait">
                  {isRecording && (
                    <motion.p
                      className="text-lg text-primary dark:text-primary-dark font-medium"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      Listening to you...
                    </motion.p>
                  )}
                  {isAISpeaking && (
                    <motion.p
                      className="text-lg text-accent dark:text-accent-dark font-medium"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      AI is speaking...
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Waveform Visualizer */}
              <motion.div 
                className="bg-light dark:bg-dark rounded-2xl p-6 mb-8"
                animate={{
                  borderColor: isAISpeaking ? "var(--color-accent)" : "var(--color-border)",
                  boxShadow: isAISpeaking ? "0 0 20px var(--color-accent-glow)" : "none",
                }}
                transition={{ duration: 0.3 }}
              >
                <div
                  ref={waveformContainerRef}
                  className="h-20 bg-light-surface dark:bg-dark-surface rounded-xl"
                />
              </motion.div>

              {/* Status and Controls */}
              <div className="flex items-center justify-between mb-6">
                <motion.button
                  className={`p-3 rounded-xl transition-colors ${
                    isMuted
                      ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                      : "bg-light dark:bg-dark text-text-muted"
                  }`}
                  onClick={() => setIsMuted(!isMuted)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isMuted ? (
                    <VolumeX className="w-6 h-6" />
                  ) : (
                    <Volume2 className="w-6 h-6" />
                  )}
                </motion.button>

                <AnimatePresence mode="wait">
                  {(isProcessing || isAISpeaking) && (
                    <motion.div
                      className="flex items-center gap-2 text-sm font-medium"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-primary dark:text-primary-dark" />
                          <span className="text-primary dark:text-primary-dark">Processing...</span>
                        </>
                      ) : (
                        <>
                          <motion.div
                            className="w-2 h-2 bg-accent rounded-full"
                            animate={{ scale: [1, 1.5, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                          />
                          <span className="text-accent dark:text-accent-dark">AI is speaking...</span>
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="w-12 h-12" /> {/* Spacer for layout balance */}
              </div>

              {/* Last Response */}
              <AnimatePresence>
                {lastResponse && (
                  <motion.div
                    className="bg-light dark:bg-dark rounded-2xl p-6 border border-light-border dark:border-dark-border"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center">
                        <Wand2 className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-text-muted mb-1">Last Response</p>
                        <p className="text-text dark:text-text-light">{lastResponse}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error Message */}
              <AnimatePresence>
                {errorMessage && (
                  <motion.div
                    className="mt-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-2xl p-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
                      <motion.span
                        className="w-2 h-2 bg-red-500 rounded-full mr-2"
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      />
                      {errorMessage}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
