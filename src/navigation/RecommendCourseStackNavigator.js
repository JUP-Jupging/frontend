import React from "react"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import RecommendCourseScreen from "../screens/RecommendCourseScreen"
import CourseDetailScreen from "../screens/CourseDetailScreen"
import PloggingStartScreen from "../screens/PloggingStartScreen"
import PloggingRecordScreen from "../screens/PloggingRecordScreen" // ✅ 추가
import { TouchableOpacity, Image } from "react-native"

const Stack = createNativeStackNavigator()

export default function RecommendCourseStackNavigator() {
  return (
    <Stack.Navigator>    
      <Stack.Screen
        name="RecommendCourse"
        component={RecommendCourseScreen}
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
  )
}