import {
  StarsIcon,
  MessageSquare,
  Image as ImageIcon,
  FileText,
  Mic,
  Receipt,
  SendHorizonal,
  Paperclip,
  X,
  ChevronDown,
  LayoutGrid,
  Wand2,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useIsMobile } from "./hooks/useIsMobile";
import { useSearchParams } from "react-router-dom";

const API_BASE_URL = "http://localhost:8080";

type AppMode = "chat" | "image" | "document" | "audio" | "invoice";

interface Message {
  id: number;
  role: "user" | "model";
  prompt?: string;
  file?: File;
  thoughts?: string | null;
  answer?: string;
  jsonResponse?: string;
  mode: AppMode;
  isLoading?: boolean;
}

const TABS: { id: AppMode; name: string; icon: React.ElementType }[] = [
  { id: "chat", name: "Chat", icon: MessageSquare },
  { id: "image", name: "Image", icon: ImageIcon },
  { id: "document", name: "Document", icon: FileText },
  { id: "audio", name: "Audio", icon: Mic },
  { id: "invoice", name: "Invoice", icon: Receipt },
];

const Header = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get("tab") as AppMode) || "chat";
  const isMobile = useIsMobile();

  const setActiveTab = (tab: AppMode) => {
    searchParams.set("tab", tab);
    setSearchParams(searchParams);
  };

  if (isMobile) {
    return (
      <header className="px-4 py-3 ">
        <div className="relative">
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value as AppMode)}
            className="w-full bg-gray-800 border border-[var(--color-border)] rounded-lg p-2 text-[var(--color-text)] appearance-none pl-3 pr-10"
          >
            {TABS.map((tab) => (
              <option key={tab.id} value={tab.id}>
                {tab.name}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <ChevronDown className="w-4 h-4 text-[var(--color-text)]" />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="px-4 py-3  flex items-center">
      <div className="relative">
        <button
          className="flex items-center gap-2 text-[var(--color-text)] hover:bg-gray-800 p-2 rounded-lg"
          onClick={() =>
            document.getElementById("tabs-dropdown")?.classList.toggle("hidden")
          }
        >
          <LayoutGrid className="w-5 h-5" />
          <span>Tools</span>
          <ChevronDown className="w-4 h-4" />
        </button>

        <div
          id="tabs-dropdown"
          className="hidden absolute left-0 top-full mt-1 w-48 bg-gray-800 border border-[var(--color-border)] rounded-lg shadow-lg z-10"
        >
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                document
                  .getElementById("tabs-dropdown")
                  ?.classList.add("hidden");
              }}
              className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${
                activeTab === tab.id
                  ? "bg-blue-500/10 text-blue-400"
                  : "text-gray-300 hover:bg-gray-700"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.name}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};

