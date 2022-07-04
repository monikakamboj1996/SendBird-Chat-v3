import React, { useEffect, useReducer, useState } from 'react';
import { FlatList, Image, SafeAreaView, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { TabView, TabBar, SceneMap } from 'react-native-tab-view';
import { Color, Strings } from '../asset/constants';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { requestStoragePermission } from '../utils/utility';
import { profileReducer } from '../reducer/profile';
import { useSelector, useDispatch } from 'react-redux';

const MediaDetails = props => {
  const [index, setIndex] = useState(0);
  const [images, setImages] = useState([]);
  const [docFiles, setDocFiles] = useState([]);
  const { listReducer } = useSelector(state => state);

  // const [state, dispatch] = useReducer(profileReducer, {
  //   messageListDoc: images,
  // });

  // console.log(state.messageListDoc, 'state.messageListDoc');

  useEffect(() => {
    console.log('list reducer', listReducer);
    if (index == 0) {
      const images = listReducer.list.filter(item => {
        //  {String(item.item.type).startsWith('image/') ? (
        if (String(item.type).startsWith('image/')) {
          return item;
        }
      });
      setImages(images);
    } else {
      // text/
      const docFiles = listReducer.list.filter(item => {
        // application;
        if (
          String(item.type).startsWith('text/') ||
          String(item.type).startsWith('video/') ||
          String(item.type).startsWith('application/')
        ) {
          return item;
        }
      });
      setDocFiles(docFiles);
    }
  }, [listReducer, index]);

  const { files, state, getNextImages } = props.route.params;
  // const { getNextImages } = props.route.params.state;

  const backNavigation = useNavigation();
  console.log('state', state);

  const MEDIA = () => (
    <View>
      <FlatList
        numColumns={4}
        style={{ marginStart: 15, marginEnd: 20, marginTop: 20 }}
        data={images}
        renderItem={renderMediaFlatList}
        keyExtractor={item => item.id}
        onEndReached={() => getNextImages()}
      />
    </View>
  );
  const DOCS = () => (
    <View>
      <FlatList
        style={{ marginStart: 15, marginEnd: 20, marginTop: 20 }}
        data={docFiles}
        renderItem={renderDocFlatList}
        keyExtractor={item => item.id}
      />
    </View>
  );
  const renderScene = SceneMap({
    MEDIA: MEDIA,
    DOCS: DOCS,
  });
  useEffect(() => {
    if (index == 0) {
      const images = listReducer.list.filter(item => {
        //  {String(item.item.type).startsWith('image/') ? (
        if (String(item.type).startsWith('image/')) {
          return item;
        }
      });
      setImages(images);
    } else {
      // text/
      const docFiles = listReducer.list.filter(item => {
        // application;
        if (
          String(item.type).startsWith('text/') ||
          String(item.type).startsWith('video/') ||
          String(item.type).startsWith('application/')
        ) {
          return item;
        }
      });
      setDocFiles(docFiles);
    }
  }, [index]);

  const renderMediaFlatList = item => {
    return (
      <View>
        <Image
          style={{
            width: 70,
            height: 70,
            marginStart: 5,
            marginBottom: 10,
            borderRadius: 10,
            overflow: 'hidden',
          }}
          source={{
            uri: item.item.url,
          }}
        />
      </View>
    );
  };
  const fileDownload = ({ item }) => {
    requestStoragePermission(item.url, item.name);
  };
  const threeDot = lenght => {
    if (lenght > 15) return '...';
    else {
      return '';
    }
  };
  const renderDocFlatList = item => {
    return (
      <View>
        <View
          style={{
            paddingStart: 15,
            paddingEnd: 15,
            backgroundColor: '#FFFF',
            borderRadius: 15,
            shadowOpacity: 0.3,
            shadowRadius: 5,
            marginBottom: 10,
            height: 70,
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          <View style={{ justifyContent: 'center' }}>
            <Image
              style={{
                width: 40,
                height: 40,
                marginStart: 5,
                borderRadius: 10,
                overflow: 'hidden',
              }}
              source={require('../asset/txtfile.png')}
            />
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginStart: 20,
              flex: 1,
            }}
          >
            <Text numberOfLines={2} style={{ fontSize: 16 }}>
              {`${item.item.name.slice(0, 15)}${threeDot(item.item.name?.length)}`}
            </Text>
            <TouchableOpacity onPress={() => fileDownload(item)}>
              <Icon name="file-download" color="black" size={28} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };
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
    { key: 'MEDIA', title: 'MEDIA' },
    { key: 'DOCS', title: 'DOCS' },
  ]);

  const goBack = () => {
    backNavigation.goBack();
  };

  return (
    <SafeAreaView style={{ backgroundColor: Color.APP_COLOR, flex: 1 }}>
      <StatusBar backgroundColor={Color.APP_COLOR} barStyle="light-content" />

      <View style={{ backgroundColor: Color.APP_COLOR, flexDirection: 'row' }}>
        <TouchableOpacity style={{ marginStart: 10, marginTop: 5 }} onPress={goBack}>
          <Icon name="arrow-back" color="#fff" size={28} />
        </TouchableOpacity>
        <View style={{ justifyContent: 'center', flex: 1, alignItems: 'center' }}>
          <Text style={{ fontSize: 24, color: Color.BACKGROUND_COLOR, fontWeight: 'bold' }}>{Strings.Details}</Text>
        </View>
        {/* <TouchableOpacity
          onPress={() => {
            getNextImages();
          }}
          style={{ marginEnd: 10, justifyContent: 'center' }}
        >
          <Text>LoadMore</Text>
        </TouchableOpacity> */}
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

export default MediaDetails;
