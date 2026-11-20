import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageCircle, 
  Send, 
  Bot, 
  X, 
  Sparkles, 
  Phone, 
  ExternalLink, 
  RefreshCw 
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { collegesData } from '../data/colleges';

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

const WHATSAPP_NUMBER = '8208506052';
const WHATSAPP_URL = `https://wa.me/91${WHATSAPP_NUMBER}?text=Hello%20Vedabhyas,%20I%20need%20expert%20AIAPGET%20counseling%20guidance%20for%20my%20rank.`;

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'welcome-1',
    sender: 'bot',
    text: `Namaste! 🙏 I am your **Vedabhyas AI Counselor**.\n\nI have access to official last-year **AACCC Round 3 & State Quota seat allotments** across 60+ Ayurvedic colleges in India. How can I assist you with your MD/MS AIAPGET counseling?`,
    timestamp: 'Just now',
  },
];

const SUGGESTED_QUESTIONS = [
  'What can I get at AIR 500?',
  'Top colleges for MS Shalya Tantra',
  'Highest stipend Ayurvedic colleges',
  'Private & Deemed college cutoffs',
  'UP & Haryana State Quota seats',
  'Chat with Mentor on WhatsApp',
];

export const CounselorChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
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

  // Intelligent domain query answering engine using the real colleges database
  const generateBotResponse = (userQuery: string): { text: string; action?: ChatMessage['action'] } => {
    const q = userQuery.toLowerCase().trim();

    // 1. Direct WhatsApp / Contact request
    if (q.includes('whatsapp') || q.includes('contact') || q.includes('phone') || q.includes('call') || q.includes('mentor') || q.includes('helpline') || q.includes('number')) {
      return {
        text: `You can directly reach out to our senior Ayurvedic counselor on **WhatsApp at +91 ${WHATSAPP_NUMBER}** for 1-on-1 counseling, personalized choice-filling order, and doubt clearance.`,
        action: {
          type: 'whatsapp',
          label: `Chat on WhatsApp (+91 ${WHATSAPP_NUMBER})`,
          url: WHATSAPP_URL,
        },
      };
    }

    // 2. Rank-specific inquiries (e.g. "rank 400", "air 500", "my rank is 1200")
    const rankMatch = q.match(/\b(\d{1,5})\b/);
    if (rankMatch && (q.includes('rank') || q.includes('air') || q.includes('get') || q.includes('chance') || q.includes('admission'))) {
      const rank = parseInt(rankMatch[1], 10);
      if (rank > 0 && rank <= 20000) {
        // Find safe colleges
        const safeColleges = collegesData
          .filter(c => c.closingRank >= rank)
          .sort((a, b) => a.closingRank - b.closingRank)
          .slice(0, 4);

        const borderlineColleges = collegesData
          .filter(c => c.closingRank < rank && c.closingRank >= rank * 0.8)
          .slice(0, 3);

        if (safeColleges.length > 0) {
          const listSafe = safeColleges
            .map(c => `• **${c.shortName}** (${c.city}, ${c.state}) — Last R3 Cutoff: AIR #${c.closingRank} (${c.type})`)
            .join('\n');

          let reply = `Based on last year's official AACCC & State allotments, for **AIR #${rank}**:\n\n**High Chance Options:**\n${listSafe}\n`;

          if (borderlineColleges.length > 0) {
            const listBorder = borderlineColleges
              .map(c => `• **${c.shortName}** (Cutoff: AIR #${c.closingRank})`)
              .join('\n');
            reply += `\n**Borderline / Probable in Later Rounds:**\n${listBorder}\n`;
          }

          reply += `\nWant a branch-specific choice list for Rank #${rank}? You can connect with our faculty counselor on WhatsApp:`;

          return {
            text: reply,
            action: {
              type: 'whatsapp',
              label: `Get Custom Choice-List for AIR #${rank}`,
              url: `https://wa.me/91${WHATSAPP_NUMBER}?text=Hello%20Vedabhyas,%20my%20AIAPGET%20Rank%20is%20${rank}.%20Please%20guide%20me%20with%20my%20choice-filling%20list.`,
            },
          };
        } else {
          return {
            text: `At **AIR #${rank}**, Central Institutes and Government colleges have tight cutoffs in AIQ Round 1 & 2. However, premier **Deemed and Management Quota** institutions like **Bharati Vidyapeeth Pune**, **Dr. D.Y. Patil Pune & Navi Mumbai**, and **KLE Belagavi** have seats allotted up to Rank #16,000+.\n\nConnect with us directly on WhatsApp to explore state mop-up and stray vacancy rounds!`,
            action: {
              type: 'whatsapp',
              label: `Discuss Options for AIR #${rank}`,
              url: `https://wa.me/91${WHATSAPP_NUMBER}?text=Hello,%20my%20AIAPGET%20Rank%20is%20${rank}.%20Can%20you%20guide%20me%20for%20private/deemed%20and%20mop-up%20seats?`,
            },
          };
        }
      }
    }

    // 3. Shalya Tantra / Surgery
    if (q.includes('shalya') || q.includes('surgery')) {
      return {
        text: `**MS (Ayurveda) Shalya Tantra** is the most sought-after surgical clinical branch in AIAPGET.\n\n**Top Institutions & Last Year Closing Cutoffs:**\n• **IMS BHU, Varanasi**: Cutoff AIR #1 – #2 (Highest priority)\n• **AIIA New Delhi**: Cutoff AIR #8 – #12\n• **NIA Jaipur**: Cutoff AIR #20 – #32\n• **ITRA Jamnagar**: Cutoff AIR #26 – #41\n• **R.A. Podar Mumbai**: Cutoff AIR #20 – #84\n• **GAC Varanasi (UP State)**: Cutoff AIR #172 – #534\n• **IASR Kurukshetra (Haryana)**: Cutoff AIR #312 – #823\n\nFor Private & Deemed: DY Patil Pune & BVDU Pune close around Rank #2500–#3500.`,
        action: {
          type: 'whatsapp',
          label: 'Inquire Shalya Tantra Seats on WhatsApp',
          url: `https://wa.me/91${WHATSAPP_NUMBER}?text=Hello,%20I%20am%20interested%20in%20MS%20Shalya%20Tantra.%20Please%20guide%20me.`,
        },
      };
    }

    // 4. Stree Roga / Prasuti Tantra / Gynecology
    if (q.includes('stree') || q.includes('prasuti') || q.includes('gynae') || q.includes('gynecology')) {
      return {
        text: `**MS (Ayurveda) Prasuti Tantra & Stree Roga** has high clinical demand and closes very early:\n\n• **IMS BHU, Varanasi**: Cutoff AIR #4 – #6\n• **ITRA Jamnagar**: Cutoff AIR #9 – #30\n• **AIIA New Delhi**: Cutoff AIR #15 – #47\n• **NIA Jaipur**: Cutoff AIR #21 – #59\n• **R.A. Podar Mumbai**: Cutoff AIR #24 – #27\n• **State Ayurved Lucknow (AP01)**: Cutoff AIR #180 (General), #327 (OBC)\n• **SKAU Kurukshetra**: Cutoff AIR #83 (UR IP), #263 (EWS), #617 (BCA)`,
        action: {
          type: 'whatsapp',
          label: 'Ask for Stree Roga Guidance on WhatsApp',
          url: `https://wa.me/91${WHATSAPP_NUMBER}?text=Hello,%20I%20want%20guidance%20for%20MS%20Prasuti%20Tantra%20seats.`,
        },
      };
    }

    // 5. Kayachikitsa / General Medicine
    if (q.includes('kaya') || q.includes('kayachikitsa') || q.includes('medicine')) {
      return {
        text: `**MD (Ayurveda) Kayachikitsa** is the backbone of Ayurvedic internal medicine.\n\n**Top Cutoffs:**\n• **IMS BHU Varanasi**: AIR #7 – #14\n• **AIIA New Delhi**: AIR #13 – #35\n• **ITRA Jamnagar**: AIR #32 – #49\n• **NIA Jaipur**: AIR #36 – #68\n• **GAC Nanded**: AIR #59 – #64\n• **State Ayurved Lucknow (AP01)**: AIR #304 (UROP), #581 (BCOP)\n• **KLE Belagavi & DY Patil**: AIR #1600 – #2800`,
      };
    }

    // 6. Panchakarma
    if (q.includes('panchakarma') || q.includes('panchkarma')) {
      return {
        text: `**MD Panchakarma** is globally recognized with massive clinical career potential.\n\n• **NIA Jaipur**: Cutoff AIR #18 (Famous worldwide)\n• **AIIA New Delhi**: Cutoff AIR #33 – #44\n• **ITRA Jamnagar**: Cutoff AIR #39 – #53\n• **CBPACS New Delhi**: Cutoff AIR #87 – #97\n• **GAC Varanasi**: Cutoff AIR #507\n• **Vaidyaratnam Kottakkal**: Cutoff AIR #163\n• **KLE Belagavi**: Cutoff AIR #1723`,
      };
    }

    // 7. Stipend Inquiries
    if (q.includes('stipend') || q.includes('salary') || q.includes('pay') || q.includes('earning')) {
      return {
        text: `**Highest Paying PG Ayurveda Institutions in India:**\n\n1. **IMS BHU, Varanasi**: ₹1,12,000 / month (Highest Central Central pay)\n2. **AIIA New Delhi**: ₹1,05,000 / month (7th CPC)\n3. **CBPACS New Delhi**: ₹95,000 / month\n4. **NIA Jaipur**: ₹92,000 / month\n5. **ITRA Jamnagar**: ₹88,000 / month\n6. **NEIAH Shillong & AIIA Goa**: ₹85,000 / month\n7. **Maharashtra Govt Colleges (Podar, Nanded, Nagpur)**: ₹75,000 – ₹78,000 / month\n8. **Karnataka Govt (GAMC Bangalore, Mysuru)**: ₹71,000 – ₹74,000 / month\n9. **Private & Deemed (DY Patil, BVDU, KLE)**: ₹32,000 – ₹40,000 / month`,
      };
    }

    // 8. State Quota (UP / Haryana / Maharashtra / Kerala)
    if (q.includes('up') || q.includes('uttar pradesh') || q.includes('lucknow') || q.includes('varanasi') || q.includes('haryana') || q.includes('kurukshetra')) {
      return {
        text: `**State Quota Breakdown (85% Quota):**\n\n• **Uttar Pradesh (UP State AYUSH)**:\n  - *State Ayurvedic College Lucknow (AP01)*: Gen cutoff #1120, OBC #1621, SC #3477\n  - *GAC Varanasi (AP03)*: Gen #1189, OBC #1656, SC #3629\n  - *Lalit Hari Pilibhit (AP02)*: Gen #1347, OBC #1703, SC #4044\n\n• **Haryana (SKAU Kurukshetra)**:\n  - *IASR Kurukshetra*: Gen #1101, EWS #1639, BCA #2290, BCB #2387, SC #4954\n  - *MSM Sonipat (Women)*: Gen #1278, BCA #4811\n  - *SDAC&H Chandigarh*: Gen #1973, OBC #4205\n  - *Baba Mastnath Rohtak*: Gen #4325, Management up to #15393`,
        action: {
          type: 'whatsapp',
          label: 'Consult State Quota Cutoffs on WhatsApp',
          url: `https://wa.me/91${WHATSAPP_NUMBER}?text=Hello,%20I%20need%20details%20on%20State%20Quota%20Ayurveda%20PG%20Seats.`,
        },
      };
    }

    // 9. Private & Deemed Universities
    if (q.includes('private') || q.includes('deemed') || q.includes('management') || q.includes('fee')) {
      return {
        text: `**Top Private & Deemed Ayurvedic Universities:**\n\n• **Bharati Vidyapeeth (BVDU) Pune**: Closing AIR #7,640 (Self-Finance up to #14,925). Annual Fee: ₹4.5L | Stipend: ₹38k\n• **Dr. D.Y. Patil Pune (Pimpri)**: Closing AIR #8,371 (Self-Finance up to #16,125). Annual Fee: ₹4.85L | Stipend: ₹40k\n• **Padamshri DY Patil Navi Mumbai**: Closing AIR #8,618 (Round 3 up to #13,684). Annual Fee: ₹4.6L | Stipend: ₹38k\n• **KLE Belagavi**: Closing AIR #8,703. Annual Fee: ₹3.9L | Stipend: ₹36k\n• **Mahatma Gandhi Wardha**: Closing AIR #7,816. Annual Fee: ₹3.25L | Stipend: ₹32k\n• **Amrita School of Ayurveda Kerala**: Closing AIR #8,099. Annual Fee: ₹4.1L | Stipend: ₹35k`,
        action: {
          type: 'whatsapp',
          label: 'Direct Inquiry for Deemed Seats',
          url: `https://wa.me/91${WHATSAPP_NUMBER}?text=Hello,%20I%20want%20details%20on%20Private%20and%20Deemed%20Ayurveda%20colleges.`,
        },
      };
    }

    // 10. General Fallback
    return {
      text: `Thank you for your question! I can help you evaluate your chances based on your AIAPGET rank, category (General, OBC, SC, ST, EWS), preferred clinical branch, or state preference.\n\nFor direct personalized mentorship, document verification, or choice-filling help, message our senior counselor on WhatsApp at **+91 ${WHATSAPP_NUMBER}**.`,
      action: {
        type: 'whatsapp',
        label: `Message on WhatsApp (+91 ${WHATSAPP_NUMBER})`,
        url: WHATSAPP_URL,
      },
    };
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputValue.trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      const { text: botReply, action } = generateBotResponse(text);
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: botReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        action,
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 600);
  };

  const handleReset = () => {
    setMessages(INITIAL_MESSAGES);
  };

  return (
    <>
      {/* Compact Expandable Help FAB (Bottom-Right) */}
      {!isOpen && (
        <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end">
          
          {/* Expandable Mini-Menu */}
          {isMenuOpen && (
            <div className="mb-3 w-56 rounded-2xl bg-[#0B1120]/95 border border-white/10 shadow-2xl p-2.5 backdrop-blur-xl animate-fadeIn space-y-2">
              <div className="px-2 py-0.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Vedabhyas Support
              </div>
              
              {/* WhatsApp Support Button */}
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-2.5 w-full p-2 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/30 text-white text-xs font-semibold transition-colors min-h-[44px]"
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
                  <span className="text-[10px] text-emerald-300/80 font-normal">Ask Ranks & Cutoffs</span>
                </div>
              </button>
            </div>
          )}

          {/* Single Compact Circular Icon Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="w-12 h-12 rounded-full bg-[#10B981] hover:bg-[#0ea572] text-slate-950 shadow-[0_8px_25px_rgba(16,185,129,0.35)] flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer border border-emerald-300/40 relative"
            aria-label="Toggle Help Menu"
            title="Help & Support: WhatsApp or AI Counselor"
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
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[410px] max-w-[410px] h-[560px] max-h-[82vh] rounded-3xl glass-panel border border-emerald-500/30 bg-[#090d16]/95 backdrop-blur-2xl shadow-[0_25px_65px_-10px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden animate-fadeIn"
          role="dialog"
          aria-modal="true"
        >
          
          {/* Header */}
          <div className="p-4 border-b border-white/10 bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-emerald-500/30 bg-slate-900 shadow-inner shrink-0">
                <BrandLogo alt="Vedabhyas" className="w-full h-full object-cover" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-slate-950" />
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-bold text-white font-['Outfit']">
                    Vedabhyas AI Counselor
                  </h4>
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Online
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 flex items-center gap-1">
                  <span>Vedabhyas</span>
                  <span>•</span>
                  <span className="text-amber-400 font-medium">60+ Colleges R3 Data</span>
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

          {/* Quick Helpline Header Strip */}
          <div className="px-3.5 py-2 bg-emerald-500/10 border-b border-emerald-500/20 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-emerald-300">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
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

          {/* Message List */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3 leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-medium rounded-tr-none shadow-md'
                      : 'bg-slate-900/80 border border-white/10 text-slate-200 rounded-tl-none shadow-inner'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  {/* Action Link / Button if attached */}
                  {msg.action && (
                    <div className="mt-2.5 pt-2 border-t border-white/10">
                      <a
                        href={msg.action.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>{msg.action.label}</span>
                        <ExternalLink className="w-3 h-3" />
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

          {/* Preset Suggested Query Chips */}
          <div className="px-3 py-2 border-t border-white/10 bg-slate-950/40">
            <div className="text-[10px] text-slate-400 mb-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Suggested Inquiries:</span>
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {SUGGESTED_QUESTIONS.map((question) => (
                <button
                  key={question}
                  onClick={() => handleSendMessage(question)}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-emerald-500/20 hover:border-emerald-500/30 border border-white/10 text-[11px] text-slate-300 hover:text-emerald-300 transition-colors shrink-0 cursor-pointer"
                >
                  {question}
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
            className="p-3 border-t border-white/10 bg-slate-900/90 flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about AIAPGET ranks, cutoffs, stipends..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition-colors"
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:opacity-95 text-slate-950 font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-md"
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
