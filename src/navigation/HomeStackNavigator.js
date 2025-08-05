import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TouchableOpacity, Image } from 'react-native';
import RecommendCourseScreen from '../screens/RecommendCourseScreen';
import Icon from 'react-native-vector-icons/MaterialIcons';

import MainScreen from '../screens/MainScreen';
import PloggingStartScreen from '../screens/PloggingStartScreen';

const Stack = createNativeStackNavigator();

export default function HomeStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Main" component={MainScreen} options={{ headerShown: false }} />

      <Stack.Screen
        name="PloggingStart"
        component={PloggingStartScreen}
        options={({ navigation }) => ({
          title: '플로깅 시작',
          headerRight: () => (
            <TouchableOpacity
              onPress={() => navigation.navigate('내 플로깅 기록')} // ✅ 이름 일치해야 함!
              style={{ marginRight: 16 }}
            >
              <Image
                source={require('../assets/user.png')}
                style={{ width: 24, height: 24 }}
              />
            </TouchableOpacity>
          ),
        })}
      />


    </Stack.Navigator>
  );
}
