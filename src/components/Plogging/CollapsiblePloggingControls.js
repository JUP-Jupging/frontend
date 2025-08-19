// CollapsiblePloggingControls.js - 접었다 펼 수 있는 플로깅 컨트롤

import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  Animated,
  Dimensions
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width: screenWidth } = Dimensions.get('window');

const CollapsiblePloggingControls = ({
  status,
  time,
  trashCount,
  formatTime,
  onPause,
  onResume,
  onEnd,
  onShowTrashList,
  isCollapsed = false,           // 🔥 외부에서 제어 가능
  onCollapseChange,              // 🔥 접힘 상태 변경 콜백
  forceCollapse = false,         // 🔥 강제 접힘 (모달 열릴 때)
}) => {
  const [internalCollapsed, setInternalCollapsed] = useState(isCollapsed);
  const heightAnim = useRef(new Animated.Value(isCollapsed ? 0 : 1)).current;
  const opacityAnim = useRef(new Animated.Value(isCollapsed ? 0 : 1)).current;

  // 🔥 외부에서 강제 접힘 처리
  useEffect(() => {
    if (forceCollapse && !internalCollapsed) {
      handleCollapse(true);
    }
  }, [forceCollapse, internalCollapsed]);

  // 🔥 접힘/펼침 애니메이션 처리
  const handleCollapse = (shouldCollapse) => {
    const newCollapsed = shouldCollapse !== undefined ? shouldCollapse : !internalCollapsed;
    
    setInternalCollapsed(newCollapsed);
    
    // 부모 컴포넌트에 상태 변경 알림
    if (onCollapseChange) {
      onCollapseChange(newCollapsed);
    }

    // 애니메이션 실행
    Animated.parallel([
      Animated.timing(heightAnim, {
        toValue: newCollapsed ? 0 : 1,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(opacityAnim, {
        toValue: newCollapsed ? 0 : 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  if (status === 'idle') {
    return null;
  }

  // 🔥 접힌 상태일 때의 미니 컨트롤
  if (internalCollapsed) {
    return (
      <View style={styles.collapsedContainer}>
        <TouchableOpacity 
          style={styles.collapsedCard}
          onPress={() => handleCollapse(false)}
          activeOpacity={0.8}
        >
          <View style={styles.collapsedContent}>
            {/* 상태 표시 점 */}
            <View style={[
              styles.statusDot, 
              { backgroundColor: status === 'running' ? '#4CAF50' : '#FFC107' }
            ]} />
            
            {/* 시간 표시 */}
            <Text style={styles.collapsedTime}>
              {formatTime ? formatTime(time) : '00:00:00'}
            </Text>
            
            {/* 쓰레기 개수 */}
            <View style={styles.collapsedTrashInfo}>
              <Icon name="delete" size={16} color="#666" />
              <Text style={styles.collapsedTrashCount}>{trashCount || 0}</Text>
            </View>
            
            {/* 펼치기 아이콘 */}
            <Icon name="keyboard-arrow-up" size={20} color="#666" />
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  // 🔥 펼쳐진 상태일 때의 전체 컨트롤
  return (
    <Animated.View 
      style={[
        styles.expandedContainer,
        {
          opacity: opacityAnim,
          transform: [{
            scaleY: heightAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.8, 1],
            })
          }]
        }
      ]}
    >
      {/* 드래그 핸들 */}
      <View style={styles.dragHandle} />
      
      {/* 헤더 영역 */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[
            styles.statusDot, 
            { backgroundColor: status === 'running' ? '#4CAF50' : '#FFC107' }
          ]} />
          <Text style={styles.headerTitle}>
            {status === 'running' ? '플로깅 진행중' : '플로깅 일시정지'}
          </Text>
        </View>
        
        {/* 접기 버튼 */}
        <TouchableOpacity 
          style={styles.collapseButton}
          onPress={() => handleCollapse(true)}
          activeOpacity={0.7}
        >
          <Icon name="keyboard-arrow-down" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      {/* 시간 표시 영역 */}
      <View style={styles.timeContainer}>
        <Text style={styles.timeLabel}>플로깅 시간</Text>
        <Text style={styles.timeValue}>
          {formatTime ? formatTime(time) : '00:00:00'}
        </Text>
      </View>

      {/* 구분선 */}
      <View style={styles.divider} />

      {/* 쓰레기 정보 영역 */}
      <View style={styles.trashInfoContainer}>
        <TouchableOpacity
          style={styles.trashListButton}
          onPress={onShowTrashList}
          activeOpacity={0.7}
        >
          <View style={styles.hamburgerMenu}>
            <View style={styles.hamburgerLine} />
            <View style={styles.hamburgerLine} />
            <View style={styles.hamburgerLine} />
          </View>
        </TouchableOpacity>
        <Text style={styles.trashText}>
          현재 주운 쓰레기 <Text style={styles.trashCount}>{trashCount || 0}개</Text>
        </Text>
      </View>

      {/* 버튼 영역 */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={onEnd}
          activeOpacity={0.8}
        >
          <Image source={require("../../assets/tablet.png")} style={styles.buttonIcon} />
          <Text style={styles.secondaryButtonText}>종료</Text>
        </TouchableOpacity>
        
        {status === 'running' ? (
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={onPause}
            activeOpacity={0.8}
          >
            <Image source={require("../../assets/tablet.png")} style={styles.buttonIcon} />
            <Text style={styles.primaryButtonText}>일시정지</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={onResume}
            activeOpacity={0.8}
          >
            <Image source={require("../../assets/play.png")} style={styles.buttonIcon} />
            <Text style={styles.primaryButtonText}>재시작</Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  // 🔥 접힌 상태 스타일
  collapsedContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    zIndex: 50, // 🔥 모달보다 낮은 z-index
  },
  collapsedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  collapsedContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  collapsedTime: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    minWidth: 80,
  },
  collapsedTrashInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  collapsedTrashCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#418663',
  },

  // 🔥 펼쳐진 상태 스타일
  expandedContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 15,
    paddingBottom: 40,
    paddingHorizontal: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 15,
    minHeight: 200,
    zIndex: 50, // 🔥 모달보다 낮은 z-index
  },

  // 드래그 핸들
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 15,
  },

  // 헤더
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  collapseButton: {
    padding: 5,
    borderRadius: 15,
    backgroundColor: '#F5F5F5',
  },

  // 상태 표시 점
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },

  // 시간 표시
  timeContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  timeLabel: {
    fontSize: 16,
    color: '#2E2E2E',
    marginBottom: 8,
    fontWeight: '500',
  },
  timeValue: {
    fontSize: 48,
    color: '#2E2E2E',
    fontWeight: '300',
    letterSpacing: 2,
  },

  // 구분선
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#EAEAEA',
    marginVertical: 15,
  },

  // 쓰레기 정보
  trashInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    width: '100%',
  },
  trashListButton: {
    marginRight: 15,
    padding: 10,
  },
  hamburgerMenu: {
    width: 24,
    height: 18,
    justifyContent: 'space-between',
  },
  hamburgerLine: {
    height: 3,
    backgroundColor: '#418663',
    borderRadius: 2,
  },
  trashText: {
    fontSize: 16,
    color: '#2E2E2E',
    fontWeight: '500',
  },
  trashCount: {
    fontWeight: '700',
    color: '#418663',
  },

  // 버튼 영역
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#418663',
    borderRadius: 30,
    paddingVertical: 15,
    paddingHorizontal: 30,
    flex: 1,
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2E2E2E',
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 30,
    flex: 1,
    justifyContent: 'center',
    gap: 8,
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  buttonIcon: {
    width: 20,
    height: 20,
    tintColor: '#FFFFFF'
  }
});

export default CollapsiblePloggingControls;