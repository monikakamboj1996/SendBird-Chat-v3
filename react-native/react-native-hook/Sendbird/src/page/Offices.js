import React, { useEffect, useState } from 'react';
import { SafeAreaView, Text, View, TouchableOpacity, StatusBar } from 'react-native';
import { Color, Strings } from '../asset/constants';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { TabView, TabBar, SceneMap } from 'react-native-tab-view';

const Offices = props => {
  const { route, navigation, sendbird, currentUser } = props;

  const [index, setIndex] = useState(0);

  const OpenOffice = channel1 => {
    navigation.navigate('Channels', {
      currentUser: props,
      sendbird: sendbird,
      item: channel1,
      module: index,
    });
  };
  const startChat = () => {
    if (currentUser) {
      navigation.navigate('Invite', { currentUser, index });
    }
  };

  useEffect(() => {
    // alert(index);
  }, [index]);
  const Internal = () => (
    <SafeAreaView>
      <View
        style={{
          justifyContent: 'space-between',
          paddingTop: 15,
          paddingStart: 15,
          marginTop: 20,
          backgroundColor: '#FFFF',
          borderRadius: 15,
          shadowOpacity: 0.3,
          shadowRadius: 5,
          marginHorizontal: 20,
          marginBottom: 5,
          height: 100,
        }}
      >
        <TouchableOpacity onPress={() => OpenOffice('office1')}>
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ marginTop: 30, fontWeight: 'bold', fontSize: 16 }}>office 1</Text>
          </View>
        </TouchableOpacity>
      </View>
      <View
        style={{
          justifyContent: 'space-between',
          paddingTop: 15,
          paddingStart: 15,
          marginTop: 20,
          backgroundColor: '#FFFF',
          borderRadius: 15,
          shadowOpacity: 0.3,
          shadowRadius: 5,
          marginHorizontal: 20,
          marginBottom: 5,
          height: 100,
        }}
      >
        <TouchableOpacity onPress={() => OpenOffice('office2')}>
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ marginTop: 30, fontWeight: 'bold', fontSize: 16 }}>office 2</Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
  const External = () => (
    <SafeAreaView>
      <View
        style={{
          justifyContent: 'space-between',
          paddingTop: 15,
          paddingStart: 15,
          marginTop: 20,
          backgroundColor: '#FFFF',
          borderRadius: 15,
          shadowOpacity: 0.3,
          shadowRadius: 5,
          marginHorizontal: 20,
          marginBottom: 5,
          height: 100,
        }}
      >
        <TouchableOpacity onPress={() => OpenOffice('office1')}>
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ marginTop: 30, fontWeight: 'bold', fontSize: 16 }}>office 1</Text>
          </View>
        </TouchableOpacity>
      </View>
      <View
        style={{
          justifyContent: 'space-between',
          paddingTop: 15,
          paddingStart: 15,
          marginTop: 20,
          backgroundColor: '#FFFF',
          borderRadius: 15,
          shadowOpacity: 0.3,
          shadowRadius: 5,
          marginHorizontal: 20,
          marginBottom: 5,
          height: 100,
        }}
      >
        <TouchableOpacity onPress={() => OpenOffice('office2')}>
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ marginTop: 30, fontWeight: 'bold', fontSize: 16 }}>office 2</Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
  const renderScene = SceneMap({
    Internal: Internal,
    External: External,
  });
  const renderTabBar = props => (
    <TabBar
      {...props}
      activeColor={Color.APP_COLOR}
      inactiveColor={'#9C9C9C'}
      style={{ backgroundColor: Color.BACKGROUND_COLOR }}
      indicatorStyle={{
        backgroundColor: Color.APP_COLOR,
        width: 30,
        marginStart: 70,
        alignItems: 'center',
        justifyContent: 'center',
      }}
      labelStyle={{ color: Color.APP_COLOR, fontWeight: 'bold' }}
      tabStyle={{
        flex: 1,
        color: Color.APP_COLOR,
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
      }}
    />
  );

  const [routes] = useState([
    { key: 'Internal', title: 'Internal' },
    { key: 'External', title: 'External' },
  ]);

  return (
    <SafeAreaView style={{ backgroundColor: Color.APP_COLOR, flex: 1 }}>
      <StatusBar backgroundColor={Color.APP_COLOR} barStyle="light-content" />

      <View style={{ backgroundColor: Color.APP_COLOR, flexDirection: 'row' }}>
        <View style={{ justifyContent: 'center', flex: 1, alignItems: 'center', marginStart: 25 }}>
          <Text style={{ fontSize: 24, color: Color.BACKGROUND_COLOR, fontWeight: 'bold' }}>{Strings.messenger}</Text>
        </View>
        <View style={{ marginEnd: 20, marginTop: 5 }}>
          <TouchableOpacity onPress={startChat}>
            <Icon name="chat" color="#fff" size={28} />
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
        <TabView
          navigationState={{ index, routes }}
          renderScene={renderScene}
          onIndexChange={setIndex}
          renderTabBar={renderTabBar}
          style={{
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
            justifyContent: 'center',
            borderTopColor: '#D3D3D3',
          }}
        />
      </View>
    </SafeAreaView>
  );
};

export default Offices;
