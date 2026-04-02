import React, { useState, useRef, useEffect } from "react";

type Message = {
  id: string;
  role: "user" | "ai";
  text: string;
  time: string;
};

type OpenAIMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

// ↓↓↓ PUT YOUR AI ENDPOINT HERE ↓↓↓
const OPENAI_API_KEY = "sk-...";
const OPENAI_API_URL = process.env.REACT_APP_API_URL + "/api/chat";
const MODEL = "gpt-4o";
// ↑↑↑ ──────────────────────────── ↑↑↑

const SYSTEM_PROMPT = `You are AlgoSensei, an expert algorithm and data structures tutor.
You explain concepts clearly, analyze time/space complexity, and help with coding problems.
Keep responses concise but thorough. Use plain text — no markdown formatting.`;

function getTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

async function fetchReply(history: OpenAIMessage[]): Promise<string> {
  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...history],
      max_tokens: 512,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `API error ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() ?? "No response received.";
}

function IconPhoto() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

function IconSend() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const historyRef = useRef<OpenAIMessage[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const hasMessages = messages.length > 0;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;

    setError(null);
    setMessages((prev) => [...prev, { id: Date.now().toString(), role: "user", text: trimmed, time: getTime() }]);
    setInput("");
    setIsTyping(true);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.overflowY = "hidden";
    }

    historyRef.current = [...historyRef.current, { role: "user", content: trimmed }];

    try {
      const reply = await fetchReply(historyRef.current);
      historyRef.current = [...historyRef.current, { role: "assistant", content: reply }];
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: "ai", text: reply, time: getTime() }]);
    } catch (err: any) {
      setError(err.message ?? "Something went wrong. Check your API key.");
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 140) + "px";
      el.style.overflowY = el.scrollHeight > 140 ? "auto" : "hidden";
    }
  };

  const InputBox = () => (
    <div style={s.inputCard}>
      <div style={s.inputRow}>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Send a message"
          rows={1}
          maxLength={500}
          style={s.textarea}
          disabled={isTyping}
        />
        <button
          onClick={() => send(input)}
          disabled={!input.trim() || isTyping}
          style={{ ...s.sendBtn, opacity: input.trim() && !isTyping ? 1 : 0.4, cursor: input.trim() && !isTyping ? "pointer" : "default" }}
        >
          <IconSend />
        </button>
      </div>
      <div style={s.divider} />
      <div style={s.inputFooter}>
        <button style={s.photoBtn}>
          <IconPhoto />
          <span>Add photos</span>
        </button>
      </div>
    </div>
  );

  return (
    <div style={s.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 60%, 100% { opacity: 0.25; transform: scale(1); }
          30%            { opacity: 1;    transform: scale(1.3); }
        }
        textarea { outline: none; }
        textarea::placeholder { color: #4a4a4a; }
        button { font-family: inherit; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
      `}</style>

      {!hasMessages ? (
        <div style={s.empty}>
          <h1 style={s.emptyTitle}>Got any algorithm questions?</h1>
          <div style={{ width: "100%", maxWidth: 580 }}>
            <InputBox />
          </div>
          {error && <p style={s.errorText}>{error}</p>}
        </div>
      ) : (
        <>
          <div style={s.feed}>
            {messages.map((msg) =>
              msg.role === "user" ? (
                <div key={msg.id} style={{ ...s.msgRow, justifyContent: "flex-end", animation: "fadeUp 0.2s ease" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", maxWidth: "68%" }}>
                    <div style={s.bubbleUser}>{msg.text}</div>
                    <span style={{ ...s.time, textAlign: "right" }}>{msg.time}</span>
                  </div>
                </div>
              ) : (
                <div key={msg.id} style={{ ...s.msgRow, justifyContent: "flex-start", animation: "fadeUp 0.25s ease" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", maxWidth: "68%" }}>
                    <div style={s.bubbleAi}>{msg.text}</div>
                    <span style={s.time}>{msg.time}</span>
                  </div>
                </div>
              )
            )}

            {isTyping && (
              <div style={{ ...s.msgRow, justifyContent: "flex-start" }}>
                <div style={s.typingBubble}>
                  {[0, 0.2, 0.4].map((d, i) => (
                    <span key={i} style={{ ...s.dot, animationDelay: `${d}s` }} />
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div style={{ ...s.msgRow, justifyContent: "center" }}>
                <p style={s.errorText}>{error}</p>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          <div style={s.bottomBar}>
            <div style={{ width: "100%", maxWidth: 700 }}>
              <InputBox />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  root: {
    height: "100vh",
    width: "100vw",
    background: "#242424",
    fontFamily: "'Inter', system-ui, sans-serif",
    color: "#f0ede8",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  empty: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
    padding: 32,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 700,
    color: "#f0ede8",
    textAlign: "center",
  },
  feed: {
    flex: 1,
    overflowY: "auto",
    padding: "32px 48px",
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  msgRow: { display: "flex" },
  bubbleUser: {
    background: "#3a3a3a",
    color: "#f0ede8",
    padding: "10px 14px",
    borderRadius: 16,
    borderBottomRightRadius: 4,
    fontSize: 14,
    lineHeight: 1.55,
  },
  bubbleAi: {
    background: "#2e2e2e",
    color: "#d4d0cb",
    border: "1px solid #363636",
    padding: "10px 14px",
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    fontSize: 14,
    lineHeight: 1.6,
  },
  time: {
    fontSize: 10,
    color: "#444",
    marginTop: 4,
  },
  typingBubble: {
    background: "#2e2e2e",
    border: "1px solid #363636",
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    padding: "12px 16px",
    display: "flex",
    gap: 5,
    alignItems: "center",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: "#666",
    display: "inline-block",
    animation: "pulse 1.2s infinite",
  },
  errorText: {
    fontSize: 12,
    color: "#e05a5a",
    textAlign: "center",
    maxWidth: 500,
    lineHeight: 1.5,
  },
  bottomBar: {
    padding: "12px 48px 24px",
    display: "flex",
    justifyContent: "center",
    flexShrink: 0,
  },
  inputCard: {
    background: "#2e2e2e",
    borderRadius: 16,
    border: "1px solid #3a3a3a",
    overflow: "hidden",
  },
  inputRow: {
    display: "flex",
    alignItems: "flex-end",
    padding: "14px 14px 12px",
    gap: 10,
  },
  textarea: {
    flex: 1,
    background: "none",
    border: "none",
    color: "#f0ede8",
    fontSize: 14,
    fontFamily: "'Inter', system-ui, sans-serif",
    lineHeight: 1.5,
    resize: "none",
    overflowY: "hidden",
    maxHeight: 140,
  },
  sendBtn: {
    width: 34,
    height: 34,
    borderRadius: "50%",
    background: "#4a4a4a",
    border: "none",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    transition: "opacity 0.15s",
  },
  divider: {
    height: 1,
    background: "#3a3a3a",
  },
  inputFooter: {
    padding: "10px 14px",
  },
  photoBtn: {
    display: "flex",
    alignItems: "center",
    gap: 7,
    background: "none",
    border: "none",
    color: "#555",
    fontSize: 13,
    cursor: "pointer",
    padding: 0,
  },
};