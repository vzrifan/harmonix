import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Bot,
  User,
  Sparkles,
  Zap,
  Brain,
  Layers,
  RotateCcw,
  Play,
  Volume2,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';
import { NoteName } from '../types/music';

interface MaestroChatProps {
  onApplyVisualization: (type: 'scale' | 'chord', root: NoteName, name: string) => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  modelUsed?: string;
}

export const MaestroChat: React.FC<MaestroChatProps> = ({ onApplyVisualization }) => {
  // Available models matching user prompt:
  // gemini-4-argon (complex tasks), gemini-3.8-flash (general tasks), gemini-3.1-flash-lite (fast tasks)
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3.8-flash');

  // Specific role instruction
  const [selectedRole, setSelectedRole] = useState<string>('Conservatory Theory Professor');

  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'model',
      text: `Greetings! I am **Maestro AI**, your personal music theory professor and compositional guide. 

Whether you are deciphering jazz modal interchange, mastering the Circle of Fifths, analyzing Roman numeral chord progressions, or looking for the ideal scale to solo over a altered dominant chord, ask away!

Try one of the prompts below or ask any music theory question.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modelUsed: 'gemini-3.8-flash',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const starterPrompts = [
    'What scale should I solo with over an Altered C7#9 chord?',
    'Explain the tritone substitution for G7 resolving to Cmaj7',
    'How does negative harmony work for a C minor cadence?',
    'Give me a dreamy neo-soul chord progression in Eb major',
    'What is the difference between Dorian and Natural Minor?',
  ];

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputMessage;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Format history for backend Gemini API
      const formattedHistory = newHistory.slice(0, -1).map((m) => ({
        role: m.role,
        parts: [{ text: m.text }],
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.text,
          history: formattedHistory,
          model: selectedModel,
          customRole: selectedRole,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();

      const modelMessage: ChatMessage = {
        id: `msg-${Date.now()}-model`,
        role: 'model',
        text: data.reply || 'No answer received.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: data.modelUsed || selectedModel,
      };

      setMessages((prev) => [...prev, modelMessage]);
    } catch (err: any) {
      console.error(err);
      const errorMessage: ChatMessage = {
        id: `msg-${Date.now()}-err`,
        role: 'model',
        text: `*Maestro note*: An issue occurred while contacting the model (${err?.message || 'Network error'}). Please try again.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'model',
        text: `Conversation reset. Ready for your next harmony or composition inquiry!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: selectedModel,
      },
    ]);
  };

  // Helper to parse markdown and interactive tags like [VISUALIZE: {"type": "scale", "root": "D", "name": "Dorian"}]
  const renderMessageContent = (text: string) => {
    const visualizeRegex = /\[VISUALIZE:\s*(\{[^}]+\})\]/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = visualizeRegex.exec(text)) !== null) {
      // Push preceding text
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: text.substring(lastIndex, match.index),
        });
      }

      // Parse JSON tag
      try {
        const payload = JSON.parse(match[1]);
        parts.push({
          type: 'visualize',
          payload,
        });
      } catch (e) {
        parts.push({
          type: 'text',
          content: match[0],
        });
      }

      lastIndex = visualizeRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push({
        type: 'text',
        content: text.substring(lastIndex),
      });
    }

    return (
      <div className="space-y-2">
        {parts.map((p, idx) => {
          if (p.type === 'visualize') {
            const { type, root, name } = p.payload;
            return (
              <div key={idx} className="my-2 p-2 rounded-xl bg-indigo-950/70 border border-indigo-500/40 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
                  <span className="text-xs font-semibold text-white">
                    Explore in Visualizer: <span className="text-indigo-300 font-bold">{root} {name}</span> ({type})
                  </span>
                </div>
                <button
                  onClick={() => onApplyVisualization(type, root as NoteName, name)}
                  className="flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 text-xs font-semibold transition shadow-md cursor-pointer shrink-0"
                >
                  <Play className="h-3 w-3 fill-current" />
                  <span>Load & Play</span>
                </button>
              </div>
            );
          }

          // Format basic markdown paragraphs
          const lines = (p.content || '').split('\n');
          return (
            <div key={idx} className="space-y-1.5 leading-relaxed text-sm">
              {lines.map((line, lIdx) => {
                if (line.startsWith('### ')) {
                  return <h4 key={lIdx} className="font-bold text-white text-base mt-2">{line.replace('### ', '')}</h4>;
                }
                if (line.startsWith('## ')) {
                  return <h3 key={lIdx} className="font-bold text-indigo-300 text-lg mt-3">{line.replace('## ', '')}</h3>;
                }
                if (line.startsWith('# ')) {
                  return <h2 key={lIdx} className="font-extrabold text-white text-xl mt-3">{line.replace('# ', '')}</h2>;
                }
                if (line.startsWith('- ') || line.startsWith('* ')) {
                  return (
                    <li key={lIdx} className="ml-4 list-disc text-zinc-200">
                      {line.replace(/^[-*]\s+/, '')}
                    </li>
                  );
                }
                if (!line.trim()) {
                  return <div key={lIdx} className="h-1" />;
                }
                return <p key={lIdx} className="text-zinc-200">{line}</p>;
              })}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-[750px] rounded-2xl border border-zinc-800 bg-zinc-900/60 shadow-2xl backdrop-blur-sm overflow-hidden">
      {/* Chat Header with Model Selection & Roles */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-zinc-800 bg-zinc-950/60">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 shadow-md">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">Maestro AI</h3>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                Online
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Music Theory & Composition Tutor
            </p>
          </div>
        </div>

        {/* Model Switcher & Role Selector */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Model Selector */}
          <div className="flex items-center gap-1 rounded-xl bg-zinc-900 px-2 py-1 border border-zinc-700/80">
            <span className="text-[11px] font-semibold text-zinc-400">Model:</span>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
            >
              <option value="gemini-3.8-flash" className="bg-zinc-900 text-white">
                gemini-3.8-flash (General Tasks)
              </option>
              <option value="gemini-4-argon" className="bg-zinc-900 text-white">
                gemini-4-argon (Complex Counterpoint & Reasoning)
              </option>
              <option value="gemini-3.1-flash-lite" className="bg-zinc-900 text-white">
                gemini-3.1-flash-lite (Fast Lookup)
              </option>
            </select>
          </div>

          {/* Role Instruction Selector */}
          <div className="flex items-center gap-1 rounded-xl bg-zinc-900 px-2 py-1 border border-zinc-700/80">
            <span className="text-[11px] font-semibold text-zinc-400">Persona:</span>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
            >
              <option value="Conservatory Theory Professor" className="bg-zinc-900 text-white">
                Conservatory Professor
              </option>
              <option value="Jazz Improvisation Master & Bebop Coach" className="bg-zinc-900 text-white">
                Jazz Improvisation Coach
              </option>
              <option value="Modern Songwriter & Beatmaker Producer" className="bg-zinc-900 text-white">
                Songwriter & Producer Mentor
              </option>
            </select>
          </div>

          {/* Reset Thread Button */}
          <button
            onClick={handleClearHistory}
            className="flex items-center gap-1 rounded-lg bg-zinc-800 px-2.5 py-1.5 text-zinc-400 hover:text-white transition cursor-pointer"
            title="Reset conversation"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Scrollable Message Thread */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold shadow-md ${
                  isUser
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gradient-to-tr from-amber-500 to-indigo-600 text-white'
                }`}
              >
                {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-md ${
                  isUser
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-zinc-800/90 border border-zinc-700/70 text-zinc-100 rounded-tl-none'
                }`}
              >
                {/* Message Header */}
                <div className="flex items-center justify-between gap-3 mb-1">
                  <span className="text-[11px] font-bold opacity-80">
                    {isUser ? 'You' : 'Maestro AI'}
                  </span>
                  <div className="flex items-center gap-1.5 text-[10px] opacity-60">
                    {!isUser && msg.modelUsed && (
                      <span className="font-mono bg-zinc-900/60 px-1.5 py-0.2 rounded text-[9px]">
                        {msg.modelUsed}
                      </span>
                    )}
                    <span>{msg.timestamp}</span>
                  </div>
                </div>

                {/* Message Body */}
                <div className="text-sm">
                  {renderMessageContent(msg.text)}
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 text-white">
              <Bot className="h-4 w-4" />
            </div>
            <div className="rounded-2xl rounded-tl-none bg-zinc-800/90 border border-zinc-700/70 px-4 py-3 text-zinc-300">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce" />
                <div className="h-2 w-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.2s]" />
                <div className="h-2 w-2 rounded-full bg-indigo-300 animate-bounce [animation-delay:0.4s]" />
                <span className="text-xs text-zinc-400 ml-1">
                  Maestro is analyzing harmony with {selectedModel}...
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Starter Chips */}
      {messages.length <= 2 && (
        <div className="px-4 py-2 border-t border-zinc-800/80 bg-zinc-950/40">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-400 mb-2">
            <Sparkles className="h-3 w-3 text-amber-400" />
            <span>Suggested Questions:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {starterPrompts.map((prompt, pIdx) => (
              <button
                key={pIdx}
                onClick={() => handleSendMessage(prompt)}
                className="rounded-lg bg-zinc-800/80 hover:bg-zinc-700 px-2.5 py-1 text-xs text-zinc-300 border border-zinc-700 transition cursor-pointer text-left"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-4 border-t border-zinc-800 bg-zinc-950/80 flex items-center gap-2"
      >
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={`Ask Maestro about scales, chords, reharmonization (${selectedModel})...`}
          className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-inner"
        />
        <button
          type="submit"
          disabled={isLoading || !inputMessage.trim()}
          className="flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-white transition hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 cursor-pointer shadow-lg shadow-indigo-600/30"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
};
