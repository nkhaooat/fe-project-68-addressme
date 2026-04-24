'use client';

interface AccessDeniedProps {
  message?: string;
}

export default function AccessDenied({ message = 'Access Denied' }: AccessDeniedProps) {
  return (
    <main className="min-h-screen bg-dungeon-canvas flex items-center justify-center">
      <div className="text-red-400 text-xl">{message}</div>
    </main>
  );
}
