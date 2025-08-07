import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Modal({
  isOpen,
  onClose,
  title,
  close,
  children,
  className,
}: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-40"
            onClick={onClose}
          />

          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`bg-white rounded-[32px] border border-gray-200 p-6 
                w-full max-w-[500px] max-h-[90vh] flex flex-col shadow-lg ${className}`}
            >
              {title && (
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-[18px] font-semibold font-aloeSemBold text-gray-900">
                    {title}
                  </h3>
                  <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={24} />
                  </button>
                </div>
              )}
              {close && (
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              )}
              <div className="overflow-y-auto custom-scrollbar flex-1">
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
