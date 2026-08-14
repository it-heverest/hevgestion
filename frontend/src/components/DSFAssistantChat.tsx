import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send, Bot, Loader2 } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import { useApp } from "../contexts/AppContext";
import { dsfAssistantService } from "../services/dsf-assistant.service";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
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
  },
} as const;

export function DSFAssistantChat() {
  const { language } = useApp();
  const copy = COPY[language] ?? COPY.fr;

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: copy.greeting },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const question = input.trim();
    if (!question || isLoading) return;

    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setInput("");
    setIsLoading(true);

    try {
      const { answer } = await dsfAssistantService.ask(question);
      setMessages((prev) => [...prev, { role: "assistant", content: answer }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: copy.unavailable },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {open && (
        <div
          className="fixed bottom-36 left-6 z-50 flex w-96 max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900"
          style={{ height: 480 }}
        >
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

          <ScrollArea className="flex-1 px-3 py-3">
            <div className="flex flex-col gap-2">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[85%] whitespace-pre-wrap rounded-lg px-3 py-2 text-sm ${
                    m.role === "user"
                      ? "self-end bg-blue-600 text-white"
                      : "self-start bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
                  }`}
                >
                  {m.content}
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

          <form
            onSubmit={handleSend}
            className="flex items-center gap-2 border-t border-gray-200 p-3 dark:border-gray-700"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={copy.placeholder}
              className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="rounded-lg bg-blue-600 p-2 text-white transition-colors hover:bg-blue-700 disabled:opacity-40"
              aria-label="Send"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        title={copy.tooltip}
        className="fixed bottom-20 left-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-colors hover:bg-blue-700"
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
