import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
// @ts-ignore: CSS side-effect import without type declarations
import "./AIChat.css";
import ReactMarkdown from 'react-markdown';
import Sidebar from "../../components/ui/sidebar";
import { extractCodeBlocks } from "../../components/chat-page-workspace/codeParser";
import ALWorkspace from "../../components/chat-page-workspace/ALWorkspace";
import {
  fetchCurrentUser,
  fetchChatMessages,
  fetchReply as fetchChatReply,
  sendAuthenticatedReply,
  type ChatMessageItem,
  type OpenAIMessage,
  type UserProfile,
} from "../../api";

type CodeArtifact = {
  language: string;
  filename: string;
  code: string;
  output?: string;
}

type Message = { 
  id: string; 
  role: "user" | "ai"; 
  text: string; 
  time: string; 
  attachment?: Attachment;
  code?: CodeArtifact[];
  animateText?: boolean;
};

type Attachment = { 
  name: string; 
  url: string; 
  type: string; 
};

// -----------------
// API Config
// -----------------
const OPENAI_API_KEY = "sk-..."; // OpenAI API Key here
const MODEL = "gpt-4o"; // model you want to use
const ALGO_SENSEI_LOGO_SRC = "/AlgoSensieLogo.svg";

const SYSTEM_PROMPT = `You are AlgoSensei, an expert algorithm and data structures tutor.
You explain concepts clearly, analyze time/space complexity, and help with coding problems.
Keep responses concise but thorough. Use plain text — no markdown formatting.`;
const MAX_CHAT_INPUT_LENGTH = 10000;
const AUTH_GREETING_TEMPLATES = [
  "Welcome back, {name}. What algorithm are we untangling today?",
  "Welcome back, {name}. Ready to sharpen your problem-solving?",
  "Good to see you, {name}. What are we building clarity around today?",
  "Welcome back, {name}. Drop a problem and we'll crack it together.",
  "Back in the dojo, {name}. Which concept needs a clean walkthrough?",
  "Welcome back, {name}. Got a tricky bug or algorithm on your mind?",
];
function getTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function getFirstName(name?: string) {
  return name?.trim().split(/\s+/)[0] || "there";
}

function getGreetingParts(template: string) {
  const [beforeName, afterName = ""] = template.split("{name}");
  return { beforeName, afterName };
}

function ThinkingPanel() {
  return (
    <div className="ai-thinking-trace" aria-live="polite">
      <div className="ai-thinking-inline">
        <span className="ai-thinking-terminal-icon" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <rect x="3.25" y="4.25" width="17.5" height="15.5" rx="3.5" stroke="currentColor" strokeWidth="1.7" />
            <path d="M8 9.5L10.8 12L8 14.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12.5 15H16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
        </span>
        <span className="ai-thinking-copy">
          <span className="ai-thinking-label">Thinking</span>
          <span className="ai-thinking-pulse" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        </span>
      </div>
    </div>
  );
}

function IconClip() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.44 11.05l-9.19 9.19a4 4 0 0 1-5.66 0 4 4 0 0 1 0-5.66l9.19-9.19a2.5 2.5 0 0 1 3.53 3.53l-9.19 9.19a1.5 1.5 0 0 1-2.12 0 1.5 1.5 0 0 1 0-2.12l8.48-8.48" />
    </svg>
  );
}

function IconSend() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function IconX() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function IconBack() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AlgoSenseiAvatar() {
  return (
    <div className="ai-avatar ai-logo-avatar" aria-hidden="true">
      <img src={ALGO_SENSEI_LOGO_SRC} alt="" />
    </div>
  );
}

