import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { ChatWidget } from "../components/shared/ChatWidget";

type ChatContextValue = {
  isOpen: boolean;
  /** Opens the assistant chat. `prompt`, if given, is sent automatically on a
   * fresh conversation, or just pre-filled into the input if one is already
   * in progress (so an ongoing chat is never interrupted). */
  openChat: (prompt?: string) => void;
  closeChat: () => void;
};

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const pendingPromptRef = useRef<string | null>(null);

  const openChat = useCallback((prompt?: string) => {
    if (prompt) pendingPromptRef.current = prompt;
    setIsOpen(true);
  }, []);

  const closeChat = useCallback(() => setIsOpen(false), []);

  const consumePendingPrompt = useCallback(() => {
    const prompt = pendingPromptRef.current;
    pendingPromptRef.current = null;
    return prompt;
  }, []);

  const value = useMemo<ChatContextValue>(() => ({ isOpen, openChat, closeChat }), [isOpen, openChat, closeChat]);

  return (
    <ChatContext.Provider value={value}>
      {children}
      <ChatWidget isOpen={isOpen} onClose={closeChat} consumePendingPrompt={consumePendingPrompt} />
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) throw new Error("useChat must be used within a ChatProvider");
  return context;
}
