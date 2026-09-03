// src/types/assistant.types.ts
export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export interface ChatAttachment {
  /** Base64-encoded file content (no "data:...;base64," prefix). */
  data: string;
  mimeType: string;
  name?: string;
}
