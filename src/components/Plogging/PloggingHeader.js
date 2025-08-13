import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { height: screenHeight } = Dimensions.get("window");

const PloggingHeader = ({ status, onBack }) => {
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

  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Icon name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>
        {status === "idle" ? "플로깅" : "마로니에 공원"}
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
