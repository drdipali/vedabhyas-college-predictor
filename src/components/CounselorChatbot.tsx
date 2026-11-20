import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageCircle, 
  Send, 
  Bot, 
  X, 
  Sparkles, 
  Phone, 
  ExternalLink, 
  RefreshCw,
  Scale,
  Building2,
  FileText,
  CreditCard,
  UserCheck
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { getCurrentStudent } from '../data/mockStudents';
import { manualNotices, defaultCounsellingFeed } from '../data/counselling';
import type { StudentProfile, StudentPreference, CounsellingAlertsFeed } from '../types';
import { 
  generateGroundedCounselorAnswer, 
  type ScopeTopic 
} from '../lib/knowledgeBase';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  action?: {
    type: 'whatsapp' | 'college' | 'link';
    label: string;
    url?: string;
  };
}

interface CounselorChatbotProps {
  currentStudent?: StudentProfile | null;
  preferences?: StudentPreference[];
  feed?: CounsellingAlertsFeed;
}

const WHATSAPP_NUMBER = '8208506052';
const WHATSAPP_URL = `https://wa.me/91${WHATSAPP_NUMBER}?text=Hello%20Vedabhyas,%20I%20need%20expert%20AIAPGET%20counseling%20guidance%20for%20my%20rank.`;

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'welcome-1',
    sender: 'bot',
    text: `Namaste! 🙏 I am your **Vedabhyas AIAPGET 2026 Counselling Assistant**.\n\nI have complete access to:\n• **AACCC Central Rules:** Round 1 & 2 exit, security deposit refund, and the **latest Nov 20, 2026 circular**.\n• **State Counselling Guidelines:** Domicile criteria, bonds, and quotas for 13+ states.\n• **Counselling Strategy & Documents:** Mandatory reporting certificates and choice filling.\n\nSelect a topic above or ask any question!`,
    timestamp: 'Just now',
  },
];

const QUICK_FAQ_CHIPS = [
  'AACCC R2 Latest Notice',
  'Free Exit vs. Forfeiture',
  'Security Deposit Refund',
  'State Domicile Rules',
  'Documents Required',
];

