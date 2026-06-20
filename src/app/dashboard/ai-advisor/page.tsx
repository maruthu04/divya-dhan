'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, User, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const suggestedPrompts = [
  'Where am I overspending?',
  'Can I increase my SIP amount?',
  'How much emergency fund should I maintain?',
  'How can I save more money?',
  'Which expense category is highest?',
  'Am I on track for my financial goals?',
  'What is my debt-to-income ratio?',
  'Suggest ways to improve my health score',
];

export default function AIAdvisorPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const chatHistory = [...messages, userMsg].map(m => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: chatHistory }),
      });

      const data = await res.json();
      if (data.error) {
        setMessages(prev => [
          ...prev,
          { id: Date.now().toString(), role: 'assistant', content: `Error: ${data.error}` }
        ]);
      } else {
        setMessages(prev => [
          ...prev,
          { id: Date.now().toString(), role: 'assistant', content: data.content }
        ]);
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { id: Date.now().toString(), role: 'assistant', content: 'Failed to contact AI advisor. Please try again later.' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="animate-fade-in mb-4">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-ai/10 flex items-center justify-center">
            <Bot className="w-5 h-5 text-ai" />
          </div>
          AI Financial Advisor
        </h1>
        <p className="text-sm text-text-muted mt-1">Powered by your real financial data</p>
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-surface border border-border rounded-xl overflow-hidden flex flex-col animate-slide-up">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-ai/20 to-primary/20 flex items-center justify-center mb-4 animate-float">
                <Sparkles className="w-8 h-8 text-ai" />
              </div>
              <h2 className="text-lg font-semibold text-text mb-1">How can I help you today?</h2>
              <p className="text-sm text-text-muted mb-6 max-w-md">
                I analyze your real financial data to provide personalized advice. Ask me anything about your finances.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
                {suggestedPrompts.slice(0, 4).map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    className="flex items-start text-left text-sm text-text-secondary border border-border rounded-lg px-4 py-3 hover:bg-surface-hover hover:border-primary/30 transition-all group cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-ai mt-1 mr-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    <span>{prompt}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className={cn('flex gap-3', msg.role === 'user' && 'flex-row-reverse')}>
              <div className={cn(
                'flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center',
                msg.role === 'user' ? 'bg-primary/10' : 'bg-ai/10'
              )}>
                {msg.role === 'user' ? <User className="w-4 h-4 text-primary" /> : <Bot className="w-4 h-4 text-ai" />}
              </div>
              <div className={cn(
                'max-w-[80%] rounded-xl px-4 py-3 text-sm',
                msg.role === 'user'
                  ? 'bg-primary/10 text-text'
                  : 'bg-background border border-border text-text-secondary'
              )}>
                <div className="leading-relaxed space-y-1.5">
                  {msg.role === 'user' ? (
                    <div className="whitespace-pre-line">{msg.content}</div>
                  ) : (
                    parseMarkdown(msg.content)
                  )}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-ai/10 flex items-center justify-center">
                <Bot className="w-4 h-4 text-ai" />
              </div>
              <div className="bg-background border border-border rounded-xl px-4 py-3 flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-ai animate-spin" />
                <span className="text-sm text-text-muted">Analyzing your data...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested prompts row */}
        {messages.length > 0 && !isLoading && (
          <div className="px-4 py-2 border-t border-border overflow-x-auto flex gap-2">
            {suggestedPrompts.slice(4).map(prompt => (
              <button key={prompt} onClick={() => sendMessage(prompt)} className="flex-shrink-0 text-xs text-text-muted border border-border rounded-full px-3 py-1.5 hover:bg-surface-hover hover:text-text transition-colors whitespace-nowrap cursor-pointer">
                {prompt}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-border">
          <form
            onSubmit={e => { e.preventDefault(); sendMessage(input); }}
            className="flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask about your finances..."
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 bg-background border border-border rounded-lg text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-ai/50 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-2.5 bg-ai hover:bg-ai/90 text-background rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

const parseMarkdown = (text: string) => {
  const lines = text.split('\n');
  return lines.map((line, index) => {
    const cleanLine = line.replace(/\r$/, '');
    const trimmed = cleanLine.trim();

    // 1. Horizontal rule
    if (trimmed === '---') {
      return <hr key={index} className="my-3 border-t border-border" />;
    }

    // 2. Headings
    if (trimmed.startsWith('### ')) {
      return (
        <h3 key={index} className="text-sm font-bold text-text mt-3 mb-1 first:mt-0">
          {parseInline(trimmed.substring(4))}
        </h3>
      );
    }
    if (trimmed.startsWith('## ')) {
      return (
        <h2 key={index} className="text-base font-bold text-text mt-4 mb-1.5 first:mt-0">
          {parseInline(trimmed.substring(3))}
        </h2>
      );
    }
    if (trimmed.startsWith('# ')) {
      return (
        <h1 key={index} className="text-lg font-bold text-text mt-5 mb-2 first:mt-0">
          {parseInline(trimmed.substring(2))}
        </h1>
      );
    }

    // 3. Bullet list item
    if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
      const content = trimmed.substring(2);
      return (
        <div key={index} className="flex items-start gap-2 ml-2 my-1">
          <span className="w-1.5 h-1.5 rounded-full bg-ai mt-1.5 flex-shrink-0" />
          <span className="flex-1 text-sm text-text-secondary">{parseInline(content)}</span>
        </div>
      );
    }

    // 4. Numbered list item (e.g. "1. ")
    const numMatch = trimmed.match(/^(\d+)\.\s(.*)/);
    if (numMatch) {
      const num = numMatch[1];
      const content = numMatch[2];
      return (
        <div key={index} className="flex items-start gap-1.5 ml-2 my-1">
          <span className="text-xs font-bold text-ai mt-0.5 w-4 flex-shrink-0">{num}.</span>
          <span className="flex-1 text-sm text-text-secondary">{parseInline(content)}</span>
        </div>
      );
    }

    // 5. Empty space
    if (trimmed === '') {
      return <div key={index} className="h-2" />;
    }

    // 6. Regular paragraph
    return (
      <p key={index} className="text-sm text-text-secondary leading-relaxed my-0.5">
        {parseInline(cleanLine)}
      </p>
    );
  });
};

const parseInline = (text: string) => {
  const regex = /(\*\*.*?\*\*|\*.*?\*)/g;
  const segments = text.split(regex);
  return segments.map((seg, i) => {
    if (seg.startsWith('**') && seg.endsWith('**')) {
      return <strong key={i} className="font-bold text-text">{seg.slice(2, -2)}</strong>;
    }
    if (seg.startsWith('*') && seg.endsWith('*')) {
      return <em key={i} className="italic text-text-secondary">{seg.slice(1, -1)}</em>;
    }
    return seg;
  });
};
