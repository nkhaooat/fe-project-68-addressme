'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-dungeon-bg flex items-center justify-center px-4">
      <div className="bg-dungeon-canvas border border-dungeon-outline rounded-xl p-8 max-w-md text-center">
        <p className="text-4xl mb-4">⚔️</p>
        <h2 className="text-dungeon-header-text text-xl font-bold mb-2">
          Something went wrong
        </h2>
        <p className="text-dungeon-secondary text-sm mb-6">
          {error.message || 'An unexpected error occurred. The dungeon has collapsed...'}
        </p>
        <button
          onClick={reset}
          className="bg-dungeon-accent text-white px-6 py-2 rounded-lg hover:opacity-90 transition-opacity"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
