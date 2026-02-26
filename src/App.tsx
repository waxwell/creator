/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { AnalysisResult } from './components/AnalysisResult';
import { SettingsModal } from './components/SettingsModal';
import { analyzeInputs, generateNewGameplay, FileData } from './services/gemini';
import { motion } from 'motion/react';
import { BrainCircuit, Layers, ArrowRight, Settings } from 'lucide-react';

export default function App() {
  const [gameplayFiles, setGameplayFiles] = useState<File[]>([]);
  const [userFiles, setUserFiles] = useState<File[]>([]);
  const [contextText, setContextText] = useState('');
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedConcept, setGeneratedConcept] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Settings State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [modelName, setModelName] = useState('gemini-2.0-flash');

  const fileToBase64 = (file: File): Promise<FileData> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64Data = result.split(',')[1];
        resolve({
          mimeType: file.type,
          data: base64Data,
        });
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleAnalyze = async () => {
    if (gameplayFiles.length === 0 && userFiles.length === 0 && !contextText) {
      setError("请至少提供一个文件或一些文本上下文。");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setAnalysisResult(null);
    setGeneratedConcept(null);

    try {
      const processedGameplayFiles = await Promise.all(gameplayFiles.map(fileToBase64));
      const processedUserFiles = await Promise.all(userFiles.map(fileToBase64));

      const result = await analyzeInputs(
        processedGameplayFiles, 
        processedUserFiles, 
        contextText,
        apiKey,
        modelName
      );
      setAnalysisResult(result);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "分析过程中发生错误。");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerate = async () => {
    if (!analysisResult) return;

    setIsGenerating(true);
    setError(null);

    try {
      const result = await generateNewGameplay(analysisResult, apiKey, modelName);
      setGeneratedConcept(result);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "生成过程中发生错误。");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-zinc-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <BrainCircuit className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-zinc-900">
              互动创意生成工具
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-zinc-500 font-medium hidden sm:block">
              AI 驱动的玩法设计师
            </div>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
              title="设置"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiKey={apiKey}
        setApiKey={setApiKey}
        modelName={modelName}
        setModelName={setModelName}
      />

      <main className="max-w-5xl mx-auto px-6 py-12 space-y-12">
        {/* Intro Section */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            将输入转化为全新的互动体验
          </h2>
          <p className="text-lg text-zinc-600 leading-relaxed">
            上传互动玩法和用户特征的示例。
            我们将分析它们，为您生成量身定制的创新玩法概念和代码原型。
          </p>
        </div>

        {/* Input Section */}
        <div className="grid md:grid-cols-2 gap-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-zinc-900">互动玩法素材</h3>
                <p className="text-sm text-zinc-500">上传视频、截图或文档</p>
              </div>
            </div>
            <FileUpload
              label="玩法素材"
              description="拖入玩法视频、UI 截图或设计文档。"
              onFilesChange={setGameplayFiles}
              accept="image/*,video/*,text/plain,application/pdf"
            />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-rose-50 rounded-lg text-rose-600">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-zinc-900">用户特征素材</h3>
                <p className="text-sm text-zinc-500">上传画像、反馈或人口统计数据</p>
              </div>
            </div>
            <FileUpload
              label="用户数据"
              description="拖入用户研究、画像卡片或反馈日志。"
              onFilesChange={setUserFiles}
              accept="image/*,video/*,text/plain,application/pdf"
            />
          </motion.div>
        </div>

        {/* Context Input */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.3 }}
           className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm"
        >
           <label className="block text-sm font-medium text-zinc-700 mb-2">
             额外上下文 (可选)
           </label>
           <textarea
             className="w-full h-24 p-4 rounded-xl border border-zinc-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none resize-none transition-all"
             placeholder="在此添加任何特定的限制、目标或备注..."
             value={contextText}
             onChange={(e) => setContextText(e.target.value)}
           />
        </motion.div>

        {/* Action Button */}
        <div className="flex justify-center">
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || (gameplayFiles.length === 0 && userFiles.length === 0 && !contextText)}
            className={`
              group relative flex items-center gap-3 px-8 py-4 rounded-full font-semibold text-lg shadow-lg transition-all
              ${isAnalyzing || (gameplayFiles.length === 0 && userFiles.length === 0 && !contextText)
                ? 'bg-zinc-300 text-zinc-500 cursor-not-allowed'
                : 'bg-zinc-900 text-white hover:bg-zinc-800 hover:scale-105 active:scale-95'
              }
            `}
          >
            {isAnalyzing ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                正在分析输入...
              </>
            ) : (
              <>
                开始分析
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-center"
          >
            {error}
          </motion.div>
        )}

        {/* Results Section */}
        {analysisResult && (
          <AnalysisResult
            analysis={analysisResult}
            generatedConcept={generatedConcept || undefined}
            isGenerating={isGenerating}
            onGenerate={handleGenerate}
          />
        )}
      </main>
    </div>
  );
}

