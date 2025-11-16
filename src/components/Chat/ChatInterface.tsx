import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, ChatWidgetConfig } from '@types/index';
import { formatTimestamp } from '@utils/formatters';
import { Send, User, Bot, Sparkles } from 'lucide-react';
import { hexToRgba } from '@utils/colors';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  config?: ChatWidgetConfig;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  onSendMessage,
  isLoading = false,
  config = {},
}) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (config.enableAutoScroll !== false) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, config.enableAutoScroll]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const displayMessages = config.maxMessages
    ? messages.slice(-config.maxMessages)
    : messages;

  return (
    <div
      className="flex flex-col bg-adapt-bg-secondary rounded-lg border border-adapt-border"
      style={{
        height: config.height || '600px',
        width: config.width || '100%',
      }}
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-adapt-border">
        <div className="flex items-center gap-2">
          <Sparkles size={20} className="text-adapt-primary" />
          <h3 className="text-lg font-semibold text-adapt-text-primary">
            Diagnostic Assistant
          </h3>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {displayMessages.map((message) => {
          const isUser = message.role === 'user';
          const isAgent = message.role === 'agent';

          return (
            <div
              key={message.id}
              className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div
                className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: isUser
                    ? hexToRgba('#3b82f6', 0.2)
                    : isAgent
                    ? hexToRgba('#8b5cf6', 0.2)
                    : hexToRgba('#10b981', 0.2),
                }}
              >
                {isUser ? (
                  <User size={16} className="text-adapt-primary" />
                ) : isAgent ? (
                  <Sparkles size={16} className="text-purple-400" />
                ) : (
                  <Bot size={16} className="text-green-400" />
                )}
              </div>

              {/* Message Content */}
              <div className={`flex-1 ${isUser ? 'text-right' : ''}`}>
                <div
                  className={`inline-block max-w-[80%] rounded-lg px-4 py-3 ${
                    isUser
                      ? 'bg-adapt-primary text-white'
                      : 'bg-adapt-bg-tertiary text-adapt-text-primary'
                  }`}
                >
                  {/* Agent Name */}
                  {isAgent && message.metadata?.agentName && (
                    <div className="text-xs text-purple-400 mb-1 font-semibold">
                      {message.metadata.agentName}
                    </div>
                  )}

                  {/* Message Text */}
                  <div className="whitespace-pre-wrap">{message.content}</div>

                  {/* Confidence Badge */}
                  {message.metadata?.confidence !== undefined && (
                    <div className="mt-2 text-xs opacity-75">
                      Confidence: {message.metadata.confidence}%
                    </div>
                  )}
                </div>

                {/* Timestamp */}
                {config.showTimestamps && (
                  <div className="text-xs text-adapt-text-muted mt-1">
                    {formatTimestamp(message.timestamp, 'p')}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3">
            <div
              className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: hexToRgba('#10b981', 0.2),
              }}
            >
              <Bot size={16} className="text-green-400" />
            </div>
            <div className="bg-adapt-bg-tertiary rounded-lg px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-adapt-text-muted rounded-full animate-pulse" />
                <div
                  className="w-2 h-2 bg-adapt-text-muted rounded-full animate-pulse"
                  style={{ animationDelay: '0.2s' }}
                />
                <div
                  className="w-2 h-2 bg-adapt-text-muted rounded-full animate-pulse"
                  style={{ animationDelay: '0.4s' }}
                />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-6 py-4 border-t border-adapt-border">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={config.placeholder || 'Ask a question about this incident...'}
            disabled={isLoading}
            className="flex-1 bg-adapt-bg-tertiary border border-adapt-border rounded-lg px-4 py-2 text-adapt-text-primary placeholder-adapt-text-muted focus:outline-none focus:ring-2 focus:ring-adapt-primary disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-adapt-primary text-white rounded-lg px-4 py-2 hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default React.memo(ChatInterface);
