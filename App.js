import React from 'react';
import { StatusBar, useColorScheme, TouchableOpacity, Image } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PloggingRecordScreen from './src/screens/PloggingRecordScreen'; // 추가
import TrashCanInfoScreen from './src/screens/TrashCanInfoScreen'; // 추가
import LoginScreen from './src/screens/LoginScreen';
import BottomTabNavigator from './src/navigation/BottomTabNavigator'; // ✅ 탭 네비게이터 import

const Stack = createNativeStackNavigator();

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <NavigationContainer>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />

        {/* ✅ 메인 진입 시 탭 네비게이터로 이동 */}
        <Stack.Screen
          name="Main"
          component={BottomTabNavigator}
          options={{ headerShown: false }} // 탭에 헤더 필요 없으면 숨김
        />

        <Stack.Screen
          name="TrashCanInfo"
          component={TrashCanInfoScreen}
           options={{ headerShown: false }} // 추가: 근처 쓰레기통 정보 화면 
        />

      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
