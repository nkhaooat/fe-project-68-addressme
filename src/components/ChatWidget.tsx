'use client';

import { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import ReactMarkdown from 'react-markdown';
import { API_URL } from '@/libs/config';
import { createReservation, deleteReservation } from '@/libs/reservations';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// Send icon SVG (paper plane)
function SendIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
    </svg>
  );
}

const STORAGE_KEY = 'dungeon_chat_history';
const WEATHER_CACHE_KEY = 'dungeon_weather_cache';
const WEATHER_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

async function getWeather() {
  try {
    // Check cache first
    const cached = sessionStorage.getItem(WEATHER_CACHE_KEY);
    if (cached) {
      const { data, ts } = JSON.parse(cached);
      if (Date.now() - ts < WEATHER_CACHE_TTL) return data;
    }
    // Fetch fresh
    const res = await fetch(
      'https://pm25.gistda.or.th/rest/getWeatherbyArea?id=103301',
      { signal: AbortSignal.timeout(4000) }
    );
    const json = await res.json();
    const d = json?.data?.[0];
    if (!d) return null;
    const data = {
      temp: d.temperature_2m,
      wind: d.windspeed_10m_max,
      rainChance: d.precipitation_probability_max,
    };
    sessionStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify({ data, ts: Date.now() }));
    return data;
  } catch {
    return null;
  }
}

const defaultMessages: Message[] = [
  {
    role: 'assistant',
    content:
      "Hi! I'm your **Dungeon Inn** assistant 🕯️\n\nAsk me about massage shops, services, prices, hours, or TikTok videos!",
  },
];

