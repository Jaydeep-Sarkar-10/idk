import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { chatAPI } from '../../api/chat';
import {
  MessageSquare,
  SendHorizontal,
  ArrowLeft,
  Search,
  Plus,
  AlertCircle,
  Tag,
  Clock,
  Check,
  CheckCheck,
  X,
  RefreshCw
} from 'lucide-react';
import './Chat.css';

export default function Chat() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // State
  const [conversations, setConversations] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [errorConversations, setErrorConversations] = useState(null);

  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messagesError, setMessagesError] = useState(null);

  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [wsStatus, setWsStatus] = useState('disconnected'); // 'connected' | 'connecting' | 'reconnecting' | 'disconnected'
  const [searchFilter, setSearchFilter] = useState('');

  // Modal for initiating new conversation with student ID
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [newChatUserId, setNewChatUserId] = useState('');
  const [newChatLoading, setNewChatLoading] = useState(false);
  const [newChatError, setNewChatError] = useState(null);

  // Refs
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const messagesEndRef = useRef(null);
  const activeConvRef = useRef(activeConversation);

  useEffect(() => {
    activeConvRef.current = activeConversation;
  }, [activeConversation]);

  // Scroll to bottom when messages change
  const scrollToBottom = useCallback((smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
    }
  }, []);

  useEffect(() => {
    scrollToBottom(false);
  }, [messages, scrollToBottom]);

  // 1. Fetch conversations on load
  const loadConversations = useCallback(async (selectConvId = null) => {
    try {
      setLoadingConversations(true);
      setErrorConversations(null);
      const data = await chatAPI.getConversations();
      setConversations(data);

      // Check if a specific conversation ID was requested via URL query params
      const targetId = selectConvId || searchParams.get('conv') || searchParams.get('conversationId');
      if (targetId) {
        const found = data.find((c) => c.id === parseInt(targetId, 10));
        if (found) {
          setActiveConversation(found);
        } else {
          // If conversation is newly created and not yet in list, fetch its detail
          try {
            const single = await chatAPI.getConversation(targetId);
            setConversations((prev) => [single, ...prev.filter((c) => c.id !== single.id)]);
            setActiveConversation(single);
          } catch {
            // Ignore if invalid ID
          }
        }
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
      setErrorConversations(err.detail || err.error || 'Failed to load conversations.');
    } finally {
      setLoadingConversations(false);
    }
  }, [searchParams]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // 2. Load messages when active conversation changes
  useEffect(() => {
    if (!activeConversation) {
      setMessages([]);
      return;
    }

    let isMounted = true;

    const fetchHistory = async () => {
      try {
        setLoadingMessages(true);
        setMessagesError(null);
        const data = await chatAPI.getMessages(activeConversation.id);
        if (isMounted) {
          const list = data.results || (Array.isArray(data) ? data : []);
          setMessages(list);

          // Reset unread count for active conversation in list
          setConversations((prev) =>
            prev.map((c) => (c.id === activeConversation.id ? { ...c, unread_count: 0 } : c))
          );
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to load messages:', err);
          setMessagesError(err.detail || err.error || 'Failed to load message history.');
        }
      } finally {
        if (isMounted) setLoadingMessages(false);
      }
    };

    fetchHistory();

    return () => {
      isMounted = false;
    };
  }, [activeConversation?.id]);

  // 3. Manage WebSocket lifecycle for active conversation
  useEffect(() => {
    if (!activeConversation) {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      setWsStatus('disconnected');
      return;
    }

    let isCancelled = false;

    const connectWebSocket = async () => {
      // Clean up previous socket if any
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }

      setWsStatus(reconnectAttemptsRef.current === 0 ? 'connecting' : 'reconnecting');

      try {
        // Request single-use cryptographic WebSocket ticket
        const ticketRes = await chatAPI.getWsTicket();
        if (isCancelled) return;

        const wsUrl = chatAPI.getWsUrl(activeConversation.id, ticketRes.ticket);
        const socket = new WebSocket(wsUrl);
        wsRef.current = socket;

        socket.onopen = () => {
          if (isCancelled) {
            socket.close();
            return;
          }
          setWsStatus('connected');
          reconnectAttemptsRef.current = 0;
        };

        socket.onmessage = (event) => {
          if (isCancelled) return;
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'chat_message' && data.message) {
              const newMsg = data.message;

              // Deduplicate messages
              setMessages((prev) => {
                if (prev.some((m) => m.id === newMsg.id)) return prev;
                return [...prev, newMsg];
              });

              // Update conversation snippet in sidebar
              setConversations((prev) =>
                prev.map((c) => {
                  if (c.id === newMsg.conversation_id) {
                    return {
                      ...c,
                      latest_message: newMsg,
                      updated_at: newMsg.created_at
                    };
                  }
                  return c;
                })
              );
            } else if (data.type === 'error') {
              console.warn('WebSocket message error:', data.error);
            }
          } catch (e) {
            console.error('Failed to parse WebSocket message:', e);
          }
        };

        socket.onerror = (err) => {
          console.warn('WebSocket error:', err);
        };

        socket.onclose = (event) => {
          if (isCancelled) return;
          setWsStatus('disconnected');

          // Automatic exponential backoff reconnection if not a clean intentional close
          if (event.code !== 1000 && event.code !== 4001 && event.code !== 4003) {
            const attempts = reconnectAttemptsRef.current;
            const delay = Math.min(1000 * Math.pow(2, attempts), 10000);
            reconnectAttemptsRef.current += 1;
            setWsStatus('reconnecting');
            reconnectTimeoutRef.current = setTimeout(() => {
              if (!isCancelled) connectWebSocket();
            }, delay);
          }
        };
      } catch (err) {
        if (isCancelled) return;
        console.error('Failed to obtain WebSocket ticket:', err);
        setWsStatus('disconnected');
      }
    };

    connectWebSocket();

    return () => {
      isCancelled = true;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close(1000, 'Conversation switched or unmounted');
        wsRef.current = null;
      }
      setWsStatus('disconnected');
    };
  }, [activeConversation?.id]);

  // Send message handler
  const handleSendMessage = (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isSending || !activeConversation) return;

    const content = inputText.trim();
    setInputText('');

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try {
        setIsSending(true);
        wsRef.current.send(JSON.stringify({ content }));
      } catch (err) {
        console.error('Failed to send message via WebSocket:', err);
        setMessagesError('Failed to send message. Please check your connection.');
      } finally {
        setIsSending(false);
      }
    } else {
      setMessagesError('Real-time connection is currently disconnected. Reconnecting...');
    }
  };

  // Handle Enter to send, Shift+Enter for newline
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Select conversation
  const handleSelectConversation = (conv) => {
    setActiveConversation(conv);
    setSearchParams({ conv: conv.id });
  };

  // Back to inbox for mobile
  const handleBackToInbox = () => {
    setActiveConversation(null);
    setSearchParams({});
  };

  // Handle starting a new conversation by student ID
  const handleCreateNewChat = async (e) => {
    e.preventDefault();
    if (!newChatUserId) return;

    const targetId = parseInt(newChatUserId, 10);
    if (isNaN(targetId)) {
      setNewChatError('Please enter a valid student user ID.');
      return;
    }
    if (user && targetId === user.id) {
      setNewChatError('You cannot start a conversation with yourself.');
      return;
    }

    try {
      setNewChatLoading(true);
      setNewChatError(null);
      const conv = await chatAPI.createOrGetConversation({
        other_user_id: targetId
      });
      setShowNewChatModal(false);
      setNewChatUserId('');
      setConversations((prev) => [conv, ...prev.filter((c) => c.id !== conv.id)]);
      setActiveConversation(conv);
      setSearchParams({ conv: conv.id });
    } catch (err) {
      console.error('Failed to create conversation:', err);
      setNewChatError(err.error || err.detail || 'User not found or unable to start chat.');
    } finally {
      setNewChatLoading(false);
    }
  };

  // Format timestamp helper
  const formatTime = (isoString) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      const now = new Date();
      const isToday = date.toDateString() === now.toDateString();

      const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      if (isToday) return timeStr;

      return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })} ${timeStr}`;
    } catch {
      return '';
    }
  };

  // Filtered conversation list
  const filteredConversations = conversations.filter((c) => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    const otherName = c.other_user?.username?.toLowerCase() || '';
    const title = c.listing_title?.toLowerCase() || '';
    return otherName.includes(q) || title.includes(q);
  });

  return (
    <div className="chat-container">
      <div className="chat-card">
        {/* LEFT SIDEBAR */}
        <aside className={`chat-sidebar ${activeConversation ? 'mobile-hidden' : ''}`}>
          <div className="chat-sidebar-header">
            <h2 className="chat-sidebar-title">
              <MessageSquare size={22} color="var(--color-primary)" />
              Messages
            </h2>
            <button
              className="chat-new-btn"
              onClick={() => setShowNewChatModal(true)}
              title="Start a new chat with student ID"
            >
              <Plus size={16} />
              New Chat
            </button>
          </div>

          <div className="chat-search-box">
            <Search size={16} className="chat-search-icon" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="chat-search-input"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
            />
          </div>

          {loadingConversations ? (
            <div className="chat-placeholder-state">
              <RefreshCw size={24} className="animate-spin" />
              <p style={{ marginTop: '0.5rem', fontSize: 'var(--font-size-sm)' }}>Loading conversations...</p>
            </div>
          ) : errorConversations ? (
            <div className="chat-placeholder-state">
              <AlertCircle size={28} color="#dc2626" />
              <p style={{ marginTop: '0.5rem', color: '#dc2626', fontSize: 'var(--font-size-sm)' }}>
                {errorConversations}
              </p>
              <button
                onClick={() => loadConversations()}
                style={{
                  marginTop: '0.75rem',
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--color-primary)',
                  fontWeight: 600,
                  textDecoration: 'underline'
                }}
              >
                Retry
              </button>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="chat-placeholder-state">
              <MessageSquare size={36} className="chat-placeholder-icon" />
              <p className="chat-placeholder-title">No conversations yet</p>
              <p className="chat-placeholder-desc">
                When you enquire about marketplace listings or message other students, your chats will appear here.
              </p>
            </div>
          ) : (
            <ul className="chat-thread-list">
              {filteredConversations.map((conv) => {
                const isActive = activeConversation?.id === conv.id;
                const otherUser = conv.other_user?.username || 'Student';
                const initial = otherUser.charAt(0).toUpperCase();
                const latestMsg = conv.latest_message;

                return (
                  <li
                    key={conv.id}
                    className={`chat-thread-item ${isActive ? 'active' : ''}`}
                    onClick={() => handleSelectConversation(conv)}
                  >
                    <div className="chat-avatar">{initial}</div>
                    <div className="chat-thread-content">
                      <div className="chat-thread-top">
                        <span className="chat-thread-username">{otherUser}</span>
                        {latestMsg?.created_at && (
                          <span className="chat-thread-time">{formatTime(latestMsg.created_at)}</span>
                        )}
                      </div>

                      {conv.listing_title && (
                        <div className="chat-thread-listing" title={conv.listing_title}>
                          <Tag size={11} />
                          <span>{conv.listing_title}</span>
                        </div>
                      )}

                      <div className="chat-thread-preview-row">
                        <p className="chat-thread-preview">
                          {latestMsg ? (
                            <>
                              {latestMsg.sender_id === user?.id ? 'You: ' : ''}
                              {latestMsg.content}
                            </>
                          ) : (
                            <span style={{ fontStyle: 'italic', opacity: 0.7 }}>No messages yet</span>
                          )}
                        </p>
                        {conv.unread_count > 0 && (
                          <span className="chat-unread-badge">{conv.unread_count}</span>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>

        {/* MAIN CHAT AREA */}
        <main className={`chat-main ${!activeConversation ? 'mobile-hidden' : ''}`}>
          {activeConversation ? (
            <>
              {/* Header */}
              <div className="chat-main-header">
                <div className="chat-main-header-left">
                  <button className="chat-back-btn" onClick={handleBackToInbox} aria-label="Back to inbox">
                    <ArrowLeft size={20} />
                  </button>

                  <div className="chat-avatar" style={{ width: '38px', height: '38px', fontSize: '14px' }}>
                    {(activeConversation.other_user?.username || 'S').charAt(0).toUpperCase()}
                  </div>

                  <div className="chat-header-user-info">
                    <span className="chat-header-username">
                      {activeConversation.other_user?.username || 'Student'}
                    </span>
                    <span className="chat-header-status">
                      <span className={`status-dot ${wsStatus}`} />
                      {wsStatus === 'connected' && 'Online • Real-time'}
                      {wsStatus === 'connecting' && 'Connecting...'}
                      {wsStatus === 'reconnecting' && 'Reconnecting...'}
                      {wsStatus === 'disconnected' && 'Offline'}
                    </span>
                  </div>
                </div>

                {activeConversation.listing_title && (
                  <div className="chat-header-listing-chip" title={activeConversation.listing_title}>
                    {activeConversation.listing_image ? (
                      <img
                        src={activeConversation.listing_image}
                        alt="Listing"
                        className="chat-header-listing-thumb"
                      />
                    ) : (
                      <Tag size={14} color="var(--color-primary)" />
                    )}
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {activeConversation.listing_title}
                    </span>
                  </div>
                )}
              </div>

              {/* Messages Body */}
              <div className="chat-messages-container">
                {loadingMessages ? (
                  <div className="chat-placeholder-state">
                    <RefreshCw size={24} className="animate-spin" />
                    <p style={{ marginTop: '0.5rem', fontSize: 'var(--font-size-sm)' }}>
                      Loading message history...
                    </p>
                  </div>
                ) : messagesError ? (
                  <div className="chat-placeholder-state">
                    <AlertCircle size={28} color="#dc2626" />
                    <p style={{ marginTop: '0.5rem', color: '#dc2626', fontSize: 'var(--font-size-sm)' }}>
                      {messagesError}
                    </p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="chat-placeholder-state">
                    <MessageSquare size={36} className="chat-placeholder-icon" />
                    <p className="chat-placeholder-title">No messages yet</p>
                    <p className="chat-placeholder-desc">
                      Say hello to {activeConversation.other_user?.username || 'the student'} to begin the discussion!
                    </p>
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const isMe = msg.sender_id === user?.id;
                    const showDateSeparator =
                      index === 0 ||
                      new Date(messages[index - 1].created_at).toDateString() !==
                        new Date(msg.created_at).toDateString();

                    return (
                      <React.Fragment key={msg.id || index}>
                        {showDateSeparator && (
                          <div className="chat-date-separator">
                            <span>{new Date(msg.created_at).toLocaleDateString([], { dateStyle: 'medium' })}</span>
                          </div>
                        )}
                        <div className={`message-row ${isMe ? 'sent' : 'received'}`}>
                          <div className="message-bubble">{msg.content}</div>
                          <div className="message-meta">
                            <span>{formatTime(msg.created_at)}</span>
                            {isMe && (
                              <span title={msg.is_read ? 'Read' : 'Delivered'}>
                                {msg.is_read ? (
                                  <CheckCheck size={13} color="var(--color-accent)" />
                                ) : (
                                  <Check size={13} />
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Footer */}
              <div className="chat-input-container">
                <form className="chat-input-form" onSubmit={handleSendMessage}>
                  <textarea
                    className="chat-textarea"
                    placeholder="Type a message (Enter to send, Shift + Enter for newline)..."
                    value={inputText}
                    rows={1}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isSending}
                  />
                  <button
                    type="submit"
                    className="chat-send-btn"
                    disabled={!inputText.trim() || isSending}
                    title="Send message"
                  >
                    <SendHorizontal size={18} />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="chat-placeholder-state">
              <MessageSquare size={52} className="chat-placeholder-icon" />
              <h3 className="chat-placeholder-title">Select a conversation</h3>
              <p className="chat-placeholder-desc">
                Choose a conversation from the sidebar or click "New Chat" to start messaging another student.
              </p>
            </div>
          )}
        </main>
      </div>

      {/* NEW CHAT MODAL */}
      {showNewChatModal && (
        <div className="chat-modal-overlay">
          <div className="chat-modal-content">
            <div className="chat-modal-header">
              <h3 className="chat-modal-title">Start a New Conversation</h3>
              <button
                onClick={() => {
                  setShowNewChatModal(false);
                  setNewChatError(null);
                }}
                style={{ cursor: 'pointer', color: 'var(--color-text-muted)' }}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateNewChat} className="chat-modal-form">
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
                Enter the student's Django user ID to begin a secure, private one-to-one conversation.
              </p>

              <div className="chat-form-group">
                <label className="chat-form-label">Student User ID</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 2"
                  className="chat-form-input"
                  value={newChatUserId}
                  onChange={(e) => setNewChatUserId(e.target.value)}
                  autoFocus
                />
              </div>

              {newChatError && (
                <div
                  style={{
                    background: '#fee2e2',
                    color: '#b91c1c',
                    padding: '0.5rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--font-size-xs)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <AlertCircle size={14} />
                  <span>{newChatError}</span>
                </div>
              )}

              <div className="chat-modal-actions">
                <button
                  type="button"
                  onClick={() => {
                    setShowNewChatModal(false);
                    setNewChatError(null);
                  }}
                  style={{
                    padding: 'var(--spacing-2) var(--spacing-4)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={newChatLoading}
                  style={{
                    padding: 'var(--spacing-2) var(--spacing-4)',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--color-primary)',
                    color: '#ffffff',
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    opacity: newChatLoading ? 0.6 : 1
                  }}
                >
                  {newChatLoading ? 'Starting...' : 'Start Chat'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
