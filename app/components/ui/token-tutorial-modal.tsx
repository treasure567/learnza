'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Copy, X, Plus, ChevronRight, ExternalLink } from 'lucide-react';
import { Button } from '@/app/components/ui';
import { useState } from 'react';
import { toast } from 'sonner';

interface TokenTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TokenTutorialModal({ isOpen, onClose }: TokenTutorialModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const contractAddress = '0xe27399eEc73266341cebd61dEAE432c41a031ae3';

  const copyAddress = () => {
    navigator.clipboard.writeText(contractAddress);
    toast.success('Contract address copied to clipboard');
  };

  const steps = [
    {
      title: "Open MetaMask",
      description: "Open your MetaMask wallet and make sure you're connected to EDUChain Network",
    },
    {
      title: "Import Token",
      description: "Click on 'Import tokens' at the bottom of your assets list",
    },
    {
      title: "Add Token Details",
      description: "Paste the contract address below and MetaMask will auto-fill the token details",
    },
    {
      title: "Confirm Import",
      description: "Click 'Import' to add LZA token to your wallet",
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-[100]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20"
            onClick={onClose}
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative bg-white rounded-[32px] p-8 border border-gray-200 shadow-xl max-w-2xl mx-4 w-full"
          >
            <button
              onClick={onClose}
              className="absolute right-6 top-6 text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Import LZA Token</h2>
                <p className="text-gray-600 mt-2">Follow these steps to see your LZA tokens in your wallet</p>
              </div>

              <div className="space-y-6">
                {/* Contract Address */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <label className="block text-sm font-medium text-gray-600 mb-2">Contract Address</label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-white px-4 py-2 rounded-lg border border-gray-200 text-sm font-mono text-gray-800">
                      {contractAddress}
                    </code>
                    <button
                      onClick={copyAddress}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Copy address"
                    >
                      <Copy className="w-5 h-5 mr-2 text-gray-600" />
                    </button>
                  </div>
                </div>

                {/* Steps */}
                <div className="space-y-4">
                  {steps.map((step, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-xl border ${
                        currentStep === index + 1
                          ? 'bg-purple-50 border-purple-200'
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          currentStep === index + 1
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{step.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Navigation */}
                <div className="flex justify-between pt-4">
                  <Button
                    onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                    variant="secondary"
                    className={`${currentStep === 1 ? 'invisible' : ''}`}
                  >
                    Previous
                  </Button>
                  <Button
                    onClick={() => {
                      if (currentStep < steps.length) {
                        setCurrentStep(currentStep + 1);
                      } else {
                        onClose();
                        setCurrentStep(1);
                      }
                    }}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    {currentStep === steps.length ? 'Done' : 'Next'}
                  </Button>
                </div>
              </div>

              {/* Faucet Link */}
              <div className="pt-4 border-t border-gray-200">
                <a
                  href="https://faucet.educhain.network"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium"
                >
                  <span>Get EDU tokens from faucet</span>
                  <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
