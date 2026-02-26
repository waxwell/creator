import React, { useState, useEffect } from 'react';
import { Upload, X, FileType, Film, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FileUploadProps {
  label: string;
  description: string;
  onFilesChange: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
}

const FilePreviewItem = ({ file, onRemove }: { file: File; onRemove: () => void }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  const getIcon = (type: string) => {
    if (type.startsWith('video/')) return <Film className="w-5 h-5" />;
    if (type.startsWith('image/')) return <ImageIcon className="w-5 h-5" />;
    return <FileType className="w-5 h-5" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      className="flex items-center justify-between p-3 bg-white border border-zinc-200 rounded-lg shadow-sm"
    >
      <div className="flex items-center space-x-3 overflow-hidden">
        <div className="flex-shrink-0 text-zinc-500">
            {previewUrl ? (
                <img src={previewUrl} alt={file.name} className="w-10 h-10 object-cover rounded-md" />
            ) : (
                <div className="w-10 h-10 bg-zinc-100 rounded-md flex items-center justify-center">
                    {getIcon(file.type)}
                </div>
            )}
        </div>
        <div className="flex flex-col min-w-0">
            <span className="text-sm text-zinc-700 truncate font-medium">{file.name}</span>
            <span className="text-xs text-zinc-400">({(file.size / 1024).toFixed(1)} KB)</span>
        </div>
      </div>
      <button
        onClick={onRemove}
        className="p-1 hover:bg-zinc-100 rounded-full text-zinc-400 hover:text-red-500 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

export const FileUpload: React.FC<FileUploadProps> = ({
  label,
  description,
  onFilesChange,
  accept = "image/*,video/*,text/plain",
  multiple = true,
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files) as File[];
    addFiles(droppedFiles);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files) as File[];
      addFiles(selectedFiles);
    }
  };

  const addFiles = (newFiles: File[]) => {
    const updatedFiles = multiple ? [...files, ...newFiles] : newFiles;
    setFiles(updatedFiles);
    onFilesChange(updatedFiles);
  };

  const removeFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    onFilesChange(updatedFiles);
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-zinc-700 mb-2">{label}</label>
      <div
        className={`relative border-2 border-dashed rounded-xl p-6 transition-colors ${
          isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-zinc-300 hover:border-zinc-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleFileInput}
          accept={accept}
          multiple={multiple}
        />
        <div className="flex flex-col items-center justify-center text-center pointer-events-none">
          <div className="bg-zinc-100 p-3 rounded-full mb-3">
            <Upload className="w-6 h-6 text-zinc-500" />
          </div>
          <p className="text-sm font-medium text-zinc-900">点击或拖拽上传文件</p>
          <p className="text-xs text-zinc-500 mt-1">{description}</p>
        </div>
      </div>

      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 space-y-2"
          >
            {files.map((file, index) => (
              <FilePreviewItem 
                key={`${file.name}-${index}`} 
                file={file} 
                onRemove={() => removeFile(index)} 
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
