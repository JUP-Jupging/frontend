import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TouchableOpacity, Image } from 'react-native';
import RecommendCourseScreen from '../screens/RecommendCourseScreen';
import Icon from 'react-native-vector-icons/MaterialIcons';

import MainScreen from '../screens/MainScreen';
import PloggingStartScreen from '../screens/PloggingStartScreen';
import PloggingRecordScreen from '../screens/PloggingRecordScreen';
import TrashCanInfoScreen from '../screens/TrashCanInfoScreen';

const Stack = createNativeStackNavigator();

export default function HomeStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Main" component={MainScreen} options={{ headerShown: false }} />

      <Stack.Screen
        name="PloggingStart"
        component={PloggingStartScreen}
        options={{ headerShown: false }}
      />

      {/* 플로깅 레코드 화면을 홈 스택에 추가 */}
      <Stack.Screen
        name="PloggingRecord"
        component={PloggingRecordScreen}
        options={{ headerShown: false }}
      />

      {/* 쓰레기통 정보 화면도 홈 스택에 추가 */}
      <Stack.Screen
        name="TrashCanInfo"
        component={TrashCanInfoScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}