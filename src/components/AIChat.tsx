import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { getChatResponse } from '@/src/services/geminiService';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function AIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm Saheli, your Ajwa Global concierge. How can I help you plan your perfect birthday or event today?"
    }
  ]);
  const [history, setHistory] = useState<{ role: 'user' | 'model', parts: { text: string }[] }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userContent = input.trim();
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userContent
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const responseText = await getChatResponse(userContent, history);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseText || "I'm sorry, I'm having trouble connecting right now. Please try again later."
      };

      setMessages(prev => [...prev, aiMessage]);
      setHistory(prev => [
        ...prev,
        { role: 'user', parts: [{ text: userContent }] },
        { role: 'model', parts: [{ text: responseText || "" }] }
      ]);
    } catch (error) {
      console.error("Gemini Error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I encountered an error. Please check your connection."
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-sage text-gray-900 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform z-50"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 w-[90vw] sm:w-[400px] h-[600px] max-h-[80vh] bg-white rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden border border-wood/20"
          >
            {/* Header */}
            <div className="p-4 bg-sage flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-sage" />
                </div>
                <div>
                  <h3 className="font-serif font-semibold text-gray-900">Saheli</h3>
                  <p className="text-[10px] uppercase tracking-wider text-gray-700">Ajwa Global Concierge</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-gray-700 hover:text-gray-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-grow overflow-y-auto p-4 space-y-4 bg-cream">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex",
                    msg.role === 'user' ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] p-3 rounded-2xl text-sm",
                      msg.role === 'user'
                        ? "bg-sage text-gray-900 rounded-tr-none"
                        : "bg-white border border-wood/20 text-gray-800 rounded-tl-none"
                    )}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-wood/20 p-3 rounded-2xl rounded-tl-none">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-sage rounded-full animate-bounce" />
                      <div className="w-1.5 h-1.5 bg-sage rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-1.5 h-1.5 bg-sage rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-wood/20">
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask about birthdays, menu, or venue..."
                  className="w-full pl-4 pr-12 py-3 bg-cream border border-wood/20 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-sage/50"
                />
                <button
                  onClick={handleSend}
                  disabled={isLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-sage rounded-full flex items-center justify-center text-gray-900 hover:bg-opacity-80 transition-all disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
