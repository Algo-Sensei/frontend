import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./sidebar.css";

function IconNewChat() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      <line x1="12" y1="9" x2="12" y2="15" />
      <line x1="9" y1="12" x2="15" y2="12" />
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
  { q: "Can guests upload files?", a: "File attachments are available after signing in." },
];

export default function GuestSidebar({
  onNewChat,
  onCollapse,
}: {
  onNewChat: () => void;
  onCollapse: (collapsed: boolean) => void;
}) {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(true);
  const [showFaq, setShowFaq] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleToggleCollapse = () => {
    const next = !collapsed;
    setCollapsed(next);
    onCollapse(next);
    setShowFaq(false);
  };

  return (
    <div className={`sb-root${collapsed ? " sb-collapsed" : ""}`}>
      <div className="sb-header">
        {!collapsed && (
          <div className="sb-logo">
            <img
              src="/logo.png"
              alt="AS"
              style={{ width: 36, height: 36, objectFit: "contain" }}
              onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          </div>
        )}
        <button className="sb-collapse-btn" onClick={handleToggleCollapse}>
          {collapsed ? <IconExpand /> : <IconCollapse />}
        </button>
      </div>

      {!collapsed && (
        <>
          <div className="sb-top">
            <button className="sb-item" onClick={onNewChat}>
              <IconNewChat />
              <span>New chat</span>
            </button>
          </div>

          <div className="sb-bottom">
            <div className="sb-sep" />

            <div className="sb-guest-card">
              <button className="sb-login-btn" onClick={() => navigate("/login")}>Sign in</button>
            </div>

            <button className={`sb-item${showFaq ? " active" : ""}`} onClick={() => setShowFaq(prev => !prev)}>
              <span>FAQ</span>
              <IconFAQ />
            </button>

            {showFaq && (
              <div className="sb-sublist">
                {faqs.map((item, i) => (
                  <div key={item.q} className="sb-faq-item">
                    <button className="sb-faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                      <span>{item.q}</span>
                      <span className="sb-faq-arrow">{openFaq === i ? "▲" : "▼"}</span>
                    </button>
                    {openFaq === i && <p className="sb-faq-a">{item.a}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {collapsed && (
        <div className="sb-icon-rail">
          <button className="sb-icon-btn" title="New Chat" onClick={onNewChat}><IconNewChat /></button>
          <div className="sb-spacer" />
          <div className="sb-sep-sm" />
          <button className="sb-icon-btn" title="FAQ" onClick={handleToggleCollapse}><IconFAQ /></button>
        </div>
      )}
    </div>
  );
}
