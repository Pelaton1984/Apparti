import React, { useState, useCallback } from 'react';

interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
  imagePreviewUrl: string | null;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelect, imagePreviewUrl }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageSelect(e.target.files[0]);
    }
  };

  const handleDragEvents = (e: React.DragEvent<HTMLLabelElement>, isEntering: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(isEntering);
  };
  
  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    handleDragEvents(e, false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      if (e.dataTransfer.files[0].type.startsWith('image/')) {
        onImageSelect(e.dataTransfer.files[0]);
      }
    }
  }, [onImageSelect]);

  if (imagePreviewUrl) {
    return <img src={imagePreviewUrl} alt="Previsualización de imagen" className="rounded-lg max-h-48 object-contain" />;
  }

  return (
    <label
      htmlFor="image-upload"
      className={`cursor-pointer w-full h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center transition-colors p-4 text-center
        ${isDragging ? 'border-pink-500' : 'border-slate-500 hover:border-pink-500'}`}
      onDragEnter={(e) => handleDragEvents(e, true)}
      onDragOver={(e) => handleDragEvents(e, true)}
      onDragLeave={(e) => handleDragEvents(e, false)}
      onDrop={handleDrop}
    >
      <input type="file" id="image-upload" accept="image/*" className="hidden" onChange={handleFileChange} />
      <span className="text-5xl text-slate-500 mb-2">+</span>
      <span className="text-slate-400">Subir una Imagen</span>
      <span className="text-sm text-slate-500 mt-1">(hacé clic o arrastrá acá)</span>
    </label>
  );
};
