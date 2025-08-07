"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/app/components/ui";
import { Mic, MicOff, PhoneOff, Clock } from "lucide-react";
import { useLesson } from "@/lib/hooks/useLesson";
import WaveSurfer from "wavesurfer.js";
import { useAuthStore } from "@/lib/store/auth";
import { useSettingsStore } from "@/lib/store/settings";
import { useRouter } from "nextjs-toploader/app";
import { useMutation } from "@tanstack/react-query";
import { lessonsApi } from "@/lib/api";
import { toast } from "sonner";

// Add custom animations
const customAnimations = `
  @keyframes ping-slow {
    75%, 100% {
      transform: scale(2);
      opacity: 0;
    }
  }
  
  @keyframes ping-slower {
    75%, 100% {
      transform: scale(1.75);
      opacity: 0;
    }
  }
  
  @keyframes sound-wave {
    0% {
      height: 24px;
    }
    50% {
      height: 48px;
    }
    100% {
      height: 24px;
    }
  }
  
  .animate-ping-slow {
    animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
  }
  
  .animate-ping-slower {
    animation: ping-slow 2.5s cubic-bezier(0, 0, 0.2, 1) infinite;
  }
  
  .animate-sound-wave {
    animation: sound-wave 1s ease-in-out infinite;
  }
`;

// Add styles to head
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = customAnimations;
  document.head.appendChild(style);
}


interface CallControlsProps {
  isMuted: boolean;
  onToggleMute: () => void;
  onEndCall: () => void;
}
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
  new(): SpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

type StreamResponse = {
  ok: boolean;
  status: number;
  body: ReadableStream<Uint8Array>;
};

