import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-dungeon-bg flex items-center justify-center px-4">
      <div className="bg-dungeon-canvas border border-dungeon-outline rounded-xl p-8 max-w-md text-center">
        <p className="text-6xl mb-4">🕯️</p>
        <h2 className="text-dungeon-header-text text-2xl font-bold mb-2">
          Room Not Found
        </h2>
        <p className="text-dungeon-secondary text-sm mb-6">
          You have wandered into an unexplored corridor. This page does not exist.
        </p>
        <Link
          href="/"
          className="inline-block bg-dungeon-accent text-white px-6 py-2 rounded-lg hover:opacity-90 transition-opacity"
        >
          Return to the Inn
        </Link>
      </div>
    </div>
  );
}
