import React from 'react';

interface TextInputProps {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: 'text' | 'number';
}

export const TextInput: React.FC<TextInputProps> = ({ id, label, placeholder, value, onChange, type = 'text' }) => {
  return (
    <div className="bg-slate-700 p-4 rounded-xl">
      <label htmlFor={id} className="block text-sm font-medium text-slate-400 mb-2">
        {label}
      </label>
      <input
        type={type}
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full p-3 rounded-lg bg-slate-900 text-gray-200 border border-slate-600 focus:outline-none focus:border-pink-500 transition-colors"
      />
    </div>
  );
};
