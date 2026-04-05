import React, { useState, useEffect } from "react";
import "./sidebar.css";

// -----------------
// API Config
// -----------------
const BACKEND_URL = process.env.REACT_APP_API_URL;

// TODO: replace with your actual endpoint to fetch chat history
// GET /api/chat/history — should return: { id: string, title: string, date: string }[]
async function fetchChatHistory(): Promise<ChatHistoryItem[]> {
  const res = await fetch(`${BACKEND_URL}/api/chat/history`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch history");
  return res.json();
}

// TODO: replace with your actual endpoint to delete/clear all chat history
// DELETE /api/chat/history
async function clearChatHistory(): Promise<void> {
  await fetch(`${BACKEND_URL}/api/chat/history`, { method: "DELETE", credentials: "include" });
}

// TODO: replace with your actual logout endpoint
// POST /api/auth/logout
async function logoutUser(): Promise<void> {
  await fetch(`${BACKEND_URL}/api/auth/logout`, { method: "POST", credentials: "include" });
}

type ChatHistoryItem = { id: string; title: string; date: string; };
type ActiveItem = "newchat" | "history" | "faq" | "settings" | null;

function IconNewChat() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      <line x1="12" y1="9" x2="12" y2="15" />
      <line x1="9" y1="12" x2="15" y2="12" />
    </svg>
  );
}

function IconHistory() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function IconFAQ() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function IconSettings() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function IconCollapse() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 3v18" />
      <path d="M15 9l-3 3 3 3" />
    </svg>
  );
}

function IconExpand() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 3v18" />
      <path d="M13 9l3 3-3 3" />
    </svg>
  );
}

const faqs = [
  { q: "What is AlgoSensei?", a: "AlgoSensei is an AI tutor specialized in algorithms and data structures." },
  { q: "How do I ask a question?", a: "Type your question in the chat box and press Enter or click send." },
  { q: "Can it solve LeetCode problems?", a: "Yes! Paste the problem and AlgoSensei will walk you through it." },
  { q: "Is my chat history saved?", a: "Chat history is saved per session. Account-based history coming soon." },
];

export default function Sidebar({
  onNewChat,
  onCollapse,
}: {
  onNewChat: () => void;
  onCollapse: (collapsed: boolean) => void;
}) {
  // starts collapsed so sidebar is closed on login
  const [collapsed, setCollapsed] = useState(true);
  const [active, setActive] = useState<ActiveItem>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [history, setHistory] = useState<ChatHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  // notify AIChat of initial collapsed state on mount
  useEffect(() => {
    onCollapse(true);
  }, []);

  useEffect(() => {
    if (active !== "history") return;
    setHistoryLoading(true);
    setHistoryError(null);
    fetchChatHistory()
      .then(data => setHistory(data))
      .catch(() => setHistoryError("Could not load history."))
      .finally(() => setHistoryLoading(false));
  }, [active]);

  const toggle = (item: ActiveItem) => {
    setActive(prev => prev === item ? null : item);
  };

  const handleToggleCollapse = () => {
    const next = !collapsed;
    setCollapsed(next);
    onCollapse(next);
    setActive(null);
  };

  const handleClear = async () => {
    try {
      await clearChatHistory();
      setHistory([]);
      onNewChat();
    } catch {}
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } finally {
      window.location.href = "/login";
    }
  };

  const groups = ["Today", "Yesterday", "This week"];

  return (
    <div className={`sb-root${collapsed ? " sb-collapsed" : ""}`}>

      <div className="sb-header">
        {!collapsed && (
          <div className="sb-logo">
            <img src="/logo.png" alt="AS" style={{ width: 36, height: 36, objectFit: "contain" }}
              onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
          </div>
        )}
        <button className="sb-collapse-btn" onClick={handleToggleCollapse}>
          {collapsed ? <IconExpand /> : <IconCollapse />}
        </button>
      </div>

      {!collapsed && (
        <>
          <div className="sb-top">
            <button className={`sb-item${active === "newchat" ? " active" : ""}`} onClick={() => { onNewChat(); setActive(null); }}>
              <IconNewChat />
              <span>New chat</span>
            </button>

            <div className="sb-sep" />

            <button className={`sb-item${active === "history" ? " active" : ""}`} onClick={() => toggle("history")}>
              <IconHistory />
              <span>Chat History</span>
            </button>

            {active === "history" && (
              <div className="sb-sublist">
                {historyLoading && <p className="sb-status">Loading...</p>}
                {historyError && <p className="sb-status sb-error">{historyError}</p>}
                {!historyLoading && !historyError && history.length === 0 && (
                  <p className="sb-status">No history yet.</p>
                )}
                {!historyLoading && !historyError && groups.map(group => {
                  const items = history.filter(c => c.date === group);
                  if (!items.length) return null;
                  return (
                    <div key={group}>
                      <span className="sb-group-label">{group}</span>
                      {items.map(chat => (
                        <button key={chat.id} className="sb-history-item">{chat.title}</button>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="sb-bottom">
            <div className="sb-sep" />

            <button className={`sb-item${active === "faq" ? " active" : ""}`} onClick={() => toggle("faq")}>
              <span>FAQ</span>
              <IconFAQ />
            </button>

            {active === "faq" && (
              <div className="sb-sublist">
                {faqs.map((item, i) => (
                  <div key={i} className="sb-faq-item">
                    <button className="sb-faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                      <span>{item.q}</span>
                      <span className="sb-faq-arrow">{openFaq === i ? "▲" : "▼"}</span>
                    </button>
                    {openFaq === i && <p className="sb-faq-a">{item.a}</p>}
                  </div>
                ))}
              </div>
            )}

            <button className={`sb-item${active === "settings" ? " active" : ""}`} onClick={() => toggle("settings")}>
              <span>Settings</span>
              <IconSettings />
            </button>

            {active === "settings" && (
              <div className="sb-sublist">
                <div className="sb-setting-row"><span>Theme</span><span className="sb-setting-val">Dark</span></div>
                <div className="sb-setting-row"><span>Model</span><span className="sb-setting-val">GPT-4o</span></div>
                <div className="sb-setting-row">
                  <span>Clear history</span>
                  <button className="sb-danger-btn" onClick={handleClear}>Clear</button>
                </div>
                <div className="sb-setting-row">
                  <span>Logout</span>
                  <button className="sb-danger-btn" onClick={handleLogout}>Logout</button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {collapsed && (
        <div className="sb-icon-rail">
          <button className="sb-icon-btn" title="New Chat" onClick={onNewChat}><IconNewChat /></button>
          <div className="sb-sep-sm" />
          <button className="sb-icon-btn" title="Chat History" onClick={handleToggleCollapse}><IconHistory /></button>
          <div className="sb-spacer" />
          <div className="sb-sep-sm" />
          <button className="sb-icon-btn" title="FAQ" onClick={handleToggleCollapse}><IconFAQ /></button>
          <button className="sb-icon-btn" title="Settings" onClick={handleToggleCollapse}><IconSettings /></button>
        </div>
      )}
    </div>
  );
}