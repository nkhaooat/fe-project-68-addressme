'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials } from '@/redux/features/authSlice';
import { updatePdpaConsent } from '@/libs/auth';
import Link from 'next/link';

interface ConsentState {
  personalData: boolean;
  bookingEmails: boolean;
  aiChatbot: boolean;
  publicReviews: boolean;
}

function ConsentFallback() {
  return (
    <main className="min-h-screen bg-dungeon-canvas flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg">
        <div className="bg-dungeon-surface border border-dungeon-outline rounded-lg overflow-hidden">
          <div className="px-8 py-6 border-b border-dungeon-outline bg-gradient-to-r from-dungeon-primary-header to-dungeon-secondary-header">
            <h1 className="text-2xl font-bold text-dungeon-header-text font-dungeon">Data Privacy Consent</h1>
            <p className="text-dungeon-sub-header text-sm mt-1">Dungeon Inn — Massage Reservation System</p>
          </div>
          <div className="px-8 py-12 text-center">
            <p className="text-dungeon-secondary">Loading consent form...</p>
          </div>
        </div>
      </div>
    </main>
  );
}

function ConsentContent() {
  const router = useRouter();
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const token = useSelector((state: any) => state.auth.token);
  const user = useSelector((state: any) => state.auth.user);

  const [consent, setConsent] = useState<ConsentState>({
    personalData: true,
    bookingEmails: true,
    aiChatbot: false,
    publicReviews: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!token) {
    return (
      <main className="min-h-screen bg-dungeon-canvas flex items-center justify-center px-4">
        <div className="bg-dungeon-surface border border-dungeon-outline rounded-lg p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-dungeon-header-text mb-4">No Session Found</h1>
          <p className="text-dungeon-secondary mb-6">Please register or log in first.</p>
          <Link href="/register" className="text-dungeon-accent hover:underline">← Back to Register</Link>
        </div>
      </main>
    );
  }

  const toggleConsent = (key: keyof ConsentState) => {
    setConsent(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const canAccept = consent.personalData && consent.bookingEmails;

  const handleAccept = async () => {
    if (!canAccept) return;
    setError('');
    setLoading(true);

    try {
      const res = await updatePdpaConsent(token, consent);
      if (res.success) {
        dispatch(setCredentials({ user: { ...user, pdpaConsent: consent, pdpaConsentedAt: new Date().toISOString() }, token }));
        const redirectTo = searchParams.get('redirect') || '/';
        router.push(redirectTo);
      } else {
        setError(res.message || 'Failed to save consent');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = () => {
    router.push('/login');
  };

  return (
    <main className="min-h-screen bg-dungeon-canvas flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg">
        <div className="bg-dungeon-surface border border-dungeon-outline rounded-lg overflow-hidden">
          {/* Header */}
          <div className="px-8 py-6 border-b border-dungeon-outline bg-gradient-to-r from-dungeon-primary-header to-dungeon-secondary-header">
            <h1 className="text-2xl font-bold text-dungeon-header-text font-dungeon">
              Data Privacy Consent
            </h1>
            <p className="text-dungeon-sub-header text-sm mt-1">
              Dungeon Inn — Massage Reservation System
            </p>
          </div>

          {/* Body */}
          <div className="px-8 py-6 space-y-6">
            {error && (
              <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded text-sm">
                {error}
              </div>
            )}

            {/* Personal Data */}
            <div className="border-b border-dungeon-outline pb-5">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">👤</span>
                <h3 className="text-base font-semibold text-dungeon-header-text">Personal Information</h3>
              </div>
              <p className="text-sm text-dungeon-secondary mb-3 leading-relaxed">
                Name, email, and telephone for account creation and booking management. Required for the service to function.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-dungeon-primary">
                  Allow collection & processing
                  <span className="text-dungeon-accent text-xs font-semibold ml-2">Required</span>
                </span>
                <button
                  onClick={() => toggleConsent('personalData')}
                  className={`w-10 h-6 rounded-full relative transition-colors ${consent.personalData ? 'bg-dungeon-accent' : 'bg-dungeon-outline'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-dungeon-primary transition-transform ${consent.personalData ? 'left-5' : 'left-1'}`} />
                </button>
              </div>
            </div>

            {/* Booking Emails */}
            <div className="border-b border-dungeon-outline pb-5">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">📧</span>
                <h3 className="text-base font-semibold text-dungeon-header-text">Booking Emails</h3>
              </div>
              <p className="text-sm text-dungeon-secondary mb-3 leading-relaxed">
                Confirmation emails with QR codes sent via Brevo to your registered address. Needed for reservation verification.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-dungeon-primary">
                  Allow email delivery
                  <span className="text-dungeon-accent text-xs font-semibold ml-2">Required</span>
                </span>
                <button
                  onClick={() => toggleConsent('bookingEmails')}
                  className={`w-10 h-6 rounded-full relative transition-colors ${consent.bookingEmails ? 'bg-dungeon-accent' : 'bg-dungeon-outline'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-dungeon-primary transition-transform ${consent.bookingEmails ? 'left-5' : 'left-1'}`} />
                </button>
              </div>
            </div>

            {/* AI Chatbot */}
            <div className="border-b border-dungeon-outline pb-5">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">🤖</span>
                <h3 className="text-base font-semibold text-dungeon-header-text">AI Chatbot</h3>
              </div>
              <p className="text-sm text-dungeon-secondary mb-3 leading-relaxed">
                Chat messages processed by OpenAI for recommendations. Not stored beyond the current session.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-dungeon-primary">
                  Allow AI processing
                  <span className="text-dungeon-muted text-xs ml-2">Optional</span>
                </span>
                <button
                  onClick={() => toggleConsent('aiChatbot')}
                  className={`w-10 h-6 rounded-full relative transition-colors ${consent.aiChatbot ? 'bg-dungeon-accent' : 'bg-dungeon-outline'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-dungeon-primary transition-transform ${consent.aiChatbot ? 'left-5' : 'left-1'}`} />
                </button>
              </div>
            </div>

            {/* Public Reviews */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">⭐</span>
                <h3 className="text-base font-semibold text-dungeon-header-text">Public Reviews</h3>
              </div>
              <p className="text-sm text-dungeon-secondary mb-3 leading-relaxed">
                Ratings and comments publicly visible on shop pages. Linked to your account name.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-dungeon-primary">
                  Allow public display
                  <span className="text-dungeon-muted text-xs ml-2">Optional</span>
                </span>
                <button
                  onClick={() => toggleConsent('publicReviews')}
                  className={`w-10 h-6 rounded-full relative transition-colors ${consent.publicReviews ? 'bg-dungeon-accent' : 'bg-dungeon-outline'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-dungeon-primary transition-transform ${consent.publicReviews ? 'left-5' : 'left-1'}`} />
                </button>
              </div>
            </div>

            {/* Privacy Policy link */}
            <p className="text-xs text-dungeon-muted text-center pt-2">
              Read our full <Link href="/privacy" className="text-dungeon-accent hover:underline">Privacy Policy</Link> for details.
            </p>
          </div>

          {/* Footer */}
          <div className="px-8 py-5 border-t border-dungeon-outline flex gap-3">
            <button
              onClick={handleDecline}
              className="flex-1 py-3 border border-dungeon-outline text-dungeon-secondary rounded font-medium text-sm hover:bg-dungeon-canvas transition-colors"
            >
              Decline
            </button>
            <button
              onClick={handleAccept}
              disabled={!canAccept || loading}
              className="flex-[2] py-3 bg-dungeon-accent text-dungeon-dark-text font-bold rounded text-sm hover:bg-dungeon-accent-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Accept & Continue'}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function ConsentPage() {
  return (
    <Suspense fallback={<ConsentFallback />}>
      <ConsentContent />
    </Suspense>
  );
}
