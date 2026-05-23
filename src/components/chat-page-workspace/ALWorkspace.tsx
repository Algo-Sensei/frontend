import { useState, useRef, useEffect, type CSSProperties, type ReactNode } from "react";
import "./ALWorkspace.css";
import Visualizer from "./Visualizer";
import type { ExecutionFrame } from "./traceProgram";

type SyntaxToken = {
  text: string;
  type:
    | "annotation"
    | "boolean"
    | "class-name"
    | "comment"
    | "identifier"
    | "keyword"
    | "method"
    | "number"
    | "operator"
    | "punctuation"
    | "string"
    | "type"
    | "plain";
};

const javaKeywords = new Set([
  "abstract",
  "break",
  "case",
  "catch",
  "class",
  "const",
  "continue",
  "default",
  "do",
  "else",
  "extends",
  "final",
  "finally",
  "for",
  "if",
  "implements",
  "import",
  "instanceof",
  "interface",
  "native",
  "new",
  "package",
  "private",
  "protected",
  "public",
  "return",
  "static",
  "super",
  "switch",
  "synchronized",
  "this",
  "throw",
  "throws",
  "transient",
  "try",
  "void",
  "volatile",
  "while",
]);

const javaTypes = new Set([
  "boolean",
  "byte",
  "char",
  "double",
  "float",
  "int",
  "long",
  "short",
  "String",
  "Integer",
  "Double",
  "Float",
  "Boolean",
  "Character",
  "Object",
  "ArrayList",
  "List",
  "Map",
  "Set",
  "HashMap",
  "HashSet",
  "Queue",
  "Stack",
]);

const javaValues = new Set(["true", "false", "null"]);

const tokenClassName = (type: SyntaxToken["type"]) => `code-token code-token-${type}`;

const readQuotedToken = (line: string, start: number) => {
  const quote = line[start];
  let end = start + 1;

  while (end < line.length) {
    if (line[end] === "\\" && end + 1 < line.length) {
      end += 2;
      continue;
    }

    if (line[end] === quote) {
      end += 1;
      break;
    }

    end += 1;
  }

  return end;
};

const tokenizeCodeLine = (line: string, startsInBlockComment: boolean) => {
  const tokens: SyntaxToken[] = [];
  let index = 0;
  let inBlockComment = startsInBlockComment;

  const pushToken = (text: string, type: SyntaxToken["type"]) => {
    if (text) {
      tokens.push({ text, type });
    }
  };

  while (index < line.length) {
    if (inBlockComment) {
      const endComment = line.indexOf("*/", index);

      if (endComment === -1) {
        pushToken(line.slice(index), "comment");
        return { tokens, endsInBlockComment: true };
      }

      pushToken(line.slice(index, endComment + 2), "comment");
      index = endComment + 2;
      inBlockComment = false;
      continue;
    }

    const char = line[index];
    const nextChar = line[index + 1];

    if (char === "/" && nextChar === "/") {
      pushToken(line.slice(index), "comment");
      break;
    }

    if (char === "/" && nextChar === "*") {
      const endComment = line.indexOf("*/", index + 2);

      if (endComment === -1) {
        pushToken(line.slice(index), "comment");
        return { tokens, endsInBlockComment: true };
      }

      pushToken(line.slice(index, endComment + 2), "comment");
      index = endComment + 2;
      continue;
    }

    if (char === '"' || char === "'") {
      const end = readQuotedToken(line, index);
      pushToken(line.slice(index, end), "string");
      index = end;
      continue;
    }

    if (/\s/.test(char)) {
      const match = line.slice(index).match(/^\s+/);
      const text = match?.[0] ?? char;
      pushToken(text, "plain");
      index += text.length;
      continue;
    }

    if (char === "@") {
      const match = line.slice(index).match(/^@\w+/);
      const text = match?.[0] ?? char;
      pushToken(text, "annotation");
      index += text.length;
      continue;
    }

    if (/\d/.test(char)) {
      const match = line.slice(index).match(/^\d+(?:\.\d+)?(?:[dDfFlL])?/);
      const text = match?.[0] ?? char;
      pushToken(text, "number");
      index += text.length;
      continue;
    }

    if (/[A-Za-z_$]/.test(char)) {
      const match = line.slice(index).match(/^[A-Za-z_$][\w$]*/);
      const text = match?.[0] ?? char;
      const rest = line.slice(index + text.length);
      const nextNonSpace = rest.match(/^\s*(.)/)?.[1];
      const previousChar = line[index - 1];

      if (javaTypes.has(text)) {
        pushToken(text, "type");
      } else if (javaKeywords.has(text)) {
        pushToken(text, "keyword");
      } else if (javaValues.has(text)) {
        pushToken(text, "boolean");
      } else if (nextNonSpace === "(" && previousChar !== ".") {
        pushToken(text, "method");
      } else if (/^[A-Z]/.test(text)) {
        pushToken(text, "class-name");
      } else {
        pushToken(text, "identifier");
      }

      index += text.length;
      continue;
    }

    if (/[+\-*/%=!<>&|?:.]/.test(char)) {
      const match = line.slice(index).match(/^(?:===|!==|>>>|<<=|>>=|==|!=|<=|>=|\+\+|--|&&|\|\||<<|>>|\+=|-=|\*=|\/=|%=|->|::|[+\-*/%=!<>&|?:.])/);
      const text = match?.[0] ?? char;
      pushToken(text, "operator");
      index += text.length;
      continue;
    }

    if (/[()[\]{};,]/.test(char)) {
      pushToken(char, "punctuation");
      index += 1;
      continue;
    }

    pushToken(char, "plain");
    index += 1;
  }

  return { tokens, endsInBlockComment: inBlockComment };
};

