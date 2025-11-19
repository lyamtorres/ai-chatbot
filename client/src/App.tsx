import { useEffect, useMemo, useRef, useState } from "react";
import { Send, Copy, Check, Sparkles, Plus, Menu, X, ScrollText, User, Lock, Eye, EyeOff } from "lucide-react";

// NeoChat – A modern, responsive chat UI
// Palette: #0955FF (primary), #051742 (navy bg), #FFFFFF (white)
// Notes:
// - Fully responsive (mobile-first)
// - Scrollable conversation area with chat bubbles
// - Input composer with textarea + Send button
// - Read-only Transcript textarea (collapsible panel) to satisfy the explicit requirement
// - Keyboard: Enter to send, Shift+Enter for newline
// - Minimal mock assistant reply logic for demo

const PALETTE = {
  primary: "#0955FF",
  navy: "#051742",
  white: "#FFFFFF",
};

function classNames(...arr: Array<string | false | null | undefined>): string {
  return arr.filter(Boolean).join(" ");
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  ts: string;
  thinking?: boolean;
}

function useAutoResizeTextarea(ref: React.RefObject<HTMLTextAreaElement | null>, value: string) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 240) + "px"; // up to ~8 lines
  }, [ref, value]);
}

const initialMessages: ChatMessage[] = [
  {
    id: "m1",
    role: "assistant",
    content:
      "Hi! I’m NeoChat. Ask me anything — I’ll do my best to help. ✨",
    ts: new Date().toISOString(),
  },
];

