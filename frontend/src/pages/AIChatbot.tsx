import { useState, useEffect, useRef } from 'react';
import { api } from '../lib/api';
import { ChatMessage } from '../lib/types';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import {
  MessageCircle,
  Send,
  Bot,
  User,
  Trash2,
  Loader2,
  Sparkles,
  Heart,
  Pill,
  Activity,
  AlertCircle
} from 'lucide-react';

interface Message extends ChatMessage {
  loading?: boolean;
}

const quickQuestions = [
  "What are the symptoms of dehydration?",
  "How can I improve my sleep quality?",
  "What vitamins should I take daily?",
  "How to maintain a healthy weight?"
];

export default function AIChatbot() {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (profile) {
      fetchMessages();
    }
  }, [profile]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    if (!profile) return;

    try {
      const data = await api.get('/api/chat-history');

      setMessages((data || []) as Message[]);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  

 const handleSend = async () => {
  if (!input.trim() || !profile || sending) return;

  const userMessage = input.trim();
  setInput("");
  setSending(true);

  // Show user message immediately
  const userMsg: Message = {
    id: `user-${Date.now()}`,
    user_id: profile.id,
    message: userMessage,
    is_user: true,
    created_at: new Date().toISOString(),
  };

  setMessages((prev) => [...prev, userMsg]);

  // Show loading
  const loadingId = `loading-${Date.now()}`;

  setMessages((prev) => [
    ...prev,
    {
      id: loadingId,
      user_id: profile.id,
      message: "",
      is_user: false,
      created_at: new Date().toISOString(),
      loading: true,
    },
  ]);

  try {
    const res = await api.post("/api/ai-chat", {
      message: userMessage,
    });

    // Remove loading and add AI reply
    setMessages((prev) => [
      ...prev.filter((m) => m.id !== loadingId),
      {
        id: `ai-${Date.now()}`,
        user_id: profile.id,
        message: res.reply,
        is_user: false,
        created_at: new Date().toISOString(),
      },
    ]);
  } catch (err) {
    console.error(err);

    setMessages((prev) => prev.filter((m) => m.id !== loadingId));

    alert("Failed to contact AI");
  } finally {
    setSending(false);
  }
};

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = async () => {
    if (!profile || !confirm('Are you sure you want to clear the chat history?')) return;

    try {
      await api.delete('/api/chat-history');
      setMessages([]);
    } catch (error) {
      console.error('Error clearing chat:', error);
    }
  };

  const handleQuickQuestion = (question: string) => {
    setInput(question);
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-200">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-sky-900">Health AI Assistant</h1>
              <p className="text-sm text-sky-600 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Online - Ask me anything about health
              </p>
            </div>
          </div>
          {messages.length > 0 && (
            <button
              onClick={clearChat}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Clear Chat
            </button>
          )}
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto bg-white rounded-2xl shadow-sm border border-sky-100 p-4 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Loader2 className="w-8 h-8 text-sky-500 animate-spin mx-auto mb-3" />
                <p className="text-sky-600">Loading messages...</p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center mb-6">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-xl font-bold text-sky-900 mb-2">Welcome to Health AI</h2>
              <p className="text-sky-600 mb-6 max-w-md">
                I'm your personal health assistant. Ask me about symptoms, medications, nutrition, fitness, or general wellness tips.
              </p>
              <div className="grid grid-cols-2 gap-2 w-full max-w-lg">
                {quickQuestions.map((question, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuickQuestion(question)}
                    className="p-3 rounded-xl bg-sky-50 border border-sky-200 text-sm text-sky-700 hover:bg-sky-100 transition-colors text-left"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.is_user ? 'justify-end' : 'justify-start'}`}
                >
                  {!msg.is_user && (
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] p-4 rounded-2xl ${
                      msg.is_user
                        ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-br-md'
                        : 'bg-sky-50 text-sky-900 rounded-bl-md'
                    }`}
                  >
                    {msg.loading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sky-600">Thinking...</span>
                      </div>
                    ) : (
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {msg.message}
                      </div>
                    )}
                  </div>
                  {msg.is_user && (
                    <div className="w-8 h-8 rounded-lg bg-sky-200 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-sky-600" />
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="mt-4 bg-white rounded-2xl shadow-sm border border-sky-100 p-3">
          <div className="flex items-end gap-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about symptoms, medications, wellness tips..."
              rows={1}
              className="flex-1 resize-none border-0 bg-transparent text-sky-900 placeholder-sky-400 focus:outline-none focus:ring-0 text-sm"
              style={{ minHeight: '24px', maxHeight: '120px' }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || sending}
              className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-shadow"
            >
              {sending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-center text-sky-500 mt-3 flex items-center justify-center gap-1">
          <AlertCircle className="w-3 h-3" />
          This is general information only. Always consult a healthcare professional for medical advice.
        </p>
      </div>
    </Layout>
  );
}
