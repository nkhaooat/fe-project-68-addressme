'use client';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { rebuildEmbedding } from '@/libs/shops';
import AccessDenied from '@/components/AccessDenied';

export default function AdminSettingsPage() {
  const { token, user } = useSelector((state: RootState) => state.auth);
  const [rebuildStatus, setRebuildStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [rebuildMessage, setRebuildMessage] = useState('');

  if (user?.role !== 'admin') return <AccessDenied />;

  const handleRebuildEmbedding = async () => {
    if (!token || rebuildStatus === 'loading') return;
    setRebuildStatus('loading');
    setRebuildMessage('');
    try {
      const res = await rebuildEmbedding(token);
      if (res.success) {
        setRebuildStatus('success');
        setRebuildMessage('Embedding index rebuilt successfully.');
        setTimeout(() => { setRebuildStatus('idle'); setRebuildMessage(''); }, 4000);
      } else {
        setRebuildStatus('error');
        setRebuildMessage(res.message || 'Failed to rebuild embedding index.');
      }
    } catch {
      setRebuildStatus('error');
      setRebuildMessage('Error rebuilding embedding index.');
    }
  };

  return (
    <main className="min-h-screen bg-dungeon-canvas py-8">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-dungeon-header-text mb-8">Admin Settings</h1>

        {/* Chatbot Section */}
        <div className="bg-dungeon-surface border border-dungeon-outline rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-dungeon-header-text mb-2">Chatbot</h2>
          <p className="text-dungeon-secondary text-sm mb-4">
            Manage the AI chatbot&apos;s vector store index. Rebuild when shop data changes significantly (new shops, updated descriptions, etc.).
          </p>

          <button
            onClick={handleRebuildEmbedding}
            disabled={rebuildStatus === 'loading'}
            className="px-6 py-2 bg-dungeon-accent text-dungeon-dark-text font-bold rounded-lg hover:bg-dungeon-accent-dark transition-colors disabled:opacity-50"
          >
            {rebuildStatus === 'loading' ? 'Rebuilding...' : 'Rebuild Embedding Index'}
          </button>

          {rebuildMessage && (
            <p className={`mt-3 text-sm ${rebuildStatus === 'success' ? 'text-green-400' : 'text-red-400'}`}>
              {rebuildMessage}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
