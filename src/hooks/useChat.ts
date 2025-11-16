import { useState, useEffect } from 'react';
import { ChatSession, ChatMessage } from '@types/index';
import { defaultClient } from '@api/client';

export const useChat = (incidentId: string) => {
  const [session, setSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      setLoading(true);
      setError(null);

      const response = await defaultClient.getChatSession(incidentId);

      if (response.success && response.data) {
        setSession(response.data);
        setMessages(response.data.messages);
      } else {
        setError(response.error?.message || 'Failed to load chat session');
      }

      setLoading(false);
    };

    if (incidentId) {
      fetchSession();
    }
  }, [incidentId]);

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    setSending(true);
    setError(null);

    const response = await defaultClient.sendChatMessage(incidentId, content);

    if (response.success && response.data) {
      // Add both user and assistant messages to keep state in sync
      const { userMessage, assistantMessage } = response.data as any;
      if (userMessage && assistantMessage) {
        setMessages(prev => [...prev, userMessage, assistantMessage]);
      } else {
        // Fallback for backward compatibility
        setMessages(prev => [...prev, response.data!]);
      }
    } else {
      setError(response.error?.message || 'Failed to send message');
    }

    setSending(false);
  };

  return { session, messages, loading, sending, error, sendMessage };
};
