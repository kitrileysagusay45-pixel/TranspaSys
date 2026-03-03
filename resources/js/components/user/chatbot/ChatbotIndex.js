import React, { useState, useRef, useEffect } from 'react';
import UserLayout from '../../layout/UserLayout';

const csrf = (window.__APP__ || {}).csrfToken || '';
const categories = [
    { value: 'budget', label: 'Budget' },
    { value: 'events', label: 'Events' },
    { value: 'office_hours', label: 'Office Hours' },
    { value: 'contact', label: 'Contact' },
    { value: 'sk_programs', label: 'SK Programs' },
];

export default function UserChatbot() {
    const [messages, setMessages] = useState([
        { type: 'bot', text: "Hello! I'm the TranspaSys Citizen Assistant 🤖 How can I help you today? Ask me about budget, events, office hours, contact info, or SK programs!" }
    ]);
    const [input, setInput] = useState('');
    const [category, setCategory] = useState('');
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef(null);

    useEffect(() => {
        if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    async function sendMessage(e) {
        e.preventDefault();
        if (!input.trim() || !category) return;

        const userMsg = input.trim();
        setMessages(m => [...m, { type: 'user', text: userMsg }]);
        setInput('');
        setLoading(true);

        try {
            const res = await fetch('/user/chatbot/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf },
                body: JSON.stringify({ message: userMsg, category })
            });
            const data = await res.json();
            setMessages(m => [...m, { type: 'bot', text: data.response || 'Sorry, no response.' }]);
        } catch {
            setMessages(m => [...m, { type: 'bot', text: 'Sorry, something went wrong. Please try again.' }]);
        } finally {
            setLoading(false);
        }
    }

    return (
        <UserLayout title="AI Citizen Helper">
            <div className="grid-2-1">
                <div className="card">
                    <div className="card-header">
                        <div className="card-title">
                            <i className="bi bi-robot"></i> TranspaSys AI Helper
                        </div>
                    </div>
                    <div className="chat-messages" style={{ minHeight: 450, maxHeight: 550, overflowY: 'auto', padding: '16px' }}>
                        {messages.map((m, i) => (
                            <div key={i} className={`chat-bubble ${m.type}`} style={{
                                marginBottom: 12,
                                padding: '10px 14px',
                                borderRadius: 12,
                                maxWidth: '85%',
                                alignSelf: m.type === 'user' ? 'flex-end' : 'flex-start',
                                background: m.type === 'user' ? 'var(--primary)' : '#f1f5f9',
                                color: m.type === 'user' ? '#fff' : 'var(--text-primary)',
                                marginLeft: m.type === 'user' ? 'auto' : '0',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                            }}>
                                {m.text}
                            </div>
                        ))}
                        {loading && (
                            <div className="chat-bubble bot" style={{ background: '#f1f5f9', padding: '10px 14px', borderRadius: 12, display: 'inline-block' }}>
                                <div className="typing-indicator">
                                    <div className="typing-dot"></div>
                                    <div className="typing-dot"></div>
                                    <div className="typing-dot"></div>
                                </div>
                            </div>
                        )}
                        <div ref={bottomRef}></div>
                    </div>
                    <div className="card-footer p-3 border-top bg-white">
                        <form onSubmit={sendMessage} className="flex gap-2">
                            <input
                                type="text"
                                className="form-control"
                                placeholder={category ? `Message about ${category}...` : 'Choose a topic on the right...'}
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                disabled={loading || !category}
                                style={{ borderRadius: 20 }}
                            />
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading || !input.trim() || !category}
                                style={{ borderRadius: '50%', width: 40, height: 40, padding: 0 }}
                            >
                                <i className="bi bi-send"></i>
                            </button>
                        </form>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <div className="card-title">
                            <i className="bi bi-list-task"></i> Select Topic
                        </div>
                    </div>
                    <div className="card-body">
                        <p className="small text-muted mb-3">Please choose what you'd like to ask about:</p>
                        <div className="flex flex-col gap-2">
                            {categories.map(c => (
                                <button
                                    key={c.value}
                                    className={`btn w-full text-left flex-between ${category === c.value ? 'btn-primary' : 'btn-outline'}`}
                                    onClick={() => setCategory(c.value)}
                                    style={{ justifyContent: 'space-between' }}
                                >
                                    {c.label}
                                    {category === c.value && <i className="bi bi-check-lg"></i>}
                                </button>
                            ))}
                        </div>
                        <div className="divider mt-4"></div>
                        <div className="alert alert-info py-2 small mt-3">
                            <i className="bi bi-info-circle"></i> This assistant provides guided information based on official barangay records.
                        </div>
                    </div>
                </div>
            </div>
        </UserLayout>
    );
}
