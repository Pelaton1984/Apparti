import React from 'react';

interface ActionButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
}

export const ActionButton: React.FC<ActionButtonProps> = ({ onClick, children, disabled = false, variant = 'primary' }) => {
  const baseClasses = "w-full font-bold py-3 px-6 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900";
  
  const primaryClasses = "bg-pink-500 text-white hover:bg-pink-600 focus:ring-pink-400 disabled:bg-pink-800 disabled:cursor-not-allowed";
  const secondaryClasses = "bg-slate-600 text-gray-200 hover:bg-slate-500 focus:ring-slate-400";
  
  const variantClasses = variant === 'primary' ? primaryClasses : secondaryClasses;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses}`}
    >
      {children}
    </button>
  );
};
