import React, { useState, useRef, useEffect } from 'react';
import { OddIdea, ChatMessage, ProposedRevision } from '../types';
import { 
  X, 
  Send, 
  Sparkles, 
  ArrowRight, 
  Check, 
  RotateCcw, 
  HelpCircle,
  Lightbulb,
  ShieldCheck,
  FlaskConical
} from 'lucide-react';
import { PipMascot } from './PipMascot';

interface ChallengeDrawerProps {
  idea: OddIdea;
  isOpen: boolean;
  onClose: () => void;
  onApplyRevision: (revision: ProposedRevision) => void;
}

const CONVERSATION_STARTERS = [
  'Why would anyone pay?',
  'Isn’t this just a chatbot?',
  'Make it ten times simpler.',
  'What breaks first?',
  'Defend the weird part.',
  'What would prove this wrong?',
];

export const ChallengeDrawer: React.FC<ChallengeDrawerProps> = ({
  idea,
  isOpen,
  onClose,
  onApplyRevision,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [appliedRevisionSummaries, setAppliedRevisionSummaries] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with Pip's opening greeting for this idea
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          sender: 'pip',
          text: `I'm standing by **${idea.name}**! Its core mechanism is unusual, but I believe it solves a real, recurring moment for ${idea.targetUserAndMoment.who}. Poke at the logic, challenge the willingness to pay, or tell me to make it simpler. I'll defend the strongest version or revise it if you find a flaw.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  }, [isOpen, idea.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  if (!isOpen) return null;

  const sendMessage = async (userText: string) => {
    if (!userText.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      sender: 'user',
      text: userText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputMessage('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat/challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea,
          messages: newMessages.map((m) => ({
            role: m.sender === 'user' ? 'user' : 'model',
            text: m.text,
          })),
          userMessage: userText,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Pip could not process the challenge.');
      }

      const pipMsg: ChatMessage = {
        id: 'msg_' + Date.now() + '_pip',
        sender: 'pip',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        proposedRevision: data.proposedRevision,
      };

      setMessages((prev) => [...prev, pipMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: 'err_' + Date.now(),
          sender: 'pip',
          text: `My thoughts hit a snag: ${err.message || 'Network hiccup'}. Could you try challenging me again?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = (revision: ProposedRevision) => {
    onApplyRevision(revision);
    setAppliedRevisionSummaries((prev) => [...prev, revision.summary]);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-900/40 backdrop-blur-xs flex justify-end animate-fade-in">
      <div 
        className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col border-l border-stone-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="challenge-title"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 bg-[#FAF8F5] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <PipMascot mood={loading ? 'thinking' : 'debating'} size="sm" />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-bold text-stone-900 text-sm">Pip</span>
                <span className="text-stone-300">·</span>
                <span className="text-xs text-stone-500 font-medium">Logic Companion</span>
              </div>
              <p id="challenge-title" className="text-xs text-stone-600 truncate max-w-[240px]">
                Debating: {idea.name}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200/50 transition-colors"
            aria-label="Close debate"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conversation Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            const isRevisionApplied =
              msg.proposedRevision &&
              appliedRevisionSummaries.includes(msg.proposedRevision.summary);

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <PipMascot mood="debating" size="sm" className="shrink-0 mt-0.5" />
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-4 leading-relaxed ${
                    isUser
                      ? 'bg-stone-900 text-white rounded-tr-xs'
                      : 'bg-[#FAF8F5] text-stone-800 border border-stone-200/80 rounded-tl-xs shadow-2xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  {/* Proposed Revision Action Banner */}
                  {msg.proposedRevision && (
                    <div className="mt-3 pt-3 border-t border-stone-200/60 bg-amber-50/70 p-3 rounded-xl border border-amber-200/60">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-900 mb-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        <span>Proposed Revision</span>
                      </div>
                      <p className="text-[11px] text-stone-700 mb-2.5">
                        {msg.proposedRevision.summary}
                      </p>

                      {isRevisionApplied ? (
                        <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
                          <Check className="w-3.5 h-3.5" />
                          <span>Revision applied to idea card!</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleApply(msg.proposedRevision!)}
                          className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white text-[11px] font-semibold rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>Apply revision</span>
                          <ArrowRight className="w-3 h-3 text-amber-300" />
                        </button>
                      )}
                    </div>
                  )}

                  <span
                    className={`block text-[10px] mt-1.5 text-right ${
                      isUser ? 'text-stone-400' : 'text-stone-400'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3 justify-start items-center">
              <PipMascot mood="thinking" size="sm" className="shrink-0 animate-pulse" />
              <div className="bg-[#FAF8F5] border border-stone-200/80 rounded-2xl px-4 py-3 text-stone-500 italic text-xs">
                Pip is testing the logic against reality...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Starters suggestions */}
        <div className="p-3 bg-[#FAF8F5]/80 border-t border-stone-200/70">
          <div className="text-[10px] uppercase tracking-wider font-semibold text-stone-500 mb-2 px-1">
            Suggested challenges:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {CONVERSATION_STARTERS.map((starter) => (
              <button
                key={starter}
                onClick={() => sendMessage(starter)}
                disabled={loading}
                className="px-2.5 py-1 text-[11px] text-stone-700 bg-white hover:bg-stone-100 border border-stone-200 rounded-lg transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50"
              >
                {starter}
              </button>
            ))}
          </div>
        </div>

        {/* Input box */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(inputMessage);
          }}
          className="p-3.5 sm:p-4 border-t border-stone-200 bg-white flex items-center gap-2"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Challenge Pip's logic or propose a tweak..."
            className="flex-1 px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white text-stone-900 placeholder:text-stone-400"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !inputMessage.trim()}
            className="p-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl shadow-2xs transition-colors disabled:opacity-40 cursor-pointer"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
