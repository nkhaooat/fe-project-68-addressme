'use client';

/**
 * Lightweight loading indicator — spinner + text.
 * Replaces broken skeleton loading across all pages.
 */

interface LoadingProps {
  text?: string;
}

export default function Loading({ text = 'Loading...' }: LoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div className="w-8 h-8 border-3 border-dungeon-outline border-t-dungeon-accent rounded-full animate-spin" />
      <p className="text-dungeon-secondary text-sm">{text}</p>
    </div>
  );
}
