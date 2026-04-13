'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function ChatbotLogs() {
  const supabase = createClient();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);

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
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Category</th>
                    <th>User Message</th>
                    <th>Bot Response</th>
                    <th>Date</th>
                    <th style={{ width: 60 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {conversations.length === 0 ? (
                    <tr><td colSpan="6" className="text-center text-muted">No chatbot logs</td></tr>
                  ) : conversations.map((c) => (
                    <tr key={c.id}>
                      <td className="td-bold">{c.users?.name || 'Unknown'}</td>
                      <td><span className="badge badge-info">{c.category}</span></td>
                      <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.user_message}</td>
                      <td style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.bot_response}</td>
                      <td>{new Date(c.created_at).toLocaleString('en-PH')}</td>
                      <td>
                        <button className="btn-icon" onClick={() => setSelectedLog(c)} aria-label="View Details">
                          <i className="bi bi-eye"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Log Details Modal */}
        {selectedLog && (
          <div className="modal-overlay" onClick={() => setSelectedLog(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Log Details</h3>
                <button className="btn-close" onClick={() => setSelectedLog(null)}>
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>
              <div className="modal-body">
                <div className="log-meta">
                  <div className="meta-item">
                    <span className="meta-label">User</span>
                    <strong>{selectedLog.users?.name || 'Unknown'}</strong>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Category</span>
                    <span className="badge badge-info">{selectedLog.category}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Date</span>
                    <span>{new Date(selectedLog.created_at).toLocaleString('en-PH')}</span>
                  </div>
                </div>
                
                <hr className="divider" />
                
                <div className="log-section">
                  <p className="log-title"><i className="bi bi-person-fill"></i> User Message:</p>
                  <div className="log-box user">
                    {selectedLog.user_message}
                  </div>
                </div>

                <div className="log-section">
                  <p className="log-title"><i className="bi bi-robot"></i> Bot Response:</p>
                  <div className="log-box bot">
                    {selectedLog.bot_response}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <style jsx>{`
          .btn-icon {
            background: transparent;
            border: none;
            color: var(--text-muted);
            font-size: 1.1rem;
            cursor: pointer;
            padding: 6px;
            border-radius: 6px;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .btn-icon:hover {
            color: var(--primary);
            background: rgba(255, 255, 255, 0.05); /* Subtle highlight consistent with admin theme */
          }

          /* Modal Styles */
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(4px);
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.15s ease;
          }
          .modal-content {
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: 12px;
            width: 90%;
            max-width: 650px;
            max-height: 85vh;
            display: flex;
            flex-direction: column;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
            animation: slideUp 0.2s ease;
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .modal-header {
            padding: 20px 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid var(--border);
            flex-shrink: 0;
          }
          .modal-header h3 {
            margin: 0;
            color: var(--text-primary);
            font-size: 1.25rem;
            font-weight: 600;
          }
          .btn-close {
            background: transparent;
            border: none;
            color: var(--text-muted);
            font-size: 1.2rem;
            cursor: pointer;
            padding: 4px;
            transition: color 0.2s;
          }
          .btn-close:hover {
            color: var(--danger);
          }
          .modal-body {
            padding: 24px;
            overflow-y: auto;
            -webkit-overflow-scrolling: touch;
          }
          .log-meta {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
            margin-bottom: 4px;
          }
          .meta-item {
            display: flex;
            flex-direction: column;
            gap: 4px;
            color: var(--text-secondary);
            font-size: 0.95rem;
          }
          .meta-label {
            font-size: 0.8rem;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-weight: 600;
          }
          .divider {
            border: 0;
            height: 1px;
            background: var(--border);
            margin: 20px 0;
          }
          .log-section {
            margin-bottom: 20px;
          }
          .log-title {
            margin-top: 0;
            margin-bottom: 8px;
            font-weight: 600;
            color: var(--text-primary);
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .log-box {
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid var(--border);
            border-radius: 8px;
            padding: 14px 16px;
            font-size: 0.95rem;
            line-height: 1.5;
            color: var(--text-secondary);
            white-space: pre-wrap;
            word-break: break-word;
          }
          .log-box.user {
            border-left: 3px solid var(--primary);
          }
          .log-box.bot {
            border-left: 3px solid var(--success);
          }
        `}</style>
    </div>
  );
}