const tokenizeCode = (lines: string[]) => {
  let inBlockComment = false;

  return lines.map((line) => {
    const result = tokenizeCodeLine(line, inBlockComment);
    inBlockComment = result.endsInBlockComment;
    return result.tokens;
  });
};

const renderHighlightedLine = (tokens: SyntaxToken[], lineNumber: number): ReactNode => {
  if (tokens.length === 0) {
    return " ";
  }

  return tokens.map((token, tokenIndex) => (
    <span className={tokenClassName(token.type)} key={`${lineNumber}-${tokenIndex}`}>
      {token.text}
    </span>
  ));
};

const ALWorkspace = ({ code, showVisualizer, onVisualize, onClose, isFullScreen, onToggleFullScreen, onCloseVisualizer }: any) => {
  const [activeLine, setActiveLine] = useState<number | null>(null);
  const [currentFrame, setCurrentFrame] = useState<ExecutionFrame | undefined>(undefined);
  const [copied, setCopied] = useState(false);
  const [traceExpanded, setTraceExpanded] = useState(false);
  const activeLineRef = useRef<HTMLDivElement | null>(null);

  const codeLines = code.code.split("\n");
  const highlightedCodeLines = tokenizeCode(codeLines);
  const fileName = code.filename || "Snippet.java";
  const traceSectionClassName = `workspace-section workspace-code-section${traceExpanded ? " expanded" : ""}`;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code.code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div
      className="workspace-panel"
      style={{
        height: "100%",
        display: "flex",
        left: "56px",
        flexDirection: "column",
        background: "#1e1e1e",
        color: "#fff",
        overflow: "hidden",
      }}
    >
      <div
        className="workspace-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "16px",
          padding: "20px 24px",
          flexShrink: 0,
          borderBottom: "1px solid #2f2f2f",
          background: "#252525",
          zIndex: 10,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <h2 style={{ margin: 0, fontSize: "24px", fontWeight: "bold" }}>AlgoSensei&apos;s Workspace</h2>
          <span style={{ fontSize: "14px", opacity: 0.75 }}>
            {fileName}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
          {!showVisualizer && (
            <button
              onClick={onVisualize}
              style={{
                background: "linear-gradient(135deg, rgba(229, 77, 66, 0.85) 0%, rgba(112, 36, 30, 0.95) 100%)",
                color: "#fff",
                border: "1px solid rgba(229, 77, 66, 0.5)",
                padding: "10px 16px",
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: "bold",
                boxShadow: "0 10px 26px rgba(229, 77, 66, 0.18)",
              }}
              >
              Visualize
            </button>
          )}
          <button
            onClick={onToggleFullScreen}
            aria-label={isFullScreen ? "Exit Full Screen" : "Full Screen"}
            title={isFullScreen ? "Exit Full Screen" : "Full Screen"}
            style={{
              background: "#2a2a2a",
              border: "1px solid #3a3a3a",
              color: "#fff",
              width: "38px",
              height: "38px",
              borderRadius: "8px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isFullScreen ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
              </svg>
            )}
          </button>
          <button
            onClick={onClose}
            aria-label="Close workspace"
            style={{
              background: "#2a2a2a",
              border: "1px solid #3a3a3a",
              color: "#fff",
              width: "38px",
              height: "38px",
              borderRadius: "8px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      <div
        className="workspace-content"
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          padding: "24px",
          display: "flex",
          flexDirection: isFullScreen ? "row" : "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "24px",
        }}
      >
        <section
          className={traceSectionClassName}
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            width: "100%",
            maxWidth: isFullScreen ? "none" : "700px",
            border: "1px solid #323232",
            borderRadius: "14px",
            overflow: "hidden",
            background: "#232323",
            flexShrink: 0,
            order: isFullScreen ? 1 : 2,
          }}
        >
          <div
            style={{
              padding: "14px 16px",
              borderBottom: "1px solid #343434",
              fontWeight: "bold",
              fontSize: "14px",
            }}
          >
            Code Trace
          </div>

          <div
            style={{
              background: "#121212",
              borderBottom: "1px solid #333",
              padding: "10px 16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "12px",
            }}
          >
            <span>{fileName}</span>
            <div className="workspace-code-toolbar">
              <button
                className="workspace-icon-button"
                type="button"
                onClick={handleCopyCode}
                aria-label="Copy code"
                title="Copy code"
              >
                {copied ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                )}
              </button>
              <button
                className="workspace-icon-button"
                type="button"
                onClick={() => setTraceExpanded((value) => !value)}
                aria-label={traceExpanded ? "Exit full code trace" : "Expand code trace"}
                title={traceExpanded ? "Exit full" : "Expand full"}
              >
                {traceExpanded ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="4 14 10 14 10 20" />
                    <polyline points="20 10 14 10 14 4" />
                    <line x1="14" y1="10" x2="21" y2="3" />
                    <line x1="3" y1="21" x2="10" y2="14" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 3 21 3 21 9" />
                    <polyline points="9 21 3 21 3 15" />
                    <line x1="21" y1="3" x2="14" y2="10" />
                    <line x1="3" y1="21" x2="10" y2="14" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div
            style={{
              padding: "10px 0",
              overflow: "auto",
              fontSize: "13px",
              lineHeight: "1.65",
              color: "#d4d4d4",
              fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
              background: "#161616",
              flex: 1,
            }}
          >
            {codeLines.map((lineText: string, idx: number) => {
              const lineNumber = idx + 1;
              const isHighlighted = showVisualizer && activeLine === lineNumber;
              const visibleCharacterCount = Math.max(lineText.length, 1);
              const lineDelay = Math.min(idx * 0.045, 2.2);
              const lineDuration = Math.min(Math.max(visibleCharacterCount * 0.012, 0.18), 1.1);
              const typingStyle = {
                "--line-chars": visibleCharacterCount,
                "--line-delay": `${lineDelay}s`,
                "--line-duration": `${lineDuration}s`,
              } as CSSProperties;

              return (
                <div
                  key={lineNumber}
                  ref={isHighlighted ? activeLineRef : null}
                  className={`workspace-code-line${isHighlighted ? " active" : ""}`}
                  style={{
                    "--line-delay": `${lineDelay}s`,
                  } as CSSProperties}
                >
                  <div
                   style={{
                      display: "grid",
                      gridTemplateColumns: "52px 1fr",
                      alignItems: "start",
                      backgroundColor: isHighlighted ? "rgba(229, 77, 66, 0.16)" : "transparent",
                      borderLeft: isHighlighted ? "3px solid #e54d42" : "3px solid transparent",
                      transition: "background-color 0.2s ease, border-left-color 0.2s ease",
                   }}
                  >
                    <div
                      style={{
                        padding: "0 12px 0 16px",
                        color: isHighlighted ? "#f1a197" : "#666",
                        textAlign: "right",
                        userSelect: "none",
                      }}
                    >
                      {lineNumber}
                    </div>
                    <div style={{ padding: "0 16px 0 0" }}>
                      <span className="workspace-code-text" style={typingStyle}>
                        {renderHighlightedLine(highlightedCodeLines[idx], lineNumber)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div
            style={{
              borderTop: "1px solid #333",
              padding: "14px 16px",
              background: "#1a1a1a",
            }}
          >
            <div style={{ fontWeight: "bold", marginBottom: "8px", fontSize: "13px" }}>Trace note</div>
            <div style={{ color: "#cfc3bf", fontSize: "13px", lineHeight: "1.5" }}>
              {currentFrame?.note ?? "Play the visualization to trace the active line and algorithm state."}
            </div>
          </div>
        </section>

        {showVisualizer && (
          <section
            className="workspace-section"
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              width: "100%",
              maxWidth: isFullScreen ? "none" : "700px",
              border: "1px solid #323232",
              borderRadius: "14px",
              overflow: "hidden",
              background: "#232323",
              flexShrink: 0,
              order: isFullScreen ? 2 : 1,
            }}
          >
            <div
              style={{
                padding: "14px 16px",
                borderBottom: "1px solid #343434",
                fontWeight: "bold",
                fontSize: "14px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              Visualize
              <button
                onClick={onCloseVisualizer}
                aria-label="Close visualizer"
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#888",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "4px"
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div style={{ padding: "14px", flex: 1, display: "flex", flexDirection: "column", overflowY: "auto" }}>
              <Visualizer
                code={code.code}
                onActiveLineChange={setActiveLine}
                onFrameChange={setCurrentFrame}
              />
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ALWorkspace;
