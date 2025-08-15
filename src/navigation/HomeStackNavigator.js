import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TouchableOpacity, Image } from 'react-native';
import RecommendCourseScreen from '../screens/RecommendCourseScreen';
import Icon from 'react-native-vector-icons/MaterialIcons';

import MainScreen from '../screens/MainScreen';
import PloggingStartScreen from '../screens/PloggingStartScreen';
import PloggingRecordScreen from '../screens/PloggingRecordScreen';

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
    </Stack.Navigator>
  );
}
