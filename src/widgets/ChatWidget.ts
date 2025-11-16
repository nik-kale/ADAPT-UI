import { createElement } from 'react';
import { AdaptWidget } from './AdaptWidget';
import { ChatInterface } from '@components/Chat';
import { ChatWidgetConfig } from '@types/index';
import { useChat } from '@hooks/useChat';

// Wrapper component for chat that uses hooks
const ChatWrapper: React.FC<{ incidentId: string; config: ChatWidgetConfig }> = ({
  incidentId,
  config,
}) => {
  const { messages, sending, sendMessage } = useChat(incidentId);

  return createElement(ChatInterface, {
    messages,
    onSendMessage: sendMessage,
    isLoading: sending,
    config,
  });
};

export class ChatWidget extends AdaptWidget {
  private incidentId: string;

  constructor(
    container: HTMLElement | string,
    incidentId: string,
    config: ChatWidgetConfig = {}
  ) {
    super(container, config);
    this.incidentId = incidentId;
    this.render();
  }

  render(): void {
    this.mount(
      createElement(ChatWrapper, {
        incidentId: this.incidentId,
        config: this.config as ChatWidgetConfig,
      })
    );
  }
}
