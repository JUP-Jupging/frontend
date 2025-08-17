import React, { useRef, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'

const { width: screenWidth } = Dimensions.get('window');

export default function PloggingControls({
  status,
  time,
  trashCount,
  onStart,
  onPause,
  onResume,
  onEnd,
  onShowTrashList,
  formatTime,
}) {
  const isMounted = useRef(true);
  
  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const safeOnPause = () => onPause?.();
  const safeOnResume = () => onResume?.();
  const safeOnEnd = () => onEnd?.();
  const safeOnShowTrashList = () => onShowTrashList?.();

  const safeFormatTime = (t) => (formatTime && t !== undefined ? formatTime(t) : '00:00:00');

  // PloggingStartScreen에서 idle 상태는 다른 UI를 사용하므로 이 컴포넌트는 running/paused일 때만 보입니다.
  if (status === 'idle') {
    return null; 
  }

  return (
    <View style={styles.container}>
      {/* 상단 시간 표시 */}
      <View style={styles.timeContainer}>
        <Text style={styles.timeLabel}>플로깅 시간</Text>
        <Text style={[styles.timeValue, status === 'paused' && styles.pausedTimeValue]}>
          {safeFormatTime(time)}
        </Text>
      </View>

      {/* 구분선 */}
      <View style={styles.divider} />

      {/* 쓰레기 정보 영역 */}
      <View style={styles.trashInfoContainer}>
        <TouchableOpacity 
          style={styles.trashListButton}
          onPress={safeOnShowTrashList}
          activeOpacity={0.8}
        >
          {/* 디자인 명세에 있는 menu-01 아이콘 적용 */}
          <Icon name="menu" size={24} color="#418663" />
        </TouchableOpacity>
        
        <Text style={styles.trashText}>
          현재 주운 쓰레기 <Text style={styles.trashCount}>{trashCount || 0}개</Text>
        </Text>
      </View>

      {/* 제어 버튼들 */}
      <View style={styles.buttonContainer}>
        {status === 'running' ? (
          // [진행 중] 상태일 때의 버튼
          <TouchableOpacity 
            style={styles.singleButton} 
            onPress={safeOnPause}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>일시정지</Text>
            <Image source={require("../../assets/tablet.png")} style={styles.buttonIcon} />
          </TouchableOpacity>
        ) : (
          // [일시정지] 상태일 때의 버튼들
          <>
            <TouchableOpacity 
              style={styles.secondaryButton} 
              onPress={safeOnEnd}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>종료</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.primaryButton} 
              onPress={safeOnResume}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>재시작</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
    alignItems: 'center',
  },
  timeContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  timeLabel: {
    fontFamily: 'Pretendard',
    fontWeight: '500',
    fontSize: 14,
    color: '#999999',
  },
  timeValue: {
    fontFamily: 'Pretendard',
    fontWeight: '600',
    fontSize: 30,
    color: '#333333',
    marginTop: 4,
  },
  pausedTimeValue: {
    color: '#D9D9D9',
  },
  divider: {
    width: 320,
    height: 2,
    backgroundColor: 'rgba(170, 178, 200, 0.2)',
    marginVertical: 12,
  },
  trashInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 20,
  },
  trashListButton: {
    padding: 10,
  },
  trashText: {
    fontFamily: 'Pretendard',
    fontWeight: '600',
    fontSize: 16,
    color: '#999999',
    marginLeft: 8, // 아이콘과 텍스트 간격
  },
  trashCount: {
    color: '#2E2E2E',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32, // 버튼 사이 간격
    width: '100%',
  },
  // 진행 중일 때의 '일시정지' 버튼
  singleButton: {
    width: 120,
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2E2E2E',
    borderRadius: 30,
  },
  // 일시정지 상태의 '종료' 버튼
  secondaryButton: {
    width: 100,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2E2E2E',
    borderRadius: 30,
  },
  // 일시정지 상태의 '재시작' 버튼
  primaryButton: {
    width: 100,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#418663',
    borderRadius: 30,
  },
  buttonText: {
    fontFamily: 'Pretendard',
    fontWeight: '700',
    fontSize: 20,
    color: '#FFFFFF',
  },
  buttonIcon: {
    width: 24,
    height: 24,
    tintColor: '#FFFFFF',
    marginLeft: 8,
  },
});