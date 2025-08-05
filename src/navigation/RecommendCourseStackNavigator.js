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
  options={({ navigation }) => ({
    // ② 반환값에 headerShown:false 로 헤더 숨김
    headerShown: false,
    title: '추천 코스',
    headerRight: () => (
      <TouchableOpacity
        onPress={() => navigation.navigate('내 플로깅 기록')}
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


      
            <Stack.Screen name="CourseDetail" component={CourseDetailScreen} options={{ headerShown: false }} />
      
    </Stack.Navigator>
  )
}