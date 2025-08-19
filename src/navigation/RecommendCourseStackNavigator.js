import React from "react"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import RecommendCourseScreen from "../screens/RecommendCourseScreen"
import CourseDetailScreen from "../screens/CourseDetailScreen"  // 🤔 파일명/컴포넌트명 확인
import { TouchableOpacity, Image } from "react-native"
const Stack = createNativeStackNavigator()

export default function RecommendCourseStackNavigator() {
  return (
    <Stack.Navigator>    
<Stack.Screen
  name="RecommendCourse"
  component={RecommendCourseScreen}
  // ① options 함수 매개변수에서 headerShown 제거
options={{ headerShown: false }}
/>

      <Stack.Screen 
        name="PloggingStart" 
        component={PloggingStartScreen} 
        options={{ headerShown: false }} 
      />
      
            <Stack.Screen name="CourseDetail" component={CourseDetailScreen} options={{ headerShown: false }} />
      
    </Stack.Navigator>
  )
}