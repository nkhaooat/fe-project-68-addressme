'use client';

import { useState } from 'react';
import { API_URL } from '@/libs/config';

interface Props {
  reservationId: string;
  shopName: string;
  serviceName: string;
  token: string;
  onDone: () => void;
  onClose: () => void;
}

export default function ReviewModal({ reservationId, shopName, serviceName, token, onDone, onClose }: Props) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (rating === 0) { setError('Please select a rating'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reservationId, rating, comment }),
      });
      const data = await res.json();
      if (data.success) {
        onDone();
      } else {
        setError(data.message || 'Failed to submit review');
      }
    } catch {
      setError('Error submitting review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-dungeon-surface border border-dungeon-outline rounded-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-dungeon-header-text mb-1">Rate Your Experience</h2>
        <p className="text-dungeon-sub-header text-sm mb-5">
          {serviceName} · {shopName}
        </p>

        {/* Star rating */}
        <div className="flex gap-2 mb-5">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => setRating(star)}
              className="text-3xl leading-none w-10 h-10 flex items-center justify-center transition-colors"
            >
              {star <= (hovered || rating) ? '⭐' : '☆'}
            </button>
          ))}
        </div>

        {/* Comment */}
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience (optional)"
          rows={3}
          maxLength={500}
          className="w-full bg-dungeon-canvas border border-dungeon-outline rounded-lg px-4 py-2.5 text-sm text-dungeon-header-text placeholder-dungeon-secondary focus:outline-none focus:border-dungeon-accent resize-none mb-1"
        />
        <p className="text-dungeon-secondary text-xs text-right mb-4">{comment.length}/500</p>

        {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-dungeon-outline text-dungeon-secondary rounded-lg hover:border-dungeon-accent hover:text-dungeon-header-text transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-dungeon-accent text-dungeon-dark-text font-bold rounded-lg hover:bg-dungeon-accent-dark transition-colors disabled:opacity-50"
          >
            {loading ? 'Submitting…' : 'Submit Review'}
          </button>
        </div>
      </div>
    </div>
  );
}
