import React, { Component } from 'react';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import {
  View,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Text,
  Platform,
  Dimensions,
  PermissionsAndroid,
  Alert,
} from 'react-native';
import { check, PERMISSIONS, request, RESULTS } from 'react-native-permissions';

const options = {
  storageOptions: {
    skipBackup: true,
    path: 'images',
  },
  includeBase64: true,
  quality: 0.85,
  maxWidth: 760,
  maxHeight: 253,
};

const givePermission = async () => {
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
};

// export default class FileModal extends Component {
//   openCamera = () => {
//     _cameraPermission().then(() =>
//       launchCamera(options, response => {
//         console.log('response', response);
//         if (response.didCancel) {
//         } else if (response.error) {
//         } else if (response.customButton) {
//         } else {
//           const source = {
//             uri: Platform.OS === 'ios' ? response?.uri?.replace('file://', '') : response.uri,
//             name: response.fileName,
//             type: 'multipart/form-data',
//           };
//           this.props.setProfilePic(source);
//         }
//       }),
//     );
//   };

//   openGallery = () => {
//     launchImageLibrary(options, response => {
//       if (response.didCancel) {
//       } else if (response.error) {
//       } else if (response.customButton) {
//       } else {
//         const source = {
//           uri: Platform.OS === 'ios' ? response?.uri?.replace('file://', '') : response.uri,
//           name: response.fileName,
//           type: 'multipart/form-data',
//         };
//         // this.props.setProfilePic(source);
//       }
//     });
//   };
// }
