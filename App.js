import React, { useEffect, useState } from 'react';
import { StatusBar, useColorScheme, View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './src/screens/LoginScreen';
import BottomTabNavigator from './src/navigation/BottomTabNavigator';
import { PloggingProvider } from './src/contexts/PloggingContext';
import { useAuth } from './src/stores/useAuth';
import AsyncStorage from "@react-native-async-storage/async-storage";

const Stack = createNativeStackNavigator();

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const setTokens = useAuth((s) => s.setTokens);
  const setUser = useAuth((s) => s.setUser);
  const isAuthed = useAuth((s) => s.isAuthed());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const restoreAuth = async () => {
      try {
        const value = await AsyncStorage.getItem("auth");
        console.log("AsyncStorage에 저장된 auth 값:", value);
        if (value) {
          const parsed = JSON.parse(value);
          const { accessToken, refreshToken, user } = parsed.state || {};
          if (accessToken && refreshToken) {
            setTokens({ accessToken, refreshToken });
          }
          if (user) {
            setUser(user);
          }
        }
      } catch (e) {
        console.error("토큰 복원 에러:", e);
      } finally {
        setHydrated(true);
      }
    };
    restoreAuth();
  }, []);

  if (!hydrated) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#1ECD90" />
      </View>
    );
  }

  return (
    <PloggingProvider>
      <NavigationContainer>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <Stack.Navigator initialRouteName={isAuthed ? "Main" : "Login"}>
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Main"
            component={BottomTabNavigator}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </PloggingProvider>
  );
}

export default App;