export type CodeArtifact = {
  language: string;
  filename: string;
  code: string;
  output?: string;
}

export type Message = { 
  id: string; 
  role: "user" | "ai"; 
  text: string; 
  time: string; 
  attachment?: Attachment;
  code?: CodeArtifact[];
};

export type OpenAIMessage = { 
  role: "system" | "user" | "assistant"; 
  content: string; 
};

export type Attachment = { 
  name: string; 
  url: string; 
  type: string; 
};