export default function NeoChat() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showTranscript, setShowTranscript] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const listRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const composerRef = useRef<HTMLDivElement | null>(null);

  useAutoResizeTextarea(inputRef, input);

  useEffect(() => {
    // Auto-scroll to bottom when messages change
    const el = listRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  const transcriptText = useMemo(() => {
    return messages
      .map((m) => `${m.role === "user" ? "User" : "NeoChat"}: ${m.content}`)
      .join("\n\n");
  }, [messages]);

  function newChat() {
    setMessages([...initialMessages]);
    setInput("");
  }

  async function fetchAssistantReply(userText: string) {
    const id = "a_" + Math.random().toString(36).slice(2);
    setMessages((prev) => [
      ...prev,
      { id, role: "assistant", content: "Thinking…", ts: new Date().toISOString(), thinking: true },
    ]);
    try {
      const res = await fetch("http://localhost:3000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText }),
      });
      const data = await res.json();
      setMessages((prev) =>
        prev.map((m) =>
          m.id === id
            ? { ...m, content: data.reply || "(No reply)", thinking: false }
            : m
        )
      );
    } catch (err: any) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === id
            ? { ...m, content: "Error: " + (err.message || "Failed to fetch reply."), thinking: false }
            : m
        )
      );
    }
  }

  function sendMessage() {
    const text = input.trim();
    if (!text) return;
    const id = "u_" + Math.random().toString(36).slice(2);
    setMessages((prev) => [
      ...prev,
      { id, role: "user", content: text, ts: new Date().toISOString() },
    ]);
    setInput("");
    fetchAssistantReply(text);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function copyMessage(id: string, text: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1200);
    });
  }

  return (
    <div className="min-h-screen w-full text-white" style={{ backgroundColor: PALETTE.navy }}>
      {/* Decorative background gradient */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 opacity-60"
        style={{
          background:
            `radial-gradient(1200px 600px at 80% -10%, ${PALETTE.primary}33, transparent 60%),\n             radial-gradient(800px 500px at -10% 10%, ${PALETTE.primary}22, transparent 60%)`,
          filter: "blur(24px)",
        }}
      />

      {/* App Shell */}
      <header className="sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-white/5 bg-white/0 border-b border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-3">
          <button
            className="md:hidden p-2 rounded-xl bg-white/5 border border-white/10"
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          <div className="flex items-center gap-2">
            <div
              className="h-8 w-8 rounded-xl grid place-items-center font-bold"
              style={{ backgroundColor: PALETTE.primary, color: PALETTE.white }}
            >
              N
            </div>
            <div>
              <div className="font-semibold leading-tight">NeoChat</div>
              <div className="text-xs text-white/70 -mt-0.5">Conversational AI</div>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={newChat}
              className="hidden sm:inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10 transition"
            >
              <Plus size={16} /> New chat
            </button>
            <button
              onClick={() => setShowTranscript((v) => !v)}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10 transition"
            >
              <ScrollText size={16} /> Transcript
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl grid md:grid-cols-[260px_1fr] gap-4 px-4 py-4">
        {/* Sidebar */}
        <aside
          className={classNames(
            "md:sticky md:self-start md:top-[64px] md:h-[calc(100vh-80px)] overflow-y-auto",
            "rounded-2xl border border-white/10 bg-white/5 p-3",
            sidebarOpen ? "block" : "hidden md:block"
          )}
        >
          <div className="mb-3 text-xs uppercase tracking-wider text-white/60">History</div>
          <div className="flex flex-col gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <button
                key={i}
                className="text-left text-sm rounded-xl px-3 py-2 bg-white/0 hover:bg-white/10 border border-white/10"
              >
                Conversation {i + 1}
              </button>
            ))}
          </div>

          <div className="mt-6 text-xs uppercase tracking-wider text-white/60">Models</div>
          <div className="mt-2 grid grid-cols-1 gap-2">
            {[
              { id: "neo-pro", label: "NeoChat Pro" },
              { id: "neo-lite", label: "NeoChat Lite" },
            ].map((m) => (
              <label key={m.id} className="flex items-center gap-2 text-sm">
                <input type="radio" name="model" defaultChecked={m.id === "neo-pro"} /> {m.label}
              </label>
            ))}
          </div>
        </aside>

        {/* Main Chat Panel */}
        <section className="rounded-2xl border border-white/10 bg-white/5 flex flex-col min-h-[70vh]">
          {/* Hero / Empty-state banner (hidden once many messages) */}
          {messages.length <= 2 && (
            <div className="p-6 md:p-8 border-b border-white/10">
              <div className="flex items-center gap-3 text-lg font-semibold">
                <Sparkles size={18} />
                Ask anything. Stay curious.
              </div>
              <p className="mt-2 text-white/80 text-sm">
                Tips: Press <kbd className="px-1.5 py-0.5 rounded bg-white/10">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 rounded bg-white/10">Shift</kbd>+<kbd className="px-1.5 py-0.5 rounded bg-white/10">Enter</kbd> for a new line.
              </p>

              <div className="mt-4 grid sm:grid-cols-3 gap-3">
                {[
                  "Summarize this article",
                  "Draft a friendly email reply",
                  "Explain a complex topic simply",
                ].map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(s)}
                    className="text-left rounded-xl border border-white/10 bg-white/0 hover:bg-white/10 px-4 py-3 text-sm"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          <div ref={listRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
            {messages.map((m) => (
              <MessageBubble
                key={m.id}
                msg={m}
                onCopy={() => copyMessage(m.id, m.content)}
                copied={copiedId === m.id}
              />
            ))}
          </div>

          {/* Composer */}
          <div ref={composerRef} className="border-t border-white/10 p-3 md:p-4">
            <div
              className="rounded-2xl border bg-white/5 border-white/10 p-2 md:p-3 flex items-end gap-2"
              style={{ boxShadow: "0 8px 30px rgba(0,0,0,.25)" }}
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Message NeoChat…"
                className="flex-1 resize-none bg-transparent outline-none placeholder:text-white/50 text-sm md:text-base leading-relaxed max-h-[240px]"
                rows={1}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim()}
                className="shrink-0 inline-flex items-center gap-2 rounded-xl px-3 py-2 md:px-4 md:py-2 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: PALETTE.primary,
                  color: PALETTE.white,
                }}
                aria-label="Send message"
              >
                <Send size={16} />
                <span className="hidden sm:inline">Send</span>
              </button>
            </div>
            <div className="mt-2 text-[11px] text-white/60 text-center">
              NeoChat can make mistakes. Consider checking important info.
            </div>
          </div>
        </section>
      </div>

      {/* Transcript Drawer */}
      {showTranscript && (
        <div className="fixed inset-0 z-40 grid place-items-end md:place-items-center bg-black/40">
          <div className="w-full md:max-w-2xl h-[60vh] md:h-[70vh] rounded-t-2xl md:rounded-2xl overflow-hidden border border-white/10" style={{ backgroundColor: "#0a1140" }}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <div className="font-medium">Transcript (read-only)</div>
              <button
                onClick={() => setShowTranscript(false)}
                className="p-2 rounded-lg bg-white/5 border border-white/10"
                aria-label="Close transcript"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-3">
              <textarea
                readOnly
                value={transcriptText}
                className="w-full h-[48vh] md:h-[56vh] p-3 rounded-xl bg-white/5 border border-white/10 text-sm"
              />
              <div className="mt-2 text-xs text-white/60">
                This textarea shows the entire conversation as plain text.
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="py-6 text-center text-xs text-white/50">
        <span className="opacity-80">© {new Date().getFullYear()} NeoChat</span>
      </footer>
    </div>
  );
}

interface MessageBubbleProps {
  msg: ChatMessage;
  onCopy: () => void;
  copied: boolean;
}