export default function ChatWidget() {
  const { token, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(defaultMessages);
  const prevAuthRef = useRef<boolean | null>(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Restore chat history from sessionStorage on first mount
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: Message[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Persist chat history to sessionStorage whenever it changes
  useEffect(() => {
    try {
      if (messages.length > 1) {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
      }
    } catch {
      // ignore
    }
  }, [messages]);

  // Clear history when user logs out
  useEffect(() => {
    if (prevAuthRef.current === true && !isAuthenticated) {
      setMessages(defaultMessages);
      sessionStorage.removeItem(STORAGE_KEY);
    }
    prevAuthRef.current = isAuthenticated;
  }, [isAuthenticated]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { role: 'user', content: text };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');
    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
    setLoading(true);

    try {
      const history = nextMessages
        .slice(1)
        .slice(-8)
        .map(({ role, content }) => ({ role, content }));

      // Fetch live weather from client side (cached 10 min, GISTDA Thai IP)
      // Only include in request if the message seems weather-related
      const weatherKeywords = /weather|rain|hot|temperature|wind|umbrella|อากาศ|ฝน|ร้อน|ลม|หนาว/i;
      const weather = weatherKeywords.test(text) ? await getWeather() : null;

      const res = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ message: text, history, weather }),
      });

      const data = await res.json();
      const reply = data.success
        ? data.reply
        : 'Sorry, something went wrong. Please try again.';

      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);

      // Handle booking/cancel action from chatbot
      if (data.success && token) {
        if (data.action?.type === 'create_reservation') {
          const { shopId, serviceId, resvDate } = data.action;
          try {
            const resvRes = await createReservation(
              { shop: shopId, service: serviceId, resvDate },
              token
            );
            if (resvRes.success) {
              setMessages((prev) => [
                ...prev,
                {
                  role: 'assistant',
                  content: `✅ **Booking confirmed!** \n\nView it at [My Bookings](/mybookings)`,
                },
              ]);
            } else {
              setMessages((prev) => [
                ...prev,
                {
                  role: 'assistant',
                  content: `❌ **Booking failed:** ${resvRes.message || 'Please try again'}`,
                },
              ]);
            }
          } catch {
            setMessages((prev) => [
              ...prev,
              { role: 'assistant', content: '❌ Error creating booking. Please try again.' },
            ]);
          }
        } else if (data.action?.type === 'edit_reservation') {
          const { reservationId, resvDate } = data.action;
          try {
            const res = await fetch(`${API_URL}/reservations/${reservationId}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ resvDate }),
            });
            const editRes = await res.json();
            if (editRes.success) {
              setMessages((prev) => [
                ...prev,
                {
                  role: 'assistant',
                  content: `✅ **Booking updated!** \n\nView it at [My Bookings](/mybookings)`,
                },
              ]);
            } else {
              setMessages((prev) => [
                ...prev,
                {
                  role: 'assistant',
                  content: `❌ **Update failed:** ${editRes.message || 'Please try again'}`,
                },
              ]);
            }
          } catch {
            setMessages((prev) => [
              ...prev,
              { role: 'assistant', content: '❌ Error updating booking. Please try again.' },
            ]);
          }
        } else if (data.action?.type === 'cancel_reservation') {
          const { reservationId } = data.action;
          try {
            const cancelRes = await deleteReservation(reservationId, token);
            if (cancelRes.success) {
              setMessages((prev) => [
                ...prev,
                {
                  role: 'assistant',
                  content: `✅ **Reservation cancelled successfully!** \n\nView your bookings at [My Bookings](/mybookings)`,
                },
              ]);
            } else {
              setMessages((prev) => [
                ...prev,
                {
                  role: 'assistant',
                  content: `❌ **Cancellation failed:** ${cancelRes.message || 'Please try again'}`,
                },
              ]);
            }
          } catch {
            setMessages((prev) => [
              ...prev,
              { role: 'assistant', content: '❌ Error cancelling reservation. Please try again.' },
            ]);
          }
        }
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Connection error. Please try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#E57A00] text-white shadow-lg flex items-center justify-center hover:bg-[#c46a00] transition-all duration-200 hover:scale-105"
        aria-label="Open chat"
      >
        {open ? (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path fillRule="evenodd" d="M4.804 21.644A6.707 6.707 0 006 21.75a6.721 6.721 0 003.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 01-.814 1.686.75.75 0 00.44 1.223 3.98 3.98 0 002-.554z" clipRule="evenodd" />
          </svg>
        )}
      </button>

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex flex-col bg-[#1A1A1A] border border-[#403A36] rounded-2xl shadow-2xl overflow-hidden
          w-[420px] max-w-[calc(100vw-2rem)]
          sm:w-[480px]
          md:w-[520px]
          h-[580px]
          sm:h-[640px]">

          {/* Header */}
          <div className="bg-[#2B2B2B] px-4 py-3 flex items-center justify-between border-b border-[#403A36] shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-xl">🕯️</span>
              <div>
                <p className="text-[#F0E5D8] font-bold text-sm">Dungeon Inn Assistant</p>
                <p className="text-[#8A8177] text-xs">Ask about shops, services & TikTok</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setMessages(defaultMessages);
                  sessionStorage.removeItem(STORAGE_KEY);
                }}
                title="Clear chat history"
                className="text-[#8A8177] hover:text-[#F0E5D8] transition-colors p-1 rounded-lg hover:bg-[#403A36] text-xs"
              >
                🗑️
              </button>
              <button
                onClick={() => setOpen(false)}
                className="text-[#8A8177] hover:text-[#F0E5D8] transition-colors p-1 rounded-lg hover:bg-[#403A36]"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-[#E57A00] flex items-center justify-center text-xs mr-2 mt-1 shrink-0">
                    🕯️
                  </div>
                )}

                <div
                  className={`max-w-[82%] px-3 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-[#E57A00] text-[#1A110A] rounded-br-sm font-medium'
                      : 'bg-[#2B2B2B] text-[#D4CFC6] border border-[#403A36] rounded-bl-sm'
                  }`}
                >
                  {msg.role === 'assistant' ? (
                    <div className="prose prose-sm max-w-none
                      prose-p:my-1 prose-p:leading-relaxed
                      prose-headings:text-[#F0E5D8] prose-headings:font-bold prose-headings:my-1
                      prose-strong:text-[#F0E5D8] prose-strong:font-semibold
                      prose-ul:my-1 prose-ul:pl-4 prose-li:my-0.5
                      prose-ol:my-1 prose-ol:pl-4
                      prose-a:text-[#E57A00] prose-a:underline prose-a:break-all
                      prose-code:text-[#E57A00] prose-code:bg-[#1A1A1A] prose-code:px-1 prose-code:rounded
                      prose-hr:border-[#403A36] prose-hr:my-2
                      text-[#D4CFC6]">
                      <ReactMarkdown
                        components={{
                          a: ({ href, children }) => (
                            <a
                              href={href}
                              target={href?.startsWith('http') ? '_blank' : '_self'}
                              rel="noopener noreferrer"
                              className="text-[#E57A00] underline break-all"
                            >
                              {children}
                            </a>
                          ),
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="flex justify-start">
                <div className="w-7 h-7 rounded-full bg-[#E57A00] flex items-center justify-center text-xs mr-2 mt-1 shrink-0">
                  🕯️
                </div>
                <div className="bg-[#2B2B2B] border border-[#403A36] px-4 py-3 rounded-2xl rounded-bl-sm">
                  <span className="flex gap-1.5 items-center">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="w-2 h-2 bg-[#E57A00] rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </span>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-[#403A36] p-3 flex gap-2 shrink-0 bg-[#1A1A1A] items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                // Auto-resize: reset then expand
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
              }}
              onKeyDown={handleKey}
              placeholder="Ask about shops, prices, TikTok…"
              disabled={loading}
              rows={1}
              className="flex-1 bg-[#2B2B2B] border border-[#403A36] rounded-xl px-4 py-2.5 text-sm text-[#F0E5D8] placeholder-[#8A8177] focus:outline-none focus:border-[#E57A00] disabled:opacity-50 transition-colors resize-none overflow-y-auto leading-relaxed"
              style={{ minHeight: '42px', maxHeight: '120px' }}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="w-10 h-10 bg-[#E57A00] text-[#1A110A] rounded-xl flex items-center justify-center hover:bg-[#c46a00] transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 shrink-0 mb-0"
              aria-label="Send"
            >
              <SendIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
