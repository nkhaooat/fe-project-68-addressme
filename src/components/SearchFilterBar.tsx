'use client';

interface SearchFilterBarProps {
  children: React.ReactNode;
  resultText?: string;
}

export default function SearchFilterBar({ children, resultText }: SearchFilterBarProps) {
  return (
    <div className="bg-dungeon-surface border border-dungeon-outline rounded-lg p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {children}
      </div>
      {resultText && (
        <div className="mt-4 pt-4 border-t border-dungeon-outline">
          <p className="text-dungeon-secondary text-sm">{resultText}</p>
        </div>
      )}
    </div>
  );
}

interface SearchInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  typing?: boolean;
}

export function SearchInput({ label, placeholder, value, onChange, typing }: SearchInputProps) {
  return (
    <div>
      <label className="block text-dungeon-secondary text-sm mb-2">{label}</label>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-dungeon-canvas border border-dungeon-outline rounded-lg px-4 py-2 text-dungeon-header-text focus:border-dungeon-accent focus:outline-none"
      />
      {typing && <p className="text-dungeon-secondary text-xs mt-1">Typing...</p>}
    </div>
  );
}
