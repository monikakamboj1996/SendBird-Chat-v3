import styles from '../scss/chat.scss';
import { createDivEl } from './utils';
import { SendBirdAction } from './SendBirdAction';
import { SendBirdChatEvent } from './SendBirdChatEvent';
import { ChatLeftMenu } from './ChatLeftMenu';
import { ChatTopMenu } from './components/ChatTopMenu';
import { ChatMain } from './components/ChatMain';

let instance = null;

class Chat {
  constructor() {
    if (instance) {
      return instance;
    }
    this.body = document.querySelector('.body-center');

    this.channel = null;
    this.element = null;
    this.top = null;
    this.emptyElement = this._createEmptyElement();
    this.render();
    instance = this;
  }

  _createEmptyElement() {
    const item = createDivEl({ className: styles['chat-empty'] });

    const content = createDivEl({ className: styles['empty-content'] });
    item.appendChild(content);

    const title = createDivEl({ className: styles['content-title'], content: 'WELCOME TO SAMPLE CHAT' });
    content.appendChild(title);
    const image = createDivEl({ className: styles['content-image'] });
    content.appendChild(image);
    const desc = createDivEl({
      className: styles['content-desc'],
      content:
        'Create or select a channel to chat in.\n' +
        "If you don't have a channel to participate,\n" +
        'go ahead and create your first channel now.'
    });
    content.appendChild(desc);
    return item;
  }

  renderEmptyElement() {
    this._removeChatElement();
    this.body.appendChild(this.emptyElement);
  }

  _removeEmptyElement() {
    if (this.body.contains(this.emptyElement)) {
      this.body.removeChild(this.emptyElement);
    }
  }

  _createChatElement(channel) {
    this.element = createDivEl({ className: styles['chat-root'] });

    this.top = new ChatTopMenu(channel);
    this.element.appendChild(this.top.element);

    /// reset manager when ChatMain is obsolete
    if (this.main && this.main.body && this.main.body.collection) {
      this.main.body.collection.remove();
    }
    this.main = new ChatMain(channel);
  }

  _addEventHandler() {
    const channelEvent = new SendBirdChatEvent();
    channelEvent.onTypingStatusUpdated = groupChannel => {
      if (this.channel.url === groupChannel.url) {
        this.main.updateTyping(groupChannel.getTypingMembers());
      }
    };
  }

  _renderChatElement(channel) {
    const sendbirdAction = SendBirdAction.getInstance();
    this._removeEmptyElement();
    this._removeChatElement();
    this.channel = channel;

    ChatLeftMenu.getInstance().activeChannelItem(channel.url);
    this._addEventHandler();

    sendbirdAction
      .getChannel(channel.url)
      .then(channel => {
        this.channel = channel;
        this._createChatElement(this.channel);
        this.body.appendChild(this.element);
        this.main.loadInitialMessages();
      })
      .catch(() => {
        this._createChatElement(this.channel);
        this.body.appendChild(this.element);
        this.main.loadInitialMessages();
      });
  }

  _removeChatElement() {
    const chatElements = this.body.getElementsByClassName(styles['chat-root']);
    Array.prototype.slice.call(chatElements).forEach(chatEl => {
      chatEl.parentNode.removeChild(chatEl);
    });
  }

  render(channel) {
    channel ? this._renderChatElement(channel) : this.renderEmptyElement();
  }

  static getInstance() {
    return new Chat();
  }
}

export { Chat };