export const CounselorChatbot: React.FC<CounselorChatbotProps> = ({
  currentStudent: propStudent,
  preferences = [],
  feed = defaultCounsellingFeed,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedScope, setSelectedScope] = useState<ScopeTopic>('all');

  const activeStudent = propStudent || getCurrentStudent();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      inputRef.current?.focus();
    }
  }, [isOpen, messages, isTyping]);

  const handleSendMessage = (textToSend?: string) => {
    const query = textToSend || inputValue;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue('');
    setIsTyping(true);

    // Grounded RAG Answering
    setTimeout(() => {
      const response = generateGroundedCounselorAnswer(
        query,
        selectedScope,
        activeStudent,
        preferences,
        manualNotices,
        feed
      );

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        action: response.action,
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 450);
  };

  const handleReset = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'bot',
        text: `Chat reset! 🙏 How can I assist you with AACCC Central, State Quotas, or AIAPGET 2026 choice filling?`,
        timestamp: 'Just now',
      },
    ]);
    setSelectedScope('all');
  };

  return (
    <>
      {/* Floating Action Button & Mini Menu */}
      {!isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end gap-2.5">
          
          {/* Expanded Mini Menu */}
          {isMenuOpen && (
            <div className="flex flex-col gap-2 p-2.5 rounded-2xl bg-[#090d16]/95 border border-white/15 backdrop-blur-xl shadow-2xl animate-fadeIn w-60">
              
              {/* WhatsApp Option */}
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 p-2 rounded-xl bg-white/5 hover:bg-[#25D366]/20 border border-white/10 hover:border-[#25D366]/40 text-white text-xs font-semibold transition-colors min-h-[44px]"
              >
                <div className="w-7 h-7 rounded-lg bg-[#25D366] flex items-center justify-center shrink-0">
                  <MessageCircle className="w-4 h-4 text-white fill-white" />
                </div>
                <div className="flex flex-col text-left">
                  <span>WhatsApp Support</span>
                  <span className="text-[10px] text-emerald-300 font-normal">{WHATSAPP_NUMBER}</span>
                </div>
              </a>

              {/* AI Counselor Option */}
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsOpen(true);
                }}
                className="flex items-center gap-2.5 w-full p-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-white text-xs font-semibold transition-colors min-h-[44px] cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-slate-950" />
                </div>
                <div className="flex flex-col text-left">
                  <span>AI Counselor</span>
                  <span className="text-[10px] text-emerald-300/80 font-normal">Ask AACCC, State Rules & Cutoffs</span>
                </div>
              </button>
            </div>
          )}

          {/* Single Compact Circular Icon Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="w-12 h-12 rounded-full bg-[#10B981] hover:bg-[#0ea572] text-slate-950 shadow-[0_8px_25px_rgba(16,185,129,0.35)] flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer border border-emerald-300/40 relative"
            aria-label="Toggle Help Menu"
            title="Help: WhatsApp or AI Counselor"
          >
            {isMenuOpen ? (
              <X className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            ) : (
              <MessageCircle className="w-5 h-5 text-slate-950 fill-slate-950" />
            )}
            {!isMenuOpen && (
              <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#0B1120] animate-ping" />
            )}
          </button>

        </div>
      )}

      {/* Slide-out Interactive Chat Window */}
      {isOpen && (
        <div 
          className="fixed bottom-3 right-3 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-1.5rem)] sm:w-[430px] max-w-[430px] h-[590px] max-h-[86vh] rounded-3xl glass-panel border border-emerald-500/30 bg-[#090d16]/98 backdrop-blur-2xl shadow-[0_25px_65px_-10px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden animate-fadeIn"
          role="dialog"
          aria-modal="true"
        >
          
          {/* Header */}
          <div className="p-3.5 sm:p-4 border-b border-white/10 bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden border border-emerald-500/30 bg-slate-900 shadow-inner shrink-0">
                <BrandLogo alt="Vedabhyas" className="w-full h-full object-cover" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-slate-950" />
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs sm:text-sm font-bold text-white font-['Outfit']">
                    Vedabhyas AI Counselor
                  </h4>
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Active
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 flex items-center gap-1">
                  <span>AACCC & State AIAPGET Assistant</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleReset}
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Reset Chat"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Topic / Scope Selector Strip */}
          <div className="px-3 py-1.5 bg-slate-900/95 border-b border-white/5 flex items-center gap-1 overflow-x-auto scrollbar-none shrink-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
              Scope:
            </span>
            
            <button
              onClick={() => setSelectedScope('all')}
              className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition-all shrink-0 cursor-pointer ${
                selectedScope === 'all'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              All Topics
            </button>

            <button
              onClick={() => setSelectedScope('aaccc')}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold transition-all shrink-0 cursor-pointer ${
                selectedScope === 'aaccc'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              <Scale className="w-3 h-3 text-emerald-400" />
              <span>AACCC Central</span>
            </button>

            <button
              onClick={() => setSelectedScope('states')}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold transition-all shrink-0 cursor-pointer ${
                selectedScope === 'states'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              <Building2 className="w-3 h-3 text-teal-400" />
              <span>State Rules</span>
            </button>

            <button
              onClick={() => setSelectedScope('fees')}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold transition-all shrink-0 cursor-pointer ${
                selectedScope === 'fees'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              <CreditCard className="w-3 h-3 text-amber-400" />
              <span>Fees & Exit</span>
            </button>

            <button
              onClick={() => setSelectedScope('documents')}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold transition-all shrink-0 cursor-pointer ${
                selectedScope === 'documents'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-3 h-3 text-indigo-400" />
              <span>Documents</span>
            </button>

            <button
              onClick={() => setSelectedScope('my_list')}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold transition-all shrink-0 cursor-pointer ${
                selectedScope === 'my_list'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              <UserCheck className="w-3 h-3 text-pink-400" />
              <span>My Rank & List</span>
            </button>
          </div>

          {/* Quick Helpline Header Strip */}
          <div className="px-3.5 py-1.5 bg-emerald-500/10 border-b border-emerald-500/20 flex items-center justify-between text-[11px] shrink-0">
            <div className="flex items-center gap-1.5 text-emerald-300">
              <Phone className="w-3 h-3 text-emerald-400" />
              <span>Helpline: <strong>{WHATSAPP_NUMBER}</strong></span>
            </div>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 text-[11px] hover:underline"
            >
              <span>WhatsApp Chat</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 custom-scrollbar text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[88%] p-3 rounded-2xl ${
                    msg.sender === 'user'
                      ? 'bg-emerald-600 text-white rounded-br-none shadow-sm'
                      : 'bg-slate-900 border border-white/10 text-slate-100 rounded-bl-none shadow-md'
                  }`}
                >
                  <div className="whitespace-pre-wrap leading-relaxed text-xs">
                    {msg.text}
                  </div>

                  {/* Action Link / Button if attached */}
                  {msg.action && (
                    <div className="mt-2.5 pt-2 border-t border-white/10">
                      <a
                        href={msg.action.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#10B981] hover:bg-[#0ea572] text-slate-950 font-bold text-[11px] shadow-sm transition-all cursor-pointer"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>{msg.action.label}</span>
                      </a>
                    </div>
                  )}
                </div>

                <span className="text-[10px] text-slate-500 mt-1 px-1">
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-center gap-1.5 p-3 rounded-2xl bg-slate-900/80 border border-white/10 w-20 text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* 1-Click Quick FAQ Chips */}
          <div className="px-3 py-2 border-t border-white/10 bg-slate-950/60 shrink-0">
            <div className="text-[10px] text-slate-400 mb-1.5 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>1-Click FAQs:</span>
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
              {QUICK_FAQ_CHIPS.map((chip) => (
                <button
                  key={chip}
                  onClick={() => handleSendMessage(chip)}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-emerald-500/20 hover:border-emerald-500/30 border border-white/10 text-[11px] text-slate-300 hover:text-emerald-300 transition-colors shrink-0 cursor-pointer"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-2.5 sm:p-3 border-t border-white/10 bg-slate-900/90 flex items-center gap-2 shrink-0"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask AACCC, state rules, security deposit, exit..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition-colors min-h-[40px]"
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="p-2.5 rounded-xl bg-[#10B981] hover:bg-[#0ea572] text-slate-950 font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-md min-h-[40px] min-w-[40px] flex items-center justify-center"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}
    </>
  );
};
