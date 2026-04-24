import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-dungeon-primary-header border-t border-dungeon-outline mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-bold text-dungeon-header-text mb-2">Dungeon Inn</h3>
            <p className="text-dungeon-secondary text-sm">
              Find your sanctuary in the dark. Premium massage services curated for you.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-dungeon-sub-header font-bold mb-3">Quick Links</h4>
            <div className="flex flex-col gap-2">
              <Link href="/shops" className="text-dungeon-secondary hover:text-dungeon-accent text-sm transition-colors">
                Browse Shops
              </Link>
              <Link href="/mybookings" className="text-dungeon-secondary hover:text-dungeon-accent text-sm transition-colors">
                My Bookings
              </Link>
              <Link href="/register/merchant" className="text-dungeon-secondary hover:text-dungeon-accent text-sm transition-colors">
                Become a Merchant
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-dungeon-sub-header font-bold mb-3">Support</h4>
            <p className="text-dungeon-secondary text-sm">
              Need help? Chat with our assistant — it&apos;s available 24/7 on any page.
            </p>
          </div>
        </div>

        <div className="border-t border-dungeon-outline mt-8 pt-6 text-center">
          <p className="text-dungeon-muted text-sm">
            &copy; {new Date().getFullYear()} Dungeon Inn. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
