import React, { useLayoutEffect, useEffect, useReducer } from 'react';
import { Text, StatusBar, SafeAreaView, View, FlatList, TouchableOpacity, AppState } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { withAppContext } from '../context';
import { memberReducer } from '../reducer/member';
import User from '../component/user';
import { Color, String } from '../asset/constants';
import { useNavigation } from '@react-navigation/native';

const Member = props => {
  const backNavigation = useNavigation();

  const { route, navigation, sendbird } = props;
  const { currentUser, channel } = route.params;
  const [state, dispatch] = useReducer(memberReducer, {
    members: channel.members,
    error: '',
  });

  // useLayoutEffect(() => {
  //   const right = (
  //     <View style={style.headerRightContainer}>
  //       <TouchableOpacity activeOpacity={0.85} style={style.inviteButton} onPress={invite}>
  //         <Icon name="person-add" color="#fff" size={28} />
  //       </TouchableOpacity>
  //     </View>
  //   );
  //   navigation.setOptions({
  //     headerRight: () => right,
  //   });
  // });

  // on state change
  useEffect(() => {
    sendbird.addConnectionHandler('member', connectionHandler);
    sendbird.addChannelHandler('member', channelHandler);
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
      sendbird.removeConnectionHandler('member');
      sendbird.removeChannelHandler('member');
      unsubscribe.remove();
    };
  }, []);

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
  channelHandler.onUserJoined = (_, user) => {
    if (user.userId !== currentUser.userId) {
      dispatch({ type: 'add-member', payload: { user } });
    }
  };
  channelHandler.onUserLeft = (_, user) => {
    if (user.userId !== currentUser.userId) {
      dispatch({ type: 'remove-member', payload: { user } });
    } else {
      navigation.goBack();
    }
  };

  const handleStateChange = newState => {
    if (newState === 'active') {
      sendbird.setForegroundState();
    } else {
      sendbird.setBackgroundState();
    }
  };
  const invite = () => {
    navigation.navigate('Invite', { channel, currentUser });
  };
  const refresh = () => {
    dispatch({ type: 'refresh', payload: { members: channel.members } });
  };

  const goBack = () => {
    backNavigation.goBack();
  };

  return (
    <SafeAreaView style={style.container}>
      <StatusBar backgroundColor={Color.APP_COLOR} barStyle="light-content" />
      <SafeAreaView style={{ flex: 1, backgroundColor: Color.BACKGROUND_COLOR }}>
        <View
          style={{
            backgroundColor: Color.APP_COLOR,
            padding: 10,
            flexDirection: 'row',
          }}
        >
          <View style={{ flexDirection: 'row', flex: 1, justifyContent: 'space-between' }}>
            <TouchableOpacity style={{ marginTop: 5 }} onPress={goBack}>
              <Icon name="arrow-back" color="#fff" size={28} />
            </TouchableOpacity>
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ fontSize: 24, color: Color.BACKGROUND_COLOR, fontWeight: 'bold' }}>{String.members}</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginEnd: 10, flex: 0.5 }}>
            <TouchableOpacity activeOpacity={0.85} style={style.inviteButton} onPress={invite}>
              <Icon name="person-add" color="#fff" size={28} />
            </TouchableOpacity>
          </View>
        </View>
        <FlatList
          data={state.members}
          renderItem={({ item }) => <User user={item} navigation={navigation} />}
          keyExtractor={item => item.userId}
          contentContainerStyle={{ flexGrow: 1 }}
          ListHeaderComponent={
            state.error && (
              <View style={style.errorContainer}>
                <Text style={style.error}>{state.error}</Text>
              </View>
            )
          }
        />
      </SafeAreaView>
    </SafeAreaView>
  );
};

const style = {
  container: {
    flex: 1,
    backgroundColor: Color.APP_COLOR,
  },
  inviteButton: {
    // marginRight: 12,
  },
  errorContainer: {
    backgroundColor: '#333',
    opacity: 0.8,
    padding: 10,
  },
  error: {
    color: '#fff',
  },
};

export default withAppContext(Member);
