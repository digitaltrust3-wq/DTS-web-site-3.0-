import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import { LanguageProvider } from "./app/i18n/LanguageContext.tsx";
import { ChatProvider } from "./app/chat/ChatContext.tsx";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(
  <LanguageProvider>
    <ChatProvider>
      <App />
    </ChatProvider>
  </LanguageProvider>,
);
