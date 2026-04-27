import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy — Dungeon Inn',
  description: 'Dungeon Inn privacy policy and data handling practices',
};

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0d0d0d] via-[#1a1a2e] to-[#0d0d0d] text-gray-200">
      <div className="max-w-3xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-12">
          <Link
            href="/"
            className="text-amber-400 hover:text-amber-300 text-sm mb-4 inline-block"
          >
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-amber-400 mt-2">
            Privacy Policy
          </h1>
          <p className="text-gray-400 mt-2">
            Dungeon Inn — Massage Reservation System
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Last updated: April 2026
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-10 text-sm leading-relaxed">
          {/* 1. Introduction */}
          <section>
            <h2 className="text-xl font-semibold text-amber-300 mb-3">
              1. Introduction
            </h2>
            <p>
              Dungeon Inn (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) operates a massage reservation
              platform that connects customers with massage shops. This Privacy
              Policy explains how we collect, use, store, and protect your
              personal information when you use our service.
            </p>
            <p className="mt-2">
              By creating an account or using our platform, you consent to the
              data practices described in this policy. If you do not agree,
              please discontinue use of the service.
            </p>
          </section>

          {/* 2. Information We Collect */}
          <section>
            <h2 className="text-xl font-semibold text-amber-300 mb-3">
              2. Information We Collect
            </h2>
            <div className="space-y-3">
              <div>
                <h3 className="font-medium text-gray-100">
                  2.1 Personal Information
                </h3>
                <p className="text-gray-400">
                  Name, email address, and encrypted password when you register
                  an account.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-gray-100">
                  2.2 Booking Data
                </h3>
                <p className="text-gray-400">
                  Reservation details including selected shop, service, date,
                  time, and promotion codes applied. This data is linked to
                  your account.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-gray-100">
                  2.3 Payment Slip Images
                </h3>
                <p className="text-gray-400">
                  When you upload a payment slip for booking verification, the
                  image file is stored on our server. Access is restricted to
                  the booking owner and administrators only.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-gray-100">2.4 Reviews</h3>
                <p className="text-gray-400">
                  Ratings (1–5 stars) and comments you submit for completed
                  bookings. Reviews are publicly visible on shop pages.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-gray-100">
                  2.5 Chat Messages
                </h3>
                <p className="text-gray-400">
                  Messages you send to our AI chatbot are processed by OpenAI
                  to generate responses. Conversations are not permanently
                  stored beyond the current session.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-gray-100">2.6 QR Tokens</h3>
                <p className="text-gray-400">
                  Unique QR tokens are generated for confirmed reservations to
                  enable check-in. Tokens are stored in the reservation record
                  and expire after the reservation date.
                </p>
              </div>
            </div>
          </section>

          {/* 3. How We Use Information */}
          <section>
            <h2 className="text-xl font-semibold text-amber-300 mb-3">
              3. How We Use Your Information
            </h2>
            <ul className="list-disc list-inside text-gray-400 space-y-1">
              <li>Process and manage your reservations</li>
              <li>Send booking confirmation emails with QR codes</li>
              <li>Verify payment slips and confirm bookings</li>
              <li>Display your reviews on shop pages</li>
              <li>Provide AI-powered recommendations via chatbot</li>
              <li>Enable QR code check-in at massage shops</li>
              <li>Manage merchant accounts and shop administration</li>
              <li>Improve our service and user experience</li>
            </ul>
          </section>

          {/* 4. Cookies & Authentication */}
          <section>
            <h2 className="text-xl font-semibold text-amber-300 mb-3">
              4. Cookies & Authentication
            </h2>
            <p>
              We use an <strong>httpOnly JWT cookie</strong> for
              authentication. This cookie:
            </p>
            <ul className="list-disc list-inside text-gray-400 space-y-1 mt-2">
              <li>
                Is set only when you log in or register
              </li>
              <li>
                Cannot be accessed by JavaScript (httpOnly flag)
              </li>
              <li>
                Expires after a configured period, requiring re-authentication
              </li>
              <li>
                Contains your user ID, role, and expiration — no sensitive
                personal data
              </li>
            </ul>
            <p className="mt-2">
              We do <strong>not</strong> use third-party tracking cookies,
              advertising cookies, or analytics cookies. No cookie consent
              banner is required as we do not fall under cookie regulation
              thresholds.
            </p>
          </section>

          {/* 5. Third-Party Services */}
          <section>
            <h2 className="text-xl font-semibold text-amber-300 mb-3">
              5. Third-Party Services
            </h2>
            <div className="space-y-3">
              <div>
                <h3 className="font-medium text-gray-100">
                  Google Places API
                </h3>
                <p className="text-gray-400">
                  Used to fetch shop photos and place details. Google receives
                  your IP address when photo requests are proxied. See{' '}
                  <a
                    href="https://policies.google.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-400 hover:underline"
                  >
                    Google&apos;s Privacy Policy
                  </a>
                  .
                </p>
              </div>
              <div>
                <h3 className="font-medium text-gray-100">OpenAI API</h3>
                <p className="text-gray-400">
                  Your chat messages are sent to OpenAI for generating
                  AI responses. OpenAI processes this data under their{' '}
                  <a
                    href="https://openai.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-400 hover:underline"
                  >
                    privacy policy
                  </a>
                  . We do not store chat history beyond the session.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-gray-100">
                  Brevo (Email Service)
                </h3>
                <p className="text-gray-400">
                  Booking confirmation emails (including QR codes) are sent via
                  Brevo. Your email address is shared with Brevo solely for
                  delivery of booking-related emails. See{' '}
                  <a
                    href="https://www.brevo.com/legal/privacypolicy/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-400 hover:underline"
                  >
                    Brevo&apos;s Privacy Policy
                  </a>
                  .
                </p>
              </div>
            </div>
          </section>

          {/* 6. User Consent */}
          <section>
            <h2 className="text-xl font-semibold text-amber-300 mb-3">
              6. User Consent
            </h2>
            <p>
              By registering an account, you provide explicit consent for:
            </p>
            <ul className="list-disc list-inside text-gray-400 space-y-1 mt-2">
              <li>
                Collection and storage of your personal information (name,
                email)
              </li>
              <li>
                Processing your booking data and payment slips
              </li>
              <li>
                Sending booking confirmation emails to your registered address
              </li>
              <li>
                Using your review data publicly on shop pages
              </li>
              <li>
                Processing chat messages through OpenAI
              </li>
            </ul>
            <p className="mt-2">
              You may withdraw consent at any time by requesting account
              deletion (see Section 8).
            </p>
          </section>

          {/* 7. User Roles & Access Control */}
          <section>
            <h2 className="text-xl font-semibold text-amber-300 mb-3">
              7. User Roles & Access Control
            </h2>
            <div className="space-y-3">
              <div className="border border-gray-700 rounded-lg p-4">
                <h3 className="font-medium text-amber-200">
                  👤 Customer (Default Role)
                </h3>
                <ul className="list-disc list-inside text-gray-400 text-xs mt-1 space-y-0.5">
                  <li>Can browse shops, services, and reviews</li>
                  <li>Can create, view, and cancel own reservations</li>
                  <li>Can upload payment slips for own bookings</li>
                  <li>Can review completed bookings</li>
                  <li>Can use AI chatbot</li>
                  <li>Cannot access other users&apos; data or admin functions</li>
                </ul>
              </div>
              <div className="border border-gray-700 rounded-lg p-4">
                <h3 className="font-medium text-amber-200">
                  🏪 Merchant (Approved by Admin)
                </h3>
                <ul className="list-disc list-inside text-gray-400 text-xs mt-1 space-y-0.5">
                  <li>All customer permissions</li>
                  <li>Can manage own shop (details, services)</li>
                  <li>Can view and update reservations for own shop</li>
                  <li>Can scan QR codes for check-in at own shop</li>
                  <li>Cannot access other shops&apos; data or admin functions</li>
                </ul>
              </div>
              <div className="border border-gray-700 rounded-lg p-4">
                <h3 className="font-medium text-amber-200">
                  ⚙️ Administrator
                </h3>
                <ul className="list-disc list-inside text-gray-400 text-xs mt-1 space-y-0.5">
                  <li>Full system access</li>
                  <li>Can manage all shops, services, and users</li>
                  <li>Can approve/reject merchant registrations</li>
                  <li>Can verify/reject payment slips</li>
                  <li>Can manage promotions and TikTok links</li>
                  <li>Can access all reservation and review data</li>
                </ul>
              </div>
            </div>
            <p className="mt-3 text-gray-400">
              Access control is enforced via JWT role claims and server-side
              middleware. Users can only access resources appropriate to their
              role.
            </p>
          </section>

          {/* 8. Data Retention & Deletion */}
          <section>
            <h2 className="text-xl font-semibold text-amber-300 mb-3">
              8. Data Retention & Deletion Rights
            </h2>
            <ul className="list-disc list-inside text-gray-400 space-y-1">
              <li>
                <strong>Account data</strong> is retained while your account is
                active
              </li>
              <li>
                <strong>Reservation data</strong> is retained for 1 year after
                completion for record-keeping
              </li>
              <li>
                <strong>Payment slip images</strong> are deleted after
                verification is complete
              </li>
              <li>
                <strong>QR tokens</strong> expire after the reservation date
              </li>
              <li>
                <strong>Reviews</strong> remain publicly visible unless
                removed by admin
              </li>
            </ul>
            <p className="mt-3">
              You may request deletion of your account and all associated data
              by contacting us. Upon deletion:
            </p>
            <ul className="list-disc list-inside text-gray-400 space-y-1">
              <li>Your account and personal information are removed</li>
              <li>Your reviews are anonymized (name removed, rating retained)</li>
              <li>
                Your reservations are retained (anonymized) for shop records
              </li>
              <li>Payment slip images are permanently deleted</li>
            </ul>
          </section>

          {/* 9. Security */}
          <section>
            <h2 className="text-xl font-semibold text-amber-300 mb-3">
              9. Security
            </h2>
            <ul className="list-disc list-inside text-gray-400 space-y-1">
              <li>
                Passwords are hashed using bcrypt (salt rounds 12)
              </li>
              <li>
                JWT tokens are stored in httpOnly cookies (not accessible via
                JavaScript)
              </li>
              <li>
                Payment slip images are accessible only to the booking owner
                and administrators
              </li>
              <li>
                API endpoints enforce role-based access control
              </li>
              <li>
                Input validation prevents SQL/NoSQL injection and XSS attacks
              </li>
            </ul>
          </section>

          {/* 10. Contact */}
          <section>
            <h2 className="text-xl font-semibold text-amber-300 mb-3">
              10. Contact Information
            </h2>
            <p className="text-gray-400">
              For privacy-related questions or data deletion requests, contact:
            </p>
            <p className="mt-2 text-gray-300">
              📧{' '}
              <a
                href="mailto:aotmetrasit@gmail.com"
                className="text-amber-400 hover:underline"
              >
                aotmetrasit@gmail.com
              </a>
            </p>
            <p className="text-gray-300">
              🏫 Chulalongkorn University — Department of Computer Engineering
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-gray-700 text-center">
          <p className="text-gray-500 text-xs">
            © 2026 Dungeon Inn — Team Namthom (Group 68-2)
          </p>
          <p className="text-gray-600 text-xs mt-1">
            SE Project — Chulalongkorn University
          </p>
        </div>
      </div>
    </main>
  );
}
