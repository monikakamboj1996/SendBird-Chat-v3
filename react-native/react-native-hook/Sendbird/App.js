import React, { useEffect } from 'react';
import { Platform, StatusBar } from 'react-native';
import SendBird from 'sendbird';
import { AppContext } from './src/context';
import 'react-native-gesture-handler';
import messaging from '@react-native-firebase/messaging';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { store, persistor } from './src/store/AppStore';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import Lobby from './src/page/lobby';
import Chat from './src/page/chat';
import Member from './src/page/member';
import Invite from './src/page/invite';
import Profile from './src/page/profile';
import { onRemoteMessage } from './src/utils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Channels from './src/page/channels';
import UserProfile from './src/page/UserProfile';
import MediaDetails from './src/page/MediaDetails';
import DirectCall from './src/page/directCall';
import CreateGroup from './src/page/CreateGroup';

const Stack = createNativeStackNavigator();

// const appId = '9DA1B1F4-0BE6-4DA8-82C5-2E81DAB56F23';
// const appId = '812BDBE5-3FE7-45AA-B86E-308FF8CA921A';
const appId = '7C14A46A-804B-4A11-B9ED-5D2F02406B96';

const sendbird = new SendBird({ appId });

//register our FCM token in SendBird
const initialState = {
  sendbird,
};

const defaultHeaderOptions = {
  headerStyle: {
    backgroundColor: '#742ddd',
  },
  headerTintColor: '#fff',
};

const App = () => {
  const savedUserKey = 'savedUser';

  useEffect(() => {
    AsyncStorage.getItem(savedUserKey).then(async user => {
      try {
        if (user) {
          const authorizationStatus = await messaging().requestPermission();
          console.log('authorizationStatus', messaging.AuthorizationStatus.PROVISIONAL);

          if (
            authorizationStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            authorizationStatus === messaging.AuthorizationStatus.PROVISIONAL
          ) {
            if (Platform.OS === 'ios') {
              const token = await messaging().getAPNSToken();
              sendbird.registerAPNSPushTokenForCurrentUser(token);
            } else {
              // console.log(await messaging().getToken());
              const token = await messaging().getToken();

              try {
                // alert(JSON.stringify(token));
                const response = await sendbird.registerGCMPushTokenForCurrentUser(token);
                // alert(JSON.stringify(response));
              } catch (error) {
                // alert(JSON.stringify(error));
              }
            }
          }
        }
      } catch (err) {
        console.error(err);
      }
    });

    if (Platform.OS !== 'ios') {
      const unsubscribeHandler = messaging().onMessage(onRemoteMessage);
      return unsubscribeHandler;
    }
  }, []);

  return (
    <ActionSheetProvider>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <NavigationContainer>
            <AppContext.Provider value={initialState}>
              <Stack.Navigator screenOptions={{ header: () => null }}>
                <Stack.Screen name="Lobby" component={Lobby} />
                <Stack.Screen name="Channels" component={Channels} options={{ ...defaultHeaderOptions }} />
                <Stack.Screen name="Chat" component={Chat} options={{ ...defaultHeaderOptions }} />
                <Stack.Screen name="Member" component={Member} options={{ ...defaultHeaderOptions }} />
                <Stack.Screen name="Invite" component={Invite} options={{ ...defaultHeaderOptions }} />
                <Stack.Screen name="Profile" component={Profile} options={{ ...defaultHeaderOptions }} />
                <Stack.Screen name="UserProfile" component={UserProfile} options={{ ...defaultHeaderOptions }} />
                <Stack.Screen name="MediaDetails" component={MediaDetails} options={{ ...defaultHeaderOptions }} />
                <Stack.Screen name="DirectCall" component={DirectCall} options={{ ...defaultHeaderOptions }} />
                <Stack.Screen name="CreateGroup" component={CreateGroup} options={{ ...defaultHeaderOptions }} />
              </Stack.Navigator>
            </AppContext.Provider>
          </NavigationContainer>
        </PersistGate>
      </Provider>
    </ActionSheetProvider>
  );
};
// Notifee.onBackgroundEvent(onNotificationAndroid);

export default App;
