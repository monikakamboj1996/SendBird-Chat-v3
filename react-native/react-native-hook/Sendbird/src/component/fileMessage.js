import React, { useEffect, useState } from 'react';
import { Text, Image, TouchableOpacity, View } from 'react-native';
import Video from 'react-native-video';
import * as Progress from 'react-native-progress';
import Icon from 'react-native-vector-icons/MaterialIcons';
import moment from 'moment';
import { requestStoragePermission } from '../utils/utility';
import { withAppContext } from '../context';
import { Color } from '../asset/constants';

const DEFAULT_IMAGE_WIDTH = 240;
const DEFAULT_IMAGE_HEIGHT = 160;

const FileMessage = props => {
  const { sendbird, channel, message, onPress = () => {}, onLongPress = () => {} } = props;
  const isMyMessage = message.sender.userId === sendbird.currentUser.userId;
  const [readReceipt, setReadReceipt] = useState(0);

  const isImage = () => {
    return message.type.match(/^image\/.+$/);
  };
  const isVideo = () => {
    return message.type.match(/^video\/.+$/);
  };
  const isFile = () => {
    return !isImage() && !isVideo();
  };

  useEffect(() => {
    sendbird.addChannelHandler(`message-${message.reqId}`, channelHandler);
    setReadReceipt(channel.getUnreadMemberCount(message));
    return () => {
      sendbird.removeChannelHandler(`message-${message.reqId}`);
    };
  }, []);

  const channelHandler = new sendbird.ChannelHandler();
  channelHandler.onReadReceiptUpdated = targetChannel => {
    if (targetChannel.url === channel.url) {
      const newReadReceipt = channel.getUnreadMemberCount(message);
      if (newReadReceipt !== readReceipt) {
        setReadReceipt(newReadReceipt);
      }
    }
  };
  const fileDownload = message => {
    requestStoragePermission(message.url, message.name);
  };
  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={() => onPress(message)}
      onLongPress={() => onLongPress(message)}
      style={{
        ...style.container,
        flexDirection: isMyMessage ? 'row-reverse' : 'row',
      }}
    >
      {/* <View style={style.profileImageContainer}>
        {!message.hasSameSenderAbove && (
          <Image source={{ uri: message.sender.profileUrl }} style={style.profileImage} />
        )}
      </View> */}
      <View style={{ ...style.content }}>
        {/* {!message.hasSameSenderAbove && <Text style={style.nickname}>{message.sender.nickname}</Text>} */}
        {isImage() && <Image resizeMode={'cover'} source={{ uri: message.url }} style={style.image} />}
        {isVideo() && <Video source={{ uri: message.url }} repeat muted style={style.video} />}
        {/* {isFile() && <Image resizeMode={'cover'} source={{ uri: message.url }} style={style.image} />} */}

        {isFile() && (
          <TouchableOpacity
            onPress={() => fileDownload(message)}
            style={{ ...style.messageBubble, backgroundColor: isMyMessage ? Color.APP_COLOR : '#ddd' }}
          >
            <View style={{ ...style.message, flexDirection: 'row' }}>
              <Icon
                style={{ marginTop: 3, marginEnd: 10 }}
                name="attach-file"
                color={isMyMessage ? '#fff' : '#333'}
                size={18}
              />
              <Text style={{ color: isMyMessage ? '#fff' : '#333', fontSize: 18, marginEnd: 10 }}>{message.name}</Text>
            </View>
          </TouchableOpacity>
        )}
        <View style={{ ...style.dateTime, marginTop: isFile() ? 70 : 140, paddingEnd: 10 }}>
          <Text style={style.updatedAt}>
            {moment(message.createdAt).format('LL')}
            {' at '}
          </Text>
          <Text style={style.updatedAt}>{moment(message.createdAt).format('hh:mm a')}</Text>
        </View>
        {!isImage() || !isVideo() ? (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'absolute',
              textAlignVertical: 'bottom',
              padding: 5,
            }}
          >
            <Text style={{ ...style.nickname, color: isMyMessage ? '#D0D443' : Color.APP_COLOR }}>
              {message.sender.nickname}
            </Text>
            <Text style={{ ...style.hospitalName, color: isMyMessage ? '#D0D443' : Color.APP_COLOR }}>
              {message.data}
            </Text>
          </View>
        ) : null}
      </View>
      {/* <View style={{ ...style.status, alignItems: isMyMessage ? 'flex-end' : 'flex-start' }}>
        {/* {message.sendingStatus === 'pending' && (
          <Progress.Circle size={10} indeterminate indeterminateAnimationDuration={800} color="#999" />
        )} */}
      {/* {message.sendingStatus === 'succeeded' && readReceipt > 0 && (
          <Text style={style.readReceipt}>{readReceipt}</Text>
        )} */}
      {/* <Text style={style.updatedAt}>{moment(message.createdAt).fromNow()}</Text> */}
      {/* </View> */}
    </TouchableOpacity>
  );
};

const style = {
  container: {
    paddingHorizontal: 4,
  },
  profileImageContainer: {
    width: 32,
    height: 32,
    marginHorizontal: 8,
  },
  profileImage: {
    width: 32,
    height: 32,
    borderWidth: 0,
    borderRadius: 16,
    marginTop: 20,
  },
  content: {
    marginHorizontal: 12,
    alignItems: 'flex-end',
  },
  nickname: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#888',
    flex: 1,
  },
  hospitalName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#888',
    marginEnd: 10,
    // marginHorizontal: 8,
  },
  image: {
    width: DEFAULT_IMAGE_WIDTH,
    height: DEFAULT_IMAGE_HEIGHT,
    backgroundColor: '#ccc',
    borderRadius: 8,
    marginTop: 6,
  },
  video: {
    width: DEFAULT_IMAGE_WIDTH,
    height: DEFAULT_IMAGE_HEIGHT,
    borderRadius: 8,
    marginTop: 6,
  },

  messageBubble: {
    maxWidth: 240,
    borderBottomLeftRadius: 12,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginTop: 4,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    padding: 10,
    height: 80,
  },
  icon: {
    justifyContent: 'center',
    alignItems: 'center',
    // padding: 10,
    // height: 80,
  },
  status: {
    alignSelf: 'flex-end',
    marginHorizontal: 3,
    marginBottom: 2,
  },
  readReceipt: {
    fontSize: 12,
    color: '#f89',
  },
  updatedAt: {
    fontSize: 12,
    color: '#999',
    // position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    // top: 0,
    // left: 0,
    // right: 0,
    // bottom: 0,
    // backgroundColor: 'red',
    // zIndex: 3,
  },
  dateTime: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    textAlignVertical: 'bottom',
  },
};

export default withAppContext(FileMessage);
