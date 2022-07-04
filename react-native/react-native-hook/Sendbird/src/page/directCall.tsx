import React from 'react';
import { SafeAreaView, Text } from 'react-native';
import Video from 'react-native-video';
import SendBirdCall from 'sendbird-calls';
// import useStaticServer from '../Calls/useStaticServer';

const DirectCall = props => {
  // const [url] = useStaticServer(); // add this line

  console.log('props direct call', props);
  return (
    <SafeAreaView>
      <Text>Hello</Text>
    </SafeAreaView>
  );
};
export default DirectCall;
