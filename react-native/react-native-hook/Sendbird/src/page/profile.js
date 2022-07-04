import React, { useEffect, useReducer, useState } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  Animated,
  Keyboard,
  StatusBar,
  SafeAreaView,
  Image,
  FlatList,
} from 'react-native';
import { Color } from '../asset/constants';
import { withAppContext } from '../context';
import { profileReducer } from '../reducer/profile';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { ListUpdate } from '../Action/listUpdateAction';
import { useDispatch } from 'react-redux';

const Profile = props => {
  const { route, sendbird, navigation } = props;
  const { currentUser, channels } = route.params;
  const [messageListDoc, setmessageListDoc] = useState([]);
  const _dispatch = useDispatch();

  const [state, dispatch] = useReducer(profileReducer, {
    nickname: currentUser.nickname,
    error: '',
    updating: false,
    messageListDoc: messageListDoc,
    getNextImages: getNextImages,
  });

  useEffect(() => {
    _dispatch(ListUpdate(messageListDoc));
  }, [messageListDoc]);

  const getImages = () => {
    sendbird.GroupChannel.getChannel(channels?.url, function (GroupChannel, error) {
      let listQuery = GroupChannel.createPreviousMessageListQuery();
      listQuery.load(10, false, 'FILE', (messageList, error) => {
        if (!error) {
          setmessageListDoc(messageList);
        }
      });
    });
  };

  const getNextImages = () => {
    const params = new sendbird.MessageListParams();
    params.prevResultSize = 10;
    params.messageType = 'FILE';
    // messageListDoc,
    channels.getMessagesByMessageId(messageListDoc[0]?.messageId, params, (messages, error) => {
      setmessageListDoc(e => [...messages, ...e]);
    });
  };
  // const getImages = async () => {
  //   const messageList = await listQuery.load();
  //   setFiles(pf => [...pf, ...messageList]);
  //   console.log('message list', messageList);
  //   // listQuery?.load?.(10, false, 'FILE', (messageList, error) => {
  //   //   if (!error) {
  //   //     files.push(...messageList);
  //   //     console.log('message list', messageList);
  //   //     console.log('files list', files);

  //   //     setFiles([...files]);
  //   //   }
  //   // });
  //   // sendbird.GroupChannel.getChannel(channels.url, function (GroupChannel, error) {
  //   //   let listQuery = GroupChannel.createPreviousMessageListQuery();
  //   //   listQuery.load(30, false, 'FILE', (messageList, error) => {
  //   //     if (!error) {
  //   //       console.log(messageList, 'message list query');
  //   //       setFiles([...messageList]);
  //   //     }
  //   //   });
  //   // });
  // };
  console.log('files list', messageListDoc);

  const backNavigation = useNavigation();

  console.log('messageListDocstate', state.messageListDoc);
  // useEffect(() => {
  //   sendbird.GroupChannel.getChannel(channels.url, function (GroupChannel, error) {
  //     const listQuerytemp = GroupChannel.createPreviousMessageListQuery();
  //     setListQuery(listQuerytemp);
  //   });
  // }, [channels]);
  // useEffect(() => {
  //   if (channels && channels.url) {
  //     const query = channels.createPreviousMessageListQuery();
  //     query.limit = 10;
  //     query.messageTypeFilter = 'FILE';
  //     setListQuery(query);
  //   }
  // }, [channels]);
  useEffect(() => {
    getImages();
  }, []);
  const renderFlatList = item => {
    return (
      <View>
        {String(item.item.type).startsWith('image/') ? (
          <Image
            style={{
              width: 70,
              height: 70,
              marginStart: 5,
              borderRadius: 10,
              overflow: 'hidden',
            }}
            source={{
              uri: item.item.url,
            }}
          />
        ) : null}
      </View>
    );
  };
  const showErrorFadeDuration = 200;
  const showErrorDuration = 3500;

  const fade = new Animated.Value(0);
  // const showError = message => {
  //   dispatch({ type: 'error', payload: { error: message } });
  //   Animated.sequence([
  //     Animated.timing(fade, {
  //       toValue: 1,
  //       duration: showErrorFadeDuration,
  //       useNativeDriver: true,
  //     }),
  //     Animated.timing(fade, {
  //       toValue: 0,
  //       delay: showErrorDuration,
  //       duration: showErrorFadeDuration,
  //       useNativeDriver: true,
  //     }),
  //   ]).start();
  // };
  // const saveNickname = () => {
  //   if (!state.updating) {
  //     if (state.nickname && sendbird.currentUser.nickname !== state.nickname) {
  //       dispatch({ type: 'start-update' });
  //       Keyboard.dismiss();
  //       sendbird.updateCurrentUserInfo(state.nickname, '', (user, err) => {
  //         dispatch({ type: 'end-update' });
  //         if (!err) {
  //           currentUser.nickname = user.nickname;
  //         } else {
  //           showError(err.message);
  //         }
  //       });
  //     } else {
  //       showError('Please put your user ID and nickname.');
  //     }
  //   }
  // };
  const seeDetails = () => {
    // navigation.navigate('MediaDetails', { files, getImages });
    navigation.navigate('MediaDetails', {
      files: messageListDoc,
      getNextImages: getNextImages,
      state: state,
    });
  };
  const goBack = () => {
    backNavigation.goBack();
  };
  return (
    <>
      <StatusBar backgroundColor={Color.APP_COLOR} barStyle="light-content" />
      <SafeAreaView style={style.container}>
        <TouchableOpacity style={{ marginStart: 10 }} onPress={goBack}>
          <Icon name="arrow-back" color="black" size={28} />
        </TouchableOpacity>
        <View style={style.imageContainer}>
          <Image
            style={{
              width: 200,
              height: 200,
              borderRadius: 40,
              overflow: 'hidden',
            }}
            source={
              currentUser.currentUser.plainProfileUrl
                ? { uri: currentUser.currentUser.plainProfileUrl }
                : require('../asset/profile.jpeg')
            }
          />
        </View>

        {/* <ActivityIndicator animating={state.updating} size="large" color="#6e5baa" /> */}
        {/* <View style={[style.loginForm]}>
          <Animated.View style={{ opacity: fade }}>
            <Text style={style.loginError}>{state.error}</Text>
          </Animated.View> */}
        {/* <TextInput
            placeholder={'Nickname'}
            editable={!state.updating}
            onChangeText={content => dispatch({ type: 'edit-nickname', payload: { content } })}
            style={style.loginInput}
            defaultValue={currentUser.nickname}
          /> */}
        {/* <Text style={{ marginTop: 10, fontWeight: 'bold', marginStart: 20 }}>{currentUser.currentUser.userId}</Text> */}
        {/* <TouchableOpacity
            disabled={state.updating}
            activeOpacity={0.85}
            style={[style.loginButton, { backgroundColor: state.updating ? '#dbcfff' : '#742ddd' }]}
            onPress={saveNickname}
          >
            <Text style={style.loginButtonLabel}>Save</Text>
          </TouchableOpacity> */}
        {/* </View> */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ marginTop: 10, fontWeight: 'bold', marginStart: 20 }}>Media & Docs</Text>
          <TouchableOpacity onPress={() => seeDetails()}>
            <Text style={{ marginTop: 10, fontWeight: 'bold', marginEnd: 20 }}>See All</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          style={{ marginStart: 15, marginEnd: 20, marginTop: 20 }}
          horizontal
          data={messageListDoc}
          renderItem={renderFlatList}
          keyExtractor={item => item.id}
          onEndReached={() => getNextImages()}
        />
      </SafeAreaView>
    </>
  );
};

const style = {
  container: {
    flex: 1,
  },
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
};

export default withAppContext(Profile);
