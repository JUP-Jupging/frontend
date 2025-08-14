import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Modal,
  ScrollView,
  SafeAreaView,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

const { width: screenWidth } = Dimensions.get("window");

export default function PloggingControls({
  status,
  time,
  trashCount,
  totalDistance,
  formatTime,
  formatDistance,
  onStart,
  onPause,
  onResume,
  onEnd,
  onGoToMain,
  collectedTrashList = [], // 수집된 쓰레기 목록
}) {
  const [showTrashList, setShowTrashList] = useState(false);

  // 더미 쓰레기 목록 (실제로는 props로 받아올 데이터)
  const dummyTrashList = [
    { id: 1, type: "플라스틱 병", time: "10:30", location: "공원 입구" },
    { id: 2, type: "캔", time: "10:45", location: "벤치 근처" },
    { id: 3, type: "종이컵", time: "11:00", location: "산책로" },
  ];

  const trashListToShow =
    collectedTrashList.length > 0
      ? collectedTrashList
      : dummyTrashList.slice(0, trashCount);

  return (
    <View style={styles.container}>
      {/* 상단 흰색 배경 영역 */}
      <View style={styles.topSection}>
        {/* 플로깅 시간 */}
        <View style={styles.timerSection}>
          <Text style={styles.timerLabel}>플로깅 시간</Text>
          <Text style={styles.timerText}>{formatTime(time)}</Text>
        </View>

        {/* 주운 쓰레기 정보 */}
        <View style={styles.trashSection}>
          <View style={styles.trashHeader}>
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => setShowTrashList(true)}
            >
              <View style={styles.menuIcon}>
                <View style={styles.menuLine} />
                <View style={styles.menuLine} />
                <View style={styles.menuLine} />
              </View>
            </TouchableOpacity>
            <Text style={styles.trashLabel}>현재 주운 쓰레기</Text>
            <Text style={styles.trashCount}>{trashCount}개</Text>
          </View>
        </View>

        {/* 컨트롤 버튼들 */}
        <View style={styles.buttonRow}>
          {status === "running" ? (
            <>
              <TouchableOpacity style={styles.pauseButton} onPress={onPause}>
                <Icon name="pause" size={20} color="#FFFFFF" />
                <Text style={styles.pauseButtonText}>일시정지</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.endButton} onPress={onEnd}>
                <Icon name="stop" size={20} color="#FFFFFF" />
                <Text style={styles.endButtonText}>종료</Text>
              </TouchableOpacity>
            </>
          ) : status === "paused" ? (
            <>
              <TouchableOpacity style={styles.resumeButton} onPress={onResume}>
                <Icon name="play-arrow" size={20} color="#FFFFFF" />
                <Text style={styles.resumeButtonText}>재시작</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.endButton} onPress={onEnd}>
                <Icon name="stop" size={20} color="#FFFFFF" />
                <Text style={styles.endButtonText}>종료</Text>
              </TouchableOpacity>
            </>
          ) : null}
        </View>
      </View>

      {/* 쓰레기 목록 모달 */}
      <Modal
        visible={showTrashList}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowTrashList(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>주운 쓰레기 목록</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowTrashList(false)}
            >
              <Icon name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.trashList}>
            {trashListToShow.length > 0 ? (
              trashListToShow.map((trash, index) => (
                <View key={trash.id || index} style={styles.trashItem}>
                  <View style={styles.trashIcon}>
                    <Icon name="delete" size={20} color="#4CAF50" />
                  </View>
                  <View style={styles.trashInfo}>
                    <Text style={styles.trashType}>{trash.type}</Text>
                    <Text style={styles.trashDetails}>
                      {trash.time} • {trash.location}
                    </Text>
                  </View>
                  <Text style={styles.trashNumber}>#{index + 1}</Text>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Icon name="delete-outline" size={48} color="#CCC" />
                <Text style={styles.emptyText}>아직 주운 쓰레기가 없습니다</Text>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },

  topSection: {
    alignItems: "center",
  },

  // 타이머 섹션
  timerSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  timerLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
    fontWeight: "500",
  },
  timerText: {
    fontSize: 36,
    fontWeight: "300",
    color: "#333",
    letterSpacing: 1,
  },

  // 쓰레기 섹션
  trashSection: {
    width: "100%",
    marginBottom: 20,
  },
  trashHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  menuButton: {
    padding: 4,
    marginRight: 8,
  },
  menuIcon: {
    width: 16,
    height: 12,
    justifyContent: "space-between",
  },
  menuLine: {
    width: 16,
    height: 2,
    backgroundColor: "#666",
    borderRadius: 1,
  },
  trashLabel: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  trashCount: {
    fontSize: 16,
    color: "#333",
    fontWeight: "700",
    marginLeft: 8,
  },

  // 버튼 행
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    paddingHorizontal: 20,
  },
  pauseButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFA500",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  pauseButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
  resumeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4CAF50",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  resumeButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
  endButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F44336",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  endButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },

  // 모달 스타일
  modalContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  closeButton: {
    padding: 8,
  },
  trashList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  trashItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  trashIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E8F5E8",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  trashInfo: {
    flex: 1,
  },
  trashType: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  trashDetails: {
    fontSize: 14,
    color: "#666",
  },
  trashNumber: {
    fontSize: 14,
    color: "#999",
    fontWeight: "500",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    marginTop: 16,
  },
});
