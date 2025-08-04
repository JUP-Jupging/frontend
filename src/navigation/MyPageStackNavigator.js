import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MyPageScreen from '../screens/MyPageScreen';
import MyPloggingScreen from '../screens/MyPloggingScreen';
import ChangeNicknameScreen from '../screens/ChangeNicknameScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen'; // 👈 임포트 추가

const Stack = createNativeStackNavigator();

export default function MyPageStackNavigator() {
  return (
    <Stack.Navigator>
      {/* ✅ 탭에서 보여줄 첫 화면을 MyPloggingScreen으로 */}
      <Stack.Screen
        name="내 플로깅 기록"
        component={MyPloggingScreen}
        options={{ title: '내 플로깅 기록' }}
      />

      {/* 👇 MyPageScreen을 이 안에서 navigate 해서 접근 */}
      <Stack.Screen
        name="MyPageMain"
        component={MyPageScreen}
        options={{ title: '나의 활동' }}
      />

      <Stack.Screen
        name="ChangeNickname"
        component={ChangeNicknameScreen}
        options={{ title: '닉네임 변경', headerShown: false }}
      />

      <Stack.Screen
        name="ChangePassword" // 👈 추가!
        component={ChangePasswordScreen}
        options={{ title: '비밀번호 변경', headerShown: false }}
      />

    </Stack.Navigator>
  );
}
