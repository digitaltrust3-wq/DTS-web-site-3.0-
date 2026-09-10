import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { Send, X } from "lucide-react";
import { useLanguage } from "../../i18n/LanguageContext";

export type ChatMessage = { id: string; role: "user" | "assistant"; text: string };

type ChatWidgetProps = {
  isOpen: boolean;
  onClose: () => void;
  /** Returns (and clears) the prompt queued by openChat(), or null if none. */
  consumePendingPrompt: () => string | null;
};

const STORAGE_KEY = "dts-chat-session";
const MAX_STORED_MESSAGES = 40;

function randomId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function readStoredSession(): { sessionId: string; messages: ChatMessage[] } {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.sessionId === "string") {
        return { sessionId: parsed.sessionId, messages: Array.isArray(parsed.messages) ? parsed.messages : [] };
      }
    }
  } catch {
    // Private browsing, disabled storage or corrupt JSON: start a fresh session.
  }
  return { sessionId: randomId(), messages: [] };
}

function persistSession(sessionId: string, messages: ChatMessage[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ sessionId, messages: messages.slice(-MAX_STORED_MESSAGES) }));
  } catch {
    // Ignore — the chat still works for this page view without persistence.
  }
}

export function ChatWidget({ isOpen, onClose, consumePendingPrompt }: ChatWidgetProps) {
  const titleId = useId();
  const { copy } = useLanguage();
  const chat = copy.chatWidget;

  const [session] = useState(readStoredSession);
  const sessionIdRef = useRef(session.sessionId);
  const [messages, setMessages] = useState<ChatMessage[]>(session.messages);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const sendMessage = async (rawText: string) => {
    const text = rawText.trim();
    if (!text || sending) return;

    setError("");
    setMessages((current) => [...current, { id: randomId(), role: "user", text }]);
    setInput("");
    setSending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sessionIdRef.current, message: text }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.ok) throw new Error(result?.error?.message ?? chat.error);
      setMessages((current) => [...current, { id: randomId(), role: "assistant", text: result.text }]);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : chat.error);
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    persistSession(sessionIdRef.current, messages);
  }, [messages]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    inputRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const prompt = consumePendingPrompt();
    if (!prompt) return;
    if (messages.length === 0) {
      void sendMessage(prompt);
    } else {
      setInput(prompt);
    }
    // Runs once per open (isOpen flips false -> true); consumePendingPrompt
    // and messages are read at that moment, not re-triggered by later changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void sendMessage(input);
  };

  return createPortal(
    <div className="fixed inset-0 z-[70] grid place-items-center overflow-y-auto bg-slate-950/80 px-4 py-10 backdrop-blur-md">
      <button type="button" className="absolute inset-0 cursor-default" aria-label={chat.closeChat} onClick={onClose} />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-white/15 bg-slate-950 text-white shadow-[0_2rem_8rem_rgba(0,0,0,0.55)]"
        style={{ height: "min(680px, 85vh)" }}
      >
        <header className="flex items-start justify-between border-b border-white/10 px-6 py-5">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{chat.eyebrow}</p>
            <h2 id={titleId} className="text-xl font-semibold tracking-tight">{chat.title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
            aria-label={chat.closeChat}
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-6 py-5">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <p
                className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  message.role === "user"
                    ? "bg-white text-slate-950"
                    : "border border-white/10 bg-white/5 text-slate-100"
                }`}
              >
                {message.text}
              </p>
            </div>
          ))}
          {sending && (
            <div className="flex justify-start">
              <p className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-400">{chat.typing}</p>
            </div>
          )}
        </div>

        <div className="border-t border-white/10 px-6 py-4">
          {error && (
            <p className="mb-3 rounded-lg border border-red-400/25 bg-red-950/35 px-4 py-2.5 text-sm text-red-100" role="alert">
              {error}
            </p>
          )}
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <label htmlFor="chat-widget-input" className="sr-only">{chat.inputLabel}</label>
            <input
              id="chat-widget-input"
              ref={inputRef}
              type="text"
              value={input}
              maxLength={2000}
              placeholder={chat.placeholder}
              onChange={(event) => setInput(event.target.value)}
              className="flex-1 rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500 focus:border-slate-400"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              aria-label={sending ? chat.sending : chat.send}
              className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-white text-slate-950 transition-opacity hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
          <p className="mt-3 text-xs text-slate-500">{chat.disclaimer}</p>
        </div>
      </section>
    </div>,
    document.body,
  );
}
