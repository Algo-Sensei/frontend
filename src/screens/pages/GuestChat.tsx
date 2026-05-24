import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
// @ts-ignore: CSS side-effect import without type declarations
import "./AIChat.css";
import GuestSidebar from "../../components/ui/GuestSidebar";
import { extractCodeBlocks } from "../../components/chat-page-workspace/codeParser";
import ALWorkspace from "../../components/chat-page-workspace/ALWorkspace";
import { sendGuestReply, type OpenAIMessage } from "../../api";

const MAX_CHAT_INPUT_LENGTH = 10000;

type CodeArtifact = {
  language: string;
  filename: string;
  code: string;
  output?: string;
};

type Message = {
  id: string;
  role: "user" | "ai";
  text: string;
  time: string;
  code?: CodeArtifact[];
  animateText?: boolean;
};

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

function GuestInputBox({
  textareaRef,
  onInput,
  onKeyDown,
  onSend,
  onRequireLogin,
  canSend,
  isTyping,
}: {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  onInput: (e: React.FormEvent<HTMLTextAreaElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onSend: () => void;
  onRequireLogin: () => void;
  canSend: boolean;
  isTyping: boolean;
}) {
  return (
    <div className="ai-input-card" style={{ width: "100%", background: "#2e2e2e", borderRadius: "16px", border: "1px solid #3a3a3a", padding: "12px" }}>
      <div className="ai-input-row" style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
        <textarea
          ref={textareaRef}
          onKeyDown={onKeyDown}
          onInput={onInput}
          placeholder="Ask me about algorithms, data structures, complexity..."
          rows={1}
          maxLength={MAX_CHAT_INPUT_LENGTH}
          className="ai-textarea"
          disabled={isTyping}
          style={{ flex: 1, background: "none", border: "none", color: "#fff", fontSize: "16px", resize: "none" }}
        />
        <button
          onClick={onSend}
          disabled={!canSend || isTyping}
          className={`ai-send-btn${canSend && !isTyping ? " active" : ""}`}
          style={{ background: "none", border: "none", color: canSend ? "#fff" : "#555", cursor: canSend ? "pointer" : "default" }}
        >
          <IconSend />
        </button>
      </div>

      <div className="ai-divider" style={{ height: "1px", background: "#3a3a3a", margin: "12px 0" }} />

      <button
        className="ai-clip-btn"
        onClick={onRequireLogin}
        style={{ display: "flex", alignItems: "center", gap: "6px", background: "none", border: "none", color: "#888", cursor: "pointer", fontSize: "14px" }}
      >
        <IconClip />
        <span>Add photos</span>
      </button>
    </div>
  );
}

export default function GuestChat() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canSend, setCanSend] = useState(false);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [workspaceWidth, setWorkspaceWidth] = useState(480);
  const [activeCode, setActiveCode] = useState<CodeArtifact | null>(null);
  const [showVisualizer, setShowVisualizer] = useState(false);
  const [showGuestAttachmentModal, setShowGuestAttachmentModal] = useState(false);
  const historyRef = useRef<OpenAIMessage[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const splitRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const hasMessages = messages.length > 0;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isTyping]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
    el.style.overflowY = el.scrollHeight > 200 ? "auto" : "hidden";
    setCanSend(el.value.trim().length > 0);
  }, [hasMessages]);

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
    setWorkspaceOpen(false);
    setActiveCode(null);
    historyRef.current = [];
    resetTextarea();
  };

  const openWorkspace = (code: CodeArtifact) => {
    setActiveCode(code);
    setWorkspaceOpen(true);
    setShowVisualizer(false);
  };

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

  const send = async () => {
    const el = textareaRef.current;
    if (!el) return;

    const userContent = el.value.trim();
    if (!userContent || isTyping) return;

    setError(null);
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: "user",
      text: userContent,
      time: getTime(),
    }]);

    const previousHistory = historyRef.current;
    resetTextarea();
    setIsTyping(true);

    try {
      const { reply } = await sendGuestReply({
        content: userContent,
        history: previousHistory,
      });

      historyRef.current = [
        ...previousHistory,
        { role: "user", content: userContent },
        { role: "assistant", content: reply },
      ];

      const parsed = extractCodeBlocks(reply);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "ai",
        text: parsed.cleanText,
        time: getTime(),
        code: parsed.code,
        animateText: true,
      }]);
    } catch (err: any) {
      setError(err.message ?? "Something went wrong.");
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const handleTextareaInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
    el.style.overflowY = el.scrollHeight > 200 ? "auto" : "hidden";
    setCanSend(el.value.trim().length > 0);
  };

  return (
    <div
      className="ai-root"
      style={{
        position: "relative",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        background: "#1e1e1e",
        display: "flex",
        flexDirection: "row",
      }}
    >
      <GuestSidebar onNewChat={handleNewChat} onCollapse={() => {}} />

      <div className="ai-root" style={{ flex: 1, position: "relative", display: "flex", flexDirection: "column" }}>
        <div className="ai-split-layout" ref={splitRef}>
          <div className="ai-chat-pane">
            {!hasMessages ? (
              <div className="ai-empty" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <h1 className="ai-empty-title">Got any algorithm questions?</h1>
                <div style={{ width: "100%", maxWidth: 580 }}>
                  <GuestInputBox
                    textareaRef={textareaRef}
                    onKeyDown={handleKeyDown}
                    onInput={handleTextareaInput}
                    onSend={send}
                    onRequireLogin={() => setShowGuestAttachmentModal(true)}
                    canSend={canSend}
                    isTyping={isTyping}
                  />
                </div>
                {error && <p className="ai-error-text">{error}</p>}
              </div>
            ) : (
              <>
                <div className="ai-feed" style={{ flex: 1, overflowY: "auto", padding: "80px clamp(24px, 8%, 20%) 20px" }}>
                  {messages.map(msg => (
                    <div
                      key={msg.id}
                      className="ai-msg-row"
                      style={{
                        display: "flex",
                        justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                        marginBottom: "20px",
                        gap: "12px",
                      }}
                    >
                      {msg.role === "ai" && (
                        <div className="ai-avatar" style={{ width: "32px", height: "32px", background: "#e54d42", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" /></svg>
                        </div>
                      )}

                      <div style={{ display: "flex", flexDirection: "column", alignItems: msg.role === "user" ? "flex-end" : "flex-start", maxWidth: "80%" }}>
                        {msg.text && (
                          <div className={msg.role === "user" ? "ai-bubble-user" : "ai-bubble-ai"} style={{ padding: "12px 20px", borderRadius: "16px", background: msg.role === "user" ? "#3a3a3a" : "transparent", color: "#fff", fontSize: "14px", lineHeight: "1.5", border: msg.role === "ai" ? "1px solid #333" : "none" }}>
                            {msg.role === "ai" ? (
                              <AnimatedMessageText text={msg.text} animate={msg.animateText} />
                            ) : (
                              msg.text
                            )}
                          </div>
                        )}

                        {msg.code?.map((snippet, i) => (
                          <button
                            key={i}
                            className="ai-code-pill ai-code-pill-reveal"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              openWorkspace(snippet);
                            }}
                            style={{ background: "#2a2a2a", border: "1px solid #3a3a3a", borderRadius: "8px", padding: "12px 20px", marginTop: "10px", color: "#fff", width: "100%", textAlign: "left", cursor: "pointer", display: "flex", alignItems: "center", fontWeight: "500", animationDelay: `${i * 90}ms` }}
                          >
                            {snippet.filename}
                          </button>
                        ))}
                      </div>

                    </div>
                  ))}

                  {isTyping && (
                    <div className="ai-msg-row" style={{ justifyContent: "flex-start", gap: "12px" }}>
                      <div className="ai-avatar" style={{ width: "32px", height: "32px", background: "#e54d42", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" /></svg>
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
                    <GuestInputBox
                      textareaRef={textareaRef}
                      onKeyDown={handleKeyDown}
                      onInput={handleTextareaInput}
                      onSend={send}
                      onRequireLogin={() => setShowGuestAttachmentModal(true)}
                      canSend={canSend}
                      isTyping={isTyping}
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          {workspaceOpen && activeCode && (
            <>
              <div className="ai-resize-handle" role="separator" aria-orientation="vertical" aria-label="Resize workspace" onPointerDown={handleResizeStart} />
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
