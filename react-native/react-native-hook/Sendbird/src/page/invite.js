import React, { useLayoutEffect, useEffect, useReducer, useState } from 'react';
import {
  Text,
  StatusBar,
  SafeAreaView,
  View,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  AppState,
} from 'react-native';
import { StackActions, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { withAppContext } from '../context';
import { inviteReducer } from '../reducer/invite';
import User from '../component/user';
import { Color, Strings } from '../asset/constants';

const Invite = props => {
  const { route, navigation, sendbird } = props;
  const { currentUser, channel, index } = route.params;
  const backNavigation = useNavigation();
  const [query, setQuery] = useState(null);
  const [state, dispatch] = useReducer(inviteReducer, {
    channel,
    users: [],
    userMap: {},
    selectedUsers: [],
    loading: false,
    error: '',
  });
  const goBack = () => {
    backNavigation.goBack();
  };
  // useLayoutEffect(() => {
  //   const right = (
  //     <View style={style.headerRightContainer}>
  //       <TouchableOpacity activeOpacity={0.85} style={style.inviteButton} onPress={invite}>
  //         <Icon name="done" color="#fff" size={28} />
  //       </TouchableOpacity>
  //     </View>
  //   );
  //   navigation.setOptions({
  //     headerRight: () => right,
  //   });
  // });

  // on state change
  useEffect(() => {
    sendbird.addConnectionHandler('invite', connectionHandler);
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
      dispatch({ type: 'end-loading' });
      sendbird.removeConnectionHandler('invite');
      unsubscribe.remove();
    };
  }, []);

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

  const handleStateChange = newState => {
    if (newState === 'active') {
      sendbird.setForegroundState();
    } else {
      sendbird.setBackgroundState();
    }
  };

  // var metadata = {
  //   'isInternal': true,
  //   'officeID': 'NetSOL15',
  // };

  const invite = async () => {
    // if (state.selectedUsers.length > 0) {
    dispatch({ type: 'start-loading' });
    try {
      if (!channel) {
        const params = new sendbird.GroupChannelParams();

        let module = index == 0 ? 'INTERNAL' : 'EXTERNAL';

        let office = 'office2';

        params.customType = module;

        params.data = JSON.stringify({
          'officeBranch': module + office,
        });

        params.addUsers(state.selectedUsers);
        const createdChannel = await sendbird.GroupChannel.createChannel(params);

        dispatch({ type: 'end-loading' });
        navigation.dispatch(
          StackActions.replace('Chat', {
            currentUser,
            channel: createdChannel,
          }),
        );
      } else {
        await channel.invite(state.selectedUsers);
        dispatch({ type: 'end-loading' });
        navigation.goBack();
      }
    } catch (err) {
      dispatch({
        type: 'error',
        payload: { error: err.message },
      });
    }
    // } else {
    //   dispatch({
    //     type: 'error',
    //     payload: { error: 'Select at least 1 user to invite.' },
    //   });
    // }
  };
  const createGroup = () => {
    if (state.selectedUsers.length > 0) {
      navigation.navigate('CreateGroup', { currentUser, index, sendbird, channel, invite });
    } else {
      dispatch({
        type: 'error',
        payload: { error: 'Select at least 1 user to invite.' },
      });
    }
  };

  const refresh = () => {
    setQuery(sendbird.createApplicationUserListQuery());
    dispatch({ type: 'refresh' });
  };
  const next = () => {
    if (query.hasNext) {
      dispatch({ type: 'start-loading' });
      query.limit = 50;
      query.next((fetchedUsers, err) => {
        dispatch({ type: 'end-loading' });
        if (!err) {
          dispatch({
            type: 'fetch-users',
            payload: { users: fetchedUsers },
          });
        } else {
          dispatch({
            type: 'error',
            payload: {
              error: 'Failed to get the users.',
            },
          });
        }
      });
    }
  };
  const onSelect = user => {
    if (!state.selectedUsers.includes(user)) {
      dispatch({ type: 'select-user', payload: { user } });
    } else {
      dispatch({ type: 'unselect-user', payload: { user } });
    }
  };

  return (
    <>
      <StatusBar backgroundColor={Color.APP_COLOR} barStyle="light-content" />
      <SafeAreaView style={{ backgroundColor: Color.APP_COLOR, flex: 1 }}>
        <View style={{ backgroundColor: Color.APP_COLOR, flexDirection: 'row' }}>
          <TouchableOpacity style={{ marginTop: 5, paddingStart: 10 }} onPress={goBack}>
            <Icon name="arrow-back" color="#fff" size={28} />
          </TouchableOpacity>
          <View style={{ justifyContent: 'center', flex: 1, alignItems: 'center', marginStart: 25 }}>
            <Text style={{ fontSize: 24, color: Color.BACKGROUND_COLOR, fontWeight: 'bold' }}>
              {Strings.start_chat}
            </Text>
          </View>
          <View style={{ marginEnd: 20, marginTop: 5 }}>
            <TouchableOpacity onPress={createGroup}>
              <Icon name="done" color="#fff" size={28} />
            </TouchableOpacity>
          </View>
        </View>
        <View
          style={{
            marginTop: 20,
            backgroundColor: Color.BACKGROUND_COLOR,
            flex: 1,
            borderTopLeftRadius: 30,
            borderTopEndRadius: 30,
            padding: 10,
          }}
        >
          <FlatList
            data={state.users}
            renderItem={({ item }) => (
              <User
                key={item.userId}
                user={item}
                selected={state.selectedUsers.includes(item)}
                selectable={true}
                onSelect={onSelect}
              />
            )}
            keyExtractor={item => item.userId}
            refreshControl={
              <RefreshControl
                refreshing={state.loading}
                colors={['#587E85']}
                tintColor={'#587E85'}
                onRefresh={refresh}
              />
            }
            contentContainerStyle={{ flexGrow: 1 }}
            ListHeaderComponent={
              state.error && (
                <View style={style.errorContainer}>
                  <Text style={style.error}>{state.error}</Text>
                </View>
              )
            }
            onEndReached={() => next()}
            onEndReachedThreshold={0.5}
          />
        </View>
      </SafeAreaView>
    </>
  );
};

const style = {
  container: {
    flex: 1,
  },
  inviteButton: {
    marginRight: 12,
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

export default withAppContext(Invite);
