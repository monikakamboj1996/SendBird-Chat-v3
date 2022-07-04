import React, { useEffect, useState } from 'react';
import { Text, Image, TouchableOpacity, View } from 'react-native';
import * as Progress from 'react-native-progress';
import moment from 'moment';

import { withAppContext } from '../context';
import { Color } from '../asset/constants';

const UserMessage = props => {
  const { sendbird, channel, message, onPress = () => {}, onLongPress = () => {} } = props;
  const isMyMessage = message.sender.userId === sendbird.currentUser.userId;
  const [readReceipt, setReadReceipt] = useState(channel.members.length - 1);

  useEffect(() => {
    const channelHandler = new sendbird.ChannelHandler();
    channelHandler.onReadReceiptUpdated = targetChannel => {
      if (targetChannel.url === channel.url) {
        setReadReceipt(channel.getUnreadMemberCount(message));
      }
    };

    sendbird.addChannelHandler(`message-${message.reqId}`, channelHandler);
    setReadReceipt(channel.getUnreadMemberCount(message));
    return () => {
      sendbird.removeChannelHandler(`message-${message.reqId}`);
    };
  }, []);

  const copyMessage = () => {
    const copy = channel.copyUserMessage(channel, message);
    console.log('copyyy', copy);
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
      {/* <View style={{ ...style.content, alignItems: isMyMessage ? 'flex-end' : 'flex-start' }}> */}
      <View
        style={{
          ...style.content,
          alignItems: isMyMessage ? 'flex-end' : 'flex-start',
        }}
      >
        {/* <Text style={style.nickname}>{message.sender.nickname}</Text> */}

        {/* {!message.hasSameSenderAbove && <Text style={style.nickname}>{message.sender.nickname}</Text>} */}
        <TouchableOpacity
          onLongPress={() => copyMessage()}
          style={{
            ...style.messageBubble,
            backgroundColor: isMyMessage ? Color.APP_COLOR : '#fff',
            // backgroundColor: 'red',
          }}
        >
          {/* {!message.hasSameSenderAbove && <Text style={style.nickname}>{message.sender.nickname}</Text>} */}

          <View
            style={{
              flexDirection: isMyMessage ? 'row-reverse' : 'row',
              justifyContent: 'space-between',
            }}
          >
            <Text style={{ ...style.nickname, color: isMyMessage ? '#D0D443' : Color.APP_COLOR }}>
              {message.sender.nickname}
            </Text>
            <Text style={{ ...style.nickname, color: isMyMessage ? '#D0D443' : Color.APP_COLOR }}>{message.data}</Text>
          </View>

          <Text style={{ ...style.message, color: isMyMessage ? '#fff' : '#333' }}>{message.message}</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
            <Text style={{ ...style.updatedAt, color: isMyMessage ? '#B0C1C4' : '#87928D' }}>
              {moment(message.createdAt).format('LL')}
              {' at '}
            </Text>
            <Text style={{ ...style.updatedAt, color: isMyMessage ? '#B0C1C4' : '#87928D' }}>
              {moment(message.createdAt).format('hh:mm a')}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
      <View style={{ ...style.status, alignItems: isMyMessage ? 'flex-end' : 'flex-start' }}>
        {message.sendingStatus === 'pending' && (
          <Progress.Circle size={10} indeterminate={true} indeterminateAnimationDuration={800} color="#999" />
        )}
        {/* {message.sendingStatus === 'succeeded' && readReceipt > 0 && (
          <Text style={style.readReceipt}>{readReceipt}</Text>
        )} */}
      </View>
    </TouchableOpacity>
  );
};

const style = {
  container: {
    paddingHorizontal: 15,
    marginVertical: 2,
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
    alignSelf: 'center',
    marginHorizontal: 4,
    flexDirection: 'row',
  },
  nickname: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
  },
  messageBubble: {
    maxWidth: 240,
    borderBottomLeftRadius: 12,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginTop: 2,
    width: '100%',
  },
  message: {
    fontSize: 18,
    marginTop: 5,
  },
  status: {
    alignSelf: 'flex-end',
    marginHorizontal: 3,
    marginBottom: 3,
  },
  readReceipt: {
    fontSize: 12,
    color: '#f89',
  },
  updatedAt: {
    fontSize: 12,

    marginTop: 12,
  },
};

export default withAppContext(UserMessage);
