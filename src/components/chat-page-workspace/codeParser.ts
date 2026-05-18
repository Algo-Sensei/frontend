import { CodeArtifact } from "./types";

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
    const filename = match[2] || `snippet-${code.length + 1}.${lang === 'text' ? 'txt' : lang}`;
    
    code.push({
      language: lang,
      filename: filename,
      code: match[3].trim(),
    });

    cleanText = cleanText.replace(match[0], "");
  }

  return {
    cleanText: cleanText.trim(),
    code,
  }
}