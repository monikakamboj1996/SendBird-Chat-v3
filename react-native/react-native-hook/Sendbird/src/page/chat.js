import React, { useLayoutEffect, useEffect, useState, useReducer } from 'react';
import {
  Text,
  StatusBar,
  SafeAreaView,
  TouchableOpacity,
  View,
  FlatList,
  AppState,
  TextInput,
  Alert,
  Platform,
} from 'react-native';

import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import DocumentPicker from 'react-native-document-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { withAppContext } from '../context';
import { chatReducer } from '../reducer/chat';
import Message from '../component/message';
import { createChannelName } from '../utils';
import { Color } from '../asset/constants';
import { useNavigation } from '@react-navigation/native';
import { useActionSheet } from '@expo/react-native-action-sheet';

// import { registerGlobals } from 'react-native-webrtc';
// import SendBirdCall from 'sendbird-calls';

const Chat = props => {
  const { route, navigation, sendbird } = props;
  const { currentUser, channel } = route.params;
  const [name, setName] = useState('');
  const backNavigation = useNavigation();
  const [isTyping, SetIsTyping] = useState(false);
  const [members, setMembers] = useState([]);

  const { showActionSheetWithOptions } = useActionSheet();

  // const appId = '812BDBE5-3FE7-45AA-B86E-308FF8CA921A';

  const [query, setQuery] = useState(null);
  const [state, dispatch] = useReducer(chatReducer, {
    sendbird,
    channel,
    messages: [],
    messageMap: {}, // redId => boolean
    loading: false,
    input: '',
    empty: '',
    error: '',
  });
  // const bypass = () => {
  //   registerGlobals();
  //   window.RTCPeerConnection.prototype.addTrack = () => {};
  //   window.RTCPeerConnection.prototype.getSenders = () => {};
  //   // window.location = { protocol: 'https:' };
  // };
  // useEffect(() => {
  //   // bypass();
  //   SendBirdCall.init(appId);

  //   SendBirdCall.authenticate({ userId: 'sendBird12300002222', accessToken: null }, (result, error) => {
  //     if (error) {
  //       console.log('error', error);
  //     } else {
  //       console.log('authhh', result);
  //     }
  //   });

  //   SendBirdCall.connectWebSocket()
  //     .then(function () {
  //       console.log('trueeeeeeee');
  //     })
  //     .catch(function (error) {
  //       console.log('eeeeeee', error);
  //     });
  // }, []);

  const updateChannelName = channel => {
    setName(createChannelName(channel));
  };

  console.log('channel', channel);

  const goBack = () => {
    backNavigation.goBack();
  };
  useEffect(() => {
    updateChannelName(channel);
    sendbird.addConnectionHandler('chat', connectionHandler);
    sendbird.addChannelHandler('chat', channelHandler);
    const unsubscribe = AppState.addEventListener('change', handleStateChange);

    if (!sendbird.currentUser) {
      sendbird.connect(currentUser.userId, (_, err) => {
        if (!err) {
          refresh();
        } else {
          dispatch({
            type: 'error',
            payload: {
              error: 'Connection failed. Please check the network status.',
            },
          });
        }
      });
    } else {
      refresh();
    }

    return () => {
      sendbird.removeConnectionHandler('chat');
      sendbird.removeChannelHandler('chat');
      unsubscribe.remove();
    };
  }, []);

  /// on query refresh
  useEffect(() => {
    if (query) {
      next();
    }
  }, [query]);

  /// on connection event
  const connectionHandler = new sendbird.ConnectionHandler();
  connectionHandler.onReconnectStarted = () => {
    dispatch({
      type: 'error',
      payload: {
        error: 'Connecting..',
      },
    });
  };
  connectionHandler.onReconnectSucceeded = () => {
    dispatch({
      type: 'error',
      payload: {
        error: '',
      },
    });
    refresh();
  };
  connectionHandler.onReconnectFailed = () => {
    dispatch({
      type: 'error',
      payload: {
        error: 'Connection failed. Please check the network status.',
      },
    });
  };

  /// on channel event
  const channelHandler = new sendbird.ChannelHandler();
  channelHandler.onMessageReceived = (targetChannel, message) => {
    if (targetChannel.url === channel.url) {
      dispatch({ type: 'receive-message', payload: { message, channel } });
    }
  };
  channelHandler.onMessageUpdated = (targetChannel, message) => {
    if (targetChannel.url === channel.url) {
      dispatch({ type: 'update-message', payload: { message } });
    }
  };

  channelHandler.onTypingStatusUpdated = channel => {
    const members = channel.getTypingUsers();
    setMembers(members);
    SetIsTyping(true);
    // Refresh the typing status of members within the channel.
  };

  channelHandler.onMessageDeleted = (targetChannel, messageId) => {
    console.log('targetChannel', targetChannel);
    console.log('channnell', channel);

    if (targetChannel.url === channel.url) {
      dispatch({ type: 'delete-message', payload: { messageId } });
    }
  };
  channelHandler.onUserLeft = (channel, user) => {
    if (user.userId === currentUser.userId) {
      navigation.navigate('Lobby', {
        action: 'leave',
        data: { channel },
      });
    }
  };

  channelHandler.onChannelDeleted = (channelUrl, channelType) => {
    navigation.navigate('Lobby', {
      action: 'delete',
      data: { channel },
    });
  };

  const handleStateChange = newState => {
    if (newState === 'active') {
      sendbird.setForegroundState();
    } else {
      sendbird.setBackgroundState();
    }
  };
  const member = () => {
    navigation.navigate('Member', { channel, currentUser });
  };
  const leave = () => {
    Alert.alert('Leave', 'Are you going to leave this channel?', [
      { text: 'Cancel' },
      {
        text: 'OK',
        onPress: () => {
          navigation.navigate('Channels', {
            action: 'leave',
            data: { channel },
            sendbird: sendbird,
          });
        },
      },
    ]);
  };
  const refresh = () => {
    channel.markAsRead();
    setQuery(channel.createPreviousMessageListQuery());
    dispatch({ type: 'refresh' });
  };
  const next = () => {
    if (query.hasMore) {
      dispatch({ type: 'error', payload: { error: '' } });
      query.limit = 50;
      query.reverse = true;
      query.load((fetchedMessages, err) => {
        if (!err) {
          dispatch({ type: 'fetch-messages', payload: { messages: fetchedMessages } });
        } else {
          dispatch({ type: 'error', payload: { error: 'Failed to get the messages.' } });
        }
      });
    }
  };

  const sendUserMessage = () => {
    if (state.input.length > 0) {
      const data = {
        office: 'Dental Hospital',
      };
      const params = new sendbird.UserMessageParams();
      params.data = 'Dental Hospital';
      params.message = state.input;

      const pendingMessage = channel.sendUserMessage(params, (message, err) => {
        if (!err) {
          dispatch({ type: 'send-message', payload: { message } });
        } else {
          setTimeout(() => {
            dispatch({ type: 'error', payload: { error: 'Failed to send a message.' } });
            dispatch({ type: 'delete-message', payload: { reqId: pendingMessage.reqId } });
          }, 500);
        }
      });
      dispatch({ type: 'send-message', payload: { message: pendingMessage, clearInput: true } });
    }
  };
  const selectFile = async () => {
    try {
      if (Platform.OS === 'android') {
        const permission = await check(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
        if (permission !== RESULTS.GRANTED) {
          const result = await request(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
          if (result !== RESULTS.GRANTED) {
            throw new Error('Please allow the storage access permission request.');
          }
        }
      } else if (Platform.OS === 'ios') {
        // TODO:
      }
      const result = await DocumentPicker.pickSingle({
        type: [
          DocumentPicker.types.images,
          DocumentPicker.types.video,
          DocumentPicker.types.audio,
          DocumentPicker.types.plainText,
          DocumentPicker.types.zip,
          DocumentPicker.types.pdf,
          DocumentPicker.types.allFiles,
        ],
      });

      const params = new sendbird.FileMessageParams();
      params.file = {
        size: result.size,
        uri: result.uri,
        name: result.name,
        type: result.type,
      };
      params.data = 'Urban Dental';
      dispatch({ type: 'start-loading' });
      channel.sendFileMessage(params, (message, err) => {
        dispatch({ type: 'end-loading' });
        if (!err) {
          dispatch({ type: 'send-message', payload: { message } });
        } else {
          setTimeout(() => {
            dispatch({ type: 'error', payload: { error: 'Failed to send a message.' } });
          }, 500);
        }
      });
    } catch (err) {
      console.log(err);
      if (!DocumentPicker.isCancel(err)) {
        dispatch({ type: 'error', payload: { error: err.message } });
      }
    }
  };
  const viewDetail = message => {
    if (message.isFileMessage()) {
      //if we want to show image details in next comopnent
    }
  };
  const showContextMenu = message => {
    // console.log('mmmmm', message);
    if (message.sender && message.sender.userId === currentUser.currentUser.userId) {
      showActionSheetWithOptions(
        {
          title: 'Message control',
          message: 'You can copy or delete the message.',
          // options: ['Edit', 'Delete', 'Cancel'],
          options: ['Copy', 'Delete', 'Cancel'],
          cancelButtonIndex: 2,
          destructiveButtonIndex: 1,
        },
        buttonIndex => {
          switch (buttonIndex) {
            case 0: //copy
              // channel.copyUserMessage(channel, message);
              break;
            case 1: // delete
              channel.deleteMessage(message);
              break;
            case 2: // cancel
              break;
          }
        },
      );
    }
  };

  const addCall = () => {
    alert('add call');
  };

  const addVideoCall = () => {
    navigation.navigate('DirectCall', {
      data: { channel },
      currentUser: { currentUser },
    });
  };
  const profile = () => {
    let userMessages = state.messages;
    let channels = state.channel;
    if (currentUser) {
      navigation.navigate('Profile', { currentUser, userMessages, channels });
    }
  };
  const deleteAllHistory = () => {
    channel.resetMyHistory();
  };

  return (
    <SafeAreaView style={style.container}>
      {/* <WebView
        source={{
          uri: 'SERVER_URL' + `/?q=${authQuery}&playsinline=1`,
        }}
        originWhitelist={['*']}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        allowFileAccess={true}
      /> */}
      <StatusBar backgroundColor={Color.APP_COLOR} barStyle="light-content" />
      <SafeAreaView style={{ backgroundColor: Color.BACKGROUND_COLOR, flex: 1 }}>
        <View style={style.headerRightContainer}>
          <View style={{ flexDirection: 'row', flex: 1 }}>
            <TouchableOpacity style={{ marginTop: 5 }} onPress={goBack}>
              <Icon name="arrow-back" color="#fff" size={28} />
            </TouchableOpacity>
            <View style={{ flexDirection: 'column' }}>
              <TouchableOpacity
                style={{ justifyContent: 'center', alignItems: 'center' }}
                onPress={() => {
                  profile();
                }}
              >
                <Text
                  style={{
                    color: '#fff',
                    alignItems: 'center',
                    marginStart: 20,
                    fontSize: 18,
                    fontWeight: 'bold',
                    paddingEnd: 25,
                  }}
                >
                  {name}
                </Text>
              </TouchableOpacity>
              {isTyping && members?.length > 0 ? <Text style={{ marginStart: 20 }}>Typing...</Text> : null}
            </View>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
            <TouchableOpacity activeOpacity={0.85} style={style.headerRightButton} onPress={deleteAllHistory}>
              <Icon name="delete" color="#fff" size={28} />
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.85} style={style.headerRightButton} onPress={addVideoCall}>
              <Icon name="videocam" color="#fff" size={28} />
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.85} style={style.headerRightButton} onPress={addCall}>
              <Icon name="call" color="#fff" size={26} />
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.85} style={style.headerRightButton} onPress={member}>
              <Icon name="people" color="#fff" size={28} />
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.85} style={style.headerRightButton} onPress={leave}>
              <Icon name="directions-walk" color="#fff" size={28} />
            </TouchableOpacity>
          </View>
        </View>
        <FlatList
          data={state.messages}
          // onLongPress={message => showContextMenu(message)}
          inverted={true}
          renderItem={({ item }) => (
            <Message
              key={item.reqId}
              channel={channel}
              message={item}
              onPress={message => viewDetail(message)}
              onLongPress={message => showContextMenu(message)}
            />
          )}
          keyExtractor={item => `${item.messageId}` || item.reqId}
          contentContainerStyle={{ flexGrow: 1, paddingVertical: 10 }}
          ListHeaderComponent={
            state.error && (
              <View style={style.errorContainer}>
                <Text style={style.error}>{state.error}</Text>
              </View>
            )
          }
          ListEmptyComponent={
            <View style={style.emptyContainer}>
              <Text style={style.empty}>{state.empty}</Text>
            </View>
          }
          onEndReached={() => next()}
          onEndReachedThreshold={0.5}
        />
        <View style={style.inputContainer}>
          <TouchableOpacity activeOpacity={0.85} style={style.uploadButton} onPress={selectFile}>
            <Icon name="insert-photo" color={Color.APP_COLOR} size={28} />
          </TouchableOpacity>
          <TextInput
            value={state.input}
            style={style.input}
            multiline={true}
            numberOfLines={2}
            onChangeText={content => {
              if (content.length > 0) {
                channel.startTyping();
              } else {
                channel.endTyping();
              }
              dispatch({ type: 'typing', payload: { input: content } });
            }}
          />
          <TouchableOpacity activeOpacity={0.85} style={style.sendButton} onPress={sendUserMessage}>
            <Icon name="send" color={state.input.length > 0 ? Color.APP_COLOR : '#ddd'} size={28} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </SafeAreaView>
  );
};

const style = {
  container: {
    flex: 1,
    backgroundColor: Color.APP_COLOR,
  },
  headerRightContainer: {
    flexDirection: 'row',
    backgroundColor: Color.APP_COLOR,
    padding: 10,
    justifyContent: 'space-around',
  },
  headerRightButton: {
    marginRight: 10,
  },
  errorContainer: {
    backgroundColor: '#333',
    opacity: 0.8,
    padding: 10,
  },
  error: {
    color: '#fff',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  empty: {
    fontSize: 24,
    color: '#999',
    alignSelf: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 4,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: 20,
    color: '#555',
  },
  uploadButton: {
    marginRight: 10,
  },
  sendButton: {
    marginLeft: 10,
  },
};

export default withAppContext(Chat);
