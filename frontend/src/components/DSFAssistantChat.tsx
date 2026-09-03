import { useEffect, useRef, useState } from "react";
import {
  MessageCircle,
  X,
  Send,
  Bot,
  Loader2,
  Paperclip,
  FileText,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ScrollArea } from "./ui/scroll-area";
import { useApp } from "../contexts/AppContext";
import { useFormulaPanel } from "../contexts/FormulaPanelContext";
import { dsfAssistantService } from "../services/dsf-assistant.service";

const ALLOWED_ATTACHMENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "application/pdf",
];
const MAX_ATTACHMENT_BYTES = 15 * 1024 * 1024; // 15MB

// Compact markdown rendering tuned for a narrow (420px) chat bubble: small
// type, tight spacing, and a scroll wrapper around tables so they don't
// blow out the bubble width.
const markdownComponents = {
  p: ({ ...props }) => <p className="mb-2 last:mb-0" {...props} />,
  ul: ({ ...props }) => (
    <ul className="mb-2 list-disc space-y-0.5 pl-4 last:mb-0" {...props} />
  ),
  ol: ({ ...props }) => (
    <ol className="mb-2 list-decimal space-y-0.5 pl-4 last:mb-0" {...props} />
  ),
  li: ({ ...props }) => <li {...props} />,
  strong: ({ ...props }) => <strong className="font-semibold" {...props} />,
  h1: ({ ...props }) => <p className="mb-1 font-semibold" {...props} />,
  h2: ({ ...props }) => <p className="mb-1 font-semibold" {...props} />,
  h3: ({ ...props }) => <p className="mb-1 font-semibold" {...props} />,
  a: ({ ...props }) => (
    <a
      className="underline underline-offset-2"
      target="_blank"
      rel="noreferrer"
      {...props}
    />
  ),
  code: ({ ...props }) => (
    <code
      className="rounded bg-black/10 px-1 py-0.5 text-[13px] dark:bg-white/10"
      {...props}
    />
  ),
  table: ({ ...props }) => (
    <div className="mb-2 overflow-x-auto last:mb-0">
      <table className="border-collapse text-xs" {...props} />
    </div>
  ),
  th: ({ ...props }) => (
    <th
      className="border border-gray-300 px-1.5 py-1 text-left font-semibold dark:border-gray-600"
      {...props}
    />
  ),
  td: ({ ...props }) => (
    <td
      className="border border-gray-300 px-1.5 py-1 dark:border-gray-600"
      {...props}
    />
  ),
};

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  attachmentName?: string;
  attachmentPreviewUrl?: string;
}

interface PendingAttachment {
  file: File;
  base64: string;
  mimeType: string;
  previewUrl: string;
}

const COPY = {
  fr: {
    title: "Assistant SYSCOHADA",
    subtitle: "Basé sur SYSCOHADA & fiscalité Cameroun",
    greeting:
      "Bonjour, je peux répondre à vos questions sur SYSCOHADA et la DSF. Que voulez-vous savoir ?",
    placeholder: "Poser une question SYSCOHADA…",
    unavailable:
      "Le service IA n'est pas encore connecté côté serveur. Cette fonctionnalité arrive bientôt.",
    tooltip: "Assistant SYSCOHADA",
    attach: "Joindre un document ou une image",
    attachTooLarge: "Le fichier est trop volumineux (15 Mo maximum).",
    attachUnsupported:
      "Type de fichier non supporté. Utilisez une image (JPEG, PNG, WEBP) ou un PDF.",
    removeAttachment: "Retirer la pièce jointe",
  },
  en: {
    title: "SYSCOHADA Assistant",
    subtitle: "Grounded in SYSCOHADA & Cameroon tax rules",
    greeting:
      "Hi, I can answer questions about SYSCOHADA and the DSF. What would you like to know?",
    placeholder: "Ask a SYSCOHADA question…",
    unavailable:
      "The AI service isn't wired up on the server yet. This feature is coming soon.",
    tooltip: "SYSCOHADA Assistant",
    attach: "Attach a document or image",
    attachTooLarge: "The file is too large (15MB maximum).",
    attachUnsupported: "Unsupported file type. Use an image (JPEG, PNG, WEBP) or a PDF.",
    removeAttachment: "Remove attachment",
  },
} as const;

