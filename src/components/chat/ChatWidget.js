'use client';

import { useState, useRef, useEffect } from 'react';

const categories = [
  { key: 'general', label: 'General' },
  { key: 'budget', label: '💰 Budget' },
  { key: 'events', label: '📅 Events' },
  { key: 'office_hours', label: '🕐 Hours' },
  { key: 'contact', label: '📞 Contact' },
];

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{ role: 'bot', content: 'Hello! How can I help you today? 😊' }]);
  const [input, setInput] = useState('');
  const [category, setCategory] = useState('general');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  async function handleSend(e) {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);
    try {
      const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: userMsg, category }) });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: 'bot', content: data.response }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'bot', content: 'Sorry, something went wrong.' }]);
    }
    setLoading(false);
  }

  return (
    <div className={`chat-widget-container ${isOpen ? 'open' : ''}`}>
      {isOpen && (
        <div className="chat-widget-window" style={{ opacity: 1, visibility: 'visible', transform: 'translateY(0) scale(1)' }}>
          <div className="chat-widget-header">
            <div className="chat-widget-title"><i className="bi bi-robot"></i> TranspaSys AI</div>
            <button className="chat-widget-close" onClick={() => setIsOpen(false)}>×</button>
          </div>
          <div className="chat-widget-topics">
            {categories.map((c) => (
              <button key={c.key} className={`topic-btn ${category === c.key ? 'active' : ''}`} onClick={() => setCategory(c.key)}>{c.label}</button>
            ))}
          </div>
          <div className="chat-widget-messages">
            {messages.map((m, i) => (
              <div key={i} className={`chat-message-row ${m.role}`}>
                {m.role === 'bot' && <div className="chat-avatar bot"><i className="bi bi-robot"></i></div>}
                <div className={`chat-bubble ${m.role}`}>{m.content}</div>
                {m.role === 'user' && <div className="chat-avatar user"><i className="bi bi-person"></i></div>}
              </div>
            ))}
            {loading && (
              <div className="chat-message-row bot">
                <div className="chat-avatar bot"><i className="bi bi-robot"></i></div>
                <div className="chat-bubble bot typing">
                  <div className="typing-indicator"><div className="typing-dot"></div><div className="typing-dot"></div><div className="typing-dot"></div></div>
                  <span className="typing-text">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <form className="chat-widget-input" onSubmit={handleSend}>
            <input placeholder="Ask a question..." value={input} onChange={(e) => setInput(e.target.value)} disabled={loading} />
            <button type="submit" disabled={loading || !input.trim()}><i className="bi bi-send"></i></button>
          </form>
        </div>
      )}
      <button className="chat-widget-toggle" onClick={() => setIsOpen(!isOpen)}>
        <div className="robot-head">
          <div className="robot-eyes"><span></span><span></span></div>
          <div className="robot-mouth"></div>
        </div>
        <span className="chat-widget-tooltip">Chat with AI</span>
      </button>
    </div>
  );
}
