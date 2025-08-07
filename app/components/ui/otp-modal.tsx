"use client";

import React, { useState, useEffect } from "react";
import { X, Key, Phone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "./button";

interface OtpModalProps {
  isOpen: boolean;
  onClose: () => void;
  phoneNumber: string;
  countryCode: string;
  onVerify: (otp: string) => void;
}

export default function OtpModal({
  isOpen,
  onClose,
  phoneNumber,
  countryCode,
  onVerify,
}: OtpModalProps) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setOtp(["", "", "", "", "", ""]);
      setIsVerifying(false);
    }
  }, [isOpen]);

  const handleOtpChange = (index: number, value: string) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.querySelector(`input[data-index="${index + 1}"]`) as HTMLInputElement;
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.querySelector(`input[data-index="${index - 1}"]`) as HTMLInputElement;
      prevInput?.focus();
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join("");
    if (otpString.length === 6) {
      setIsVerifying(true);
      try {
        await onVerify(otpString);
        onClose();
      } catch (error) {
        console.error("Verification failed:", error);
      } finally {
        setIsVerifying(false);
      }
    }
  };

  const isOtpComplete = otp.every(digit => digit !== "");

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            onClick={onClose}
          />

          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-md overflow-hidden border border-gray-100"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
                    <Phone className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Verify Phone Number
                    </h2>
                    <p className="text-sm text-gray-500">
                      Enter the 6-digit code sent to your phone
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="text-center space-y-6">
                  <div className="bg-green-50 rounded-xl p-4">
                    <p className="text-gray-700 font-medium">
                      We've sent a 6-digit code to
                    </p>
                    <p className="text-gray-900 font-semibold text-lg">
                      {countryCode} {phoneNumber}
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-center gap-3">
                      {otp.map((digit, index) => (
                        <input
                          key={index}
                          data-index={index}
                          type="text"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(index, e)}
                          className="w-12 h-12 text-center text-lg font-semibold border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                          placeholder=""
                        />
                      ))}
                    </div>

                    <div className="flex justify-center gap-3 pt-4">
                      <Button
                        onClick={handleVerify}
                        disabled={!isOtpComplete || isVerifying}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Key className="w-4 h-4 mr-2" />
                        {isVerifying ? "Verifying..." : "Verify"}
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={onClose}
                        disabled={isVerifying}
                        className="border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}