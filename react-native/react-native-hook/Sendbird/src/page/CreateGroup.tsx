import { useNavigation } from '@react-navigation/native';
import React, { useReducer } from 'react';
import { Button, Image, SafeAreaView, StatusBar, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Color, Strings } from '../asset/constants';
import { inviteReducer } from '../reducer/invite';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useActionSheet } from '@expo/react-native-action-sheet';

const CreateGroup = props => {
  const { route, navigation, sendbird } = props;
  const { currentUser, channel, index, invite } = route.params;

  console.log('creaaa', invite);
  const backNavigation = useNavigation();
  const { showActionSheetWithOptions } = useActionSheet();

  // const [state, dispatch] = useReducer(inviteReducer, {
  //   channel,
  //   users: [],
  //   userMap: {},
  //   selectedUsers: [],
  //   loading: false,
  //   error: '',
  // });

  const goBack = () => {
    backNavigation.goBack();
  };

  const showContextMenu = message => {
    // console.log('mmmmm', message);
    // if (message.sender && message.sender.userId === currentUser.currentUser.userId) {
    showActionSheetWithOptions(
      {
        // title: 'Message control',
        message: 'Choose your profile photo',
        options: ['Take Photo', 'Choose from Library', 'Cancel'],
        // cancelButtonIndex: 2,
        // destructiveButtonIndex: 1,
      },
      buttonIndex => {
        switch (buttonIndex) {
          case 0: //Take Photo
            //From Camera
            break;
          case 1: // Choose from Library
            break;
          case 2: // cancel4
            break;
        }
      },
    );
    // }
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
            <Text style={{ fontSize: 24, color: Color.BACKGROUND_COLOR, fontWeight: 'bold', marginEnd: 20 }}>
              {Strings.create_group}
            </Text>
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
          <View
            style={{
              margin: 15,
              backgroundColor: Color.white_color,
              borderRadius: 30,
              padding: 20,
              height: 300,
            }}
          >
            <View style={{ alignItems: 'center' }}>
              <TouchableOpacity onPress={showContextMenu}>
                <Image
                  style={{ width: 50, height: 50, marginTop: 10 }}
                  source={{
                    uri: 'https://reactnative.dev/img/tiny_logo.png',
                  }}
                />
              </TouchableOpacity>
              <Text style={{ marginTop: 10 }}>Click here to upload picture</Text>
            </View>
            <View style={{ marginTop: 100 }}>
              <Text style={{ fontSize: 16 }}>Group Name</Text>
              <TextInput style={{ height: 40 }} placeholder="Type here" />
              <View style={{ borderBottomColor: Color.APP_COLOR, borderBottomWidth: 1 }} />
            </View>
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-evenly',
              marginTop: 270,
            }}
          >
            <TouchableOpacity
              style={{
                backgroundColor: Color.APP_COLOR,
                borderRadius: 15,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onPress={invite}
            >
              <Text style={{ color: Color.white_color, padding: 15, fontWeight: 'bold' }}>Create Group</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                backgroundColor: Color.APP_COLOR,
                borderRadius: 15,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text style={{ color: Color.white_color, padding: 15, fontWeight: 'bold' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
};
export default CreateGroup;
