'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, ShieldAlert } from 'lucide-react';
import { Button } from '@/app/components/ui';
import { useState } from 'react';

interface WalletConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function WalletConfirmationModal({ isOpen, onClose, onConfirm }: WalletConfirmationModalProps) {
  const [isConfirmed, setIsConfirmed] = useState(false);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-[100]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative bg-white rounded-2xl border border-gray-200 shadow-xl p-8 w-full max-w-[500px] mx-4"
          >
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="text-center space-y-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center justify-center animate-pulse">
                  <div className="w-16 h-16 rounded-full bg-red-100" />
                </div>
                <div className="relative flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                    <ShieldAlert className="w-8 h-8 text-red-500" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-900">Important Notice</h2>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-start gap-3">
                      <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                      <p className="text-sm text-left text-gray-700">
                        You can only connect <span className="font-semibold text-gray-900">one wallet</span> to your account. 
                        This process is <span className="font-semibold text-gray-900">irreversible</span> once the wallet 
                        has been linked.
                      </p>
                    </div>
                  </div>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isConfirmed}
                      onChange={(e) => setIsConfirmed(e.target.checked)}
                      className="rounded border-gray-300 bg-white text-green-600 focus:ring-green-500/20 focus:ring-2"
                    />
                    <span className="text-sm text-gray-700">I understand and confirm this action</span>
                  </label>
                </div>

                <div className="pt-4 flex flex-col gap-3">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      onConfirm();
                    }}
                    disabled={!isConfirmed}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Connect Wallet
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      onClose();
                    }}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-medium transition-colors"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}