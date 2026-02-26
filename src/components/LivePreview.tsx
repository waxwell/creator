import React, { useEffect, useState } from 'react';
import { transform } from '@babel/standalone';
import * as LucideIcons from 'lucide-react';
import * as Motion from 'motion/react';

interface LivePreviewProps {
  code: string;
}

export const LivePreview: React.FC<LivePreviewProps> = ({ code }) => {
  const [Component, setComponent] = useState<React.ComponentType | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!code) return;

    try {
      // 1. Clean up the code
      // Only remove markdown code blocks. Do NOT remove imports manually.
      const cleanCode = code.replace(/```tsx|```jsx|```/g, '').trim();
      
      // 2. Transpile to CommonJS
      // We use 'transform-modules-commonjs' to convert ES imports/exports to require/module.exports
      const transformed = transform(cleanCode, {
        presets: ['react', 'typescript'],
        plugins: ['transform-modules-commonjs'],
        filename: 'preview.tsx',
      }).code;

      if (!transformed) {
        throw new Error('Transformation failed: No code generated.');
      }

      // 3. Create a shim for 'require'
      const require = (moduleName: string) => {
        if (moduleName === 'react') return React;
        if (moduleName === 'lucide-react') return LucideIcons;
        if (moduleName === 'motion/react') return Motion;
        // Fallback for 'framer-motion' if the AI generates it by mistake
        if (moduleName === 'framer-motion') return Motion;
        throw new Error(`Cannot find module '${moduleName}'`);
      };

      // 4. Create module and exports objects
      const module = { exports: {} as any };
      const exports = module.exports;

      // 5. Execute the code
      // The transformed code will look like:
      // "use strict";
      // Object.defineProperty(exports, "__esModule", { value: true });
      // var react_1 = require("react");
      // ...
      const func = new Function('module', 'exports', 'require', transformed);
      func(module, exports, require);

      // 6. Extract the component
      // It should be on module.exports.default (ES export default) or module.exports (CommonJS export)
      const ResultComponent = module.exports.default || module.exports;

      if (!ResultComponent || (typeof ResultComponent !== 'function' && typeof ResultComponent !== 'object')) {
         throw new Error('The code did not export a valid React component. Ensure you are using "export default function...".');
      }

      setComponent(() => ResultComponent);
      setError(null);
    } catch (err: any) {
      console.error("Preview Error:", err);
      // Show a more helpful error message if possible
      let msg = err.message || "Failed to render preview";
      if (msg.includes("transform-modules-commonjs")) {
        msg = "Babel plugin error: transform-modules-commonjs not found.";
      }
      setError(msg);
    }
  }, [code]);

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 font-mono text-sm overflow-auto max-h-40">
        <p className="font-bold mb-2">预览渲染错误:</p>
        {error}
      </div>
    );
  }

  if (!Component) {
    return (
      <div className="h-64 flex items-center justify-center bg-zinc-50 rounded-xl border border-zinc-200 text-zinc-400">
        加载预览中...
      </div>
    );
  }

  return (
    <div className="relative w-full bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
      <div className="bg-zinc-100 px-4 py-2 border-b border-zinc-200 flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-amber-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
        </div>
        <span className="text-xs text-zinc-500 font-medium ml-2">Live Preview</span>
      </div>
      <div className="p-6 min-h-[400px] flex flex-col items-center justify-center bg-zinc-50/50">
        <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden border border-zinc-100">
           <Component />
        </div>
      </div>
    </div>
  );
};
