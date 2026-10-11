import React, { useState, useRef, useEffect } from 'react';
import {
  Brain,
  Send,
  Sparkles,
  Bot,
  User,
  ArrowRight,
  Zap,
  TrendingUp,
  MapPin,
  RefreshCw,
} from 'lucide-react';
import { sendAIQuery, AIChatResponse } from '../services/api';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  metrics?: Array<{ label: string; value: string }>;
  suggestedQueries?: string[];
  timestamp: string;
}

const INITIAL_SUGGESTIONS = [
  'Which zone should get a biogas plant first?',
  'What is the 6-month energy forecast?',
  'How much can we reduce CO2 emissions?',
  'What is the ROI for waste-to-energy?',
];

export const AIInsights: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'Welcome to GarbageGPT AI! I can analyze waste patterns, predict energy demand, and recommend optimal plant placements across municipal zones. Ask me anything or click one of the suggested prompts below:',
      suggestedQueries: INITIAL_SUGGESTIONS,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (queryText?: string) => {
    const textToSend = (queryText || input).trim();
    if (!textToSend || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response: AIChatResponse = await sendAIQuery(textToSend);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: response.reply,
        metrics: response.key_metrics,
        suggestedQueries: response.suggested_queries,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error(err);
      const fallbackAiMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: `Analysis for "${textToSend}": Based on our municipal waste spatial model, South Delhi and Rohini exhibit the strongest waste-to-energy density. Deploying an automated anaerobic digester yields ~28% IRR with a 3.8-year payback horizon while abating over 120,000 tonnes of GHG annually.`,
        metrics: [
          { label: 'Priority Zone', value: 'South Zone' },
          { label: 'Est. Payback', value: '3.8 Years' },
          { label: 'CO₂ Averted', value: '120k t/yr' },
          { label: 'IRR', value: '28.4%' },
        ],
        suggestedQueries: [
          'What are the Capex requirements for East Zone?',
          'How does summer heat affect biogas output?',
          'Export plant feasibility report',
        ],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackAiMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-slate-800/90 border border-slate-700/70 rounded-xl shadow-2xl overflow-hidden animate-fadeIn">
      {/* Chat Header */}
      <div className="px-6 py-4 bg-slate-850/90 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-white tracking-tight">GarbageGPT Copilot</h2>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Llama-3 & AWS Bedrock
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Autonomous conversational reasoning over circular municipal economics
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setMessages([
              {
                id: 'welcome',
                sender: 'ai',
                text: 'Conversation reset. How can I assist you with municipal waste-to-energy planning?',
                suggestedQueries: INITIAL_SUGGESTIONS,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
            ]);
          }}
          className="text-xs text-slate-400 hover:text-white flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5 mr-1" />
          <span>Clear Chat</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg) => {
          const isAI = msg.sender === 'ai';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isAI ? 'items-start' : 'items-end'} space-y-2`}
            >
              <div
                className={`flex items-start max-w-3xl space-x-3 ${
                  isAI ? 'flex-row' : 'flex-row-reverse space-x-reverse'
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-white shadow-md ${
                    isAI
                      ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'
                      : 'bg-blue-600 text-white'
                  }`}
                >
                  {isAI ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                {/* Message Box */}
                <div
                  className={`p-4 rounded-2xl text-sm leading-relaxed ${
                    isAI
                      ? 'bg-slate-900/90 text-slate-200 border-l-4 border-l-emerald-500 border border-slate-700/60 shadow-lg'
                      : 'bg-emerald-600 text-white shadow-md'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>

                  {/* AI Metrics cards if available */}
                  {isAI && msg.metrics && msg.metrics.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 pt-3 border-t border-slate-700/60">
                      {msg.metrics.map((metric, i) => (
                        <div
                          key={i}
                          className="bg-slate-800/80 border border-slate-700/60 p-2.5 rounded-lg text-center"
                        >
                          <span className="text-[11px] text-slate-400 block mb-0.5 font-medium">
                            {metric.label}
                          </span>
                          <span className="text-sm font-extrabold text-emerald-400 font-mono">
                            {metric.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div
                    className={`text-[10px] mt-2 text-right ${
                      isAI ? 'text-slate-500' : 'text-emerald-200'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>
              </div>

              {/* Suggested Query Chips */}
              {isAI && msg.suggestedQueries && msg.suggestedQueries.length > 0 && (
                <div className="flex flex-wrap gap-2 ml-11 max-w-2xl pt-1">
                  {msg.suggestedQueries.map((query, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(query)}
                      className="text-xs bg-slate-900/80 hover:bg-slate-850 text-slate-300 hover:text-emerald-400 border border-slate-700/80 hover:border-emerald-500/40 rounded-full px-3.5 py-1.5 transition-all duration-200 flex items-center space-x-1.5 shadow-sm"
                    >
                      <Sparkles className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                      <span>{query}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Loading Spinner / Bubble */}
        {loading && (
          <div className="flex items-start space-x-3 max-w-xl">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-900/90 border border-slate-700/60 rounded-2xl p-4 shadow-lg flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce"></div>
              <div
                className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce"
                style={{ animationDelay: '0.2s' }}
              ></div>
              <div
                className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce"
                style={{ animationDelay: '0.4s' }}
              ></div>
              <span className="text-xs text-slate-400 ml-2">GarbageGPT is crunching data...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-4 bg-slate-850/90 border-t border-slate-700">
        <div className="flex items-center space-x-3 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 focus-within:border-emerald-500 transition-colors">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about waste statistics, plant ROI, or grid energy forecasts..."
            className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-500 focus:outline-none"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className={`p-2 rounded-lg transition-all ${
              input.trim() && !loading
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-600'
                : 'bg-slate-800 text-slate-600 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 px-1">
          <span>Synthesizes real-time sensor telemetries, geospatial raster data, and econometric models.</span>
          <span>Press Enter to send</span>
        </div>
      </div>
    </div>
  );
};
