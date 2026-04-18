'use client';

import { useState, useRef, useEffect } from 'react';
import { API_URL } from '@/libs/config';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        "Hi! I'm your Dungeon Inn assistant 🕯️ Ask me about massage shops, services, prices, hours, or TikTok videos!",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
    setLoading(true);

    try {
      // Build history excluding the initial greeting
      const history = nextMessages
        .slice(1) // skip the greeting
        .slice(-8) // last 4 turns
        .map(({ role, content }) => ({ role, content }));

      const res = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history }),
      });

      const data = await res.json();
      const reply = data.success
        ? data.reply
        : 'Sorry, something went wrong. Please try again.';

      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
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

  // Render message content — detect URLs and make them clickable
  const renderContent = (text: string) => {
    // Split on URLs (http/https) and relative booking links
    const urlRegex = /(https?:\/\/[^\s]+|\/booking\?[^\s]+|\/shops\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    return parts.map((part, i) => {
      if (urlRegex.test(part)) {
        urlRegex.lastIndex = 0; // reset regex state
        const isExternal = part.startsWith('http');
        return (
          <a
            key={i}
            href={part}
            target={isExternal ? '_blank' : '_self'}
            rel="noopener noreferrer"
            className="text-[#E57A00] underline break-all"
          >
            {isExternal && part.includes('tiktok') ? '🎵 TikTok' : part}
          </a>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#E57A00] text-white shadow-lg flex items-center justify-center text-2xl hover:bg-[#c46a00] transition-colors"
        aria-label="Open chat"
      >
        {open ? '✕' : '💬'}
      </button>

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] flex flex-col bg-[#1A1A1A] border border-[#403A36] rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-[#2B2B2B] px-4 py-3 flex items-center gap-3 border-b border-[#403A36]">
            <span className="text-xl">🕯️</span>
            <div>
              <p className="text-[#F0E5D8] font-bold text-sm">Dungeon Inn Assistant</p>
              <p className="text-[#8A8177] text-xs">Ask about shops, services & TikTok</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[400px]">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-[#E57A00] text-[#1A110A] rounded-br-sm'
                      : 'bg-[#2B2B2B] text-[#D4CFC6] border border-[#403A36] rounded-bl-sm'
                  }`}
                >
                  {renderContent(msg.content)}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-[#2B2B2B] border border-[#403A36] px-4 py-2 rounded-2xl rounded-bl-sm">
                  <span className="flex gap-1">
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
          <div className="border-t border-[#403A36] p-3 flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask about shops, prices, TikTok…"
              disabled={loading}
              className="flex-1 bg-[#2B2B2B] border border-[#403A36] rounded-xl px-3 py-2 text-sm text-[#F0E5D8] placeholder-[#8A8177] focus:outline-none focus:border-[#E57A00] disabled:opacity-50"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="px-3 py-2 bg-[#E57A00] text-[#1A110A] rounded-xl font-bold text-sm hover:bg-[#c46a00] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ↑
            </button>
          </div>
        </div>
      )}
    </>
  );
}
