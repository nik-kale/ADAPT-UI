import { useState, useEffect } from 'react';
import { ChatSession, ChatMessage } from '@types/index';
import { defaultClient } from '@api/client';
import { useFetch } from './useFetch';

/**
 * Hook for managing chat session with message sending capability.
 *
 * @param incidentId - The unique identifier for the incident to fetch
 * @returns Object containing session, messages, loading state, sending state, error state, sendMessage function, and refetch function
 *
 * @example
 * ```tsx
 * const { messages, loading, sending, error, sendMessage } = useChat('inc-123');
 * if (loading) return <Spinner />;
 * if (error) return <Error message={error} />;
 * return <ChatInterface messages={messages} onSend={sendMessage} sending={sending} />;
 * ```
 */
export const useChat = (incidentId: string) => {
  const { data: sessionData, loading, error: fetchError, refetch } = useFetch<ChatSession>(
    () => defaultClient.getChatSession(incidentId),
    [incidentId],
    { skip: !incidentId }
  );

  const [session, setSession] = useState<ChatSession | null>(sessionData);
  const [messages, setMessages] = useState<ChatMessage[]>(sessionData?.messages || []);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(fetchError);

  // Sync local state with fetched data
  useEffect(() => {
    if (sessionData) {
      setSession(sessionData);
      setMessages(sessionData.messages);
    }
  }, [sessionData]);

  // Sync error state
  useEffect(() => {
    setError(fetchError);
  }, [fetchError]);

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

  return { session, messages, loading, sending, error, sendMessage, refetch };
};
