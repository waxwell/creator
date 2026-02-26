import { GoogleGenAI } from "@google/genai";

// Lazy initialization of the Gemini client
let genAI: GoogleGenAI | null = null;

const getGenAI = (apiKey?: string) => {
  const key = apiKey || process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error("GEMINI_API_KEY is not set. Please configure it in settings.");
  }
  // Always create a new instance if a key is provided to ensure it uses the latest one
  // or if it hasn't been initialized yet.
  if (apiKey || !genAI) {
     genAI = new GoogleGenAI({ apiKey: key });
  }
  return genAI;
};

export interface FileData {
  mimeType: string;
  data: string; // base64
}

export const analyzeInputs = async (
  gameplayFiles: FileData[],
  userFiles: FileData[],
  textContext: string,
  apiKey?: string,
  modelName: string = "gemini-2.0-flash"
) => {
  const ai = getGenAI(apiKey);
  
  const prompt = `
    你是一位专业的游戏设计师和用户研究员。
    
    我将提供两组输入材料：
    1. "互动玩法" 材料 (Interactive Gameplay) - 视频、图片或文本。
    2. "用户特征" 材料 (User Characteristics) - 视频、图片或文本。
    
    你的任务是分析这些输入，并输出两个部分的分析结论。
    
    请以 **JSON 格式** 输出，不要包含 Markdown 代码块标记（如 \`\`\`json），直接输出纯 JSON 字符串。
    JSON 结构如下：
    {
      "gameplayAnalysis": "在此处详细分析互动玩法材料的机制、视觉风格、交互模式和核心循环...",
      "userAnalysis": "在此处详细分析用户特征材料中的目标受众画像、心理特征、偏好内容风格和行为触发点..."
    }
    
    上下文补充信息: ${textContext}
    
    请确保所有分析内容使用 **中文**。
  `;

  const parts: any[] = [{ text: prompt }];

  // Add Gameplay Files
  gameplayFiles.forEach((file, index) => {
    parts.push({ text: `\n[互动玩法输入 ${index + 1}]:` });
    parts.push({
      inlineData: {
        mimeType: file.mimeType,
        data: file.data,
      },
    });
  });

  // Add User Files
  userFiles.forEach((file, index) => {
    parts.push({ text: `\n[用户特征输入 ${index + 1}]:` });
    parts.push({
      inlineData: {
        mimeType: file.mimeType,
        data: file.data,
      },
    });
  });

  const result = await ai.models.generateContent({
    model: modelName,
    contents: { role: "user", parts },
  });

  return result.text;
};

export const generateNewGameplay = async (
  analysisResult: string,
  apiKey?: string,
  modelName: string = "gemini-2.0-flash"
) => {
  const ai = getGenAI(apiKey);
  
  const prompt = `
    基于以下的玩法分析和用户偏好分析：
    
    ${analysisResult}
    
    任务：
    1. 构思一个全新的互动玩法创意，完美结合分析出的玩法机制和用户偏好。
    2. 清晰地描述这个新玩法。
    3. 生成一个单文件的 React 函数式组件 (使用 Tailwind CSS 和 Lucide React 图标) 来实现这个新玩法的原型或模拟。
    
    要求：
    - 代码必须是完整的、可运行的 React 组件。
    - 使用 'lucide-react' 库中的图标。
    - 使用 Tailwind CSS 进行样式设计。
    - **不要** 使用 import 语句导入 React，假设 React 和 hooks (useState, useEffect, etc.) 已经在作用域中。
    - **不要** 使用 import 语句导入 lucide-react，假设图标组件 (如 Camera, Heart 等) 已经在作用域中。
    - **不要** 使用 import 语句导入 motion，假设 motion 已经在作用域中。
    - 组件必须默认导出 (export default function ...)。
    - 交互设计要有趣且符合用户偏好。
    
    输出格式：
    
    ## 创意名称
    [创意名称]
    
    ## 创意描述
    [详细描述]
    
    ## 核心机制
    [机制解释]
    
    ## 代码
    \`\`\`tsx
    // React 代码
    \`\`\`
  `;

  const result = await ai.models.generateContent({
    model: modelName,
    contents: { role: "user", parts: [{ text: prompt }] },
  });

  return result.text;
};
