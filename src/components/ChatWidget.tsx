'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import ReactMarkdown from 'react-markdown';
import { API_URL } from '@/libs/config';
import { handleChatAction, ActionResult, ChatAction } from '@/utils/chatActions';

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

const SESSION_ID_KEY = 'dungeon_chat_session_id';
const HISTORY_WINDOW = 12; // messages sent as context

/** Get or create a persistent session ID */
function getSessionId(): string {
  if (typeof window === 'undefined') return 'ssr';
  let id = sessionStorage.getItem(SESSION_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_ID_KEY, id);
  }
  return id;
}

/** Storage key per user */
function getStorageKey(userId?: string): string {
  return userId ? `dungeon_chat_${userId}` : 'dungeon_chat_guest';
}

const defaultMessages: Message[] = [
  {
    role: 'assistant',
    content: 'Welcome to **Dungeon Inn**! I can help you find massage shops, check services, manage bookings, and more. How can I help you today?\n\nยินดีต้อนรับสู่ **Dungeon Inn**! ฉันช่วยค้นหาร้านนวด ดูบริการ จัดการการจอง และอื่นๆ ได้ มีอะไรให้ช่วยไหมครับ?',
  },
];

export default function ChatWidget() {
  const { token, isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(defaultMessages);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const sessionIdRef = useRef(getSessionId());

  // Request geolocation on mount (optional — user can deny)
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {} // silently ignore denial — Bangkok will be used as fallback
      );
    }
  }, []);

  // Restore chat history from localStorage (per-user)
  useEffect(() => {
    const key = getStorageKey(user?._id);
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      }
    } catch {}
  }, [user?._id]);

  // Persist chat history to localStorage whenever it changes
  useEffect(() => {
    const key = getStorageKey(user?._id);
    if (messages.length > 1) {
      try {
        localStorage.setItem(key, JSON.stringify(messages.slice(-50))); // cap at 50 messages
      } catch {}
    }
  }, [messages, user?._id]);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const clearHistory = useCallback(() => {
    setMessages(defaultMessages);
    const key = getStorageKey(user?._id);
    localStorage.removeItem(key);
  }, [user?._id]);

  const processAction = useCallback(async (action: ChatAction) => {
    if (!token || !action?.type) return;

    const result: ActionResult = await handleChatAction(action, token);
    const icon = result.success ? 'OK' : 'X';
    setMessages((prev) => [
      ...prev,
      { role: 'assistant', content: `${icon} **${result.message}**` },
    ]);
  }, [token]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { role: 'user', content: text };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
    setLoading(true);
    setStreaming(false);

    try {
      const history = nextMessages
        .slice(1)
        .slice(-HISTORY_WINDOW)
        .map(({ role, content }) => ({ role, content }));

      // --- Streaming request ---
      const res = await fetch(`${API_URL}/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          message: text,
          history,
          lat: userCoords?.lat ?? null,
          lng: userCoords?.lng ?? null,
          sessionId: sessionIdRef.current,
        }),
      });

      if (!res.ok || !res.body) {
        throw new Error('Stream failed');
      }

      // Add empty assistant message that we'll fill incrementally
      const assistantIdx = nextMessages.length;
      setMessages([...nextMessages, { role: 'assistant', content: '' }]);
      setLoading(false); // hide dots, show empty bubble
      setStreaming(true); // mark as streaming

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';
      let buffer = '';
      let action: ChatAction | null = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // keep incomplete line

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const event = JSON.parse(line);
            if (event.type === 'token') {
              accumulated += event.text;
              setMessages((prev) => {
                const updated = [...prev];
                updated[assistantIdx] = { role: 'assistant', content: accumulated };
                return updated;
              });
            } else if (event.type === 'action') {
              action = event.action;
            } else if (event.type === 'error') {
              accumulated += (accumulated ? '\n\n' : '') + event.text;
              setMessages((prev) => {
                const updated = [...prev];
                updated[assistantIdx] = { role: 'assistant', content: accumulated };
                return updated;
              });
            }
            // 'done' — just end the loop naturally
          } catch {
            // malformed line — skip
          }
        }
      }

      // Process any action after stream completes
      if (action) {
        await processAction(action);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Connection error. Please try again.' },
      ]);
    } finally {
      setLoading(false);
      setStreaming(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Auth status badge
  const authBadge = isAuthenticated ? (
    <span className="inline-flex items-center gap-1 text-xs text-green-400">
      <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
      {user?.role === 'merchant' ? 'Merchant' : user?.role === 'admin' ? 'Admin' : 'Logged in'}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-xs text-dungeon-secondary">
      <span className="w-1.5 h-1.5 rounded-full bg-dungeon-secondary" />
      Guest
    </span>
  );

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-dungeon-accent text-white shadow-lg flex items-center justify-center hover:bg-dungeon-accent-dark transition-all duration-200 hover:scale-105"
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
        <div className="fixed bottom-24 right-6 z-50 flex flex-col bg-dungeon-canvas border border-dungeon-outline rounded-2xl shadow-2xl overflow-hidden
          w-[420px] max-w-[calc(100vw-2rem)]
          sm:w-[480px]
          md:w-[520px]
          h-[580px]
          sm:h-[640px]">

          {/* Header */}
          <div className="bg-dungeon-surface px-4 py-3 flex items-center justify-between border-b border-dungeon-outline shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-xl">🕯️</span>
              <div>
                <p className="text-dungeon-header-text font-bold text-sm">Dungeon Inn Assistant</p>
                <div className="flex items-center gap-2">
                  {authBadge}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={clearHistory}
                title="Clear chat history"
                className="text-dungeon-secondary hover:text-dungeon-header-text transition-colors p-1 rounded-lg hover:bg-dungeon-outline text-xs"
              >
                🗑️
              </button>
              <button
                onClick={() => setOpen(false)}
                className="text-dungeon-secondary hover:text-dungeon-header-text transition-colors p-1 rounded-lg hover:bg-dungeon-outline"
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
                  <div className="w-7 h-7 rounded-full bg-dungeon-accent flex items-center justify-center text-xs mr-2 mt-1 shrink-0">
                    🕯️
                  </div>
                )}

                <div
                  className={`max-w-[82%] px-3 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-dungeon-accent text-dungeon-dark-text rounded-br-sm font-medium'
                      : 'bg-dungeon-surface text-dungeon-primary border border-dungeon-outline rounded-bl-sm'
                  }`}
                >
                  {msg.role === 'assistant' ? (
                    <div className="prose prose-sm max-w-none
                      prose-p:my-1 prose-p:leading-relaxed
                      prose-headings:text-dungeon-header-text prose-headings:font-bold prose-headings:my-1
                      prose-strong:text-dungeon-header-text prose-strong:font-semibold
                      prose-ul:my-1 prose-ul:pl-4 prose-li:my-0.5
                      prose-ol:my-1 prose-ol:pl-4
                      prose-a:text-dungeon-accent prose-a:underline prose-a:break-all
                      prose-code:text-dungeon-accent prose-code:bg-dungeon-canvas prose-code:px-1 prose-code:rounded
                      prose-hr:border-dungeon-outline prose-hr:my-2
                      text-dungeon-primary">
                      <ReactMarkdown
                        components={{
                          a: ({ href, children }) => (
                            <a
                              href={href}
                              target={href?.startsWith('http') ? '_blank' : '_self'}
                              rel="noopener noreferrer"
                              className="text-dungeon-accent underline break-all"
                            >
                              {children}
                            </a>
                          ),
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                      {streaming && i === messages.length - 1 && msg.role === 'assistant' && (
                        <span className="inline-block w-1.5 h-4 bg-dungeon-accent animate-pulse ml-0.5 align-text-bottom" />
                      )}
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
                <div className="w-7 h-7 rounded-full bg-dungeon-accent flex items-center justify-center text-xs mr-2 mt-1 shrink-0">
                  🕯️
                </div>
                <div className="bg-dungeon-surface border border-dungeon-outline px-4 py-3 rounded-2xl rounded-bl-sm">
                  <span className="flex gap-1.5 items-center">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="w-2 h-2 bg-dungeon-accent rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </span>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Quick suggestions (only when no messages besides default) */}
          {messages.length <= 1 && (
            <div className="px-3 pb-2 flex gap-1.5 overflow-x-auto shrink-0">
              {[
                'Shops near Phaya Thai',
                'How to become a merchant?',
                'My bookings',
                'TikTok videos',
              ].map((q) => (
                <button key={q} onClick={() => { setInput(q); }}
                  className="flex-shrink-0 px-3 py-1.5 bg-dungeon-surface border border-dungeon-outline rounded-full text-dungeon-sub-header text-xs hover:border-dungeon-accent hover:text-dungeon-primary transition-colors">
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="border-t border-dungeon-outline p-3 flex gap-2 shrink-0 bg-dungeon-canvas items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
              }}
              onKeyDown={handleKey}
              placeholder="Ask about shops, bookings, merchants..."
              disabled={loading}
              rows={1}
              className="flex-1 bg-dungeon-surface border border-dungeon-outline rounded-xl px-4 py-2.5 text-sm text-dungeon-header-text placeholder-dungeon-secondary focus:outline-none focus:border-dungeon-accent disabled:opacity-50 transition-colors resize-none overflow-y-auto leading-relaxed"
              style={{ minHeight: '42px', maxHeight: '120px' }}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="w-10 h-10 bg-dungeon-accent text-dungeon-dark-text rounded-xl flex items-center justify-center hover:bg-dungeon-accent-dark transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 shrink-0 mb-0"
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
