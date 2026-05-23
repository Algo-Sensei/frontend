import React, { useState, useRef, useEffect, } from "react";
import { useLocation, useNavigate } from "react-router-dom";
// @ts-ignore: CSS side-effect import without type declarations
import "./AIChat.css";
import ReactMarkdown from 'react-markdown';
import Sidebar from "../../components/ui/sidebar";
import { extractCodeBlocks } from "../../components/chat-page-workspace/codeParser";
import ALWorkspace from "../../components/chat-page-workspace/ALWorkspace";
import { getRandomMockResponse } from "../../components/chat-page-workspace/mockResponse";
import {
  fetchCurrentUser,
  fetchChatMessages,
  fetchReply as fetchChatReply,
  sendAuthenticatedReply,
  uploadFile as uploadChatFile,
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

const SYSTEM_PROMPT = `You are AlgoSensei, an expert algorithm and data structures tutor.
You explain concepts clearly, analyze time/space complexity, and help with coding problems.
Keep responses concise but thorough. Use plain text — no markdown formatting.`;
const MAX_CHAT_INPUT_LENGTH = 10000;

function getTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function renderMessageText(text: string) {
  return text.split(/\n{2,}/).map((paragraph, index) => (
    <p
      key={`${paragraph.slice(0, 20)}-${index}`}
      style={{ margin: index === 0 ? 0 : "0 0 10px", lineHeight: "1.65", whiteSpace: "pre-wrap" }}
    >
      {paragraph}
    </p>
  ));
}

function AnimatedMessageText({
  text,
  animate,
}: {
  text: string;
  animate?: boolean;
}) {
  const [displayText, setDisplayText] = useState(animate ? "" : text);
  
  useEffect(() => {
    if (!animate) {
      setDisplayText(text);
      return;
    }

    let index = 0;
    const step = Math.max(1, Math.ceil(text.length / 80));
    setDisplayText("");

    const timer = window.setInterval(() => {
      index = Math.min(text.length, index + step);
      setDisplayText(text.slice(0, index));

      if (index >= text.length) {
        window.clearInterval(timer);
      }
    }, 18);

    return () => window.clearInterval(timer);
  }, [animate, text]);

  return (
    <div className={animate ? "ai-text-reveal" : undefined}>
      {renderMessageText(displayText)}
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
      <path d="M15 18l-6-6 6-6" stroke="#888" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
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
  textLength,
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
  textLength: number;
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
    
    <div style={{ textAlign: "right", fontSize: "12px", color: "#888", marginTop: "4px", paddingRight: "36px" }}>
      {textLength}/5000
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
          <span>Add photos</span>
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
  const [uploading, setUploading] = useState(false);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [workspaceWidth, setWorkspaceWidth] = useState(480);
  const [activeCode, setActiveCode] = useState<CodeArtifact | null>(null);
  const [showVisualizer, setShowVisualizer] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [showGuestAttachmentModal, setShowGuestAttachmentModal] = useState(false);
  const [textLength, setTextLength] = useState(0);
  const [authChecked, setAuthChecked] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);
  const [useSavedChatSession, setUseSavedChatSession] = useState(false);
  const historyRef = useRef<OpenAIMessage[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const splitRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasMessages = messages.length > 0;
  const allowsGuestMode = new URLSearchParams(location.search).get("mode") === "guest";
  const isGuest = authChecked && !user;
  const transitionState = location.state as { fromHero?: boolean } | null;
  const enteredFromHero = Boolean(transitionState?.fromHero);

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
    if (!authChecked) return;

    if (isGuest) {
      setUseSavedChatSession(false);
      return;
    }

    if (!activeChatId && messages.length === 0) {
      setUseSavedChatSession(false);
    }
  }, [activeChatId, authChecked, isGuest, messages.length]);

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
    setTextLength(0);
  };

  const handleNewChat = () => {
    setUseSavedChatSession(true);
    setActiveChatId(null);
    setMessages([]);
    setError(null);
    setPreview(null);
    historyRef.current = [];
    resetTextarea();
  };

  const handleDeleteChat = (chatId: string) => {
    if (activeChatId !== chatId) return;

    setUseSavedChatSession(false);
    setActiveChatId(null);
    setMessages([]);
    setError(null);
    setPreview(null);
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
    setUseSavedChatSession(true);
    setError(null);
    setPreview(null);
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

  // when user picks a file — show local preview immediately, then upload to backend
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
    setCanSend(true);

    // upload to backend in background
    setUploading(true);
    try {
      const remoteUrl = await uploadChatFile(file);
      // swap local blob URL for the real backend URL
      setPreview({ name: file.name, url: remoteUrl, type: file.type });
    } catch {
      // upload failed
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemovePreview = () => {
    setPreview(null);
    const el = textareaRef.current;
    setCanSend(el ? el.value.trim().length > 0 : false);
  };

  const send = async () => {
    const el = textareaRef.current;
    if (!el) return;
    const trimmed = el.value.trim();
    if ((!trimmed && !preview) || isTyping) return;

    setError(null);

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
    setIsTyping(true);

    historyRef.current.push({ role: "user", content: userContent });

    try {
      if (!isGuest && useSavedChatSession) {
        const response = await sendAuthenticatedReply({
          chatId: activeChatId,
          content: userContent,
          chatTitle: trimmed || "New chat",
        });
        setActiveChatId(response.chatId);
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

  const handleMockAI = () => {
    setIsTyping(true);
    setTimeout(() => {
      const mockResponse = getRandomMockResponse();
      const parsed = extractCodeBlocks(mockResponse);
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
      setIsTyping(false);
    }, 1000);
  };

  const handleTextareaInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
    el.style.overflowY = el.scrollHeight > 200 ? "auto" : "hidden";
    setCanSend(el.value.trim().length > 0 || preview !== null);
    setTextLength(el.value.length);
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
      className={`ai-page-shell${enteredFromHero ? " ai-page-shell-enter" : ""}`}
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
      {/* Top Navigation for Anonymous */}
      {isGuest && (
        <>
          <button
            className="ai-guest-back-btn"
            onClick={() => navigate("/landing")}
            aria-label="Back to landing page"
          >
            <IconBack />
          </button>

          <div className="ai-guest-topbar">
            <button className="ai-guest-signin-btn" onClick={() => navigate("/login")}>
              Sign in
            </button>
          </div>
        </>
      )}

      {!isGuest && (
        <Sidebar
          onNewChat={handleNewChat}
          onSelectChat={loadChat}
          onDeleteChat={handleDeleteChat}
          onCollapse={() => {}}
          historyRefreshKey={historyRefreshKey}
        />
      )}

      <div className={`ai-root${isGuest ? " ai-root-guest" : ""}${enteredFromHero ? " ai-root-enter" : ""}`} 
           style={{ flex: 1, position: "relative", display: "flex", flexDirection: "column" }}>
        <div className="ai-split-layout" ref={splitRef}>
          <div className="ai-chat-pane">
            {!hasMessages ? (
              <div className="ai-empty" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <h1 className="ai-empty-title">Got any algorithm questions?</h1>
                <div style={{ width: "100%", maxWidth: 580 }}>
                  <InputBox
                    textareaRef={textareaRef}
                    fileInputRef={fileInputRef}
                    onKeyDown={handleKeyDown}
                    onInput={handleTextareaInput}
                    onSend={send}
                    onFileChange={handleFileChange}
                    onRemovePreview={handleRemovePreview}
                    onMockAI={handleMockAI}
                    canSend={canSend}
                    isTyping={isTyping}
                    preview={preview}
                    uploading={uploading}
                    canAttachFiles={!isGuest}
                    onRequireLogin={() => setShowGuestAttachmentModal(true)}
                    textLength={textLength}
                  />
                </div>
                {error && <p className="ai-error-text">{error}</p>}
              </div>
            ) : (
              <>
                <div className="ai-feed" style={{ flex: 1, overflowY: "auto", padding: "80px clamp(24px, 8%, 20%) 20px" }}>
                  {messages.map(msg => (
                    <div key={msg.id} className="ai-msg-row" style={{ 
                      display: "flex",
                      justifyContent: msg.role === "user" ? "flex-end" : "flex-start", 
                      marginBottom: "20px",
                      gap: "12px"
                    }}>
                      {msg.role === "ai" && (
                        <div className="ai-avatar" style={{ 
                          width: "32px", height: "32px", background: "#e54d42", borderRadius: "8px", 
                          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 
                        }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>
                        </div>
                      )}
                      
                      <div style={{ display: "flex", flexDirection: "column", alignItems: msg.role === "user" ? "flex-end" : "flex-start", maxWidth: "80%" }}>
                        {msg.text && (
                          // AFTER
                        <div className={msg.role === "user" ? "ai-bubble-user" : "ai-bubble-ai"} style={{
                          padding: "12px 20px",
                          borderRadius: "16px",
                          background: msg.role === "user" ? "#3a3a3a" : "transparent",
                          color: "#fff",
                          fontSize: "14px",
                          lineHeight: "1.6",
                          border: msg.role === "ai" ? "1px solid #333" : "none"
                        }}>
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
                          <div className="ai-feedback" style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                            <button style={{ background: 'none', border: 'none', color: '#fff', opacity: 0.6, cursor: 'pointer', padding: '4px' }}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
                            </button>
                            <button style={{ background: 'none', border: 'none', color: '#fff', opacity: 0.6, cursor: 'pointer', padding: '4px' }}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zM17 2h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3"></path></svg>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {isTyping && (
                    <div className="ai-msg-row" style={{ justifyContent: "flex-start", gap: "12px" }}>
                      <div className="ai-avatar" style={{ 
                          width: "32px", height: "32px", background: "#e54d42", borderRadius: "8px", 
                          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 
                        }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>
                        </div>
                      <div className="ai-typing-bubble">
                        {[0, 0.2, 0.4].map((d, i) => <span key={i} className="ai-dot" style={{ animationDelay: `${d}s` }} />)}
                      </div>
                    </div>
                  )}

                  <div ref={bottomRef} />
                </div>

                <div className="ai-bottom-bar">
                  <div style={{ width: "calc(100% - 48px)", maxWidth: "700px" }}>
                  <InputBox
                    textareaRef={textareaRef}
                    fileInputRef={fileInputRef}
                    onKeyDown={handleKeyDown}
                    onInput={handleTextareaInput}
                    onSend={send}
                    onFileChange={handleFileChange}
                    onRemovePreview={handleRemovePreview}
                    onMockAI={handleMockAI}
                    canSend={canSend}
                    isTyping={isTyping}
                    preview={preview}
                    uploading={uploading}
                    canAttachFiles={!isGuest}
                    onRequireLogin={() => setShowGuestAttachmentModal(true)}
                    textLength={textLength}
                  />
                  </div>
                </div>
              </>
            )}
          </div>

          {workspaceOpen && activeCode && (
            <>
              <div
                className="ai-resize-handle"
                role="separator"
                aria-orientation="vertical"
                aria-label="Resize workspace"
                onPointerDown={handleResizeStart}
              />
              <div className="ai-workspace-pane" style={{ width: workspaceWidth }}>
                <ALWorkspace
                  code={activeCode}
                  showVisualizer={showVisualizer}
                  onVisualize={() => setShowVisualizer(true)}
                  onClose={() => setWorkspaceOpen(false)}
                />
              </div>
            </>
          )}
        </div>
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