const CallControls: React.FC<CallControlsProps> = ({
  isMuted,
  onToggleMute,
  onEndCall,
}) => {
  return (
    <div className="flex items-center justify-center gap-6">
      <button
        className={`rounded-full p-5 transition-all duration-200 ${isMuted
            ? "bg-red-50 text-red-500 hover:bg-red-100"
            : "bg-green-50 text-green-500 hover:bg-green-100"
          }`}
        onClick={onToggleMute}
      >
        {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
      </button>
      <button
        className="rounded-full p-5 bg-red-500 text-white hover:bg-red-600 transition-all duration-200"
        onClick={onEndCall}
      >
        <PhoneOff className="w-6 h-6" />
      </button>
    </div>
  );
};

export default function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const [isConnecting, setIsConnecting] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isEnding, setIsEnding] = useState(false);
  const setAppLanguage = useSettingsStore((s) => s.setLanguage);
  const resolvedParams = React.use(params);
  const lessonId = resolvedParams.id;
  const { data: lesson, isLoading, error } = useLesson(lessonId);
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement>(null);
  const mediaSourceRef = useRef<MediaSource | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const waveformRef = useRef<WaveSurfer | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const [languageCode, setLanguageCode] = useState<string>("en");
  const [isUpdatingLanguage, setIsUpdatingLanguage] = useState(false);

  const updateLessonLanguage = useMutation({
    mutationFn: (languageCode: string) => lessonsApi.updateLessonLanguage(lessonId, languageCode),
  });

  useEffect(() => {
    if (lesson) {
      console.log(lesson.languageCode);
      setLanguageCode(lesson.languageCode);
    }
  }, [lesson]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsConnecting(false);
      setIsConnected(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleUpdateLessonLanguage = async (languageCode: string) => {
    setIsUpdatingLanguage(true);
    await updateLessonLanguage.mutateAsync(languageCode).then(() => {
      toast.success("Language updated successfully");
      setLanguageCode(languageCode);
    }).catch(() => {
      toast.error("Failed to update language");
    });
    setIsUpdatingLanguage(false);
  };

  const playAudioStream = async (response: StreamResponse, type: 'mpeg' | 'wav') => {
    try {
      setIsAISpeaking(true);

      // Stop any ongoing recording first
      stopAllAudioAndRecording();

      // Create new MediaSource
      const mediaSource = new MediaSource();
      mediaSourceRef.current = mediaSource;

      // Create audio element if it doesn't exist
      // Create a new audio element and store it in a variable
      const audio = new Audio();
      Object.assign(audioRef, { current: audio });

      // Set up audio source
      if (audioRef.current) {
        audioRef.current.src = URL.createObjectURL(mediaSource);
      }

      // Handle source open
      mediaSource.addEventListener('sourceopen', async () => {
        const sourceBuffer = mediaSource.addSourceBuffer(type === 'mpeg' ? 'audio/mpeg' : 'audio/wav; codecs="1"');
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
      if (audioRef.current) {
        audioRef.current.addEventListener('ended', () => {
          console.log('Audio playback ended');
          setIsAISpeaking(false);

          if (mediaSourceRef.current) {
            try {
              const src = audioRef.current?.src || '';
              if (src.startsWith('blob:')) {
                URL.revokeObjectURL(src);
              }
            } catch {}
            mediaSourceRef.current = null;
          }

          handleStartRecording();
        }, { once: true });
      }

      if (audioRef.current) {
        await audioRef.current.play();
      }

    } catch (error) {
      console.error('Error playing audio stream:', error);
      setErrorMessage('Failed to play AI response');
      setIsAISpeaking(false);

      // Cleanup on error
      if (mediaSourceRef.current) {
        URL.revokeObjectURL(audioRef.current?.src || '');
        mediaSourceRef.current = null;
      }

      handleStartRecording();
    }
  };

  const handleSendMessage = async (message: string) => {
    try {
      if (isAISpeaking) return;
      setIsProcessing(true);
      setTranscript(message);
      setMessages((prev) => [...prev, { role: 'user', content: message }]);

      // Call API that may return JSON or raw audio
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3012/api";
      const token = useAuthStore.getState().getToken();
      if (!token) throw new Error('Authentication required');

      const response = await fetch(`${API_URL}/lessons/interact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json, audio/*;q=0.9, */*;q=0.8',
        },
        body: JSON.stringify({ message, lessonId, languageCode }),
        credentials: 'include',
      });

      const contentType = response.headers.get('content-type') || '';
      // Show assistant transcript ASAP from header if provided
      try {
        const transcriptB64 = response.headers.get('X-AI-Response-Base64');
        const headerTranscript = transcriptB64 ? atob(transcriptB64) : '';
        if (headerTranscript) {
          setMessages((prev) => [...prev, { role: 'assistant', content: headerTranscript }]);
        }
      } catch {}
      if (!response.ok && !contentType.startsWith('audio/')) {
        // Try to read JSON error
        let msg = 'Failed to get AI response';
        try {
          const err = await response.json();
          msg = err?.message || msg;
        } catch {}
        throw new Error(msg);
      }
      if (contentType.includes('application/json')) {
        const data = await response.json();
        const assistantText = data?.data?.text || data?.message || '';
        if (assistantText) {
          setMessages((prev) => [...prev, { role: 'assistant', content: assistantText }]);
        }
        const audioUrl: string | undefined = data?.data?.audioUrl;
        if (audioUrl) {
          setIsAISpeaking(true);
          stopAllAudioAndRecording();
          const audio = new Audio();
          Object.assign(audioRef, { current: audio });
          if (audioRef.current) {
            audioRef.current.src = audioUrl;
          audioRef.current.addEventListener('ended', () => {
              setIsAISpeaking(false);
            if (!isEnding) handleStartRecording();
            }, { once: true });
            await audioRef.current.play();
          }
        }
      } else {
        // Treat as audio blob
        setIsAISpeaking(true);
        stopAllAudioAndRecording();
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio();
        Object.assign(audioRef, { current: audio });
        if (audioRef.current) {
          audioRef.current.src = url;
          audioRef.current.addEventListener('ended', () => {
            setIsAISpeaking(false);
            URL.revokeObjectURL(url);
            if (!isEnding) handleStartRecording();
          }, { once: true });
          await audioRef.current.play();
        }
      }

    } catch (error) {
      console.error('Failed to send message:', error);
      setErrorMessage('Failed to get AI response');
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isConnected) {
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isConnected]);

  // Auto-scroll conversation to bottom on new message
  useEffect(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, isProcessing]);

  const initializeAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      // Create new MediaRecorder instance
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
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
        try {
          (mediaStreamRef.current || stream).getTracks().forEach((t) => t.stop());
        } catch {}
        mediaStreamRef.current = null;
        try {
          await audioContextRef.current?.close();
        } catch {}
        audioContextRef.current = null;
      };

    } catch (error) {
      console.error("Error accessing microphone:", error);
      setErrorMessage("Failed to access microphone");
      mediaRecorderRef.current = null;
    }
  };

  const stopAllAudioAndRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        // @ts-ignore
        recognitionRef.current.abort?.();
        // Detach handlers to avoid late callbacks changing UI after end
        recognitionRef.current.onresult = () => {};
        recognitionRef.current.onend = () => {};
        recognitionRef.current.onerror = () => {};
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
      try {
        const src = audioRef.current.src || "";
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        if (src.startsWith("blob:")) {
          URL.revokeObjectURL(src);
        }
      } catch {}
    }

    // Stop stream tracks
    try {
      mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
    } catch {}
    mediaStreamRef.current = null;

    // Close audio context
    try {
      audioContextRef.current?.close();
    } catch {}
    audioContextRef.current = null;

    // Reset states
    setIsRecording(false);
    setIsAISpeaking(false);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognitionConstructor =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (SpeechRecognitionConstructor) {
        recognitionRef.current = new SpeechRecognitionConstructor();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        // Initialize with current language code
        // @ts-ignore
        recognitionRef.current.lang = languageCode;

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
    const audio = new Audio();
    audio.onplay = () => setIsPlaying(true);
    audio.onended = () => setIsPlaying(false);
    audio.onerror = () => {
      setErrorMessage("Failed to play audio response");
      setIsPlaying(false);
    };
    Object.assign(audioRef, { current: audio });

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (audioRef.current) {
        audioRef.current.pause();
        const audio = audioRef.current;
        if (audio) {
          audio.src = '';
          Object.assign(audioRef, { current: undefined });
        }
      }
    };
  }, []);

  const handleStopRecording = () => {
    stopAllAudioAndRecording();
  };

  const handleStartRecording = async () => {
    try {
      if (isEnding) return; // Don't start if ending
      setErrorMessage(null);

      // First, stop any ongoing audio/recording
      stopAllAudioAndRecording();

      // Wait a brief moment to ensure everything is stopped
      await new Promise(resolve => setTimeout(resolve, 100));

      // Initialize audio recording
      await initializeAudioRecording();

      if (recognitionRef.current && mediaRecorderRef.current) {
        // Set language before starting
        // @ts-ignore
        recognitionRef.current.lang = languageCode;
        
        // Ensure handlers are set before starting
        recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
          if (isEnding) return;
          const transcript = event.results[0][0].transcript;
          setTranscript(transcript);
          handleSendMessage(transcript);
        };

        recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error("Speech recognition error:", event.error);
          if (!isEnding) {
            setErrorMessage("Failed to recognize speech");
            setIsRecording(false);
          }
        };

        recognitionRef.current.onend = () => {
          if (!isEnding) {
            setIsRecording(false);
          }
        };
        
        recognitionRef.current.start();
        mediaRecorderRef.current.start();
        setIsRecording(true);
      } else {
        if (!isEnding) {
          setErrorMessage(
            "Speech recognition is not supported in your browser"
          );
        }
      }
    } catch (error) {
      console.error("Failed to start recording:", error);
      if (!isEnding) {
        setErrorMessage("Failed to start recording");
        setIsRecording(false);
      }
      mediaRecorderRef.current = null;
    }
  };

  useEffect(() => {
    handleStopRecording();
    handleStartRecording();
  }, []);

  useEffect(() => {
    return () => {
      stopAllAudioAndRecording();
      if (mediaSourceRef.current) {
        URL.revokeObjectURL(audioRef.current?.src || '');
        mediaSourceRef.current = null;
      }
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleEndCall = () => {
    if (isEnding) return;
    setIsEnding(true);
    try {
      setIsConnected(false);
      stopAllAudioAndRecording();
      setIsRecording(false);
      setIsAISpeaking(false);
      setIsProcessing(false);
      setIsMuted(false);
      setElapsedTime(0);
      setTranscript("");
      setErrorMessage(null);
    } finally {
      // Navigate away immediately to avoid any lingering UI animation
      router.replace("/dashboard/lessons");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-24">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Main Call Container */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center">
                  <img
                    src="/images/ai-bg.jpg"
                    alt="AI Tutor"
                    className="w-12 h-12 object-cover rounded-xl"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  <div className="hidden text-white text-xl font-bold">AI</div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">AI Tutor Session</h1>
                  {isConnected && (
                    <div className="flex items-center mt-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
                      <span className="text-white/90 text-sm">{formatTime(elapsedTime)}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Connection Status */}
              <div className="flex items-center gap-3">
                <select
                  value={languageCode}
                  disabled={isUpdatingLanguage}
                  onChange={(e) => { handleUpdateLessonLanguage(e.target.value); }}
                  className="text-sm bg-white/90 text-gray-800 rounded-md px-2 py-1"
                >
                  <option value="en">English (en)</option>
                  <option value="yo">Yorùbá (yo)</option>
                  <option value="ig">Igbo (ig)</option>
                  <option value="ha">Hausa (ha)</option>
                </select>
                {isConnecting ? (
                  <div className="bg-white/20 backdrop-blur-xl rounded-full px-4 py-2 text-white flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                    Connecting...
                  </div>
                ) : !isConnected ? (
                  <div className="bg-red-500/20 backdrop-blur-xl rounded-full px-4 py-2 text-white flex items-center">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-2" />
                    Disconnected
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {/* Lesson Content */}
          {isConnected && lesson && (
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">{lesson.title}</h2>
                <span className={`px-4 py-1 rounded-full text-sm font-medium ${
                  lesson.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                  lesson.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {lesson.difficulty.charAt(0).toUpperCase() + lesson.difficulty.slice(1)}
                </span>
              </div>
              <p className="mt-2 text-gray-600">{lesson.description}</p>
              
              {/* Progress Section */}
              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-1" />
                    {formatTime(lesson.estimatedTime)}
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {(lesson as any).status === 'completed' ? '100' : (lesson as any).status === 'in_progress' ? '50' : '0'}%
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${(lesson as any).status === 'completed' ? 100 : (lesson as any).status === 'in_progress' ? 50 : 0}%`
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Interactive Area with Sidebar */}
          <div className="p-6 flex flex-col lg:flex-row gap-6">
            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-center space-y-6">
              {/* AI Speaking Animation */}
              {isConnected && (
                <>
                  <div className={`relative w-48 h-48 rounded-full ${
                    isAISpeaking ? 'bg-purple-100' : isRecording ? 'bg-blue-100' : 'bg-gray-100'
                  } flex items-center justify-center transition-all duration-300`}>
                    {/* Animated Rings */}
                    {(isAISpeaking || isRecording) && (
                      <>
                        <div className="absolute inset-0 rounded-full animate-ping-slow opacity-75 bg-current"></div>
                        <div className="absolute inset-2 rounded-full animate-ping-slower opacity-50 bg-current"></div>
                      </>
                    )}
                    
                    {/* Status Icon */}
                    <div className={`relative z-10 ${
                      isAISpeaking ? 'text-purple-500' : isRecording ? 'text-blue-500' : 'text-gray-400'
                    }`}>
                      {isAISpeaking ? (
                        <div className="flex space-x-1">
                          {[0, 1, 2, 3].map((i) => (
                            <div
                              key={i}
                              className="w-2 bg-current rounded-full animate-sound-wave"
                              style={{
                                height: '24px',
                                animationDelay: `${i * 0.1}s`
                              }}
                            ></div>
                          ))}
                        </div>
                      ) : isRecording ? (
                        <Mic className="w-12 h-12" />
                      ) : (
                        <div className="w-12 h-12 rounded-full border-4 border-current"></div>
                      )}
                    </div>
                  </div>

                  {/* Status Text */}
                  <div className={`text-lg font-medium ${
                    isAISpeaking ? 'text-purple-600' : 
                    isProcessing ? 'text-amber-600' : 
                    isRecording ? 'text-blue-600' : 
                    'text-gray-600'
                  }`}>
                    {isAISpeaking ? 'AI is speaking...' :
                     isProcessing ? 'Processing...' :
                     isRecording ? 'Listening...' :
                     'Ready to listen'}
                  </div>

                  {/* Call Controls */}
                  <div className="mt-8 flex justify-center items-center space-x-6">
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className={`transform hover:scale-110 transition-all duration-200 p-4 rounded-full ${
                        isMuted ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                      }`}
                    >
                      {isMuted ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
                    </button>
                    
                    <button
                      onClick={handleEndCall}
                      className="transform hover:scale-110 transition-all duration-200 bg-red-500 text-white p-4 rounded-full"
                    >
                      <PhoneOff className="w-8 h-8" />
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Right Sidebar: Conversation */}
            <aside className="w-full lg:w-80 xl:w-96 border border-gray-100 rounded-xl p-4 h-[480px] flex flex-col bg-white/60">
              <div className="font-semibold mb-2 text-gray-800">Conversation</div>
              <div ref={messagesContainerRef} className="flex-1 overflow-y-auto space-y-3 pr-1">
                {messages.map((m, idx) => (
                  <div key={idx} className={`text-sm ${m.role === 'user' ? 'text-gray-900' : 'text-purple-800'}`}>
                    <span className="font-medium mr-1">{m.role === 'user' ? 'You:' : 'AI:'}</span>
                    <span>{m.content}</span>
                  </div>
                ))}
                {isProcessing && (
                  <div className="text-sm text-gray-500 animate-pulse">AI is thinking…</div>
                )}
              </div>
              <form
                className="mt-3 flex items-stretch gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  const text = inputMessage.trim();
                  if (!text || isProcessing || isAISpeaking) return;
                  setInputMessage("");
                  handleSendMessage(text);
                }}
              >
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type a message…"
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 placeholder-gray-400"
                  disabled={isProcessing || isAISpeaking}
                />
                <Button type="submit" disabled={isProcessing || !inputMessage.trim() || isAISpeaking}>
                  Send
                </Button>
              </form>
            </aside>
          </div>
        </div>
      </div>

      {/* Bottom input for small screens */}
      <form
        className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 border-t border-gray-200 px-4 py-3 flex items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          const text = inputMessage.trim();
          if (!text || isProcessing || isAISpeaking) return;
          setInputMessage("");
          handleSendMessage(text);
        }}
      >
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type a message…"
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 placeholder-gray-400"
          disabled={isProcessing || isAISpeaking}
        />
        <Button type="submit" disabled={isProcessing || !inputMessage.trim() || isAISpeaking}>
          Send
        </Button>
      </form>
    </div>
  );
}
