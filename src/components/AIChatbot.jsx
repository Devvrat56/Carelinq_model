import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Sparkles, 
  X, 
  User, 
  Bot, 
  ChevronRight, 
  BrainCircuit,
  Zap,
  ShieldCheck,
  Mic,
  Paperclip
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '../config';
import './AIChatbot.css';

const AIChatbot = ({ isOpen, onClose, user }) => {
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      type: 'bot', 
      text: `Hello ${user?.name || 'there'}! I am your Carelinq AI Health Assistant. How can I help you today with your oncology or dermatology concerns?`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = {
      id: Date.now(),
      type: 'user',
      text: input,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(async () => {
      const botResponse = getAIResponse(input);
      const botMsg = {
        id: Date.now() + 1,
        type: 'bot',
        text: botResponse,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);

      // SAVE TO MONGODB
      try {
        await fetch(`${API_BASE_URL}/api/chatbot/save`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_email: user?.email,
            message: input,
            response: botResponse
          })
        });
      } catch (err) {
        console.error("Failed to save conversation:", err);
      }
    }, 1500);
  };

  const getAIResponse = (query) => {
    const q = query.toLowerCase();
    if (q.includes('oncology') || q.includes('cancer')) return "Our oncology protocols prioritize targeted chemotherapy and regular CT monitoring. Based on your records, you are currently in Cycle 4. Would you like to see your latest recovery markers?";
    if (q.includes('skin') || q.includes('dermatology') || q.includes('rash')) return "I see you're asking about dermatology. It's important to monitor any changes in pigmentation or texture. I can flag this for your specialist, Dr. Wilson, for your next high-res video consult.";
    if (q.includes('appointment') || q.includes('schedule')) return "I can help you schedule a virtual session with either the Oncology or Dermatology departments. Which one would you prefer?";
    return "I'm analyzing your request using our specialized medical database. Could you provide a bit more detail about your symptoms or inquiry?";
  };

  if (!isOpen) return null;

  return (
    <motion.div 
      className="ai-chatbot-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="ai-chatbot-container"
        initial={{ y: 100, scale: 0.9, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        exit={{ y: 100, scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      >
        {/* Header */}
        <div className="ai-chatbot-header">
          <div className="ai-brand">
            <div className="ai-gemini-icon">
              <Sparkles size={20} />
            </div>
            <div className="ai-title">
              <h3>Carelinq AI</h3>
              <div className="ai-status">
                <span className="pulse-dot"></span>
                Medically Verified AI
              </div>
            </div>
          </div>
          <button className="ai-close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        {/* Messages */}
        <div className="ai-chat-body" ref={scrollRef}>
          <div className="ai-security-notice">
            <ShieldCheck size={14} /> End-to-end encrypted medical consultation
          </div>

          {messages.map((msg) => (
            <div key={msg.id} className={`ai-message-wrapper ${msg.type}`}>
              {msg.type === 'bot' && <div className="bot-avatar"><Bot size={16} /></div>}
              <div className="ai-message-bubble">
                <p>{msg.text}</p>
                <span className="msg-time">{msg.time}</span>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="ai-message-wrapper bot">
              <div className="bot-avatar"><Bot size={16} /></div>
              <div className="ai-typing-indicator">
                <span></span><span></span><span></span>
              </div>
            </div>
          )}
        </div>

        {/* Suggested Actions */}
        <div className="ai-suggested">
           <button className="sug-btn">View Health Metrics <ChevronRight size={14} /></button>
           <button className="sug-btn">Check Lab Reports <ChevronRight size={14} /></button>
        </div>

        {/* Input */}
        <div className="ai-chat-footer">
          <form onSubmit={handleSend} className="ai-input-container">
            <button type="button" className="footer-action"><Paperclip size={18} /></button>
            <input 
              type="text" 
              placeholder="Ask anything about your health..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="button" className="footer-action"><Mic size={18} /></button>
            <button type="submit" className="ai-send-btn" disabled={!input.trim()}>
              <Send size={18} />
            </button>
          </form>
          <div className="ai-footer-note">
             <BrainCircuit size={12} /> Powered by Carelinq Gemini Engine
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AIChatbot;
