import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-dungeon-canvas flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-8xl mb-6">🏚️</div>
        <h1 className="text-6xl font-bold text-dungeon-header-text mb-4">404</h1>
        <h2 className="text-2xl text-dungeon-sub-header mb-2">Room Not Found</h2>
        <p className="text-dungeon-secondary mb-8 max-w-md mx-auto">
          The path you seek has vanished into the darkness. Perhaps it never existed in this dungeon.
        </p>
        <Link
          href="/"
          className="px-6 py-3 bg-dungeon-accent text-dungeon-dark-text font-bold rounded-lg hover:bg-dungeon-accent-dark transition-colors"
        >
          Return to the Entrance
        </Link>
      </div>
    </main>
  );
}