// ── Input box ────────────────────────────────────────────────────────────────
const InputBox = ({
  textareaRef,
  fileInputRef,
  onKeyDown,
  onInput,
  onSend,
  onFileChange,
  onRemovePreview,
  onMockAI,
  canSend,
  isTyping,
  preview,
  uploading,
  canAttachFiles,
  onRequireLogin,
}: {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onInput: (e: React.FormEvent<HTMLTextAreaElement>) => void;
  onSend: () => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemovePreview: () => void;
  onMockAI?: () => void;
  canSend: boolean;
  isTyping: boolean;
  preview: Attachment | null;
  uploading: boolean;
  canAttachFiles: boolean;
  onRequireLogin: () => void;
}) => (
  <div className="ai-input-card" style={{ width: '100%', background: '#2e2e2e', borderRadius: '16px', border: '1px solid #3a3a3a', padding: '12px' }}>
    {/* file preview strip */}
    {preview && (
      <div className="ai-preview-strip">
        {preview.type.startsWith("image/") ? (
          <img src={preview.url} alt={preview.name} className="ai-preview-img" />
        ) : (
          <span className="ai-preview-name">{preview.name}</span>
        )}
        <button className="ai-preview-remove" onClick={onRemovePreview}><IconX /></button>
      </div>
    )}

    <div className="ai-input-row" style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
      <textarea
        ref={textareaRef}
        onKeyDown={onKeyDown}
        onInput={onInput}
        placeholder="Ask me about algorithms, data structures, complexity..."
        rows={1}
        maxLength={MAX_CHAT_INPUT_LENGTH}
        className="ai-textarea"
        disabled={isTyping || uploading}
        style={{ flex: 1, background: 'none', border: 'none', color: '#fff', fontSize: '16px', resize: 'none' }}
      />
      <button
        onClick={onSend}
        disabled={!canSend || isTyping || uploading}
        className={`ai-send-btn${canSend && !isTyping && !uploading ? " active" : ""}`}
        style={{ background: 'none', border: 'none', color: canSend ? '#fff' : '#555', cursor: canSend ? 'pointer' : 'default' }}
      >
        <IconSend />
      </button>
    </div>
    
    <div className="ai-divider" style={{ height: '1px', background: '#3a3a3a', margin: '12px 0' }} />
    
    <div className="ai-input-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        {/* hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf,.txt,.md,.py,.js,.ts,.java,.cpp,.c"
          style={{ display: "none" }}
          onChange={onFileChange}
        />
        <button
          className="ai-clip-btn"
          onClick={() => {
            if (!canAttachFiles) {
              onRequireLogin();
              return;
            }
            fileInputRef.current?.click();
          }}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '14px' }}
        >
          <IconClip />
          <span>Add photos & files</span>
        </button>

        {onMockAI && (
          <button 
            onClick={onMockAI}
            style={{ background: '#3a3a3a', border: '1px solid #444', color: '#fff', padding: '4px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
          >
            Mock AI
          </button>
        )}
      </div>
    </div>
  </div>
);

export default function AIChat() {
  const navigate = useNavigate();
  const location = useLocation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canSend, setCanSend] = useState(false);
  const [preview, setPreview] = useState<Attachment | null>(null); // local preview before send
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [workspaceWidth, setWorkspaceWidth] = useState(480);
  const [activeCode, setActiveCode] = useState<CodeArtifact | null>(null);
  const [showVisualizer, setShowVisualizer] = useState(false);
  const [workspaceFullScreen, setWorkspaceFullScreen] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [showGuestAttachmentModal, setShowGuestAttachmentModal] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [hiddenRecentChatId, setHiddenRecentChatId] = useState<string | null>(null);
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);
  const [showAuthGreeting, setShowAuthGreeting] = useState(true);
  const [authGreetingTemplate] = useState(() => (
    AUTH_GREETING_TEMPLATES[Math.floor(Math.random() * AUTH_GREETING_TEMPLATES.length)]
  ));
  const historyRef = useRef<OpenAIMessage[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const splitRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasMessages = messages.length > 0;
  const allowsGuestMode = new URLSearchParams(location.search).get("mode") === "guest";
  const isGuest = authChecked && !user;
  const shouldShowAuthGreeting = Boolean(user && showAuthGreeting);
  const greetingName = getFirstName(user?.name);
  const greetingParts = getGreetingParts(authGreetingTemplate);
  const transitionState = location.state as { fromHero?: boolean } | null;
  const enteredFromHero = Boolean(transitionState?.fromHero);
  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate("/");
  };

  useEffect(() => {
    let cancelled = false;

    const resolveAuth = async () => {
      try {
        const currentUser = await fetchCurrentUser();
        if (cancelled) return;

        if (currentUser) {
          setUser(currentUser);
          setAuthChecked(true);
          return;
        }

        if (allowsGuestMode) {
          setUser(null);
          setAuthChecked(true);
          return;
        }

        navigate("/login", { replace: true });
      } catch {
        if (cancelled) return;

        if (allowsGuestMode) {
          setUser(null);
          setAuthChecked(true);
          return;
        }

        navigate("/login", { replace: true });
      }
    };

    void resolveAuth();

    return () => {
      cancelled = true;
    };
  }, [allowsGuestMode, navigate]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isTyping]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
    el.style.overflowY = el.scrollHeight > 200 ? "auto" : "hidden";
    setCanSend(el.value.trim().length > 0 || preview !== null);
  }, [hasMessages, preview]);

  // allow send if there's a file attached even with no text
  useEffect(() => {
    if (preview) setCanSend(true);
  }, [preview]);

  const resetTextarea = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.value = "";
    el.style.height = "auto";
    el.style.overflowY = "hidden";
    setCanSend(false);
  };

  const handleNewChat = () => {
    setShowAuthGreeting(false);
    setHiddenRecentChatId(null);
    setActiveChatId(null);
    setMessages([]);
    setError(null);
    setPreview(null);
    setPendingFile(null);
    historyRef.current = [];
    setHistoryRefreshKey((value) => value + 1);
    resetTextarea();
  };

  const handleDeleteChat = (chatId: string) => {
    if (activeChatId !== chatId) return;

    if (hiddenRecentChatId === chatId) {
      setHiddenRecentChatId(null);
    }
    setActiveChatId(null);
    setMessages([]);
    setError(null);
    setPreview(null);
    setPendingFile(null);
    historyRef.current = [];
    resetTextarea();
  };

  const getDisplayTime = (value?: string) => {
    if (!value) return getTime();
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? getTime()
      : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const mapStoredMessages = (items: ChatMessageItem[]): Message[] =>
    items.map((item, index) => {
      const parsed = item.role === "assistant" ? extractCodeBlocks(item.content) : null;
      const attachment =
        item.attachmentUrl
          ? {
              name: item.attachmentName || "Attachment",
              url: item.attachmentUrl,
              type: "",
            }
          : undefined;

      return {
        id: item.id || `${index}`,
        role: item.role === "assistant" ? "ai" : "user",
        text: item.role === "assistant" ? parsed?.cleanText ?? item.content : item.content,
        time: getDisplayTime(item.createdAt),
        attachment,
        code: item.role === "assistant" ? parsed?.code : undefined,
        animateText: false,
      };
    });

  const loadChat = async (chatId: string) => {
    setHiddenRecentChatId(null);
    setError(null);
    setPreview(null);
    setPendingFile(null);
    setUploading(false);
    resetTextarea();
    setIsTyping(true);

    try {
      const chatMessages = await fetchChatMessages(chatId);
      setActiveChatId(chatId);
      setMessages(mapStoredMessages(chatMessages));
      historyRef.current = chatMessages.map((message) => ({
        role: message.role,
        content: message.content,
      }));
    } catch (err: any) {
      setError(err.message ?? "Failed to load chat.");
    } finally {
      setIsTyping(false);
    }
  };

  const openWorkspace = (code: CodeArtifact) => {
    setActiveCode(code);
    setWorkspaceOpen(true);
    setWorkspaceFullScreen(false);
    setShowVisualizer(false);
  }

  const clampWorkspaceWidth = (nextWidth: number) => {
    const containerWidth = splitRef.current?.getBoundingClientRect().width ?? window.innerWidth;
    const minWorkspaceWidth = Math.min(360, Math.max(280, containerWidth - 320));
    const maxWorkspaceWidth = Math.max(minWorkspaceWidth, containerWidth / 2);
    return Math.min(Math.max(nextWidth, minWorkspaceWidth), maxWorkspaceWidth);
  };

  const handleResizeStart = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    const pointerId = e.pointerId;
    e.currentTarget.setPointerCapture(pointerId);

    const handlePointerMove = (event: PointerEvent) => {
      const bounds = splitRef.current?.getBoundingClientRect();
      if (!bounds) return;
      setWorkspaceWidth(clampWorkspaceWidth(bounds.right - event.clientX));
    };

    const stopResize = () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", stopResize);
      window.removeEventListener("pointercancel", stopResize);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", stopResize);
    window.addEventListener("pointercancel", stopResize);
  };

  // when user picks a file — keep a local preview and send the real file with the chat request
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isGuest) {
      setShowGuestAttachmentModal(true);
      return;
    }

    const file = e.target.files?.[0];
    if (!file) return;

    // show local preview right away
    const localUrl = URL.createObjectURL(file);
    setPreview({ name: file.name, url: localUrl, type: file.type });
    setPendingFile(file);
    setCanSend(true);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemovePreview = () => {
    setPreview(null);
    setPendingFile(null);
    const el = textareaRef.current;
    setCanSend(el ? el.value.trim().length > 0 : false);
  };

  const send = async () => {
    const el = textareaRef.current;
    if (!el) return;
    const trimmed = el.value.trim();
    if ((!trimmed && !preview) || isTyping) return;

    setError(null);
    const fileToSend = pendingFile;

    // add user message
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: "user",
      text: trimmed || (preview ? `[Attached: ${preview.name}]` : ""),
      time: getTime(),
      attachment: preview ?? undefined,
    }]);

    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    });

    const userContent = trimmed + (preview ? `\n[File attached: ${preview.name}]` : "");
    resetTextarea();
    setPreview(null);
    setPendingFile(null);
    setIsTyping(true);

    historyRef.current.push({ role: "user", content: userContent });

    try {
      if (!isGuest) {
        const isNewPersistedChat = !activeChatId;
        const response = await sendAuthenticatedReply({
          chatId: activeChatId,
          content: userContent,
          file: fileToSend,
          chatTitle: trimmed || "New chat",
        });
        setActiveChatId(response.chatId);
        if (isNewPersistedChat) {
          setHiddenRecentChatId(response.chatId);
        }
        setHistoryRefreshKey((value) => value + 1);
        historyRef.current.push({ role: "assistant", content: response.reply });

        const parsed = extractCodeBlocks(response.reply);

        setMessages(prev => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "ai",
            text: parsed.cleanText,
            time: getTime(),
            code: parsed.code,
            animateText: true,
          }
        ]);
        return;
      }

      const reply = await fetchChatReply(historyRef.current, {
        apiKey: OPENAI_API_KEY,
        model: MODEL,
        systemPrompt: SYSTEM_PROMPT,
      });

      historyRef.current.push({ role: "assistant", content: reply });

      const parsed = extractCodeBlocks(reply);

      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "ai",
          text: parsed.cleanText,
          time: getTime(),
          code: parsed.code,
          animateText: true,
        }
      ]);
      
    } catch (err: any) {
      setError(err.message ?? "Something went wrong.");
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };


  const handleTextareaInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
    el.style.overflowY = el.scrollHeight > 200 ? "auto" : "hidden";
    setCanSend(el.value.trim().length > 0 || preview !== null);
  };

  if (!authChecked) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#242424",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            border: "3px solid #444",
            borderTop: "3px solid #E24E40",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div
      className={`ai-root${enteredFromHero ? " ai-root-enter" : ""}`}
      style={{
        position: "relative",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        background: "#1e1e1e",
        display: "flex",
        flexDirection: "row"
      }}
    >
      {isGuest && (
        <button
          type="button"
          className="ai-guest-back-btn"
          onClick={handleBack}
          aria-label="Go back"
        >
          <IconBack />
        </button>
      )}

      {isGuest && (
        <div className="ai-guest-topbar">
          <button
            type="button"
            className="ai-guest-signin-btn"
            onClick={() => navigate("/login")}
          >
            Sign in
          </button>
        </div>
      )}

      {!isGuest && (
        <Sidebar
          onNewChat={handleNewChat}
          onSelectChat={loadChat}
          onDeleteChat={handleDeleteChat}
          onCollapse={() => {}}
          historyRefreshKey={historyRefreshKey}
          hiddenChatId={hiddenRecentChatId}
        />
      )}

      <div className={`ai-split-layout${workspaceFullScreen ? " ai-split-layout-workspace-full" : ""}`} ref={splitRef} style={{ flex: 1, minWidth: 0 }}>
          <div className={`ai-chat-pane${workspaceFullScreen ? " ai-chat-pane-hidden" : ""}`}>
            {!hasMessages ? (
              <div className={`ai-empty${!isGuest ? " ai-empty-auth" : ""}`} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <h1 className="ai-empty-title">
                  {shouldShowAuthGreeting ? (
                    <>
                      {greetingParts.beforeName}
                      <span className="ai-empty-title-name">{greetingName}</span>
                      {greetingParts.afterName}
                    </>
                  ) : (
                    ""
                  )}
                </h1>
                <div className="ai-empty-input-shell">
                  <InputBox
                    textareaRef={textareaRef}
                    fileInputRef={fileInputRef}
                    onKeyDown={handleKeyDown}
                    onInput={handleTextareaInput}
                    onSend={send}
                    onFileChange={handleFileChange}
                    onRemovePreview={handleRemovePreview}
                    canSend={canSend}
                    isTyping={isTyping}
                    preview={preview}
                    uploading={uploading}
                    canAttachFiles={!isGuest}
                    onRequireLogin={() => setShowGuestAttachmentModal(true)}
                  />
                </div>
                {error && <p className="ai-error-text">{error}</p>}
              </div>
            ) : (
              <>
                <div className="ai-feed ai-feed-chat">
                  {messages.map(msg => (
                    <div key={msg.id} className="ai-msg-row" style={{ 
                      display: "flex",
                      justifyContent: msg.role === "user" ? "flex-end" : "flex-start", 
                      marginBottom: "20px",
                      gap: "12px"
                    }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: msg.role === "user" ? "flex-end" : "flex-start", width: msg.role === "ai" ? "calc(100% - 16px)" : "auto", maxWidth: msg.role === "user" ? "80%" : "none" }}>
                        {msg.text && (
                          <div
                            className={msg.role === "user" ? "ai-bubble-user" : "ai-bubble-ai"}
                            style={{
                              padding: "12px 20px",
                              borderRadius: "16px",
                              background: msg.role === "user" ? "#3a3a3a" : "transparent",
                              color: "#fff",
                              fontSize: "14px",
                              lineHeight: "1.6",
                              border: msg.role === "ai" ? "1px solid #333" : "none"
                            }}
                          >
                            {msg.role === "ai" ? (
                              <ReactMarkdown
                                components={{
                                  p: ({ children }) => (
                                    <p style={{ margin: "0 0 10px", lineHeight: "1.65" }}>{children}</p>
                                  ),
                                  strong: ({ children }) => (
                                    <strong style={{ color: "#fff", fontWeight: 700 }}>{children}</strong>
                                  ),
                                  em: ({ children }) => (
                                    <em style={{ color: "#d4d0cb" }}>{children}</em>
                                  ),
                                  ul: ({ children }) => (
                                    <ul style={{ paddingLeft: "20px", margin: "8px 0" }}>{children}</ul>
                                  ),
                                  ol: ({ children }) => (
                                    <ol style={{ paddingLeft: "20px", margin: "8px 0" }}>{children}</ol>
                                  ),
                                  li: ({ children }) => (
                                    <li style={{ marginBottom: "4px", lineHeight: "1.6" }}>{children}</li>
                                  ),
                                  code: ({ children }) => (
                                    <code style={{
                                      background: "#1a1a1a",
                                      padding: "2px 6px",
                                      borderRadius: "4px",
                                      fontSize: "13px",
                                      fontFamily: "Consolas, Monaco, monospace",
                                      color: "#e06c75",
                                    }}>
                                      {children}
                                    </code>
                                  ),
                                  h1: ({ children }) => (
                                    <h1 style={{ fontSize: "18px", fontWeight: 700, margin: "12px 0 8px", color: "#fff" }}>{children}</h1>
                                  ),
                                  h2: ({ children }) => (
                                    <h2 style={{ fontSize: "16px", fontWeight: 700, margin: "10px 0 6px", color: "#fff" }}>{children}</h2>
                                  ),
                                  h3: ({ children }) => (
                                    <h3 style={{ fontSize: "14px", fontWeight: 700, margin: "8px 0 4px", color: "#e0dbd5" }}>{children}</h3>
                                  ),
                                  blockquote: ({ children }) => (
                                    <blockquote style={{
                                      borderLeft: "3px solid #e24e40",
                                      paddingLeft: "12px",
                                      margin: "8px 0",
                                      color: "#b0aca8",
                                      fontStyle: "italic",
                                    }}>
                                      {children}
                                    </blockquote>
                                  ),
                                }}
                              >
                                {msg.text}
                              </ReactMarkdown>
                            ) : (
                              msg.text
                            )}
                          </div>
                        )}

                        
                        {msg.code?.map((snippet, i) => (
                          <button
                            key={i}
                            className="ai-code-pill"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              openWorkspace(snippet);
                            }}
                            style={{
                              background: "#2a2a2a",
                              border: "1px solid #3a3a3a",
                              borderRadius: "8px",
                              padding: "12px 20px",
                              marginTop: "10px",
                              color: "#fff",
                              width: "100%",
                              textAlign: "left",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              fontWeight: "500"
                            }}
                          >
                            {snippet.filename}
                          </button>
                        ))}

                        {msg.role === "ai" && (
                          <div className="ai-feedback" style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "10px" }}>
                            <AlgoSenseiAvatar />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {isTyping && (
                    <div className="ai-msg-row" style={{ justifyContent: "flex-start", gap: "12px" }}>
                      <AlgoSenseiAvatar />
                      <div className="ai-typing-bubble">
                        <ThinkingPanel />
                      </div>
                    </div>
                  )}

                  <div ref={bottomRef} />
                </div>

                <div className="ai-bottom-bar">
                  <div className="ai-chat-content-width">
                  <InputBox
                    textareaRef={textareaRef}
                    fileInputRef={fileInputRef}
                    onKeyDown={handleKeyDown}
                    onInput={handleTextareaInput}
                    onSend={send}
                    onFileChange={handleFileChange}
                    onRemovePreview={handleRemovePreview}
                    canSend={canSend}
                    isTyping={isTyping}
                    preview={preview}
                    uploading={uploading}
                    canAttachFiles={!isGuest}
                    onRequireLogin={() => setShowGuestAttachmentModal(true)}
                  />
                  </div>
                </div>
              </>
            )}
          </div>

          {workspaceOpen && activeCode && (
            <>
              {!workspaceFullScreen && (
                <div
                  className="ai-resize-handle"
                  role="separator"
                  aria-orientation="vertical"
                  aria-label="Resize workspace"
                  onPointerDown={handleResizeStart}
                />
              )}
              <div
                className={`ai-workspace-pane${workspaceFullScreen ? " ai-workspace-pane-full" : ""}`}
                style={workspaceFullScreen ? undefined : { width: workspaceWidth }}
              >
                <ALWorkspace
                  code={activeCode}
                  showVisualizer={showVisualizer}
                  onVisualize={() => setShowVisualizer(true)}
                  onClose={() => {
                    setWorkspaceOpen(false);
                    setWorkspaceFullScreen(false);
                    setShowVisualizer(false);
                  }}
                  isFullScreen={workspaceFullScreen}
                  onToggleFullScreen={() => setWorkspaceFullScreen((value) => !value)}
                  onCloseVisualizer={() => setShowVisualizer(false)}
                />
              </div>
            </>
          )}
      </div>

      {showGuestAttachmentModal && (
        <div className="ai-modal-overlay" onClick={() => setShowGuestAttachmentModal(false)}>
          <div className="ai-modal-card" onClick={(e) => e.stopPropagation()}>
            <h2 className="ai-modal-title">Guest mode restriction</h2>
            <p className="ai-modal-text">File attachments are only available after you sign in.</p>
            <div className="ai-modal-actions">
              <button className="ai-modal-btn ai-modal-btn-secondary" onClick={() => setShowGuestAttachmentModal(false)}>
                Close
              </button>
              <button className="ai-modal-btn ai-modal-btn-primary" onClick={() => navigate("/login")}>
                Sign in
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
