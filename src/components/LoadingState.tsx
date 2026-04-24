'use client';

interface LoadingStateProps {
  message?: string;
}

export default function LoadingState({ message = 'Loading...' }: LoadingStateProps) {
  return (
    <main className="min-h-screen bg-dungeon-canvas flex items-center justify-center">
      <div className="text-dungeon-accent text-xl">{message}</div>
    </main>
  );
}
