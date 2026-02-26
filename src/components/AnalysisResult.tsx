import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { motion } from 'motion/react';
import { Sparkles, Code, Play, User, Gamepad2, Eye } from 'lucide-react';
import { LivePreview } from './LivePreview';

interface AnalysisResultProps {
  analysis: string; // JSON string
  generatedConcept?: string;
  isGenerating: boolean;
  onGenerate: () => void;
}

export const AnalysisResult: React.FC<AnalysisResultProps> = ({
  analysis,
  generatedConcept,
  isGenerating,
  onGenerate,
}) => {
  // Parse analysis JSON
  let gameplayAnalysis = "";
  let userAnalysis = "";
  
  try {
    // Clean up markdown code blocks if present in the raw string before parsing
    const cleanJson = analysis.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleanJson);
    gameplayAnalysis = parsed.gameplayAnalysis || "无法解析玩法分析";
    userAnalysis = parsed.userAnalysis || "无法解析用户分析";
  } catch (e) {
    console.error("JSON Parse Error", e);
    gameplayAnalysis = "解析分析结果失败，请重试。";
    userAnalysis = analysis; // Fallback to raw text
  }

  // Extract code block if present
  const codeBlockRegex = /```(?:tsx|jsx|javascript|js|typescript)([\s\S]*?)```/;
  const codeMatch = generatedConcept?.match(codeBlockRegex);
  const code = codeMatch ? codeMatch[1].trim() : null;
  
  // Remove code from display text to avoid duplication
  const conceptDisplay = generatedConcept?.replace(codeBlockRegex, '') || '';

  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');

  return (
    <div className="space-y-8">
      {/* Analysis Section - Split View */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Gameplay Analysis */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col h-full"
        >
          <div className="bg-blue-50 border-b border-blue-100 px-6 py-4 flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-blue-900">
              互动玩法分析
            </h2>
          </div>
          <div className="p-6 prose prose-zinc max-w-none prose-p:text-zinc-600 flex-grow">
            <ReactMarkdown>{gameplayAnalysis}</ReactMarkdown>
          </div>
        </motion.div>

        {/* User Analysis */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col h-full"
        >
          <div className="bg-rose-50 border-b border-rose-100 px-6 py-4 flex items-center gap-2">
            <User className="w-5 h-5 text-rose-600" />
            <h2 className="text-lg font-semibold text-rose-900">
              用户特征分析
            </h2>
          </div>
          <div className="p-6 prose prose-zinc max-w-none prose-p:text-zinc-600 flex-grow">
            <ReactMarkdown>{userAnalysis}</ReactMarkdown>
          </div>
        </motion.div>
      </div>
        
      {!generatedConcept && (
        <div className="flex justify-center pt-4">
          <button
            onClick={onGenerate}
            disabled={isGenerating}
            className={`
              flex items-center gap-2 px-8 py-4 rounded-full font-bold text-lg text-white shadow-lg transition-all
              ${isGenerating 
                ? 'bg-zinc-400 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-xl hover:-translate-y-1 active:scale-95'
              }
            `}
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                正在生成创意...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                生成新玩法创意
              </>
            )}
          </button>
        </div>
      )}

      {/* Generation Section */}
      {generatedConcept && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden"
        >
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-zinc-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-indigo-900 flex items-center gap-2">
              <Play className="w-5 h-5 text-indigo-600" />
              生成的创意方案
            </h2>
            
            {/* Toggle Preview/Code */}
            {code && (
              <div className="flex bg-white/50 p-1 rounded-lg border border-zinc-200/50">
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 ${
                    activeTab === 'preview' 
                      ? 'bg-white text-indigo-600 shadow-sm' 
                      : 'text-zinc-500 hover:text-zinc-700'
                  }`}
                >
                  <Eye className="w-4 h-4" />
                  预览
                </button>
                <button
                  onClick={() => setActiveTab('code')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 ${
                    activeTab === 'code' 
                      ? 'bg-white text-indigo-600 shadow-sm' 
                      : 'text-zinc-500 hover:text-zinc-700'
                  }`}
                >
                  <Code className="w-4 h-4" />
                  代码
                </button>
              </div>
            )}
          </div>
          
          <div className="p-6">
            {/* Concept Description */}
            <div className="prose prose-zinc max-w-none mb-8">
              <ReactMarkdown>{conceptDisplay}</ReactMarkdown>
            </div>

            {/* Live Preview or Code View */}
            {code && (
              <div className="mt-6">
                {activeTab === 'preview' ? (
                  <LivePreview code={code} />
                ) : (
                  <div className="rounded-xl overflow-hidden border border-zinc-200">
                    <div className="bg-zinc-900 px-4 py-2 flex items-center justify-between">
                      <span className="text-zinc-400 text-xs font-mono">GeneratedComponent.tsx</span>
                      <button 
                        onClick={() => navigator.clipboard.writeText(code)}
                        className="text-xs text-zinc-400 hover:text-white transition-colors"
                      >
                        复制代码
                      </button>
                    </div>
                    <pre className="bg-zinc-950 p-4 overflow-x-auto text-sm text-zinc-300 font-mono leading-relaxed max-h-[500px]">
                      <code>{code}</code>
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};