export function DSFAssistantChat() {
  const { language } = useApp();
  // Décale le chatbot vers la gauche quand le panneau de formules (ancré à
  // droite, largeur 380px) est ouvert, pour ne jamais les superposer.
  const { isOpen: isFormulaPanelOpen } = useFormulaPanel();
  const rightOffsetClass = isFormulaPanelOpen ? "right-[404px]" : "right-6";
  const copy = COPY[language] ?? COPY.fr;

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: copy.greeting },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pendingAttachment, setPendingAttachment] =
    useState<PendingAttachment | null>(null);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const scrollBottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow selecting the same file again later
    if (!file) return;

    setAttachmentError(null);

    if (!ALLOWED_ATTACHMENT_TYPES.includes(file.type)) {
      setAttachmentError(copy.attachUnsupported);
      return;
    }
    if (file.size > MAX_ATTACHMENT_BYTES) {
      setAttachmentError(copy.attachTooLarge);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.slice(dataUrl.indexOf(",") + 1);
      setPendingAttachment({
        file,
        base64,
        mimeType: file.type,
        previewUrl: dataUrl,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const question = input.trim();
    if ((!question && !pendingAttachment) || isLoading) return;

    const historyForRequest = messages.slice(-10).map(({ role, content }) => ({
      role,
      content,
    }));
    const attachment = pendingAttachment
      ? {
          data: pendingAttachment.base64,
          mimeType: pendingAttachment.mimeType,
          name: pendingAttachment.file.name,
        }
      : undefined;

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: question,
        attachmentName: pendingAttachment?.file.name,
        attachmentPreviewUrl: pendingAttachment?.mimeType.startsWith("image/")
          ? pendingAttachment.previewUrl
          : undefined,
      },
    ]);
    setInput("");
    setPendingAttachment(null);
    setAttachmentError(null);
    setIsLoading(true);

    try {
      const { answer } = await dsfAssistantService.ask(
        question,
        historyForRequest,
        attachment,
      );
      setMessages((prev) => [...prev, { role: "assistant", content: answer }]);
    } catch (error: any) {
      const serverMessage = error?.response?.data?.message;
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: serverMessage || copy.unavailable },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {open && (
        <div className={`fixed bottom-24 ${rightOffsetClass} z-50 flex h-[640px] max-h-[80vh] w-[420px] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl transition-[right] duration-200 dark:border-gray-700 dark:bg-gray-900`}>
          <div className="flex items-center gap-2 bg-blue-600 px-4 py-3 text-white">
            <Bot className="h-5 w-5 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold leading-tight">
                {copy.title}
              </p>
              <p className="truncate text-xs text-blue-100">{copy.subtitle}</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded p-1 hover:bg-blue-700"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <ScrollArea className="min-h-0 flex-1 px-3 py-3">
            <div className="flex flex-col gap-2">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                    m.role === "user"
                      ? "self-end whitespace-pre-wrap bg-blue-600 text-white"
                      : "self-start bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
                  }`}
                >
                  {m.attachmentName && (
                    <div className="mb-1.5">
                      {m.attachmentPreviewUrl ? (
                        <img
                          src={m.attachmentPreviewUrl}
                          alt={m.attachmentName}
                          className="max-h-40 rounded-md border border-white/30 object-cover"
                        />
                      ) : (
                        <div className="flex items-center gap-1.5 rounded-md bg-white/10 px-2 py-1 text-xs">
                          <FileText className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{m.attachmentName}</span>
                        </div>
                      )}
                    </div>
                  )}
                  {m.role === "assistant" ? (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={markdownComponents}
                    >
                      {m.content}
                    </ReactMarkdown>
                  ) : (
                    m.content
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex items-center gap-1 self-start rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              )}
              <div ref={scrollBottomRef} />
            </div>
          </ScrollArea>

          <div className="border-t border-gray-200 dark:border-gray-700">
            {attachmentError && (
              <p className="px-3 pt-2 text-xs text-red-600 dark:text-red-400">
                {attachmentError}
              </p>
            )}
            {pendingAttachment && (
              <div className="flex items-center gap-2 px-3 pt-2">
                <div className="flex items-center gap-1.5 rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                  {pendingAttachment.mimeType.startsWith("image/") ? (
                    <img
                      src={pendingAttachment.previewUrl}
                      alt={pendingAttachment.file.name}
                      className="h-5 w-5 rounded object-cover"
                    />
                  ) : (
                    <FileText className="h-3.5 w-3.5 shrink-0" />
                  )}
                  <span className="max-w-[220px] truncate">
                    {pendingAttachment.file.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPendingAttachment(null)}
                    title={copy.removeAttachment}
                    className="ml-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
            <form onSubmit={handleSend} className="flex items-center gap-2 p-3">
              <input
                ref={fileInputRef}
                type="file"
                accept={ALLOWED_ATTACHMENT_TYPES.join(",")}
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title={copy.attach}
                className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                aria-label={copy.attach}
              >
                <Paperclip className="h-4 w-4" />
              </button>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={copy.placeholder}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />
              <button
                type="submit"
                disabled={(!input.trim() && !pendingAttachment) || isLoading}
                className="rounded-lg bg-blue-600 p-2 text-white transition-colors hover:bg-blue-700 disabled:opacity-40"
                aria-label="Send"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        title={copy.tooltip}
        className={`fixed bottom-6 ${rightOffsetClass} z-50 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-colors transition-[right] duration-200 hover:bg-blue-700`}
      >
        {open ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </button>
    </>
  );
}
