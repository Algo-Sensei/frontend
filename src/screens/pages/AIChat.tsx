import React, { useState, useRef, useEffect } from "react";
// @ts-ignore: CSS side-effect import without type declarations
import "./AIChat.css";

type Message = { id: string; role: "user" | "ai"; text: string; time: string; };
type OpenAIMessage = { role: "system" | "user" | "assistant"; content: string; };

// -----------------
// API Config
// -----------------
const OPENAI_API_KEY = "sk-..."; // OpenAI API Key here
const OPENAI_API_URL = process.env.REACT_APP_API_URL + "/api/chat"; // backend endpoint
const MODEL = "gpt-4o"; // model you want to use

// System prompt sent to GPT
const SYSTEM_PROMPT = `You are AlgoSensei, an expert algorithm and data structures tutor.
You explain concepts clearly, analyze time/space complexity, and help with coding problems.
Keep responses concise but thorough. Use plain text — no markdown formatting.`;


function getTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// -----------------
// === API CALL ===
// -----------------
// this function is where the ChatGPT API will be called
async function fetchReply(history: OpenAIMessage[]): Promise<string> {
  // connect to ChatGPT API here
  // For now, this is a placeholder
  return "This is where the API response will appear.";
}

function IconClip() { return (<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a4 4 0 0 1-5.66 0 4 4 0 0 1 0-5.66l9.19-9.19a2.5 2.5 0 0 1 3.53 3.53l-9.19 9.19a1.5 1.5 0 0 1-2.12 0 1.5 1.5 0 0 1 0-2.12l8.48-8.48" /></svg>); }
function IconSend() { return (<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>); }

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canSend, setCanSend] = useState(false);
  const historyRef = useRef<OpenAIMessage[]>([]); //this stores the conversation history
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const hasMessages = messages.length > 0;

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isTyping]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    const handleInput = () => {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 200) + "px";
      el.style.overflowY = el.scrollHeight > 200 ? "auto" : "hidden";
      setCanSend(el.value.trim().length > 0);
    };
    el.addEventListener("input", handleInput);
    return () => el.removeEventListener("input", handleInput);
  }, []);

  const resetTextarea = () => {
    if (!textareaRef.current) return;
    textareaRef.current.value = "";
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.overflowY = "hidden";
    setCanSend(false);
  };

  const send = async () => {
    if (!textareaRef.current) return;
    const trimmed = textareaRef.current.value.trim();
    if (!trimmed || isTyping) return;

    setError(null);
    setMessages(prev => [...prev, { id: Date.now().toString(), role: "user", text: trimmed, time: getTime() }]);
    resetTextarea();
    setIsTyping(true);

    // add user's message to history
    historyRef.current.push({ role: "user", content: trimmed });

    try {
      // Call ChatGPT API here and get the assistant reply
      const reply = await fetchReply(historyRef.current);
      // Add assistant response to history
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

  const InputBox = () => (
    <div className="ai-input-card">
      <div className="ai-input-row">
        <textarea ref={textareaRef} onKeyDown={handleKeyDown} placeholder="Ask me about algorithms, data structures, complexity..." rows={1} maxLength={500} className="ai-textarea" disabled={isTyping} />
        <button onClick={send} disabled={!canSend || isTyping} className="ai-send-btn" style={{ opacity: canSend && !isTyping ? 1 : 0.4, cursor: canSend && !isTyping ? "pointer" : "default" }}><IconSend /></button>
      </div>
      <div className="ai-divider" />
      <div className="ai-input-footer">
        <button className="ai-clip-btn"><IconClip /><span>Attach file</span></button>
      </div>
    </div>
  );

  return (
    <div className="ai-root">
      {!hasMessages ? (
        <div className="ai-empty">
          <h1 className="ai-empty-title">Got any algorithm questions?</h1>
          <div style={{ width: "100%", maxWidth: 580 }}><InputBox /></div>
          {error && <p className="ai-error-text">{error}</p>}
        </div>
      ) : (
        <>
          <div className="ai-feed">
            {messages.map(msg => (
              <div key={msg.id} className="ai-msg-row" style={{ justifyContent: msg.role === "user" ? "flex-end" : "flex-start", animation: "fadeUp 0.25s ease" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: msg.role === "user" ? "flex-end" : "flex-start", maxWidth: "68%" }}>
                  <div className={msg.role === "user" ? "ai-bubble-user" : "ai-bubble-ai"}>{msg.text}</div>
                  <span className="ai-time">{msg.time}</span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="ai-msg-row" style={{ justifyContent: "flex-start" }}>
                <div className="ai-typing-bubble">
                  {[0,0.2,0.4].map((d,i)=><span key={i} className="ai-dot" style={{animationDelay:`${d}s`}} />)}
                </div>
              </div>
            )}

            {error && <div className="ai-msg-row" style={{ justifyContent: "center" }}><p className="ai-error-text">{error}</p></div>}

            <div ref={bottomRef} />
          </div>

          <div className="ai-bottom-bar"><div style={{ width: "100%", maxWidth: 700 }}><InputBox /></div></div>
        </>
      )}
    </div>
  );
}