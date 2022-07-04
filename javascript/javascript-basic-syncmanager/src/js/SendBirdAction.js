import { APP_ID as appId } from './const';
import { isNull } from './utils';

import SendBird from 'sendbird';
import SendBirdSyncManager from 'sendbird-syncmanager';

let instance = null;

class SendBirdAction {
  constructor() {
    if (instance) {
      return instance;
    }
    this.sb = new SendBird({
      appId
    });
    this.userQuery = null;
    this.groupChannelQuery = null;
    this.previousMessageQuery = null;
    this.blockedQuery = null;
    instance = this;
  }

  /**
   * Connect
   */
  connect(userId, nickname) {
    return new Promise((resolve, reject) => {
      const sb = SendBird.getInstance();
      sb.connect(userId, (user, error) => {
        if (error) {
          reject(error);
        } else {
          sb.updateCurrentUserInfo(decodeURIComponent(nickname), null, (user, error) => {
            error ? reject(error) : resolve(user);
          });
        }
      });
    });
  }

  /**
   * User
   */
  getCurrentUser() {
    return this.sb.currentUser;
  }

  getConnectionState() {
    return this.sb.getConnectionState();
  }

  getUserList(isInit = false) {
    if (isInit || isNull(this.userQuery)) {
      this.userQuery = this.sb.createApplicationUserListQuery();
      this.userQuery.limit = 30;
    }
    return new Promise((resolve, reject) => {
      if (this.userQuery.hasNext && !this.userQuery.isLoading) {
        this.userQuery.next((list, error) => {
          error ? reject(error) : resolve(list);
        });
      } else {
        resolve([]);
      }
    });
  }

  isCurrentUser(user) {
    const manager = SendBirdSyncManager.getInstance();
    return user.userId === manager.currentUserId;
  }

  getBlockedList(isInit = false) {
    if (isInit || isNull(this.blockedQuery)) {
      this.blockedQuery = this.sb.createBlockedUserListQuery();
      this.blockedQuery.limit = 30;
    }
    return new Promise((resolve, reject) => {
      if (this.blockedQuery.hasNext && !this.blockedQuery.isLoading) {
        this.blockedQuery.next((blockedList, error) => {
          error ? reject(error) : resolve(blockedList);
        });
      } else {
        resolve([]);
      }
    });
  }

  blockUser(user, isBlock = true) {
    return new Promise((resolve, reject) => {
      if (isBlock) {
        this.sb.blockUser(user, (response, error) => {
          error ? reject(error) : resolve();
        });
      } else {
        this.sb.unblockUser(user, (response, error) => {
          error ? reject(error) : resolve();
        });
      }
    });
  }

  /**
   * Channel
   */
  getChannel(channelUrl) {
    return new Promise((resolve, reject) => {
      this.sb.GroupChannel.getChannel(channelUrl, (groupChannel, error) => {
        error ? reject(error) : resolve(groupChannel);
      });
    });
  }

  createGroupChannel(userIds) {
    return new Promise((resolve, reject) => {
      let params = new this.sb.GroupChannelParams();
      params.addUserIds(userIds);
      this.sb.GroupChannel.createChannel(params, (groupChannel, error) => {
        error ? reject(error) : resolve(groupChannel);
      });
    });
  }

  inviteGroupChannel(channelUrl, userIds) {
    return new Promise((resolve, reject) => {
      this.sb.GroupChannel.getChannel(channelUrl, (groupChannel, error) => {
        if (error) {
          reject(error);
        } else {
          groupChannel.inviteWithUserIds(userIds, (groupChannel, error) => {
            error ? reject(error) : resolve(groupChannel);
          });
        }
      });
    });
  }

  leave(channelUrl) {
    return new Promise((resolve, reject) => {
      this.sb.GroupChannel.getChannel(channelUrl, (groupChannel, error) => {
        if (error) {
          reject(error);
        } else {
          groupChannel.leave((response, error) => {
            error ? reject(error) : resolve();
          });
        }
      });
    });
  }

  hide(channelUrl) {
    return new Promise((resolve, reject) => {
      this.sb.GroupChannel.getChannel(channelUrl, (groupChannel, error) => {
        if (error) {
          reject(error);
        } else {
          groupChannel.hide((response, error) => {
            error ? reject(error) : resolve();
          });
        }
      });
    });
  }

  markAsRead(channel) {
    channel.markAsRead();
  }

  getReadReceipt(channel, message) {
    if (this.isCurrentUser(message.sender)) {
      return this.sb.currentUser ? channel.getReadReceipt(message) : 0;
    } else {
      return 0;
    }
  }

  sendUserMessage({ channel, message, handler }) {
    return channel.sendUserMessage(message, (message, error) => {
      if (handler) handler(message, error);
    });
  }

  sendFileMessage({ channel, file, thumbnailSizes, handler }) {
    const fileMessageParams = new this.sb.FileMessageParams();
    fileMessageParams.file = file;
    fileMessageParams.thumbnailSizes = thumbnailSizes;

    return channel.sendFileMessage(fileMessageParams, (message, error) => {
      if (handler) handler(message, error);
    });
  }

  deleteMessage({ channel, message, col }) {
    return new Promise((resolve, reject) => {
      if (!this.isCurrentUser(message.sender)) {
        reject({
          message: 'You have not ownership in this message.'
        });
        return;
      }
      if (message.messageId === 0 && message.requestState === 'failed') {
        col.deleteMessage(message);
        resolve(true);
      } else {
        channel.deleteMessage(message, (response, error) => {
          error ? reject(error) : resolve(response);
        });
      }
    });
  }

  static getInstance() {
    return new SendBirdAction();
  }
}

export { SendBirdAction };
