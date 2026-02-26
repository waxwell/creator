import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Settings, Key, Cpu } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  setApiKey: (key: string) => void;
  modelName: string;
  setModelName: (name: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  apiKey,
  setApiKey,
  modelName,
  setModelName,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md pointer-events-auto overflow-hidden">
              {/* Header */}
              <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
                <h2 className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-zinc-500" />
                  API 配置
                </h2>
                <button
                  onClick={onClose}
                  className="p-1 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-200 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6">
                {/* API Key Input */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-zinc-700 flex items-center gap-2">
                    <Key className="w-4 h-4 text-zinc-400" />
                    Gemini API Key
                  </label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="输入您的 Gemini API Key"
                    className="w-full px-4 py-2 rounded-xl border border-zinc-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-sm"
                  />
                  <p className="text-xs text-zinc-500">
                    留空则使用默认的环境变量 Key。
                  </p>
                </div>

                {/* Model Name Input */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-zinc-700 flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-zinc-400" />
                    模型名称 (Model Name)
                  </label>
                  <input
                    type="text"
                    value={modelName}
                    onChange={(e) => setModelName(e.target.value)}
                    placeholder="例如: gemini-2.0-flash"
                    className="w-full px-4 py-2 rounded-xl border border-zinc-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-sm font-mono"
                  />
                  <p className="text-xs text-zinc-500">
                    默认: gemini-2.0-flash
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-200 flex justify-end">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors"
                >
                  完成
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
