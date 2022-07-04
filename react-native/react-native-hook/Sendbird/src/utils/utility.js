import React from 'react';
import { Alert, Linking, PermissionsAndroid, Platform } from 'react-native';
import RNFetchBlob from 'rn-fetch-blob';

export const requestStoragePermission = async (uri, name) => {
  // alert(JSON.stringify(RNFetchBlob.fs));
  try {
    const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE, {
      title: 'SendBird Storage permissions',
      message: 'SendBird needs to access phone storage',
      buttonNeutral: 'Ask me later',
      buttonNegative: 'Cancel',
      buttonPositive: 'OK',
    });
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      downloadFile(uri, name);
    } else {
      Alert.alert('required storage permissions ', 'Please allow it from settings', [
        {
          text: 'Cancel',

          style: 'Cancel',
        },
        {
          text: 'OK',
          onPress: () => {
            Linking.openSettings();
          },
        },
      ]);
    }
  } catch (err) {
    console.warn(err);
  }
};

const downloadFile = async (uri, name) => {
  // if (netInfo.isConnected) {
  //   showToastMessage(assets.localized_strings['COMMON.FILE_DOWNLOADING_TOAST']);
  // } else {
  //   showToastMessage(assets.localized_strings['COMMON.INTERNET_ERROR_TOAST']);
  // }

  const { dirs } = RNFetchBlob.fs;
  const dirToSave = Platform.OS == 'ios' ? dirs.DocumentDir : dirs.DownloadDir;
  const configfb = {
    fileCache: true,
    addAndroidDownloads: {
      useDownloadManager: true,
      notification: true,
      path: dirToSave + '/' + name,
      description: 'downloading file',
      title: name,
    },
  };
  const configOptions = Platform.select({
    ios: {
      fileCache: configfb.fileCache,
      title: name,
      path: dirToSave + '/' + name,
    },
    android: configfb,
  });

  RNFetchBlob.config(configOptions)
    .fetch('GET', uri)
    .then(res => {
      // do some magic here

      if (Platform.OS === 'ios') {
        RNFetchBlob.fs.writeFile(res.path(), res.data, 'base64');
        RNFetchBlob.ios.previewDocument(res.path());
      }
      showToastMessage('downloaded');
    })
    .catch(error => {
      console.log('DOWLOADING ERROR======= ', error);
      showToastMessage('downloading error');
    });
};
