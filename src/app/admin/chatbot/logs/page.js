'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function ChatbotLogs() {
  const supabase = createClient();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('chatbot_conversations').select('*, users(name)').order('created_at', { ascending: false }).limit(200);
      setConversations(data || []);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <div className="page-content"><div className="spinner"></div></div>;

  return (
    <div className="page-content">
        <div className="page-header">
          <h1 className="page-title"><span>Chatbot</span> Logs</h1>
        </div>
        <div className="card">
          <div className="card-body">
            <div className="table-wrapper">
              <table>
                <thead><tr><th>User</th><th>Category</th><th>User Message</th><th>Bot Response</th><th>Date</th></tr></thead>
                <tbody>
                  {conversations.length === 0 ? (
                    <tr><td colSpan="5" className="text-center text-muted">No chatbot logs</td></tr>
                  ) : conversations.map((c) => (
                    <tr key={c.id}>
                      <td className="td-bold">{c.users?.name || 'Unknown'}</td>
                      <td><span className="badge badge-info">{c.category}</span></td>
                      <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.user_message}</td>
                      <td style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.bot_response}</td>
                      <td>{new Date(c.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
    </div>
  );
}
