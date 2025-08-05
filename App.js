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
          options={{ title: '로그인 화면' }}
        />

        {/* ✅ 메인 진입 시 탭 네비게이터로 이동 */}
        <Stack.Screen
          name="Main"
          component={BottomTabNavigator}
          options={{ headerShown: false }} // 탭에 헤더 필요 없으면 숨김
        />


        <Stack.Screen
          name="PloggingRecord"
          component={PloggingRecordScreen}
          options={({ navigation }) => ({
            title: '플로깅 기록',
            headerRight: () => (
              <TouchableOpacity
                onPress={() => navigation.navigate('내 플로깅 기록')} // ✅ 이름 일치해야 함!
                style={{ marginRight: 16 }}
              >
                <Image
                  source={require('./src/assets/user.png')}
                  style={{ width: 24, height: 24 }}
                />
              </TouchableOpacity>
            ),
          })}
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
