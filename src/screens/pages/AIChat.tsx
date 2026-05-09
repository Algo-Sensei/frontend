import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
// @ts-ignore: CSS side-effect import without type declarations
import "./AIChat.css";
import Sidebar from "../../components/ui/sidebar";
import {
  fetchCurrentUser,
  fetchReply as fetchChatReply,
  uploadFile as uploadChatFile,
  type OpenAIMessage,
  type UserProfile,
} from "../../api";

type Message = { id: string; role: "user" | "ai"; text: string; time: string; attachment?: Attachment; };
type Attachment = { name: string; url: string; type: string; };

// -----------------
// API Config
// -----------------
const OPENAI_API_KEY = "sk-..."; // OpenAI API Key here
const MODEL = "gpt-4o"; // model you want to use

const SYSTEM_PROMPT = `You are AlgoSensei, an expert algorithm and data structures tutor.
You explain concepts clearly, analyze time/space complexity, and help with coding problems.
Keep responses concise but thorough. Use plain text — no markdown formatting.`;

function getTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
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

// ── Input box ────────────────────────────────────────────────────────────────
const InputBox = ({
  textareaRef,
  fileInputRef,
  onKeyDown,
  onSend,
  onFileChange,
  onRemovePreview,
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
  onSend: () => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemovePreview: () => void;
  canSend: boolean;
  isTyping: boolean;
  preview: Attachment | null;
  uploading: boolean;
  canAttachFiles: boolean;
  onRequireLogin: () => void;
}) => (
  <div className="ai-input-card">
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

    <div className="ai-input-row">
      <textarea
        ref={textareaRef}
        onKeyDown={onKeyDown}
        placeholder="Ask me about algorithms, data structures, complexity..."
        rows={1}
        maxLength={500}
        className="ai-textarea"
        disabled={isTyping || uploading}
      />
      <button
        onClick={onSend}
        disabled={!canSend || isTyping || uploading}
        className={`ai-send-btn${canSend && !isTyping && !uploading ? " active" : ""}`}
      >
        <IconSend />
      </button>
    </div>
    <div className="ai-divider" />
    <div className="ai-input-footer">
      {/* hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf,.txt,.md,.py,.js,.ts,.java,.cpp,.c"
        style={{ display: "none" }}
        onChange={onFileChange}
      />
      <button
        className={`ai-clip-btn${!canAttachFiles ? " disabled" : ""}`}
        onClick={() => {
          if (!canAttachFiles) {
            onRequireLogin();
            return;
          }
          fileInputRef.current?.click();
        }}
        disabled={uploading}
      >
        <IconClip />
        <span>
          {!canAttachFiles ? "Sign in to attach files" : uploading ? "Uploading..." : "Attach file"}
        </span>
      </button>
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
  const [user, setUser] = useState<UserProfile | null>(null);
  const [showGuestAttachmentModal, setShowGuestAttachmentModal] = useState(false);
  const historyRef = useRef<OpenAIMessage[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasMessages = messages.length > 0;
  const isGuest = !user;
  const transitionState = location.state as { fromHero?: boolean } | null;
  const enteredFromHero = Boolean(transitionState?.fromHero);

  useEffect(() => {
    fetchCurrentUser()
      .then(setUser)
      .catch(() => setUser(null));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    const handleInput = () => {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 200) + "px";
      el.style.overflowY = el.scrollHeight > 200 ? "auto" : "hidden";
      setCanSend(el.value.trim().length > 0 || preview !== null);
    };
    el.addEventListener("input", handleInput);
    return () => el.removeEventListener("input", handleInput);
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
    setMessages([]);
    setError(null);
    setPreview(null);
    historyRef.current = [];
    resetTextarea();
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
    // TODO: remove the try/catch stub once UPLOAD_URL is wired up
    setUploading(true);
    try {
      const remoteUrl = await uploadChatFile(file);
      // swap local blob URL for the real backend URL
      setPreview({ name: file.name, url: remoteUrl, type: file.type });
    } catch {
      // upload failed — keep local preview so user can still see it
      // the message will send with the local blob URL as fallback
    } finally {
      setUploading(false);
      // reset input so same file can be picked again
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

    // add user message with optional attachment
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: "user",
      text: trimmed || (preview ? `[Attached: ${preview.name}]` : ""),
      time: getTime(),
      attachment: preview ?? undefined,
    }]);

    const userContent = trimmed + (preview ? `\n[File attached: ${preview.name}]` : "");
    resetTextarea();
    setPreview(null);
    setIsTyping(true);

    historyRef.current.push({ role: "user", content: userContent });

    try {
      const reply = await fetchChatReply(historyRef.current, {
        apiKey: OPENAI_API_KEY,
        model: MODEL,
        systemPrompt: SYSTEM_PROMPT,
      });
      historyRef.current.push({ role: "assistant", content: reply });
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: "ai", text: reply, time: getTime() }]);
    } catch (err: any) {
      setError(err.message ?? "Something went wrong.");
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <div
      className={`ai-page-shell${enteredFromHero ? " ai-page-shell-enter" : ""}`}
      style={
        {
          position: "relative",
          height: "100vh",
          width: "100vw",
          overflow: "hidden",
          background: "#242424",
        } as React.CSSProperties
      }
    >
      {!isGuest && <Sidebar onNewChat={handleNewChat} onCollapse={() => {}} />}

      {isGuest && (
        <div className="ai-guest-topbar">
          <button className="ai-guest-signin-btn" onClick={() => navigate("/login")}>
            Sign in
          </button>
        </div>
      )}

      <div className={`ai-root${isGuest ? " ai-root-guest" : ""}${enteredFromHero ? " ai-root-enter" : ""}`}>
        {!hasMessages ? (
          <div className="ai-empty">
            <h1 className="ai-empty-title">Got any algorithm questions?</h1>
            <div style={{ width: "100%", maxWidth: 580 }}>
              <InputBox
                textareaRef={textareaRef}
                fileInputRef={fileInputRef}
                onKeyDown={handleKeyDown}
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
            <div className="ai-feed">
              <div style={{ flex: 1, minHeight: 0, width: "100%" }} />

              {messages.map(msg => (
                <div key={msg.id} className="ai-msg-row" style={{ justifyContent: msg.role === "user" ? "flex-end" : "flex-start", animation: "fadeUp 0.25s ease" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: msg.role === "user" ? "flex-end" : "flex-start", maxWidth: "68%" }}>
                    {/* show attachment above the text bubble */}
                    {msg.attachment && (
                      msg.attachment.type.startsWith("image/") ? (
                        <img src={msg.attachment.url} alt={msg.attachment.name} className="ai-msg-img" />
                      ) : (
                        <div className="ai-msg-file">{msg.attachment.name}</div>
                      )
                    )}
                    {msg.text && (
                      <div className={msg.role === "user" ? "ai-bubble-user" : "ai-bubble-ai"}>{msg.text}</div>
                    )}
                    <span className="ai-time">{msg.time}</span>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="ai-msg-row" style={{ justifyContent: "flex-start" }}>
                  <div className="ai-typing-bubble">
                    {[0, 0.2, 0.4].map((d, i) => <span key={i} className="ai-dot" style={{ animationDelay: `${d}s` }} />)}
                  </div>
                </div>
              )}

              {error && (
                <div className="ai-msg-row" style={{ justifyContent: "center" }}>
                  <p className="ai-error-text">{error}</p>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            <div className="ai-bottom-bar">
              <div style={{ width: "100%", maxWidth: 700 }}>
                <InputBox
                  textareaRef={textareaRef}
                  fileInputRef={fileInputRef}
                  onKeyDown={handleKeyDown}
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
