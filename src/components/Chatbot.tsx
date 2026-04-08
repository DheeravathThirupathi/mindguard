import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from 'react-markdown';

// ✅ CREATE AI INSTANCE ONCE (PERFORMANCE FIX)
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm your Stress Relief Assistant. I'm here to help you feel better. How are you feeling today?",
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ✅ AUTO SCROLL
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // 🔹 STEP 1: BACKEND ANALYSIS
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });

      if (!res.ok) throw new Error("Backend error");

      const analysis = await res.json();

      // 🔹 STEP 2: GEMINI AI RESPONSE
      const model = "gemini-3-flash-preview";

      const systemInstruction = `
You are a human-like emotional support assistant.

User context:
- Emotion: ${analysis.emotion || "neutral"}
- Stress level: ${analysis.stressLevel || "low"}
- Sentiment: ${analysis.sentiment || 0}

Rules:
- Speak naturally like a human
- Keep response short (1-3 sentences)
- Be empathetic and supportive
- Do NOT sound robotic
- If user is sad → comfort
- If happy → be energetic
- If stressed → calm them
`;

      const historyParts = messages.slice(-6).map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));

      const response = await ai.models.generateContent({
        model,
        contents: [
          ...historyParts,
          { role: 'user', parts: [{ text: input }] }
        ],
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.text || "I'm here for you. Tell me more.",
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);

    } catch (error) {
      console.error("Chat error:", error);

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: "⚠️ Something went wrong. Please try again.",
          sender: 'bot',
          timestamp: new Date(),
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border shadow-lg overflow-hidden">

      {/* HEADER */}
      <div className="p-4 bg-indigo-600 text-white flex items-center gap-3">
        <Bot className="w-5 h-5" />
        <div>
          <h3 className="font-bold text-sm">AI Assistant</h3>
          <p className="text-xs flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Powered by DTN
          </p>
        </div>
      </div>

      {/* CHAT */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">

        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-xl text-sm ${msg.sender === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white border'
                  }`}
              >
                <div className="text-[10px] opacity-60 mb-1">
                  {msg.sender === 'user' ? 'You' : 'Assistant'}
                </div>
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* LOADING */}
        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            Thinking...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* INPUT */}
      <form onSubmit={handleSend} className="p-4 flex gap-2 border-t">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 p-2 rounded-lg bg-gray-100 outline-none"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="bg-indigo-600 text-white p-2 rounded-lg"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>

    </div>
  );
};

export default Chatbot;