function MessageBubble({ msg, onCopy, copied }: MessageBubbleProps) {
  const isUser = msg.role === "user";
  return (
    <div className={classNames("flex gap-3", isUser ? "justify-end" : "justify-start")}>
      {!isUser && <Avatar letter="N" bg={PALETTE.primary} fg={PALETTE.white} />}
      <div
        className={classNames(
          "group max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-3 text-sm md:text-[15px] leading-relaxed border",
          isUser ? "ml-auto text-white border-white/10" : "bg-white/5 text-white border-white/10"
        )}
        style={{
          boxShadow: isUser ? "0 6px 24px rgba(9,85,255,.25)" : "0 6px 24px rgba(0,0,0,.25)",
          backgroundColor: isUser ? PALETTE.primary : undefined,
        }}
      >
        <div className="whitespace-pre-wrap">{msg.content}</div>
        <div className="mt-2 flex items-center gap-2 text-[11px] text-white/60">
          <time>{new Date(msg.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</time>
          <span>•</span>
          <button
            onClick={onCopy}
            className="inline-flex items-center gap-1 opacity-70 hover:opacity-100"
            aria-label="Copy message"
          >
            {copied ? <Check size={12} /> : <Copy size={12} />} {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>
      {isUser && <Avatar letter="U" bg={PALETTE.white} fg={PALETTE.navy} bordered />}
    </div>
  );
}

interface AvatarProps {
  letter: string;
  bg: string;
  fg: string;
  bordered?: boolean;
}

function Avatar({ letter, bg, fg, bordered }: AvatarProps) {
  return (
    <div
      className={classNames(
        "h-8 w-8 shrink-0 grid place-items-center rounded-xl font-semibold",
        bordered && "border border-white/10"
      )}
      style={{ backgroundColor: bg, color: fg }}
      aria-hidden
    >
      {letter}
    </div>
  );
}


// ------------------------------
// NeoChat Login Page
// ------------------------------
export function NeoChatLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const canSubmit = username.trim().length > 0 && password.length >= 6 && !loading;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    // Demo only — replace with your real auth call
    setTimeout(() => {
      setLoading(false);
      console.log("Logged in:", { username });
      alert("Login successful (demo). Replace with real auth.");
    }, 700);
  }

  return (
    <div className="min-h-screen grid place-items-center px-4" style={{ backgroundColor: PALETTE.navy, color: PALETTE.white }}>
      {/* Decorative background gradient */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 opacity-60"
        style={{
          background:
            `radial-gradient(1200px 600px at 80% -10%, ${PALETTE.primary}33, transparent 60%),
             radial-gradient(800px 500px at -10% 10%, ${PALETTE.primary}22, transparent 60%)`,
          filter: "blur(24px)",
        }}
      />

      <div className="relative w-full max-w-md">
        {/* Brand */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div
            className="h-10 w-10 rounded-2xl grid place-items-center font-bold"
            style={{ backgroundColor: PALETTE.primary, color: PALETTE.white }}
          >
            N
          </div>
          <div>
            <div className="font-semibold text-xl leading-tight">NeoChat</div>
            <div className="text-xs text-white/70 -mt-0.5">Sign in to continue</div>
          </div>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl border border-white/10 bg-white/5 p-5 md:p-6 shadow-xl backdrop-blur"
          style={{ boxShadow: "0 12px 32px rgba(0,0,0,.35)" }}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <label className="block text-sm">
              <span className="mb-1 inline-block text-white/80">Username</span>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 opacity-70"><User size={16} /></span>
                <input
                  type="text"
                  inputMode="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="your.name"
                  className="w-full rounded-xl bg-white/5 border border-white/10 pl-9 pr-3 py-2.5 outline-none focus:border-white/30 placeholder:text-white/40"
                />
              </div>
            </label>

            {/* Password */}
            <label className="block text-sm">
              <span className="mb-1 inline-block text-white/80">Password</span>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 opacity-70"><Lock size={16} /></span>
                <input
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl bg-white/5 border border-white/10 pl-9 pr-10 py-2.5 outline-none focus:border-white/30 placeholder:text-white/40"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-white/0 hover:bg-white/10 border border-white/10"
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div className="mt-1 text-[11px] text-white/60">Use at least 6 characters.</div>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: PALETTE.primary, color: PALETTE.white }}
            >
              {loading ? (
                <span className="inline-flex items-center gap-2"><Sparkles size={16} className="animate-pulse" /> Logging in…</span>
              ) : (
                <span className="inline-flex items-center gap-2"><Send size={16} /> Log in</span>
              )}
            </button>

            {/* Extras */}
            <div className="text-xs text-white/60 text-center">
              By continuing you agree to our Terms and Privacy Policy.
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-white/50">
          © {new Date().getFullYear()} NeoChat
        </div>
      </div>
    </div>
  );
}
