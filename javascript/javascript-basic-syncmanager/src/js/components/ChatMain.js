import styles from '../../scss/chat-main.scss';
import { ChatBody } from './ChatBody';
import { ChatInput } from './ChatInput';
import { Chat } from '../Chat';
import { createDivEl } from '../utils';
import { ChatMenu } from './ChatMenu';
import { SendBirdAction } from '../SendBirdAction';

class ChatMain {
  constructor(channel) {
    this.channel = channel;
    this.body = null;
    this.input = null;
    this.menu = null;
    this._create();
  }

  _create() {
    const root = createDivEl({ className: styles['chat-main-root'] });

    const main = createDivEl({ className: styles['chat-main'] });
    root.appendChild(main);

    this.body = new ChatBody(this.channel);
    main.appendChild(this.body.element);

    this.input = new ChatInput(this.channel);
    main.appendChild(this.input.element);

    this.menu = new ChatMenu(this.channel);
    root.appendChild(this.menu.element);

    Chat.getInstance().element.appendChild(root);
  }

  updateTyping(memberList) {
    this.input.updateTyping(memberList);
  }

  repositionScroll(height) {
    this.body.repositionScroll(height);
  }

  updateBlockedList(user, isBlock) {
    this.menu.updateBlockedList(user, isBlock);
  }

  loadInitialMessages() {
    const sendbirdAction = SendBirdAction.getInstance();
    this.body.loadPreviousMessages(() => {
      sendbirdAction.markAsRead(this.channel);
      this.body.scrollToBottom();
    });
  }
}

export { ChatMain };
