import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width: screenWidth } = Dimensions.get("window");

const PloggingControls = ({ 
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
  onGoToMain 
}) => {
  console.log('[PloggingControls] 렌더링:', { status, time, trashCount, totalDistance });

  if (status === "idle") {
    console.log('[PloggingControls] 대기 상태 - 시작 버튼 표시');
    return (
      <View style={styles.bottomContainer}>
        <View style={styles.idleControls}>
          <TouchableOpacity 
            style={styles.startButton} 
            onPress={() => {
              console.log('[PloggingControls] 시작 버튼 클릭');
              onStart();
            }}
          >
            <Icon name="play-arrow" size={36} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.startButtonText}>시작</Text>
          </TouchableOpacity>
          
          {/* 개발용 메인 이동 버튼 */}
          <TouchableOpacity 
            style={styles.mainButton} 
            onPress={() => {
              console.log('[PloggingControls] 메인 이동 버튼 클릭');
              onGoToMain();
            }}
          >
            <Text style={styles.mainButtonText}>메인 화면으로</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  console.log('[PloggingControls] 플로깅 중 - 제어 패널 표시');
  
  return (
    <View style={styles.bottomContainer}>
      {/* 통계 정보 */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>시간</Text>
          <Text style={styles.statValue}>{formatTime(time)}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>거리</Text>
          <Text style={styles.statValue}>{formatDistance(totalDistance)}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>쓰레기</Text>
          <Text style={styles.statValue}>{trashCount}개</Text>
        </View>
      </View>

      {/* 제어 버튼들 */}
      <View style={styles.controlsRow}>
        {status === "running" ? (
          <>
            <TouchableOpacity 
              style={styles.pauseButton} 
              onPress={() => {
                console.log('[PloggingControls] 일시정지 버튼 클릭');
                onPause();
              }}
            >
              <Icon name="pause" size={24} color="#FFFFFF" />
              <Text style={styles.buttonText}>일시정지</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.endButton} 
              onPress={() => {
                console.log('[PloggingControls] 종료 버튼 클릭');
                onEnd();
              }}
            >
              <Icon name="stop" size={24} color="#FFFFFF" />
              <Text style={styles.buttonText}>종료</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity 
              style={styles.resumeButton} 
              onPress={() => {
                console.log('[PloggingControls] 재시작 버튼 클릭');
                onResume();
              }}
            >
              <Icon name="play-arrow" size={24} color="#FFFFFF" />
              <Text style={styles.buttonText}>재시작</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.endButton} 
              onPress={() => {
                console.log('[PloggingControls] 종료 버튼 클릭');
                onEnd();
              }}
            >
              <Icon name="stop" size={24} color="#FFFFFF" />
              <Text style={styles.buttonText}>종료</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomContainer: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  idleControls: {
    alignItems: "center",
  },
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#418663",
    borderRadius: 30,
    paddingVertical: 16,
    paddingHorizontal: 32,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  startButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  mainButton: {
    marginTop: 16,
    paddingVertical: 12,
  },
  mainButtonText: {
    color: "#418663",
    fontSize: 16,
    fontWeight: "600",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
    paddingVertical: 16,
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
  },
  statItem: {
    alignItems: "center",
  },
  statLabel: {
    fontSize: 14,
    color: "#6C757D",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#212529",
  },
  controlsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  pauseButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFC107",
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  resumeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#418663",
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  endButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DC3545",
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});

export default PloggingControls;
