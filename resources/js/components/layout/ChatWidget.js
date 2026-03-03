import React, { useState, useRef, useEffect } from 'react';

const csrf = (window.__APP__ || {}).csrfToken || '';

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef(null);

    // Initial greeting if history is empty
    const welcomeMsg = { type: 'bot', text: "Hello! I'm your AI Assistant. How can I help you today?" };

    useEffect(() => {
        fetchHistory();
    }, []);

    useEffect(() => {
        if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isOpen]);

    const fetchHistory = async () => {
        try {
            const res = await fetch('/user/chatbot/history');
            const data = await res.json();
            if (data.history && data.history.length > 0) {
                const historyMsgs = [];
                data.history.forEach(item => {
                    historyMsgs.push({ type: 'user', text: item.user_message });
                    historyMsgs.push({ type: 'bot', text: item.bot_response });
                });
                setMessages(historyMsgs);
            } else {
                setMessages([welcomeMsg]);
            }
        } catch {
            setMessages([welcomeMsg]);
        }
    };

    const clearHistory = async () => {
        if (!confirm('Are you sure you want to delete your conversation history?')) return;

        try {
            await fetch('/user/chatbot/history', {
                method: 'DELETE',
                headers: { 'X-CSRF-TOKEN': csrf }
            });
            setMessages([welcomeMsg]);
        } catch {
            alert('Failed to clear history.');
        }
    };

    async function sendMessage(e) {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = input.trim();
        setMessages(m => [...m, { type: 'user', text: userMsg }]);
        setInput('');
        setLoading(true);

        try {
            const res = await fetch('/user/chatbot/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf },
                body: JSON.stringify({ message: userMsg }) // No category needed anymore
            });
            const data = await res.json();
            setMessages(m => [...m, { type: 'bot', text: data.response || 'Sorry, no response.' }]);
        } catch {
            setMessages(m => [...m, { type: 'bot', text: 'Sorry, something went wrong.' }]);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className={`chat-widget-container ${isOpen ? 'open' : ''}`}>
            {/* Chat Window */}
            <div className="chat-widget-window">
                <div className="chat-widget-header">
                    <div className="chat-widget-title">
                        <i className="bi bi-robot"></i> AI Helper
                    </div>
                    <div className="flex gap-2">
                        <button className="chat-widget-header-btn" onClick={clearHistory} title="Clear Chat History">
                            <i className="bi bi-trash"></i>
                        </button>
                        <button className="chat-widget-close" onClick={() => setIsOpen(false)}>
                            <i className="bi bi-x"></i>
                        </button>
                    </div>
                </div>

                <div className="chat-widget-messages">
                    {messages.map((m, i) => (
                        <div key={i} className={`chat-message-row ${m.type}`}>
                            {m.type === 'bot' && (
                                <div className="chat-avatar bot">
                                    <i className="bi bi-robot"></i>
                                </div>
                            )}
                            <div
                                className={`chat-bubble ${m.type}`}
                                style={{ whiteSpace: 'pre-line' }}
                                dangerouslySetInnerHTML={{
                                    __html: m.text
                                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                        .replace(/^\* /gm, '- ')
                                }}
                            />
                            {m.type === 'user' && (
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
                                <span className="typing-text">AI is thinking...</span>
                            </div>
                        </div>
                    )}
                    <div ref={bottomRef}></div>
                </div>

                <form className="chat-widget-input" onSubmit={sendMessage}>
                    <input
                        type="text"
                        placeholder="Type a message..."
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        disabled={loading}
                    />
                    <button type="submit" disabled={loading || !input.trim()}>
                        <i className="bi bi-send"></i>
                    </button>
                </form>
            </div>

            {/* Floating Toggle Button */}
            <button className="chat-widget-toggle" onClick={() => setIsOpen(!isOpen)}>
                <div className="robot-head">
                    <div className="robot-eyes">
                        <span></span>
                        <span></span>
                    </div>
                    <div className="robot-mouth"></div>
                </div>
                <div className="chat-widget-tooltip">Need Help?</div>
            </button>
        </div>
    );
}
