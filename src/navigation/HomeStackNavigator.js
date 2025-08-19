import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import MainScreen from '../screens/MainScreen';
import PloggingStartScreen from '../screens/PloggingStartScreen';
import PloggingRecordScreen from '../screens/PloggingRecordScreen';
import TrashCanInfoScreen from '../screens/TrashCanInfoScreen';
import CourseDetailScreen from "../screens/CourseDetailScreen"

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

      <Stack.Screen
        name="PloggingRecord"
        component={PloggingRecordScreen}
        options={{ headerShown: false }}
      />

      {/* 🔥 이 부분이 중요! CourseDetail로 등록 */}
      <Stack.Screen
        name="CourseDetail"
        component={CourseDetailScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="TrashCanInfo"
        component={TrashCanInfoScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}