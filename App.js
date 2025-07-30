import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// 화면 컴포넌트 import
import HomeScreen from './src/screens/HomeScreen';
import MainScreen from './src/screens/MainScreen'; // 추가된 메인 화면

const Stack = createNativeStackNavigator();

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <NavigationContainer>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: '홈' }}
        />
        <Stack.Screen
          name="Main"
          component={MainScreen}
          options={{ title: '메인 화면' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
