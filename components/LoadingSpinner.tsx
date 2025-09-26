import React from 'react';

export const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center space-x-2 py-4">
    <div className="w-4 h-4 bg-pink-500 rounded-full animate-pulse"></div>
    <div style={{ animationDelay: '150ms' }} className="w-4 h-4 bg-pink-500 rounded-full animate-pulse"></div>
    <div style={{ animationDelay: '300ms' }} className="w-4 h-4 bg-pink-500 rounded-full animate-pulse"></div>
    <span className="text-slate-400">Procesando imagen...</span>
  </div>
);
