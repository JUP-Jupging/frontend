import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { height: screenHeight } = Dimensions.get("window");

const PloggingHeader = ({ status, onBack, trailInfo }) => {
  const handleBack = () => {
    if (status !== "idle") {
      Alert.alert(
        '플로깅 진행 중',
        '플로깅이 진행 중입니다. 종료하고 나가시겠습니까?',
        [
          { text: '취소', style: 'cancel' },
          { 
            text: '종료하고 나가기', 
            style: 'destructive',
            onPress: onBack
          }
        ]
      );
    } else {
      onBack();
    }
  };

  // 헤더 타이틀 결정 로직
  const getHeaderTitle = () => {
    if (status === "idle") {
      return "플로깅";
    }

    // 플로깅 진행 중일 때 산책로 정보 표시
    if (trailInfo) {
      // 산책로 타입명과 이름이 모두 있는 경우
      if (trailInfo.trailTypeName && trailInfo.trailName) {
        return `${trailInfo.trailTypeName} ${trailInfo.trailName}`;
      }
      // 산책로 이름만 있는 경우
      else if (trailInfo.trailName) {
        return trailInfo.trailName;
      }
      // 선택된 루트 이름이 있는 경우
      else if (trailInfo.name) {
        return trailInfo.name;
      }
    }

    // 기본값
    return "플로깅 진행 중";
  };

  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Icon name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>
        {getHeaderTitle()}
      </Text>
      <View style={styles.headerRight}>
        {status === "idle" && (
          <TouchableOpacity style={styles.headerButton}>
            <Icon name="person" size={24} color="#333" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingTop: screenHeight * 0.05,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 28,
    paddingVertical: 15,
    backgroundColor: "#FFFFFF",
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333333",
    textAlign: "center",
    flex: 1,
    // 긴 텍스트 처리를 위한 스타일 추가
    numberOfLines: 1,
    ellipsizeMode: 'tail',
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerButton: {
    padding: 5,
    marginLeft: 10,
  },
});

export default PloggingHeader;