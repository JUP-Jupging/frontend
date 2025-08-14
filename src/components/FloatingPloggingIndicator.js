import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Animated, Platform, PanResponder } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { usePloggingContext } from '../contexts/PloggingContext'; // 플로깅 전역 상태 사용

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

/**
 * 🎯 FloatingPloggingIndicator: 드래그 가능한 플로깅 진행 상황 인디케이터
 * 
 * 주요 기능:
 * 1. 플로깅 진행 중일 때 화면 위에 오버레이로 표시
 * 2. 실시간 플로깅 정보 표시 (시간, 거리, 쓰레기 개수)
 * 3. 드래그해서 화면 내 자유롭게 이동 가능
 * 4. 접기/펼치기 기능으로 공간 절약
 * 5. 플로깅 화면으로 빠른 이동 버튼
 * 
 * 표시 조건:
 * - 플로깅 상태가 "running" 또는 "paused"일 때만 표시
 * - hideOnPlogging=true일 때는 숨김 (플로깅 시작 화면에서 중복 방지)
 * 
 * @param {boolean} hideOnPlogging - 플로깅 화면에서 인디케이터를 숨길지 여부
 */
const FloatingPloggingIndicator = ({ hideOnPlogging = false }) => {
  const insets = useSafeAreaInsets(); // 디바이스 안전 영역 정보
  const navigation = useNavigation(); // 네비게이션 객체
  
  // 플로깅 전역 상태에서 필요한 데이터 추출
  const { 
    status,        // 플로깅 상태 (idle/running/paused)
    time,          // 경과 시간 (초)
    formatTime,    // 시간 포맷팅 함수
    trashCount,    // 수집한 쓰레기 개수
    totalDistance, // 총 이동 거리 (미터)
    formatDistance // 거리 포맷팅 함수
  } = usePloggingContext();

  // 컴포넌트 로컬 상태
  const [isCollapsed, setIsCollapsed] = useState(false); // 접힘/펼침 상태
  
  // 드래그 기능을 위한 Animated Values
  const pan = useRef(new Animated.ValueXY()).current;     // X, Y 위치 값
  const opacity = useRef(new Animated.Value(1)).current;  // 투명도 값

  /**
   * 🖱️ PanResponder: 드래그 제스처 처리
   * - 작은 움직임은 버튼 클릭으로 인식하여 무시
   * - 드래그 중에는 투명도 변경으로 시각적 피드백
   * - 화면 경계를 벗어나지 않도록 제한
   */
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // 작은 움직임은 무시 (버튼 클릭과 구분)
        return Math.abs(gestureState.dx) > 10 || Math.abs(gestureState.dy) > 10;
      },
      onPanResponderGrant: () => {
        // 드래그 시작 시 현재 위치를 offset으로 설정
        pan.setOffset({
          x: pan.x._value,
          y: pan.y._value,
        });
        // 드래그 중에는 약간 투명하게
        Animated.timing(opacity, {
          toValue: 0.8,
          duration: 100,
          useNativeDriver: false,
        }).start();
      },
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (evt, gestureState) => {
        // 드래그 종료 시 offset을 합침
        pan.flattenOffset();
        
        // 화면 경계를 벗어나지 않도록 제한
        const { dx, dy } = gestureState;
        let finalX = pan.x._value;
        let finalY = pan.y._value;
        
        // X축 경계 체크 (좌우)
        const maxX = screenWidth * 0.3; // 모달 너비의 절반 정도
        const minX = -screenWidth * 0.3;
        finalX = Math.max(minX, Math.min(maxX, finalX));
        
        // Y축 경계 체크 (상하)
        const maxY = screenHeight * 0.3;
        const minY = -screenHeight * 0.3;
        finalY = Math.max(minY, Math.min(maxY, finalY));
        
        // 경계 내로 애니메이션
        Animated.parallel([
          Animated.spring(pan.x, {
            toValue: finalX,
            useNativeDriver: false,
          }),
          Animated.spring(pan.y, {
            toValue: finalY,
            useNativeDriver: false,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 100,
            useNativeDriver: false,
          }),
        ]).start();
      },
    })
  ).current;

  // 플로깅 중이 아니면 렌더링하지 않음
  if (status !== "running" && status !== "paused") {
    return null;
  }

  // hideOnPlogging이 true이면 렌더링하지 않음 (플로깅 화면용)
  if (hideOnPlogging) {
    return null;
  }

  const toggleCollapse = () => {
    console.log('[FloatingPloggingIndicator] 접기/펼치기 버튼 클릭, 현재 상태:', isCollapsed);
    setIsCollapsed(!isCollapsed);
  };

  // 플로깅 화면으로 이동 (진행 중일 때)
  const goToPloggingScreen = () => {
    console.log('[FloatingPloggingIndicator] 플로깅 화면으로 이동 버튼 클릭');
    console.log('[FloatingPloggingIndicator] 현재 상태:', status);
    
    // 바텀탭 유지하면서 홈 탭의 PloggingStart로 이동
    navigation.navigate("Main", {
      screen: "홈",
      params: { screen: "PloggingStart" }
    });
    console.log('[FloatingPloggingIndicator] 네비게이션 명령 전송 완료');
  };
  if (isCollapsed) {
    return (
      <Animated.View 
        style={[
          styles.collapsedContainer, 
          { 
            bottom: insets.bottom + screenHeight * 0.12,
            transform: pan.getTranslateTransform(),
            opacity: opacity,
          }
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity 
          style={styles.collapsedIndicator}
          onPress={toggleCollapse}
        >
          <View style={[styles.statusDot, { 
            backgroundColor: status === "running" ? "#4CAF50" : "#FFC107" 
          }]} />
          <Text style={styles.collapsedTime}>{formatTime(time)}</Text>
          <Icon name="keyboard-arrow-up" size={screenWidth * 0.05} color="#666" />
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          paddingBottom: insets.bottom + screenHeight * 0.12,
          transform: pan.getTranslateTransform(),
          opacity: opacity,
        }
      ]}
      {...panResponder.panHandlers}
    >
      <View style={styles.indicatorCard}>
        {/* 드래그 핸들 */}
        <View style={styles.dragHandle} />
        
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={goToPloggingScreen} style={styles.headerLeft}>
            <View style={[styles.statusDot, { 
              backgroundColor: status === "running" ? "#4CAF50" : "#FFC107" 
            }]} />
            <Text style={styles.title}>
              {status === "running" ? "플로깅 진행중" : "플로깅 일시정지"}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={toggleCollapse} style={styles.closeButton}>
            <Icon name="keyboard-arrow-down" size={screenWidth * 0.05} color="#666" />
          </TouchableOpacity>
        </View>

        {/* 진행 상황 */}
        <View style={styles.progressContainer}>
          <View style={styles.progressItem}>
            <Text style={styles.progressLabel}>시간</Text>
            <Text style={styles.progressValue}>{formatTime(time)}</Text>
          </View>
          
          <View style={styles.progressItem}>
            <Text style={styles.progressLabel}>거리</Text>
            <Text style={styles.progressValue}>{formatDistance(totalDistance)}</Text>
          </View>
          
          <View style={styles.progressItem}>
            <Text style={styles.progressLabel}>쓰레기</Text>
            <Text style={styles.progressValue}>{trashCount}개</Text>
          </View>
        </View>

        {/* 플로깅 화면으로 이동 버튼 */}
        <TouchableOpacity 
          style={styles.goButton}
          onPress={goToPloggingScreen}
        >
          <Text style={styles.goButtonText}>플로깅 화면으로</Text>
          <Icon name="arrow-forward" size={screenWidth * 0.04} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingHorizontal: screenWidth * 0.04,
    paddingBottom: screenWidth * 0.04,
  },
  indicatorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: screenWidth * 0.03,
    padding: screenWidth * 0.04,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
    borderTopWidth: 3,
    borderTopColor: '#4CAF50',
  },
  dragHandle: {
    width: screenWidth * 0.12,
    height: screenWidth * 0.01,
    backgroundColor: '#E0E0E0',
    borderRadius: screenWidth * 0.005,
    alignSelf: 'center',
    marginBottom: screenWidth * 0.02,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: screenWidth * 0.03,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusDot: {
    width: screenWidth * 0.025,
    height: screenWidth * 0.025,
    borderRadius: screenWidth * 0.0125,
    marginRight: screenWidth * 0.02,
  },
  title: {
    fontSize: screenWidth * 0.04,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: screenWidth * 0.01,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: screenWidth * 0.03,
  },
  progressItem: {
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: screenWidth * 0.032,
    color: '#666',
    marginBottom: screenWidth * 0.01,
  },
  progressValue: {
    fontSize: screenWidth * 0.036,
    fontWeight: '600',
    color: '#333',
  },
  goButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: screenWidth * 0.02,
    paddingVertical: screenWidth * 0.025,
    paddingHorizontal: screenWidth * 0.04,
  },
  goButtonText: {
    color: '#FFFFFF',
    fontSize: screenWidth * 0.035,
    fontWeight: '600',
    marginRight: screenWidth * 0.01,
  },
  
  // 접힌 상태 스타일
  collapsedContainer: {
    position: 'absolute',
    bottom: screenWidth * 0.04,
    right: screenWidth * 0.04,
    zIndex: 1000,
  },
  collapsedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: screenWidth * 0.05,
    paddingVertical: screenWidth * 0.02,
    paddingHorizontal: screenWidth * 0.03,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  collapsedTime: {
    fontSize: screenWidth * 0.032,
    fontWeight: '600',
    color: '#333',
    marginHorizontal: screenWidth * 0.015,
  },
});

export default FloatingPloggingIndicator;
