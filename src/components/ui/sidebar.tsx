import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import "./sidebar.css";
import {
  deleteChat,
  fetchChatHistory,
  fetchCurrentUser,
  logoutUser,
  type ChatHistoryItem,
  type UserProfile,
} from "../../api";

type ActiveItem = "newchat" | "faq" | "settings" | null;
const SIDEBAR_AUTO_HIDE_MS = 3000;

function IconNewChat() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M0 0h24v24H0z" fill="none" />
      <g fill="currentColor">
        <path d="M13 3H1v17h6.529L6 23h2.245l1.528-3H23v-7h-2v5H3V5h10z" opacity=".5" />
        <path fillRule="evenodd" d="M20 3h-2v3h-3v2h3v3h2V8h3V6h-3z" clipRule="evenodd" />
      </g>
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

function IconMore() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <circle cx="5" cy="12" r="1.8" />
      <circle cx="12" cy="12" r="1.8" />
      <circle cx="19" cy="12" r="1.8" />
    </svg>
  );
}

function ProviderIcon({ provider }: { provider?: string }) {
  if (provider?.toUpperCase() === "GITHUB") {
    return (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.2 11.38.6.1.82-.26.82-.58 0-.28-.01-1.04-.02-2.03-3.34.73-4.04-1.42-4.04-1.42-.55-1.38-1.33-1.75-1.33-1.75-1.1-.75.08-.74.08-.74 1.2.09 1.84 1.24 1.84 1.24 1.08 1.84 2.82 1.31 3.5 1 .1-.78.42-1.31.76-1.61-2.67-.3-5.47-1.34-5.47-5.95 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.55.12-3.23 0 0 1.01-.32 3.3 1.23A11.5 11.5 0 0 1 12 5.8c1.02 0 2.05.14 3.01.41 2.28-1.55 3.29-1.23 3.29-1.23.66 1.68.24 2.93.12 3.23.77.84 1.24 1.91 1.24 3.22 0 4.62-2.8 5.64-5.48 5.94.43.38.82 1.12.82 2.26 0 1.63-.02 2.95-.02 3.35 0 .32.22.69.83.57A12 12 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
      </svg>
    );
  }

  return (
    <svg width="12" height="12" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#EA4335" d="M12 5c1.7 0 3.23.59 4.43 1.74l3.3-3.3C17.7 1.5 15.08.5 12 .5 7.31.5 3.26 3.2 1.28 7.14l3.84 2.98C6.02 7.07 8.79 5 12 5z" />
      <path fill="#4285F4" d="M23.5 12.27c0-.79-.08-1.55-.19-2.27H12v4.5h6.6c-.3 1.48-1.15 2.73-2.43 3.58l3.73 2.9c2.18-2.01 3.42-4.99 3.42-8.71z" />
      <path fill="#FBBC05" d="M5.12 14.38A6.97 6.97 0 0 1 4.75 12c0-.82.14-1.61.37-2.38L1.28 6.64A11.5 11.5 0 0 0 .5 12c0 1.84.44 3.57 1.22 5.14l3.4-2.76z" />
      <path fill="#34A853" d="M12 23.5c3.08 0 5.67-1.01 7.56-2.74l-3.73-2.9c-1.03.7-2.35 1.09-3.83 1.09-3.21 0-5.98-2.07-6.88-5.12l-3.4 2.76C3.26 20.8 7.31 23.5 12 23.5z" />
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
  onSelectChat,
  onDeleteChat,
  onCollapse,
  historyRefreshKey,
  hiddenChatId,
}: {
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void;
  onDeleteChat?: (chatId: string) => void;
  onCollapse: (collapsed: boolean) => void;
  historyRefreshKey: number;
  hiddenChatId?: string | null;
}) {
  const navigate = useNavigate();
  // starts collapsed so sidebar is closed on login
  const [collapsed, setCollapsed] = useState(true);
  const [active, setActive] = useState<ActiveItem>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [history, setHistory] = useState<ChatHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [openMenuChatId, setOpenMenuChatId] = useState<string | null>(null);
  const [deletingChatId, setDeletingChatId] = useState<string | null>(null);
  const sidebarRootRef = useRef<HTMLDivElement | null>(null);
  const settingsModalRef = useRef<HTMLDivElement | null>(null);
  const autoHideTimerRef = useRef<number | null>(null);

  // notify AIChat of initial collapsed state on mount
  useEffect(() => {
    onCollapse(true);
  }, [onCollapse]);

  useEffect(() => {
    fetchCurrentUser()
      .then(setUser)
      .catch(() => setUser(null));
  }, []);

  useEffect(() => {
    if (!user) return;
    setHistoryLoading(true);
    setHistoryError(null);
    fetchChatHistory()
      .then(data => setHistory(data))
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : "Could not load history.";
        setHistoryError(message);
      })
      .finally(() => setHistoryLoading(false));
  }, [user, historyRefreshKey]);

  useEffect(() => {
    const handleCloseMenu = () => setOpenMenuChatId(null);
    window.addEventListener("click", handleCloseMenu);
    return () => window.removeEventListener("click", handleCloseMenu);
  }, []);

  useEffect(() => {
    return () => {
      if (autoHideTimerRef.current !== null) {
        window.clearTimeout(autoHideTimerRef.current);
      }
    };
  }, []);

  const clearAutoHideTimer = useCallback(() => {
    if (autoHideTimerRef.current !== null) {
      window.clearTimeout(autoHideTimerRef.current);
      autoHideTimerRef.current = null;
    }
  }, []);

  const collapseSidebar = useCallback(() => {
    clearAutoHideTimer();
    setCollapsed(true);
    onCollapse(true);
    setActive(null);
    setOpenFaq(null);
    setOpenMenuChatId(null);
  }, [clearAutoHideTimer, onCollapse]);

  const scheduleAutoHide = useCallback((allowWhenExpanded = false) => {
    clearAutoHideTimer();

    if ((!allowWhenExpanded && collapsed) || showLogoutConfirm) return;

    autoHideTimerRef.current = window.setTimeout(() => {
      collapseSidebar();
    }, SIDEBAR_AUTO_HIDE_MS);
  }, [clearAutoHideTimer, collapsed, collapseSidebar, showLogoutConfirm]);

  const toggle = (item: ActiveItem) => {
    setActive(prev => prev === item ? null : item);
  };

  const toggleSettings = () => {
    clearAutoHideTimer();
    setOpenFaq(null);
    setActive(prev => prev === "settings" ? null : "settings");
  };

  const openLogoutConfirm = () => {
    clearAutoHideTimer();
    setActive(null);
    setOpenFaq(null);
    setShowLogoutConfirm(true);
  };

  const handleToggleCollapse = () => {
    const next = !collapsed;
    clearAutoHideTimer();
    setCollapsed(next);
    onCollapse(next);
    setActive(null);

    if (!next) {
      scheduleAutoHide(true);
    }
  };

  useEffect(() => {
    if (collapsed || showLogoutConfirm) return;

    const handleOutsidePress = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (!target) return;

      if (sidebarRootRef.current?.contains(target)) return;
      if (settingsModalRef.current?.contains(target)) return;

      if (active === "settings") {
        clearAutoHideTimer();
        setActive(null);
        setOpenFaq(null);
        return;
      }

      collapseSidebar();
    };

    document.addEventListener("mousedown", handleOutsidePress, true);
    document.addEventListener("touchstart", handleOutsidePress, true);

    return () => {
      document.removeEventListener("mousedown", handleOutsidePress, true);
      document.removeEventListener("touchstart", handleOutsidePress, true);
    };
  }, [active, clearAutoHideTimer, collapsed, collapseSidebar, showLogoutConfirm]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logoutUser();
    } finally {
      window.location.href = "/login?logged_out=1";
    }
  };

  const handleDeleteChat = async (chatId: string) => {
    setDeletingChatId(chatId);
    setHistoryError(null);

    try {
      await deleteChat(chatId);
      setHistory((current) => current.filter((chat) => chat.id !== chatId));
      setOpenMenuChatId(null);
      onDeleteChat?.(chatId);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to delete chat.";
      setHistoryError(message);
    } finally {
      setDeletingChatId(null);
    }
  };

  const visibleHistory = hiddenChatId
    ? history.filter((chat) => chat.id !== hiddenChatId)
    : history;
  const groups = ["Today", "Yesterday", "This week"];
  const userInitials = user?.name
    ?.split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join("") || "AS";
  const logoutModal = showLogoutConfirm ? createPortal(
    <div
      className="sb-modal-overlay"
      onClick={() => {
        if (!loggingOut) {
          setShowLogoutConfirm(false);
        }
      }}
    >
      <div className="sb-modal-card" onClick={(e) => e.stopPropagation()}>
        <h2 className="sb-modal-title">Log out?</h2>
        <p className="sb-modal-text">You’ll need to sign in again to continue your saved chats and account features.</p>
        <div className="sb-modal-actions">
          <button
            className="sb-modal-btn sb-modal-btn-secondary"
            onClick={() => setShowLogoutConfirm(false)}
            disabled={loggingOut}
          >
            Cancel
          </button>
          <button
            className="sb-modal-btn sb-modal-btn-primary"
            onClick={handleLogout}
            disabled={loggingOut}
          >
            {loggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  ) : null;
  const settingsModal = user && active === "settings" ? createPortal(
    <div
      ref={settingsModalRef}
      className="sb-settings-modal"
      onPointerEnter={clearAutoHideTimer}
      onPointerLeave={() => scheduleAutoHide()}
    >
      <div className="sb-setting-row">
        <span>Model</span>
        <span className="sb-setting-val">GPT-4o</span>
      </div>
      <button className="sb-settings-faq-title" type="button">
        <span>FAQ</span>
        <IconFAQ />
      </button>
      <div className="sb-settings-faq-list">
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
      <div className="sb-setting-row">
        <span>Logout</span>
        <button className="sb-danger-btn" onClick={openLogoutConfirm}>Logout</button>
      </div>
    </div>,
    document.body
  ) : null;
  return (
    <div
      ref={sidebarRootRef}
      className={`sb-root${collapsed ? " sb-collapsed" : ""}`}
      onPointerEnter={clearAutoHideTimer}
      onPointerLeave={() => scheduleAutoHide()}
      onFocusCapture={clearAutoHideTimer}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          scheduleAutoHide();
        }
      }}
    >

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
            <button
              className={`sb-item${active === "newchat" ? " active" : ""}`}
              onClick={() => {
                onNewChat();
                setActive(null);
              }}
            >
              <IconNewChat />
              <span>New chat</span>
            </button>

            {user && (
              <div className="sb-sublist">
                <p className="sb-history-placeholder">Recents</p>
                {historyLoading && <p className="sb-status">Loading...</p>}
                {historyError && <p className="sb-status sb-error">{historyError}</p>}
                {!historyLoading && !historyError && visibleHistory.length === 0 && (
                  <p className="sb-status">No history yet.</p>
                )}
                {!historyLoading && !historyError && groups.map(group => {
                  const items = visibleHistory.filter(c => c.date === group);
                  if (!items.length) return null;
                  return (
                    <div key={group}>
                      <span className="sb-group-label">{group}</span>
                      {items.map(chat => (
                        <div key={chat.id} className="sb-history-row">
                          <button
                            className="sb-history-item"
                            onClick={() => onSelectChat(chat.id)}
                          >
                            {chat.title}
                          </button>
                          <div className="sb-history-actions">
                            <button
                              className="sb-history-menu-btn"
                              aria-label={`More options for ${chat.title}`}
                              aria-haspopup="menu"
                              aria-expanded={openMenuChatId === chat.id}
                              onClick={(event) => {
                                event.stopPropagation();
                                setOpenMenuChatId((current) => current === chat.id ? null : chat.id);
                              }}
                            >
                              <IconMore />
                            </button>
                            {openMenuChatId === chat.id && (
                              <div
                                className="sb-history-menu"
                                role="menu"
                                onClick={(event) => event.stopPropagation()}
                              >
                                <button
                                  className="sb-history-menu-item sb-history-menu-item-danger"
                                  onClick={() => void handleDeleteChat(chat.id)}
                                  disabled={deletingChatId === chat.id}
                                >
                                  {deletingChatId === chat.id ? "Deleting..." : "Delete chat"}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="sb-bottom">
            <div className="sb-sep" />

            {!user && (
              <div className="sb-guest-card">
                <p className="sb-guest-title">Guest mode</p>
                <p className="sb-guest-text">Sign in to unlock visualization and file attachments.</p>
                <button className="sb-login-btn" onClick={() => navigate("/login")}>Sign in</button>
              </div>
            )}

            {user && (
              <>
                <div className="sb-profile-card">
                  <div className="sb-profile-main">
                    {user.profilePicture ? (
                      <img className="sb-profile-avatar" src={user.profilePicture} alt={user.name} />
                    ) : (
                      <div className="sb-profile-avatar sb-profile-fallback">{userInitials}</div>
                    )}
                    <div className="sb-profile-meta">
                      <p className="sb-profile-name">{user.name}</p>
                      <p className="sb-profile-email">{user.email}</p>
                      {user.loginProvider?.toUpperCase() === "GITHUB" && (
                        <p className="sb-profile-provider">
                          <ProviderIcon provider={user.loginProvider} />
                          <span>{user.loginProvider}</span>
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    className={`sb-profile-settings-btn${active === "settings" ? " active" : ""}`}
                    aria-label="Open account options"
                    onClick={toggleSettings}
                  >
                    <IconSettings />
                  </button>
                </div>

                {active === "settings" && <div className="sb-settings-anchor" aria-hidden="true" />}
              </>
            )}

            {!user && (
              <>
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
              </>
            )}
          </div>
        </>
      )}

      {collapsed && (
        <div className="sb-icon-rail">
          <button className="sb-icon-btn" title="New Chat" onClick={onNewChat}><IconNewChat /></button>
          <div className="sb-spacer" />
          {user && (
            <>
              <div className="sb-collapsed-bottom">
                <button
                  className="sb-collapsed-profile-btn"
                  title={user.name}
                  onClick={handleToggleCollapse}
                >
                  {user.profilePicture ? (
                    <img className="sb-collapsed-profile-avatar" src={user.profilePicture} alt={user.name} />
                  ) : (
                    <div className="sb-collapsed-profile-avatar sb-profile-fallback">{userInitials}</div>
                  )}
                </button>
              </div>
            </>
          )}
          {!user && (
            <>
              <div className="sb-sep-sm" />
              <button className="sb-icon-btn" title="FAQ" onClick={handleToggleCollapse}><IconFAQ /></button>
            </>
          )}
        </div>
      )}
      {settingsModal}
      {logoutModal}
    </div>
  );
}
