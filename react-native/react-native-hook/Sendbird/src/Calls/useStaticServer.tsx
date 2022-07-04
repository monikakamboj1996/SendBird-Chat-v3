// import React, { useEffect, useState } from 'react';
// import { Platform } from 'react-native';
// import StaticServer from 'react-native-static-server';
// import RNFS from 'react-native-fs';

// const PORT = 8080;

// const useStaticServer = () => {
//   const [url, setUrl] = useState(null);
//   const [server, setServer] = useState(null);

//   function getPath() {
//     return Platform.OS === 'android' ? RNFS.DocumentDirectoryPath + '/www' : RNFS.MainBundlePath + '/www';
//   }

//   async function moveAndroidFiles() {
//     if (Platform.OS === 'android') {
//       await RNFS.mkdir(RNFS.DocumentDirectoryPath + '/www');
//       await [
//         'www/index.html',
//         'www/main.css',
//         'www/main.js',
//         // add more files to copy here
//       ].forEach(async file => {
//         await RNFS.copyFileAssets(file, RNFS.DocumentDirectoryPath + '/' + file);
//       });
//     }
//   }

//   useEffect(() => {
//     if (!server) {
//       const startServer = async () => {
//         await moveAndroidFiles();
//         const path = getPath();
//         const _server = new StaticServer(PORT, path, { localOnly: true });
//         _server.start().then(_url => {
//           setUrl(_url);
//         });
//         // setServer(_server);
//       };
//       startServer();
//     }

//     // Stop server when component unmounts
//     return () => {
//       // if (server && server.isRunning()) {
//       //   server.stop();
//       // }
//     };
//   }, [server]);

//   return [url, server];
// };

// export default useStaticServer;
