import React from 'react';

interface DialogProps {
  message: string;
  onClose: () => void;
}

export const Dialog: React.FC<DialogProps> = ({ message, onClose }) => {
  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-slate-800 p-8 rounded-lg shadow-2xl text-center max-w-sm w-full mx-4">
        <p className="text-gray-200 mb-6">{message}</p>
        <button
          className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600 transition-colors"
          onClick={onClose}
        >
          Aceptar
        </button>
      </div>
    </div>
  );
};
