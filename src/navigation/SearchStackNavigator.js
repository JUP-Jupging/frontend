/* 아래는 HomeStackNavigator.js, RecommendCourseStackNavigator.js, SearchStackNavigator.js 파일에 
  모두 공통으로 적용해야 할 수정 사항입니다. 
  PloggingStartScreen을 각 스택에 추가하여 어느 경로에서든 접근 가능하게 만듭니다.
*/

// 예시: navigation/SearchStackNavigator.js

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import WalkSearchScreen from '../screens/WalkSearchScreen';
import CourseDetailScreen from '../screens/CourseDetailScreen';
// PloggingStartScreen을 import 합니다.
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
      {/* 👇 PloggingStartScreen을 스택에 추가합니다. */}
      <Stack.Screen 
        name="PloggingStart" 
        component={PloggingStartScreen} 
        options={{ headerShown: false }} 
      />
    </Stack.Navigator>
  );
}

// 🚨 중요: HomeStackNavigator.js 와 RecommendCourseStackNavigator.js 파일에도
//    위와 동일한 방식으로 PloggingStartScreen을 import하고 Stack.Screen을 추가해주세요.
