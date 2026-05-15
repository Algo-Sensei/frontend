import { CodeArtifact } from "./types";

export function extractCodeBlocks(text: string): {
  cleanText: string;
  code: CodeArtifact[];
} {
  const regex = /```(\w+)?\n([\s\S]*?)```/g;

  const code: CodeArtifact[] = [];
  let cleanText = text;

  let match;
  while ((match = regex.exec(text))) {
    code.push({
      language: match[1] || "text",
      filename: `snippet-${code.length + 1}.${match[1] || "txt"}`,
      code: match[2].trim(),
    });

    cleanText = cleanText.replace(match[0], "");
  }

  return {
    cleanText: cleanText.trim(),
    code,
  }
}