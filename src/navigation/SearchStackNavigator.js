import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import WalkSearchScreen from '../screens/WalkSearchScreen';
import CourseDetailScreen from '../screens/CourseDetailScreen';
import PloggingStartScreen from '../screens/PloggingStartScreen'; 

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
    </Stack.Navigator>
  );
}