import { useState, useRef, useEffect } from 'react';
import {
  LuBot,
  LuSparkles,
  LuSend,
  LuX,
  LuSettings,
  LuKey,
  LuTrash2,
  LuChevronDown,
  LuExternalLink,
  LuCheck,
  LuRefreshCw,
  LuUser,
  LuMessageSquare,
} from 'react-icons/lu';
import {
  getActiveApiKey,
  saveActiveApiKey,
  getSelectedModel,
  saveSelectedModel,
  sendChatMessage,
  GROQ_MODELS,
} from '../services/groqService';
import profilePhoto from '../assets/Modern Portfolio Portrait with Blue Geometric Accents.png';

const SUGGESTIONS = [
  "What is Irfan's tech stack?",
  "Tell me about Irfan's experience",
  'What projects has Irfan built?',
  'How can I get in touch with Irfan?',
];

function formatChatText(text) {
  if (!text) return '';

  const lines = text.split('\n');
  const cleanedLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Skip table separator line |---|---|
    if (/^\|[\s\-:|]+\|$/.test(line)) {
      continue;
    }

    // Convert markdown table rows into clean bullet text
    if (line.startsWith('|') && line.endsWith('|')) {
      const cells = line
        .split('|')
        .map((c) => c.trim())
        .filter((c) => c.length > 0);

      // Skip header row if it is just column names like "Layer | Technologies" or "Role | Description"
      const lower0 = cells[0]?.toLowerCase() || '';
      const lower1 = cells[1]?.toLowerCase() || '';
      if (
        (lower0.includes('layer') || lower0.includes('role') || lower0.includes('project') || lower0.includes('item')) &&
        (lower1.includes('tech') || lower1.includes('description') || lower1.includes('feature') || lower1.includes('detail'))
      ) {
        continue;
      }

      if (cells.length === 2) {
        cleanedLines.push(`• **${cells[0].replace(/\*\*/g, '')}**: ${cells[1]}`);
        continue;
      } else if (cells.length > 2) {
        cleanedLines.push(`• **${cells[0].replace(/\*\*/g, '')}** (${cells[1]}): ${cells.slice(2).join(' - ')}`);
        continue;
      } else if (cells.length === 1) {
        cleanedLines.push(`• ${cells[0]}`);
        continue;
      }
    }

    // Convert ### Header into **Header**
    const headerMatch = line.match(/^#{1,4}\s+(.+)$/);
    if (headerMatch) {
      cleanedLines.push(`**${headerMatch[1].replace(/\*\*/g, '')}**`);
      continue;
    }

    cleanedLines.push(lines[i]);
  }

  return cleanedLines.join('\n').replace(/\n{3,}/g, '\n\n');
}