const ChatInput = ({
  onSubmit,
  isLoading,
  centered = false,
}: {
  onSubmit: (prompt: string) => void;
  isLoading: boolean;
  centered?: boolean;
}) => {
  const isMobile = useIsMobile();
  const [prompt, setPrompt] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onSubmit(prompt);
      setPrompt("");
    }
  };

  return (
    <div className={`${centered ? "max-w-2xl mx-auto" : ""}`}>
      <form
        onSubmit={handleSubmit}
        className="relative bg-gray-800 border border-[var(--color-border)] rounded-xl sm:rounded-2xl"
      >
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          placeholder="Message Gemini..."
          className="w-full bg-transparent p-3 sm:p-4 pr-12 sm:pr-14 resize-none focus:ring-0 focus:outline-none text-[var(--color-text)] placeholder-gray-500 text-sm sm:text-base"
          rows={1}
        />
        <div className="absolute top-1/2 right-2 sm:right-3 -translate-y-1/2 flex items-center gap-1">
          <button
            type="submit"
            disabled={isLoading || !prompt.trim()}
            className="h-7 w-7 sm:h-9 sm:w-9 bg-[var(--color-accent)] text-white rounded-lg flex items-center justify-center disabled:bg-gray-600 disabled:text-gray-400 transition-colors"
          >
            {isLoading ? (
              <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <SendHorizonal className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </button>
        </div>
      </form>

      {isMobile && (
        <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Wand2 className="w-4 h-4" />
            <span>Gemini can make mistakes. Check important info.</span>
          </div>
        </div>
      )}
    </div>
  );
};

const FileInput = ({
  onSubmit,
  isLoading,
  mode,
  centered = false,
}: {
  onSubmit: (prompt: string, file: File) => void;
  isLoading: boolean;
  mode: AppMode;
  centered?: boolean;
}) => {
  const [prompt, setPrompt] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (file) {
      onSubmit(prompt, file);
      setPrompt("");
      setFile(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`bg-gray-800 border border-[var(--color-border)] rounded-xl sm:rounded-2xl p-3 sm:p-4 flex flex-col gap-2 sm:gap-3 ${
        centered ? "max-w-2xl mx-auto" : ""
      }`}
    >
      {file && (
        <div className="w-full flex items-center justify-between gap-2 p-2 bg-gray-700/50 border border-[var(--color-border)] rounded-md">
          <span className="text-xs sm:text-sm text-[var(--color-text)] truncate">
            {file.name}
          </span>
          <button
            type="button"
            onClick={() => setFile(null)}
            className="text-gray-400 hover:text-white flex-shrink-0"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      )}

      <div className="relative flex items-center gap-2 sm:gap-4">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="text-gray-400 hover:text-white flex items-center justify-center transition-colors"
        >
          <Paperclip className="w-7 h-7 sm:w-9 sm:h-9 p-1 sm:p-2 rounded-full border border-[var(--color-border)] bg-gray-800 text-gray-400" />
        </button>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={`Ask something about the ${mode}...`}
          className="w-full bg-transparent pr-16 sm:pr-24 resize-none focus:ring-0 focus:outline-none text-[var(--color-text)] placeholder-gray-500 text-sm sm:text-base"
          rows={1}
        />

        <div className="absolute top-1/2 right-0 -translate-y-1/2 flex items-center gap-2">
          <button
            type="submit"
            disabled={isLoading || !file}
            className="h-7 w-7 sm:h-9 sm:w-9 bg-[var(--color-accent)] text-white rounded-lg flex items-center justify-center disabled:bg-gray-600 disabled:text-gray-400 transition-colors"
          >
            {isLoading ? (
              <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <SendHorizonal className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

const WelcomeScreen = ({
  activeTab,
  onSubmit,
  isLoading,
  error,
}: {
  activeTab: AppMode;
  onSubmit: (prompt: string, file?: File) => void;
  isLoading: boolean;
  error: string;
}) => {
  return (
    <div className="h-full flex flex-col items-center justify-center px-2 sm:px-4">
      <div className="text-center mb-4 sm:mb-8">
        <div className="inline-block p-3 sm:p-4 bg-[var(--color-accent)] rounded-full mb-4 sm:mb-6">
          <StarsIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
        </div>
        <h1 className="text-xl sm:text-3xl font-semibold text-[var(--color-text)] mb-1 sm:mb-2">
          How can I help you today?
        </h1>
        <p className="text-gray-500 text-sm sm:text-base">
          Ask anything or pick a tool
        </p>
      </div>

      <div className="w-full max-w-2xl mt-4">
        {error && (
          <p className="text-xs sm:text-sm text-red-500 mb-2 sm:mb-4 text-center">
            {error}
          </p>
        )}

        {activeTab === "chat" ? (
          <ChatInput
            onSubmit={onSubmit}
            isLoading={isLoading}
            centered={true}
          />
        ) : (
          <FileInput
            onSubmit={(prompt, file) => onSubmit(prompt, file)}
            isLoading={isLoading}
            mode={activeTab}
            centered={true}
          />
        )}
      </div>
    </div>
  );
};

const ThoughtsCard = ({
  thoughts,
  isLoading,
}: {
  thoughts: string;
  isLoading: boolean;
}) => {
  const streamBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (streamBoxRef.current && isLoading) {
      const element = streamBoxRef.current;
      element.scrollTop = element.scrollHeight;
    }
  }, [thoughts, isLoading]);

  return (
    <div
      className={`transition-all duration-300 ${
        isLoading
          ? "bg-gray-800/50 border border-[var(--color-border)] rounded-xl sm:rounded-2xl overflow-hidden"
          : ""
      }`}
    >
      <details className="rounded-lg group" open={isLoading}>
        <summary
          className={`flex items-center gap-2 cursor-pointer list-none transition-all duration-300 ${
            isLoading
              ? "w-full p-3 sm:p-4 hover:bg-gray-800/70"
              : "w-fit py-1 px-2 sm:py-2 sm:px-3 rounded-full hover:bg-gray-800"
          }`}
        >
          {isLoading ? (
            <>
              <div className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 bg-gray-700 rounded-full">
                <svg
                  className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-300 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    className="opacity-25"
                  ></circle>
                  <path
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    className="opacity-75"
                  ></path>
                </svg>
              </div>
              <div className="flex-1">
                <span className="text-xs sm:text-sm font-medium text-[var(--color-text)]">
                  Thinking 3s
                </span>
              </div>
              <svg
                className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 transition-transform duration-200 group-open:rotate-180"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </>
          ) : (
            <>
              <span className="text-xs sm:text-sm font-semibold text-[var(--color-text)]">
                Show thinking
              </span>
              <svg
                className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 transition-transform duration-200 group-open:rotate-180"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </>
          )}
        </summary>

        <div
          className={`transition-all duration-300 ${
            isLoading ? "h-32 sm:h-40 overflow-hidden relative" : "h-auto mt-2"
          }`}
        >
          <div
            ref={streamBoxRef}
            className={`${
              isLoading
                ? "absolute inset-0 overflow-y-auto scrollbar-hide p-3 sm:p-4 pt-0"
                : "static overflow-visible p-2 sm:p-3"
            }`}
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            <div
              className={`prose prose-sm max-w-none ${
                isLoading
                  ? "animate-slide-up"
                  : "pl-2 sm:pl-4 border-l border-[var(--color-border)]"
              }`}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {thoughts}
              </ReactMarkdown>
            </div>
          </div>

          {isLoading && (
            <>
              <div className="absolute top-0 left-0 right-0 h-6 sm:h-8 bg-gradient-to-b from-[var(--color-bg)]/50 to-transparent pointer-events-none z-10" />
              <div className="absolute bottom-0 left-0 right-0 h-6 sm:h-8 bg-gradient-to-t from-[var(--color-bg)]/50 to-transparent pointer-events-none z-10" />
            </>
          )}
        </div>
      </details>
    </div>
  );
};

const UserPrompt = ({ prompt, file }: { prompt?: string; file?: File }) => (
  <div className="flex justify-end gap-2 sm:gap-4">
    <div className="pt-1.5 text-[var(--color-text)] max-w-[85%]">
      <p className="text-sm sm:text-base leading-relaxed border border-[var(--color-border)] px-3 py-2 rounded-b-xl rounded-tl-xl sm:rounded-b-3xl sm:rounded-tl-3xl">
        {prompt}
      </p>
      {file && (
        <div className="mt-1 text-xs text-gray-400 p-1 sm:p-2 border border-[var(--color-border)] rounded-md bg-gray-800">
          {file.name}
        </div>
      )}
    </div>
  </div>
);

const ModelResponse = ({
  thoughts,
  answer,
  jsonResponse,
  isLoading = false,
}: Omit<Message, "id" | "role" | "mode">) => {
  if (isLoading && !thoughts) {
    return (
      <div className="flex items-start gap-2 sm:gap-4">
        <div
          className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-[var(--color-accent)] flex-shrink-0 flex items-center justify-center text-white font-serif text-sm sm:text-lg"
          title="Gemini"
        >
          <StarsIcon className="w-3 sm:w-4 aspect-square" />
        </div>
        <div className="pt-1.5 text-[var(--color-text)] w-full flex flex-col gap-2 sm:gap-4">
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-500 rounded-full animate-pulse"></div>
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-500 rounded-full animate-pulse [animation-delay:0.2s]"></div>
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-500 rounded-full animate-pulse [animation-delay:0.4s]"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!thoughts && !answer && !jsonResponse) {
    return null;
  }

  return (
    <div className="flex items-start gap-2 sm:gap-4">
      <div className="text-[var(--color-text)] w-full flex flex-col gap-2 sm:gap-4">
        {thoughts && (
          <ThoughtsCard thoughts={thoughts} isLoading={isLoading && !answer} />
        )}

        {answer && (
          <div className="prose prose-sm max-w-none pl-2 sm:pl-3">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{answer}</ReactMarkdown>
          </div>
        )}

        {jsonResponse && (
          <pre className="p-2 sm:p-4 rounded-lg bg-gray-900 border border-[var(--color-border)] text-[var(--color-text)] font-mono text-xs overflow-x-auto whitespace-pre-wrap break-words">
            {jsonResponse}
          </pre>
        )}

        <div className="flex items-end justify-between pl-1 sm:pl-2 mt-1 sm:mt-3">
          <div
            className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-[var(--color-accent)] flex-shrink-0 flex items-center justify-center text-white font-serif text-sm sm:text-lg"
            title="Gemini"
          >
            <StarsIcon className="w-3 sm:w-4 aspect-square" />
          </div>
          <span className="text-xs text-gray-400 max-w-[70%] sm:max-w-none">
            Gemini can make mistakes. Please double-check the responses.
          </span>
        </div>
      </div>
    </div>
  );
};

function App() {
  const [searchParams] = useSearchParams();
  const activeTab = (searchParams.get("tab") as AppMode) || "chat";
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  const hasMessages = messages.length > 0;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleNewMessage = async (prompt: string, file?: File) => {
    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      prompt: prompt,
      file: file,
      mode: activeTab,
    };

    const modelMessagePlaceholder: Message = {
      id: Date.now() + 1,
      role: "model",
      isLoading: true,
      mode: activeTab,
    };

    setMessages((prev) => [...prev, userMessage, modelMessagePlaceholder]);
    setIsLoading(true);
    setError("");

    try {
      if (activeTab === "chat") {
        await handleChatSubmit(prompt);
      } else if (file) {
        await handleFileSubmit(prompt, file, activeTab);
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred.";
      setError(errorMessage);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === modelMessagePlaceholder.id
            ? { ...m, answer: `Error: ${errorMessage}`, isLoading: false }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const updateLastModelMessage = (update: Partial<Message>) => {
    setMessages((prev) =>
      prev.map((msg, index) => {
        if (index === prev.length - 1 && msg.role === "model") {
          return { ...msg, ...update };
        }
        return msg;
      })
    );
  };

  const handleChatSubmit = async (prompt: string) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    if (!response.ok)
      throw new Error(
        `Server error: ${response.status} ${response.statusText}`
      );

    const reader = response.body?.getReader();
    if (!reader) throw new Error("Could not get stream reader.");
    const decoder = new TextDecoder();
    let buffer = "";
    let currentThoughts = "";
    let currentAnswer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.trim() === "") continue;
        try {
          const data = JSON.parse(line);
          if (data.type === "thought") {
            currentThoughts += data.content;
            updateLastModelMessage({ thoughts: currentThoughts });
          } else if (data.type === "answer") {
            currentAnswer += data.content;
            updateLastModelMessage({
              thoughts: currentThoughts,
              answer: currentAnswer,
            });
          }
        } catch (error: unknown) {
          if (error instanceof SyntaxError) {
            console.error("Failed to parse JSON line:", line);
          }
        }
      }
    }

    updateLastModelMessage({ isLoading: false });
  };

  const handleFileSubmit = async (
    prompt: string,
    file: File,
    fileMode: AppMode
  ) => {
    const endpointMap: Record<AppMode, string> = {
      image: "/api/v1/media/image",
      document: "/api/v1/media/document",
      audio: "/api/v1/media/audio",
      invoice: "/api/v1/tools/extract-invoice",
      chat: "",
    };
    const endpoint = endpointMap[fileMode];
    if (!endpoint) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("prompt", prompt);

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      body: formData,
    });
    if (!response.ok) {
      const errData = await response.json();
      throw new Error(
        errData.message || `Server error: ${response.statusText}`
      );
    }
    const result = await response.json();

    if (fileMode === "invoice") {
      updateLastModelMessage({
        jsonResponse: JSON.stringify(result.output, null, 2),
        isLoading: false,
      });
    } else {
      updateLastModelMessage({ answer: result.output, isLoading: false });
    }
  };

  return (
    <div className="bg-[var(--color-bg)] text-[var(--color-text)] font-sans h-screen flex flex-col">
      <Header />
      <main className="flex-1 overflow-y-auto">
        {!hasMessages ? (
          <WelcomeScreen
            activeTab={activeTab}
            onSubmit={handleNewMessage}
            isLoading={isLoading}
            error={error}
          />
        ) : (
          <div className="p-2 sm:p-4 md:p-6">
            <div className="max-w-3xl mx-auto flex flex-col gap-4 sm:gap-8">
              {messages.map((msg) =>
                msg.role === "user" ? (
                  <UserPrompt
                    key={msg.id}
                    prompt={msg.prompt}
                    file={msg.file}
                  />
                ) : (
                  <ModelResponse
                    key={msg.id}
                    thoughts={msg.thoughts}
                    answer={msg.answer}
                    jsonResponse={msg.jsonResponse}
                    isLoading={msg.isLoading}
                  />
                )
              )}
              <div ref={chatEndRef} />
            </div>
          </div>
        )}
      </main>
      {hasMessages && (
        <footer className="px-2 sm:px-4 pb-2 sm:pb-4 bg-gray-900/80 backdrop-blur-sm ">
          <div className="max-w-3xl mx-auto">
            {error && (
              <p className="text-xs sm:text-sm text-red-500 mb-1 sm:mb-2">
                {error}
              </p>
            )}

            {activeTab === "chat" ? (
              <ChatInput onSubmit={handleNewMessage} isLoading={isLoading} />
            ) : (
              <FileInput
                onSubmit={(prompt, file) => handleNewMessage(prompt, file)}
                isLoading={isLoading}
                mode={activeTab}
              />
            )}
          </div>
        </footer>
      )}
    </div>
  );
}

export default App;
