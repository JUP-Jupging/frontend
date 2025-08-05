"use client"

import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Image, SafeAreaView, ScrollView, Dimensions } from "react-native"
import { useNavigation } from "@react-navigation/native"
import Icon from "react-native-vector-icons/MaterialIcons"

const { width: screenWidth, height: screenHeight } = Dimensions.get("window")

export default function MyPloggingScreen() {
  const navigation = useNavigation()
  const [activeTab, setActiveTab] = useState("줍깅")

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="rgba(19, 18, 20, 0.5)" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 프로필 상단 영역 */}
        <View style={styles.profileSection}>
          <Image source={require("../assets/profile.png")} style={styles.profileImage} />
          <View style={styles.profileInfo}>
            <Text style={styles.nickname}>쓰레기줍기장인</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate("MyPageMain")}>
            <Icon name="chevron-right" size={24} color="#131214" />
          </TouchableOpacity>
        </View>

        {/* 탭 영역 */}
        <View style={styles.tabContainer}>
          <View style={styles.tabRow}>
            <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab("줍깅")}>
              <Text style={activeTab === "줍깅" ? styles.activeTab : styles.inactiveTab}>줍깅 기록</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab("신고")}>
              <Text style={activeTab === "신고" ? styles.activeTab : styles.inactiveTab}>제보 기록</Text>
            </TouchableOpacity>
          </View>

          {/* 탭 인디케이터 */}
          <View style={styles.tabIndicatorContainer}>
            <View style={[styles.tabIndicator, { left: activeTab === "줍깅" ? 0 : screenWidth * 0.5 }]} />
            <View style={styles.tabUnderline} />
          </View>
        </View>

        {/* 탭에 따라 다른 내용 */}
        {activeTab === "줍깅" ? (
          <>
            {/* 플로깅 하러 가기 버튼 */}
            <TouchableOpacity style={styles.actionBox}>
              <Image source={require("../assets/square-plus.png")} style={styles.actionIcon} />
              <View style={styles.actionTextContainer}>
                <Text style={styles.actionTitle}>플로깅 하러 가기</Text>
                <Text style={styles.actionSubtitle}>플로깅을 통해 주위를 깨끗하게</Text>
              </View>
            </TouchableOpacity>

            {/* 플로깅 기록 */}
            <View style={styles.recordSection}>
              <Text style={styles.recordTitle}>플로깅 기록</Text>
              <View style={styles.recordCard}>
                <View style={styles.recordContent}>
                  <Text style={styles.recordMainTitle}>쓰줍장의 쓰레기 기록</Text>
                  <Text style={styles.recordDate}>2024.10.24 ~ 2024.10.26</Text>
                  <Text style={styles.recordLocation}>국립 중앙 박물관</Text>
                </View>
                <View style={styles.recordImageContainer}>
                  <Image source={require("../assets/map-image.png")} style={styles.recordMapImage} />
                  <TouchableOpacity style={styles.trashIcon}>
                    <Image source={require("../assets/trash-02.png")} style={styles.trashIconImage} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </>
        ) : (
          <>
            {/* 쓰레기 제보 하러 가기 버튼 */}
            <TouchableOpacity style={styles.actionBox}>
              <Image source={require("../assets/report-icon.png")} style={styles.actionIcon} />
              <View style={styles.actionTextContainer}>
                <Text style={styles.actionTitle}>쓰레기 제보 하러 가기</Text>
                <Text style={styles.actionSubtitle}>쓰레기 제보를 통해 동네를 깨끗하게</Text>
              </View>
            </TouchableOpacity>

            {/* 제보 기록 */}
            <View style={styles.recordSection}>
              <Text style={styles.recordTitle}>제보 기록</Text>
              <View style={styles.recordCard}>
                <View style={styles.recordContent}>
                  <Text style={styles.recordMainTitle}>쓰줍장의 쓰레기 제보</Text>
                  <Text style={styles.recordDate}>2024.10.24 ~ 2024.10.26</Text>
                  <Text style={styles.recordLocation}>국립 중앙 박물관</Text>
                </View>
                <View style={styles.recordImageContainer}>
                  <Image source={require("../assets/map-image.png")} style={styles.recordMapImage} />
                  <TouchableOpacity style={styles.trashIcon}>
                    <Image source={require("../assets/trash-02.png")} style={styles.trashIconImage} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    paddingTop: screenHeight * 0.06,

    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#FFFFFF",
  },
  backButton: {
    padding: 5,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
    paddingVertical: 10,
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 20,
  },
  profileInfo: {
    flex: 1,
  },
  nickname: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    letterSpacing: -0.1,
  },
  tabContainer: {
    marginBottom: 30,
  },
  tabRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
  },
  activeTab: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
    textAlign: "center",
  },
  inactiveTab: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
    textAlign: "center",
  },
  tabIndicatorContainer: {
    position: "relative",
    height: 2,
  },
  tabIndicator: {
    position: "absolute",
    width: screenWidth * 0.5,
    height: 2,
    backgroundColor: "#418663",
  },
  tabUnderline: {
    position: "absolute",
    width: "100%",
    height: 2,
    backgroundColor: "rgba(153, 153, 153, 0.2)",
  },
  actionBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(153, 153, 153, 0.05)",
    borderRadius: 10,
    padding: 20,
    marginBottom: 30,
  },
  actionIcon: {
    width: 50,
    height: 50,
    marginRight: 15,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 5,
  },
  actionSubtitle: {
    fontSize: 10,
    fontWeight: "400",
    color: "rgba(51, 51, 51, 0.8)",
  },
  recordSection: {
    marginBottom: 20,
  },
  recordTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333333",
    marginBottom: 20,
  },
  recordCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 20,
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  recordContent: {
    flex: 1,
    justifyContent: "space-between",
  },
  recordMainTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333333",
    marginBottom: 8,
  },
  recordDate: {
    fontSize: 12,
    fontWeight: "500",
    color: "rgba(51, 51, 51, 0.8)",
    marginBottom: 8,
  },
  recordLocation: {
    fontSize: 12,
    fontWeight: "500",
    color: "rgba(51, 51, 51, 0.6)",
  },
  recordImageContainer: {
    position: "relative",
    alignItems: "center",
  },
  recordMapImage: {
    width: 60,
    height: 60,
    borderRadius: 20,
  },
  trashIcon: {
    position: "absolute",
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  trashIconImage: {
    width: 16,
    height: 16,
    tintColor: "#418663",
  },
})
