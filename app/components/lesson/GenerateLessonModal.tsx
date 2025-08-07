"use client";

import { useState } from "react";
import Button from "@/app/components/ui/button";
import { X, Sparkles, Loader2, CheckCircle } from "lucide-react";
import { useLessonGeneration } from "@/lib/hooks/useLessonGeneration";
import { useSettingsStore } from "@/lib/store/settings";

interface GenerateLessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function GenerateLessonModal({
  isOpen,
  onClose,
  onSuccess,
}: GenerateLessonModalProps) {
  const [message, setMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<
    "input" | "generating" | "success"
  >("input");
  const [languageCode, setLanguageCode] = useState<string>(
    useSettingsStore.getState().language || "en"
  );
  const setAppLanguage = useSettingsStore((s) => s.setLanguage);

  const generateLesson = useLessonGeneration();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsGenerating(true);
    setGenerationStep("generating");

    try {
      const result = await generateLesson.mutateAsync({
        message,
        languageCode,
      });

      // Only show success if the backend actually succeeded
      if (result.status) {
        setGenerationStep("success");

        setTimeout(() => {
          onClose();
          onSuccess?.();
          setMessage("");
          setGenerationStep("input");
          setIsGenerating(false);
        }, 2000);
      } else {
        // If backend returned an error, stay in input step
        setIsGenerating(false);
        setGenerationStep("input");
        // Error messages are handled by the hook's toast notifications
      }
    } catch (error) {
      console.error("Failed to generate lesson:", error);
      setIsGenerating(false);
      setGenerationStep("input");
      // Error is handled by the hook's onError callback
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-light-surface dark:bg-dark-surface rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-light-border dark:border-dark-border">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-light-border dark:border-dark-border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 mr-2 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-text dark:text-text-light">
                Create New Lesson
              </h2>
              <p className="text-sm text-text-muted">
                Let AI create a personalized lesson for you
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {generationStep === "input" && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-text dark:text-text-light mb-3">
                  What would you like to learn?
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="e.g., Terrestrial animals, Quantum physics, Ancient civilizations..."
                  className="w-full px-4 py-3 border outline-none border-light-border dark:border-dark-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary bg-light-surface dark:bg-dark-surface text-text dark:text-text-light placeholder-text-muted resize-none transition-all duration-200"
                  rows={3}
                  disabled={isGenerating}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text dark:text-text-light mb-3">
                  Select language
                </label>
                <select
                  value={languageCode}
                  onChange={(e) => {
                    setLanguageCode(e.target.value);
                    setAppLanguage(e.target.value);
                  }}
                  className="w-full px-4 py-3 border outline-none border-light-border dark:border-dark-border rounded-xl bg-light-surface dark:bg-dark-surface text-text dark:text-text-light focus:ring-2 focus:ring-primary"
                  disabled={isGenerating}
                >
                  <option value="en">English (en)</option>
                  <option value="yo">Yorùbá (yo)</option>
                  <option value="ig">Igbo (ig)</option>
                  <option value="ha">Hausa (ha)</option>
                </select>
              </div>

              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onClose}
                  className="flex-1 h-12 border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface text-text dark:text-text-light hover:bg-light-50 dark:hover:bg-dark-50"
                  disabled={isGenerating}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-12 bg-gradient-to-r from-primary to-secondary hover:from-primary-dark hover:to-secondary-dark text-white shadow-lg"
                  disabled={!message.trim() || !languageCode || isGenerating}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Lesson
                </Button>
              </div>
            </form>
          )}

          {generationStep === "generating" && (
            <div className="text-center py-8">
              <div className="relative mb-6">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary/20 to-secondary/20 dark:from-primary-dark/20 dark:to-secondary-dark/20 rounded-2xl flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-primary dark:text-primary-dark animate-spin" />
                </div>
              </div>

              <h3 className="text-xl font-semibold text-text dark:text-text-light mb-2">
                Creating Your Lesson
              </h3>
              <p className="text-text-muted mb-6">
                Our AI is crafting a personalized lesson about "{message}"
              </p>

              <div className="space-y-3">
                {[
                  { text: "Analyzing your topic", delay: 0 },
                  { text: "Generating content", delay: 1000 },
                  { text: "Optimizing for learning", delay: 2000 },
                ].map((step, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-center space-x-3"
                  >
                    <div className="w-2 h-2 bg-primary dark:bg-primary-dark rounded-full animate-pulse" />
                    <span className="text-sm text-text-muted">{step.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {generationStep === "success" && (
            <div className="text-center py-8">
              <div className="relative mb-6">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-accent/20 to-secondary/20 dark:from-accent-dark/20 dark:to-secondary-dark/20 rounded-2xl flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-accent dark:text-accent-dark" />
                </div>
              </div>

              <h3 className="text-xl font-semibold text-text dark:text-text-light mb-2">
                Lesson Ready!
              </h3>
              <p className="text-text-muted">
                Your lesson about "{message}" has been created successfully.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
