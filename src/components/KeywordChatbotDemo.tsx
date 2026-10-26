/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  Sparkles,
  Bot,
  User,
  RotateCcw,
  Copy,
  Check,
  CheckCircle2,
  Code2,
  HelpCircle,
  ExternalLink,
  PhoneCall,
  Clock,
  Layers,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  matchedKeyword?: string;
  confidence?: number;
  timestamp: string;
}

interface KeywordRule {
  keywords: string[];
  response: string;
  category: string;
}

const FAQ_RULES: KeywordRule[] = [
  {
    category: 'Operating Hours',
    keywords: ['hours', 'open', 'schedule', 'time', 'weekend', 'sunday', 'holiday'],
    response:
      'We are open 24/7/365! Our commercial roadside dispatch and mobile mechanics operate around the clock across the Greater Chicago & Midwest logistics corridor.',
  },
  {
    category: 'Pricing & Estimates',
    keywords: ['price', 'pricing', 'cost', 'quote', 'rate', 'how much', 'fee'],
    response:
      'Preventative fleet maintenance starts at $189/truck. Emergency roadside dispatch starts at $149 base fee + mileage. We offer volume fleet discounts for 5+ commercial units.',
  },
  {
    category: 'Emergency & Roadside',
    keywords: ['emergency', 'towing', 'stuck', 'breakdown', 'tire', 'blowout', 'freeway', 'highway', 'overheat'],
    response:
      'DISPATCH ALERT: Call our priority hotline directly at (708) 232-6581! Heavy-duty flatbeds, mobile tire service, and certified diesel technicians are on standby for immediate rollout.',
  },
  {
    category: 'Services Offered',
    keywords: ['services', 'repairs', 'maintenance', 'inspection', 'dot', 'brakes', 'engine', 'transmission', 'oil'],
    response:
      'We specialize in DOT annual safety inspections, heavy diesel engine diagnostics, air brake overhauls, computerized emissions repair, mobile tire changes, and preventative maintenance contracts.',
  },
  {
    category: 'Location & Depot',
    keywords: ['location', 'where', 'address', 'depot', 'yard', 'chicago', 'illinois', 'area'],
    response:
      'Our primary logistics maintenance hub is located in the Chicago metro area (Cook County) with rapid response units serving I-80, I-55, I-294, and I-90 freight corridors.',
  },
  {
    category: 'Bilingual Support',
    keywords: ['spanish', 'espanol', 'hablan espanol', 'idioma', 'mexico'],
    response:
      '¡Sí, por supuesto! Contamos con operadores y mecánicos bilingües listos para atenderle las 24 horas del día. Llámenos al 708-232-6581 o escríbanos en Facebook.',
  },
  {
    category: 'Contact & Inquiries',
    keywords: ['contact', 'phone', 'call', 'talk', 'human', 'email', 'facebook', 'facebook link', 'questions'],
    response:
      'You can reach our dispatcher directly at (708) 232-6581, email Romasel.b@elcamiones.com or billonesromasel18@gmail.com. Have specific questions? Chat directly with our team on Facebook: https://www.facebook.com/profile.php?id=61590527562517',
  },
];

const DEFAULT_FALLBACK =
  "I didn't quite catch that keyword, but our live team is here to help! For urgent roadside help, call (708) 232-6581. For general inquiries or questions on our fleet services, message our Facebook page directly: https://www.facebook.com/profile.php?id=61590527562517";

export const KeywordChatbotDemo: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'bot',
      text: 'Hello! Welcome to El Camiones automated assistant. Ask me about our operating hours, fleet maintenance pricing, emergency roadside dispatch (708-232-6581), or our repair services.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'code'>('chat');
  const [copiedCode, setCopiedCode] = useState(false);

  const samplePrompts = [
    'What are your operating hours on weekends?',
    'How much does a fleet maintenance quote cost?',
    'I have an emergency breakdown on I-80, need towing!',
    'Do you do annual DOT safety inspections?',
    '¿Tienen servicio en español para mecánicos?',
    'I have a question about services, where can I message you?',
  ];

  const processKeywordMatch = (query: string): { response: string; matchedKeyword?: string; confidence: number } => {
    const normalized = query.toLowerCase().trim();

    for (const rule of FAQ_RULES) {
      for (const kw of rule.keywords) {
        // Word boundary match or inclusion
        const regex = new RegExp(`\\b${kw}\\b`, 'i');
        if (regex.test(normalized) || normalized.includes(kw)) {
          return {
            response: rule.response,
            matchedKeyword: kw,
            confidence: 0.94,
          };
        }
      }
    }

    return {
      response: DEFAULT_FALLBACK,
      confidence: 0.35,
    };
  };

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsBotTyping(true);

    setTimeout(() => {
      const match = processKeywordMatch(text);
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: match.response,
        matchedKeyword: match.matchedKeyword,
        confidence: match.confidence,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, botMsg]);
      setIsBotTyping(false);
    }, 450);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `msg-${Date.now()}`,
        sender: 'bot',
        text: 'Chat history reset. How can I assist you with El Camiones fleet services today?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const pythonScript = `"""
