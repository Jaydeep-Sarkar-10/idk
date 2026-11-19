const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8000';

const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

export const chatAPI = {
  /**
   * List all conversations for the authenticated user.
   */
  async getConversations() {
    const res = await fetch(`${API_BASE_URL}/api/chat/conversations/`, {
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to fetch conversations' }));
      throw err;
    }
    return res.json();
  },

  /**
   * Retrieve a single conversation by ID.
   */
  async getConversation(id) {
    const res = await fetch(`${API_BASE_URL}/api/chat/conversations/${id}/`, {
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to fetch conversation' }));
      throw err;
    }
    return res.json();
  },

  /**
   * Create or retrieve an existing conversation with another student.
   * @param {Object} params
   * @param {number} params.other_user_id
   * @param {number} [params.listing_id]
   * @param {string} [params.listing_title]
   * @param {string} [params.listing_image]
   */
  async createOrGetConversation({ other_user_id, listing_id, listing_title, listing_image }) {
    const res = await fetch(`${API_BASE_URL}/api/chat/conversations/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({
        other_user_id,
        listing_id: listing_id || null,
        listing_title: listing_title || null,
        listing_image: listing_image || null
      })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to create or retrieve conversation' }));
      throw err;
    }
    return res.json();
  },

  /**
   * Fetch paginated message history for a conversation.
   */
  async getMessages(conversationId, page = 1) {
    const res = await fetch(`${API_BASE_URL}/api/chat/conversations/${conversationId}/messages/?page=${page}`, {
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to fetch messages' }));
      throw err;
    }
    return res.json();
  },

  /**
   * Request a short-lived single-use WebSocket authentication ticket.
   */
  async getWsTicket() {
    const res = await fetch(`${API_BASE_URL}/api/chat/ws-ticket/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to obtain WebSocket ticket' }));
      throw err;
    }
    return res.json();
  },

  /**
   * Construct the secure WebSocket URL with the single-use ticket.
   */
  getWsUrl(conversationId, ticket) {
    const base = WS_BASE_URL.replace(/^http/, 'ws');
    return `${base}/ws/chat/${conversationId}/?ticket=${encodeURIComponent(ticket)}`;
  }
};
