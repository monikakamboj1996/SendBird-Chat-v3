import styles from '../../scss/message-delete-modal.scss';
import { createDivEl, errorAlert, protectFromXSS } from '../utils';
import { SendBirdAction } from '../SendBirdAction';
import { Spinner } from './Spinner';
import { Modal } from './Modal';

const title = 'Delete Message';
const description = 'Are you Sure? Do you want to delete message?';
const submitText = 'DELETE';

class MessageDeleteModal extends Modal {
  constructor({ channel, message, col }) {
    super({ title, description, submitText });
    this.channel = channel;
    this.message = message;
    this.col = col;
    this._createElement();

    this.submitHandler = () => {
      SendBirdAction.getInstance()
        .deleteMessage({ channel: this.channel, message: this.message, col: this.col })
        .then(() => {
          Spinner.remove();
          this.close();
        })
        .catch(error => {
          Spinner.remove();
          errorAlert(error.message);
        });
    };
  }

  _createElement() {
    const content = createDivEl({
      className: styles['modal-message'],
      content: this.message.isFileMessage() ? protectFromXSS(this.message.name) : protectFromXSS(this.message.message)
    });
    this.contentElement.appendChild(content);
  }
}

export { MessageDeleteModal };