Rule-Based Keyword Chatbot for Commercial Services
Responds to user questions by scanning for predefined intent keywords.
Language: Python 3.8+
Dependencies: Standard library (re, datetime)
"""

import re
from datetime import datetime

# Knowledge base: map keywords to targeted responses
FAQ_RESPONSES = {
    ("hours", "open", "schedule", "time", "weekend"): (
        "We are open 24/7/365! Our commercial roadside dispatch and mobile mechanics "
        "operate around the clock across the Greater Chicago & Midwest logistics corridor."
    ),
    ("price", "pricing", "cost", "quote", "rate", "fee"): (
        "Preventative fleet maintenance starts at $189/truck. Emergency roadside dispatch "
        "starts at $149 base fee. Volume fleet discounts available for 5+ units."
    ),
    ("emergency", "towing", "stuck", "breakdown", "tire", "blowout"): (
        "DISPATCH ALERT: Call priority hotline (708) 232-6581. Heavy-duty wreckers "
        "and mobile tire technicians are on standby for immediate rollout."
    ),
    ("services", "repairs", "maintenance", "dot", "inspection", "brakes"): (
        "We provide DOT annual safety inspections, heavy diesel engine diagnostics, "
        "air brake overhauls, computerized emissions repair, and mobile tire changes."
    ),
    ("spanish", "espanol", "hablan espanol"): (
        "¡Sí! Contamos con operadores y mecánicos bilingües las 24 horas del día. "
        "Llámenos al 708-232-6581 o escríbanos en Facebook."
    ),
    ("contact", "phone", "call", "facebook", "questions"): (
        "Call our dispatch desk at (708) 232-6581 or email Romasel.b@elcamiones.com / billonesromasel18@gmail.com. "
        "For questions, reach out via Facebook: https://www.facebook.com/profile.php?id=61590527562517"
    )
}

DEFAULT_FALLBACK = (
    "I'm not sure about that, but our live team is here to help! "
    "Call 708-232-6581 or message us directly on Facebook: "
    "https://www.facebook.com/profile.php?id=61590527562517"
)

def respond(user_input: str) -> tuple[str, str | None]:
    """Matches user input against predefined keywords."""
    clean_text = user_input.lower().strip()
    
    for keywords, answer in FAQ_RESPONSES.items():
        for kw in keywords:
            # Match whole word using regex
            if re.search(rf'\\b{re.escape(kw)}\\b', clean_text):
                return answer, kw
                
    return DEFAULT_FALLBACK, None

def run_chat_loop():
    print("=" * 60)
    print(" El Camiones Customer Service Chatbot [Python]")
    print(" Type 'quit' or 'exit' to end conversation.")
    print("=" * 60)
    
    while True:
        try:
            user_msg = input("\\nYou: ")
            if user_msg.lower() in ("quit", "exit", "q"):
                print("Bot: Thank you for contacting El Camiones. Drive safe!")
                break
                
            reply, matched_kw = respond(user_msg)
            kw_tag = f" [Matched keyword: '{matched_kw}']" if matched_kw else " [Fallback]"
            print(f"Bot{kw_tag}: {reply}")
        except (KeyboardInterrupt, EOFError):
            break

if __name__ == '__main__':
    run_chat_loop()
`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(pythonScript);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
              <MessageSquare className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-white">Keyword-Matching Rule Chatbot</h2>
            <span className="px-2 py-0.5 text-xs font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded">
              Python Regex Engine
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Detects predefined intent keywords in user inquiries and delivers tailored responses, contact numbers (708-232-6581), and support routing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-3 py-1 rounded transition-colors ${
                activeTab === 'chat' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              Live Chat Simulator
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`px-3 py-1 rounded transition-colors ${
                activeTab === 'code' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              Python Script (.py)
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'chat' ? (
        <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Window */}
          <div className="lg:col-span-2 bg-slate-950 rounded-xl border border-slate-800 flex flex-col h-[520px]">
            {/* Chat Topbar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/50 rounded-t-xl">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-white">El Camiones Fleet Assistant</h3>
                  <p className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Online · 24/7 Automated Dispatch
                  </p>
                </div>
              </div>

              <button
                onClick={handleResetChat}
                className="px-2.5 py-1 text-[11px] text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors flex items-center gap-1"
                title="Reset conversation"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'bot' && (
                    <div className="w-6 h-6 rounded bg-indigo-600/30 text-indigo-400 flex items-center justify-center text-xs shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-xs ${
                      msg.sender === 'user'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-900 border border-slate-800 text-slate-200'
                    }`}
                  >
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                    {/* Metadata pill for bot */}
                    {msg.sender === 'bot' && msg.matchedKeyword && (
                      <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center gap-2 text-[10px] font-mono text-indigo-300">
                        <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                          keyword: {msg.matchedKeyword}
                        </span>
                        {msg.confidence && (
                          <span className="text-slate-500">
                            match: {(msg.confidence * 100).toFixed(0)}%
                          </span>
                        )}
                      </div>
                    )}

                    {/* External Link button if Facebook or phone mentioned */}
                    {msg.text.includes('facebook.com') && (
                      <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center gap-2">
                        <a
                          href="https://www.facebook.com/profile.php?id=61590527562517"
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 text-[11px] font-medium bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-500/30 rounded flex items-center gap-1.5 transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Open Facebook Profile</span>
                        </a>
                        <a
                          href="tel:7082326581"
                          className="px-2.5 py-1 text-[11px] font-medium bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/30 rounded flex items-center gap-1.5 transition-colors"
                        >
                          <PhoneCall className="w-3 h-3" />
                          <span>Call 708-232-6581</span>
                        </a>
                      </div>
                    )}

                    <span className="block text-[9px] text-slate-400 mt-1 text-right font-mono">
                      {msg.timestamp}
                    </span>
                  </div>

                  {msg.sender === 'user' && (
                    <div className="w-6 h-6 rounded bg-slate-800 text-slate-300 flex items-center justify-center text-xs shrink-0 mt-0.5">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              ))}

              {isBotTyping && (
                <div className="flex gap-2.5 items-center text-xs text-slate-400 font-mono">
                  <div className="w-6 h-6 rounded bg-indigo-600/30 text-indigo-400 flex items-center justify-center text-xs">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div className="bg-slate-900 px-3 py-2 rounded-xl border border-slate-800 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
            </div>

            {/* Quick Test Chips */}
            <div className="px-4 py-2 border-t border-slate-800/80 bg-slate-900/30 flex items-center gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
              <span className="text-slate-500 shrink-0 text-[10px] font-mono">Try asking:</span>
              {samplePrompts.slice(0, 3).map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(prompt)}
                  className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded border border-slate-800 shrink-0 transition-colors"
                >
                  "{prompt.slice(0, 32)}..."
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSend();
              }}
              className="p-3 border-t border-slate-800 flex items-center gap-2 bg-slate-950 rounded-b-xl"
            >
              <input
                type="text"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                placeholder="Type a message (e.g., pricing, 24/7 hours, emergency towing, contact)..."
                className="flex-1 bg-slate-900 border border-slate-800 text-white text-xs px-3.5 py-2.5 rounded-lg focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isBotTyping}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          {/* Right: Knowledge Base & Rules Inspector */}
          <div className="space-y-4">
            <div className="bg-slate-950 rounded-xl border border-slate-800 p-4">
              <h3 className="text-xs font-semibold text-white mb-2 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span>Predefined Keyword Rules ({FAQ_RULES.length})</span>
              </h3>
              <p className="text-[11px] text-slate-400 mb-3">
                The Python bot evaluates tokens against these categories:
              </p>

              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {FAQ_RULES.map((rule, idx) => (
                  <div key={idx} className="bg-slate-900/70 p-2.5 rounded-lg border border-slate-800/80 text-xs">
                    <div className="flex items-center justify-between text-indigo-300 font-medium mb-1 text-[11px]">
                      <span>{rule.category}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{rule.keywords.length} triggers</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-1.5">
                      {rule.keywords.map((kw, kIdx) => (
                        <span
                          key={kIdx}
                          className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 text-[10px] font-mono"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2">{rule.response}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Link Card to Facebook */}
            <div className="bg-gradient-to-br from-blue-900/30 to-indigo-900/30 border border-blue-800/50 rounded-xl p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-blue-200">Interested with questions?</span>
                <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded font-mono">Live</span>
              </div>
              <p className="text-[11px] text-slate-300 mt-1">
                Automated leads who have service inquiries are routed directly to Facebook chat.
              </p>
              <a
                href="https://www.facebook.com/profile.php?id=61590527562517"
                target="_blank"
                rel="noreferrer"
                className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded-lg transition-colors"
              >
                <span>Visit Facebook Profile</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      ) : (
        /* Code Tab */
        <div className="mt-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-mono">keyword_chatbot.py</span>
            <button
              onClick={copyToClipboard}
              className="px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1.5 border border-slate-700"
            >
              {copiedCode ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Python Script</span>
                </>
              )}
            </button>
          </div>

          <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed max-h-[500px]">
            {pythonScript}
          </pre>
        </div>
      )}
    </div>
  );
};
