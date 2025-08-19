import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import WalkSearchScreen from '../screens/WalkSearchScreen';
import CourseDetailScreen from '../screens/CourseDetailScreen';
import PloggingStartScreen from '../screens/PloggingStartScreen';
import PloggingRecordScreen from '../screens/PloggingRecordScreen'; // ✅ 추가

const Stack = createNativeStackNavigator();

export default function SearchStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="WalkSearch" 
        component={WalkSearchScreen} 
        options={{ headerShown: false }} 
      />
      
      <Stack.Screen 
        name="CourseDetail" 
        component={CourseDetailScreen} 
        options={{ headerShown: false }} 
      />
      
      <Stack.Screen 
        name="PloggingStart" 
        component={PloggingStartScreen} 
        options={{ headerShown: false }} 
      />

      {/* ✅ PloggingRecordScreen 추가 */}
      <Stack.Screen 
        name="PloggingRecordScreen" 
        component={PloggingRecordScreen} 
        options={{ headerShown: false }} 
      />
    </Stack.Navigator>
  );
}