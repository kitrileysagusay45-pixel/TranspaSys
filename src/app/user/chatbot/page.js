'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

const categories = [
  { key: 'general', label: 'General' },
  { key: 'budget', label: '💰 Budget' },
  { key: 'events', label: '📅 Events' },
  { key: 'office_hours', label: '🕐 Office Hours' },
  { key: 'contact', label: '📞 Contact' },
  { key: 'sk_programs', label: '🏀 SK Programs' },
];

export default function UserChatbot() {
  const supabase = createClient();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [category, setCategory] = useState('general');
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => { loadHistory(); }, []);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  async function loadHistory() {
    const { data } = await supabase.from('chatbot_conversations').select('*').order('created_at').limit(100);
    const history = (data || []).flatMap((c) => [
      { role: 'user', content: c.user_message },
      { role: 'bot', content: c.bot_response },
    ]);
    setMessages(history);
    setHistoryLoading(false);
  }

  async function handleSend(e) {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, category }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: 'bot', content: data.response }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'bot', content: 'Sorry, something went wrong. Please try again.' }]);
    }
    setLoading(false);
  }

  async function handleClearHistory() {
    if (!confirm('Clear all chat history?')) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (user) await supabase.from('chatbot_conversations').delete().eq('user_id', user.id);
    setMessages([]);
  }

  return (
    <>
      <div className="user-page-header-wrapper"><div className="user-container"><h1 className="user-page-title">AI Chatbot</h1><p className="user-page-subtitle">Ask questions about barangay services, budgets, and events</p></div></div>
      <div className="user-container user-content-wrapper">
        <div className="card">
          <div className="chatbot-wrapper">
            <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ display: 'flex', gap: 6, overflowX: 'auto' }}>
                {categories.map((c) => (
                  <button key={c.key} onClick={() => setCategory(c.key)} className={`topic-btn ${category === c.key ? 'active' : ''}`}>{c.label}</button>
                ))}
              </div>
              <button onClick={handleClearHistory} className="btn btn-sm btn-secondary"><i className="bi bi-trash"></i></button>
            </div>
            <div className="chat-messages">
              {historyLoading ? <div className="spinner"></div> : messages.length === 0 ? (
                <div className="empty-state"><i className="bi bi-robot"></i><p>Start a conversation!</p></div>
              ) : messages.map((m, i) => (
                <div key={i} className={`chat-bubble ${m.role === 'user' ? 'user' : 'bot'}`}>
                  {m.content}
                </div>
              ))}
              {loading && (
                <div className="chat-bubble bot typing">
                  <div className="typing-indicator"><div className="typing-dot"></div><div className="typing-dot"></div><div className="typing-dot"></div></div>
                  <span className="typing-text">Thinking...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSend} className="chat-input-row">
              <input className="chat-input" placeholder="Type your question..." value={input} onChange={(e) => setInput(e.target.value)} disabled={loading} />
              <button type="submit" className="btn btn-primary" disabled={loading || !input.trim()}>
                <i className="bi bi-send"></i>
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
