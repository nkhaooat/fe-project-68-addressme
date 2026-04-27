import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-dungeon-surface border-t border-dungeon-outline mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-dungeon-header-text font-bold text-lg mb-2">Dungeon Inn</h3>
            <p className="text-dungeon-secondary text-sm">
              Discover and book the best massage shops in Bangkok. Your relaxation starts here.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-dungeon-header-text font-semibold mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/shops" className="text-dungeon-secondary hover:text-dungeon-accent transition-colors">
                  Browse Shops
                </Link>
              </li>
              <li>
                <Link href="/mybookings" className="text-dungeon-secondary hover:text-dungeon-accent transition-colors">
                  My Bookings
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-dungeon-secondary hover:text-dungeon-accent transition-colors">
                  Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-dungeon-header-text font-semibold mb-3">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="text-dungeon-secondary hover:text-dungeon-accent transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* For Merchants */}
          <div>
            <h4 className="text-dungeon-header-text font-semibold mb-3">For Merchants</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/register/merchant" className="text-dungeon-secondary hover:text-dungeon-accent transition-colors">
                  Register Your Shop
                </Link>
              </li>
              <li>
                <Link href="/merchant" className="text-dungeon-secondary hover:text-dungeon-accent transition-colors">
                  Merchant Dashboard
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-dungeon-outline mt-8 pt-6 text-center">
          <p className="text-dungeon-muted text-sm">
            Dungeon Inn &copy; {new Date().getFullYear()} · All rights reserved
          </p>
        </div>
      </div>
    </footer>
  );
}
