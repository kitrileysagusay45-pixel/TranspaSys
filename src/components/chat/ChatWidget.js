'use client';

import { useState, useRef, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

// Lightweight markdown → HTML parser for bot responses
function formatBotMessage(text) {
  if (!text) return '';
  
  // Escape HTML entities first for safety
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Split into lines
  const lines = html.split('\n');
  const result = [];
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();

    if (!line) {
      if (inList) { result.push('</ul>'); inList = false; }
      result.push('<div class="chat-spacer"></div>');
      continue;
    }

    // Headings: **Text** on its own line (bold heading)
    if (/^\*\*(.+?)\*\*$/.test(line)) {
      if (inList) { result.push('</ul>'); inList = false; }
      line = line.replace(/^\*\*(.+?)\*\*$/, '<strong class="chat-heading">$1</strong>');
      result.push(line);
      continue;
    }

    // Bullet points: - text or • text or * text
    if (/^[-•*]\s+/.test(line)) {
      if (!inList) { result.push('<ul class="chat-list">'); inList = true; }
      let content = line.replace(/^[-•*]\s+/, '');
      // Inline bold
      content = content.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      result.push(`<li>${content}</li>`);
      continue;
    }

    // Numbered list: 1. text
    if (/^\d+\.\s+/.test(line)) {
      if (!inList) { result.push('<ul class="chat-list numbered">'); inList = true; }
      let content = line.replace(/^\d+\.\s+/, '');
      content = content.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      result.push(`<li>${content}</li>`);
      continue;
    }

    // Regular line — close list if open
    if (inList) { result.push('</ul>'); inList = false; }

    // Inline bold
    line = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    result.push(`<p class="chat-para">${line}</p>`);
  }

  if (inList) result.push('</ul>');
  return result.join('');
}

const categories = [
  { key: 'general', label: 'General' },
  { key: 'budget', label: '💰 Budget' },
  { key: 'events', label: '📅 Events' },
  { key: 'office_hours', label: '🕐 Hours' },
  { key: 'contact', label: '📞 Contact' },
];

export default function ChatWidget() {
  const supabase = createClient();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [input, setInput] = useState('');
  const [category, setCategory] = useState('general');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Load persisted chat history from server on mount
  useEffect(() => {
    async function loadHistory() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setMessages([{ role: 'bot', content: 'Hello! How can I help you with TranspaSys today? 😊' }]);
          setHistoryLoaded(true);
          return;
        }

        const { data, error } = await supabase
          .from('chatbot_conversations')
          .select('user_message, bot_response, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true })
          .limit(50);

        if (error || !data || data.length === 0) {
          setMessages([{ role: 'bot', content: 'Hello! How can I help you with TranspaSys today? 😊' }]);
        } else {
          const history = data.flatMap((c) => [
            { role: 'user', content: c.user_message },
            { role: 'bot', content: c.bot_response },
          ]);
          setMessages(history);
        }
      } catch {
        setMessages([{ role: 'bot', content: 'Hello! How can I help you with TranspaSys today? 😊' }]);
      }
      setHistoryLoaded(true);
    }
    loadHistory();
  }, []);

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
        <div className="chat-widget-window">
          <div className="chat-widget-header">
            <div className="chat-widget-title">
              <i className="bi bi-robot"></i> 
              <span>TranspaSys AI</span>
              <span className="status-dot online"></span>
            </div>
            <button className="chat-widget-close" onClick={() => setIsOpen(false)} aria-label="Close Chat">
              <i className="bi bi-dash-lg"></i>
            </button>
          </div>
          <div className="chat-widget-topics">
            {categories.map((c) => (
              <button 
                key={c.key} 
                className={`topic-btn ${category === c.key ? 'active' : ''}`} 
                onClick={() => setCategory(c.key)}
              >
                {c.label}
              </button>
            ))}
          </div>
          <div className="chat-widget-messages">
            {!historyLoaded ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 20 }}>
                <div className="spinner" style={{ margin: 0, width: 28, height: 28 }}></div>
              </div>
            ) : messages.map((m, i) => (
              <div key={i} className={`chat-message-row ${m.role}`}>
                {m.role === 'bot' && (
                  <div className="chat-avatar bot">
                    <i className="bi bi-robot"></i>
                  </div>
                )}
                <div className={`chat-bubble ${m.role}`}>
                  {m.role === 'bot' ? (
                    <div className="bot-formatted" dangerouslySetInnerHTML={{ __html: formatBotMessage(m.content) }} />
                  ) : m.content}
                </div>
                {m.role === 'user' && (
                  <div className="chat-avatar user">
                    <i className="bi bi-person-fill"></i>
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="chat-message-row bot">
                <div className="chat-avatar bot">
                  <i className="bi bi-robot"></i>
                </div>
                <div className="chat-bubble bot typing">
                  <div className="typing-indicator">
                    <span></span><span></span><span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <form className="chat-widget-input" onSubmit={handleSend}>
            <input 
              placeholder="Ask about budgets, events..." 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              disabled={loading}
              autoFocus
            />
            <button type="submit" disabled={loading || !input.trim()} aria-label="Send Message">
              <i className="bi bi-send-fill"></i>
            </button>
          </form>
        </div>
      )}
      <button 
        className="chat-widget-toggle" 
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close AI Assistant" : "Open AI Assistant"}
      >
        <div className="robot-head">
          <div className="robot-eyes"><span></span><span></span></div>
          <div className="robot-mouth"></div>
        </div>
        {!isOpen && <span className="chat-widget-tooltip">Need help? Ask AI</span>}
      </button>
    </div>
  );
}
