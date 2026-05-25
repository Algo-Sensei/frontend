import { CodeArtifact } from "./types";

// codeParser.ts
export function extractCodeBlocks(text: string): {
  cleanText: string;
  code: CodeArtifact[];
} {
  const regex = /```(\w+)(?::([\w.-]+))?\n([\s\S]*?)```/g;
  const code: CodeArtifact[] = [];
  let cleanText = text;

  let match;
  while ((match = regex.exec(text))) {
    const lang = match[1] || "text";
    const ext = lang === "python" ? "py" : lang === "text" ? "txt" : lang;

    // try to infer filename from class name in code
    const classMatch = match[3].match(/(?:public\s+class|class|def)\s+(\w+)/);
    const inferredName = classMatch
      ? `${classMatch[1]}.${ext}`
      : `snippet-${code.length + 1}.${ext}`;

    const filename = match[2] || inferredName;

    code.push({
      language: lang,
      filename,
      code: match[3].trim(),
    });

    cleanText = cleanText.replace(match[0], "").trim();
  }

  return { cleanText, code };
}