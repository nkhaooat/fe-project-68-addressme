import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-dungeon-canvas">
      {/* Hero Banner */}
      <div className="relative h-[70vh] w-full overflow-hidden">
        {/* Video Background */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/banner-video.mp4" type="video/mp4" />
        </video>
        
        {/* Overlay Content */}
        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-5xl md:text-7xl font-bold text-dungeon-header-text mb-4 tracking-wider">
            Dungeon Inn
          </h1>
          <p className="text-xl md:text-2xl text-dungeon-sub-header mb-8 max-w-2xl">
            Find your sanctuary in the dark. Premium massage services await.
          </p>
          <Link
            href="/shops"
            className="px-8 py-4 bg-dungeon-accent text-dungeon-dark-text font-bold rounded-lg hover:bg-dungeon-accent-dark transition-colors text-lg"
          >
            Explore Shops
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-dungeon-header-text text-center mb-12">
          Our Services
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-dungeon-surface border border-dungeon-outline rounded-lg p-6 text-center">
            <div className="w-16 h-16 bg-dungeon-accent rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🕯️</span>
            </div>
            <h3 className="text-xl font-bold text-dungeon-header-text mb-2">Premium Shops</h3>
            <p className="text-dungeon-secondary">
              Discover carefully curated massage shops with expert therapists.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-dungeon-surface border border-dungeon-outline rounded-lg p-6 text-center">
            <div className="w-16 h-16 bg-dungeon-accent rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📅</span>
            </div>
            <h3 className="text-xl font-bold text-dungeon-header-text mb-2">Easy Booking</h3>
            <p className="text-dungeon-secondary">
              Reserve your session in seconds. Up to 3 active bookings at a time.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-dungeon-surface border border-dungeon-outline rounded-lg p-6 text-center">
            <div className="w-16 h-16 bg-dungeon-accent rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">✨</span>
            </div>
            <h3 className="text-xl font-bold text-dungeon-header-text mb-2">Luxury Experience</h3>
            <p className="text-dungeon-secondary">
              From Thai massage to aromatherapy, find your perfect treatment.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-dungeon-primary-header py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-dungeon-header-text mb-4">
            Ready to Begin Your Journey?
          </h2>
          <p className="text-dungeon-sub-header mb-8 text-lg">
            Join Dungeon Inn and experience relaxation like never before.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="px-8 py-3 bg-dungeon-accent text-dungeon-dark-text font-bold rounded-lg hover:bg-dungeon-accent-dark transition-colors"
            >
              Create Account
            </Link>
            <Link
              href="/shops"
              className="px-8 py-3 bg-dungeon-star-empty text-dungeon-primary font-bold rounded-lg hover:bg-dungeon-star-half transition-colors"
            >
              Browse Shops
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}