function renderFormattedMessage(content, isUser) {
  if (!content) return null;
  if (isUser) {
    return <div className="text-xs leading-relaxed whitespace-pre-wrap">{content}</div>;
  }

  const cleanedText = formatChatText(content);
  const paragraphs = cleanedText.split('\n\n');

  return (
    <div className="space-y-2 text-xs leading-relaxed text-gray-200">
      {paragraphs.map((p, pIdx) => {
        const lines = p.split('\n');
        return (
          <div key={pIdx} className="space-y-1">
            {lines.map((line, lIdx) => {
              const parts = [];
              const regex = /(\*\*.*?\*\*|https?:\/\/[^\s]+|\[.*?\]\(.*?\))/g;
              let lastIndex = 0;
              let match;
              let keyIdx = 0;

              while ((match = regex.exec(line)) !== null) {
                if (match.index > lastIndex) {
                  parts.push(line.substring(lastIndex, match.index));
                }
                const token = match[0];
                if (token.startsWith('**') && token.endsWith('**')) {
                  parts.push(
                    <strong key={keyIdx++} className="font-semibold text-sky-300">
                      {token.slice(2, -2)}
                    </strong>
                  );
                } else if (token.startsWith('[') && token.includes('](')) {
                  const title = token.substring(1, token.indexOf(']('));
                  const url = token.substring(token.indexOf('](') + 2, token.length - 1);
                  parts.push(
                    <a
                      key={keyIdx++}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sky-400 underline hover:text-sky-300 font-medium"
                    >
                      {title}
                    </a>
                  );
                } else if (token.startsWith('http')) {
                  parts.push(
                    <a
                      key={keyIdx++}
                      href={token}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sky-400 underline hover:text-sky-300 break-all font-medium"
                    >
                      {token}
                    </a>
                  );
                }
                lastIndex = regex.lastIndex;
              }
              if (lastIndex < line.length) {
                parts.push(line.substring(lastIndex));
              }

              return (
                <div key={lIdx} className={line.startsWith('•') ? 'pl-1' : ''}>
                  {parts.length > 0 ? parts : line}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

export default function PortfolioChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [selectedModel, setSelectedModel] = useState(getSelectedModel());
  const [hasApiKey, setHasApiKey] = useState(false);
  const [keySavedMessage, setKeySavedMessage] = useState('');
  const [testStatus, setTestStatus] = useState(null); // null | 'testing' | 'success' | 'error'

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        "Hello! 👋 I'm Mohd Irfan's AI Assistant powered by Groq. Feel free to ask me anything about Irfan's background, full-stack skills, recent projects with video demos, or how to contact him!",
    },
  ]);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Check key on mount & open
  useEffect(() => {
    const key = getActiveApiKey();
    setHasApiKey(Boolean(key));
    setApiKeyInput(key);
  }, [isOpen, isSettingsOpen]);

  // Auto-scroll messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isSettingsOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, isSettingsOpen]);

  const handleSendMessage = async (customText = null) => {
    const textToSend = customText || inputMessage;
    if (!textToSend.trim() || isLoading) return;

    const currentKey = getActiveApiKey();
    if (!currentKey) {
      setMessages([
        ...messages,
        {
          role: 'assistant',
          content: '⚠️ AI assistant is currently offline. Please configure VITE_GROQ_API_KEY in your .env file.',
        },
      ]);
      return;
    }

    const newMessages = [...messages, { role: 'user', content: textToSend.trim() }];
    setMessages(newMessages);
    if (!customText) setInputMessage('');
    setIsLoading(true);

    try {
      const reply = await sendChatMessage(newMessages);
      setMessages([...newMessages, { role: 'assistant', content: reply }]);
    } catch (err) {
      console.error('Chat error:', err);
      const isMissingKey = err.message?.includes('MISSING_KEY');
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: isMissingKey
            ? '⚠️ AI assistant is currently offline. Please configure VITE_GROQ_API_KEY in your .env file.'
            : `⚠️ Oops! Encountered an error: ${err.message}.`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    saveActiveApiKey(apiKeyInput.trim());
    saveSelectedModel(selectedModel);
    setHasApiKey(Boolean(apiKeyInput.trim()));
    setKeySavedMessage('API Key & Model updated successfully!');
    setTestStatus(null);
    setTimeout(() => {
      setKeySavedMessage('');
      setIsSettingsOpen(false);
    }, 1200);
  };

  const handleTestConnection = async () => {
    if (!apiKeyInput.trim()) {
      alert('Please enter a Groq API key first.');
      return;
    }
    setTestStatus('testing');
    try {
      await sendChatMessage(
        [{ role: 'user', content: 'Respond with "Connection Successful"' }],
        apiKeyInput.trim()
      );
      setTestStatus('success');
      setHasApiKey(true);
      saveActiveApiKey(apiKeyInput.trim());
    } catch (err) {
      setTestStatus('error');
      alert(`Connection failed: ${err.message}`);
    }
  };

  const handleClearChat = () => {
    if (window.confirm('Reset conversation?')) {
      setMessages([
        {
          role: 'assistant',
          content:
            "Chat reset! Ask me anything about Irfan's engineering journey, skills, or projects.",
        },
      ]);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen && (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center gap-3 rounded-full bg-gradient-to-r from-blue-600 to-sky-500 p-4 text-white shadow-[0_4px_18px_rgba(0,112,255,0.3)] hover:shadow-[0_6px_22px_rgba(0,112,255,0.4)] hover:scale-105 active:scale-95 transition-all duration-300"
            aria-label="Open AI Chatbot"
          >
            <div className="relative flex items-center gap-2.5">
              <div className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/40 shadow-sm bg-blue-900/40">
                <img
                  src={profilePhoto}
                  alt="Mohd Irfan"
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="hidden sm:inline text-sm font-bold tracking-wide">
                Chat
              </span>
            </div>
          </button>
        )}
      </div>

      {/* Chat Window Modal */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-32px)] sm:w-[420px] h-[590px] max-h-[88vh] flex flex-col rounded-3xl bg-[#070b13]/95 backdrop-blur-2xl border border-sky-500/40 shadow-[0_12px_60px_rgba(0,112,255,0.4)] text-white overflow-hidden animate-scaleUp">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 px-4 sm:px-5 py-3.5 bg-gradient-to-r from-blue-950/60 via-slate-900/60 to-transparent">
            <div className="flex items-center gap-3">
              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-sky-400/80 shadow-[0_0_15px_rgba(0,112,255,0.5)]">
                <img
                  src={profilePhoto}
                  alt="Mohd Irfan"
                  className="h-full w-full object-cover"
                />
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-slate-950" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold tracking-tight text-white">
                    Irfan&apos;s AI Assistant
                  </h3>
                </div>
                <p className="text-[11px] text-gray-400">Online | Ask me anything</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Close Chat"
                className="flex h-8 w-8 items-center justify-center rounded-xl text-gray-400 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
              >
                <LuX className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Settings Overlay View */}
          {isSettingsOpen ? (
            <div className="flex-1 flex flex-col p-5 overflow-y-auto bg-black/60 backdrop-blur-lg animate-fadeIn">
              <div className="flex items-center gap-2 text-sky-400 mb-3">
                <LuKey className="h-4 w-4" />
                <h4 className="text-sm font-bold uppercase tracking-wider">
                  Groq API Key Settings
                </h4>
              </div>

              <p className="text-xs text-gray-300 mb-4 leading-relaxed">
                Connect your Groq Cloud API key to power instant responses using Llama 3 models.
              </p>

              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Groq API Key (starts with gsk_)
                  </label>
                  <input
                    type="password"
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    placeholder="gsk_..."
                    className="w-full rounded-xl border border-white/15 bg-black/80 px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400 font-mono"
                  />
                  <div className="flex items-center justify-between mt-1.5 text-[11px]">
                    <span className="text-gray-400">
                      {hasApiKey ? '✅ Key is active' : '⚠️ Key not provided'}
                    </span>
                    <a
                      href="https://console.groq.com/keys"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-sky-400 hover:underline"
                    >
                      <span>Get free key</span>
                      <LuExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    AI Model
                  </label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full rounded-xl border border-white/15 bg-black/80 px-3 py-2 text-xs text-white focus:border-sky-400 focus:outline-none"
                  >
                    {GROQ_MODELS.map((m) => (
                      <option key={m.id} value={m.id} className="bg-neutral-900 text-white">
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                {keySavedMessage && (
                  <div className="rounded-xl bg-emerald-500/15 border border-emerald-500/30 px-3 py-2 text-xs text-emerald-300">
                    {keySavedMessage}
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={testStatus === 'testing'}
                    className="flex-1 rounded-xl border border-white/15 px-3 py-2 text-xs font-semibold text-gray-300 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-50"
                  >
                    {testStatus === 'testing'
                      ? 'Testing...'
                      : testStatus === 'success'
                      ? 'Connection OK!'
                      : 'Test Key'}
                  </button>

                  <button
                    type="submit"
                    className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 px-4 py-2 text-xs font-semibold text-white shadow hover:from-blue-500 hover:to-sky-400 transition-all"
                  >
                    Save Key
                  </button>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-[11px] text-gray-400 space-y-1">
                  <p className="font-semibold text-gray-300">Tip: Environment Variable</p>
                  <p>
                    You can also store your key in <code className="text-sky-300">.env</code> as{' '}
                    <code className="text-sky-300">VITE_GROQ_API_KEY=gsk_...</code>.
                  </p>
                </div>
              </form>
            </div>
          ) : (
            /* Messages View */
            <div className="flex-1 flex flex-col justify-between overflow-hidden">
              {/* Scrollable messages container */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3.5">
                {/* Notice if no key configured */}
                {!hasApiKey && (
                  <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200 flex items-start gap-2.5">
                    <LuKey className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold">Groq API Key Required</p>
                      <p className="text-[11px] text-amber-300/90 mt-0.5">
                        Please configure your key in <code>.env</code> as <code>VITE_GROQ_API_KEY</code>.
                      </p>
                    </div>
                  </div>
                )}

                {messages.map((msg, idx) => {
                  const isUser = msg.role === 'user';
                  return (
                    <div
                      key={idx}
                      className={`flex items-start gap-2.5 ${
                        isUser ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {!isUser && (
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full border border-sky-400/50 bg-blue-900/30">
                          <img
                            src={profilePhoto}
                            alt="Mohd Irfan"
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}

                      <div
                        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed break-words ${
                          isUser
                            ? 'bg-gradient-to-r from-blue-600 to-sky-500 text-white rounded-br-sm shadow-[0_2px_12px_rgba(0,112,255,0.3)]'
                            : 'bg-white/5 border border-white/10 text-gray-200 rounded-bl-sm'
                        }`}
                      >
                        {renderFormattedMessage(msg.content, isUser)}
                      </div>

                      {isUser && (
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-gray-300 text-xs">
                          <LuUser className="h-3.5 w-3.5" />
                        </div>
                      )}
                    </div>
                  );
                })}

                {isLoading && (
                  <div className="flex items-start gap-2.5">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full border border-sky-400/50 bg-blue-900/30">
                      <img
                        src={profilePhoto}
                        alt="Mohd Irfan"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="rounded-2xl rounded-bl-sm bg-white/5 border border-white/10 px-4 py-2.5 text-xs text-gray-300 flex items-center gap-2">
                      <span className="flex gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-sky-400 animate-bounce" />
                        <span
                          className="h-1.5 w-1.5 rounded-full bg-sky-400 animate-bounce"
                          style={{ animationDelay: '0.15s' }}
                        />
                        <span
                          className="h-1.5 w-1.5 rounded-full bg-sky-400 animate-bounce"
                          style={{ animationDelay: '0.3s' }}
                        />
                      </span>
                      <span className="text-[11px] text-gray-400">Thinking...</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Suggestions Chips (shown when few messages) */}
              {messages.length <= 2 && !isLoading && (
                <div className="px-3 pb-2 pt-1 border-t border-white/5 bg-black/20">
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 mb-1.5 px-1">
                    Suggested Questions
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {SUGGESTIONS.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSendMessage(item)}
                        className="rounded-full bg-white/5 border border-white/10 px-2.5 py-1 text-[11px] text-gray-300 hover:bg-sky-500/20 hover:border-sky-400/40 hover:text-white transition-all text-left"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Chat Input Bar */}
              <div className="p-3 border-t border-white/10 bg-black/40">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder={
                      hasApiKey ? 'Ask about Irfan’s skills, projects...' : 'Ask a question...'
                    }
                    disabled={isLoading}
                    className="flex-1 rounded-xl border border-white/15 bg-black/60 px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400 disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || isLoading}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-[0_0_15px_rgba(0,112,255,0.4)] hover:from-blue-500 hover:to-sky-400 disabled:opacity-40 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                    aria-label="Send message"
                  >
                    <LuSend className="h-4 w-4" />
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
