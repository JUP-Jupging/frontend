import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Animated, Platform, PanResponder } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useNavigationState } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { usePloggingContext } from '../contexts/PloggingContext';

// 화면 크기를 최상단에서 정의
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const FloatingPloggingIndicator = ({ hideOnPlogging = false }) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  
  const isMounted = useRef(true);
  
  useEffect(() => {
    isMounted.current = true;
    
    return () => {
      console.log('[FloatingPloggingIndicator] 컴포넌트 언마운트 - 정리 작업');
      isMounted.current = false;
    };
  }, []);
  
  const navigationState = useNavigationState(state => state);
  
  const isPloggingStartScreen = () => {
    try {
      if (!navigationState || !isMounted.current) return false;
      
      const getCurrentRouteName = (state) => {
        if (!state || !state.routes) return null;
        
        const route = state.routes[state.index];
        if (route.state) {
          return getCurrentRouteName(route.state);
        }
        return route.name;
      };
      
      const currentRouteName = getCurrentRouteName(navigationState);
      const isPloggingScreen = currentRouteName === 'PloggingStart';
      
      return isPloggingScreen;
    } catch (error) {
      console.error('[FloatingPloggingIndicator] 화면 감지 오류:', error);
      return false;
    }
  };
  
  const { 
    status,
    time,
    formatTime,
    trashCount,
    totalDistance,
    formatDistance,
    isContextActive
  } = usePloggingContext();

  if (!isContextActive || !isMounted.current) {
    return null;
  }

  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const pan = useRef(new Animated.ValueXY()).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        if (!isMounted.current) return false;
        return Math.abs(gestureState.dx) > 10 || Math.abs(gestureState.dy) > 10;
      },
      onPanResponderGrant: () => {
        if (!isMounted.current) return;
        
        pan.setOffset({
          x: pan.x._value,
          y: pan.y._value,
        });
        
        Animated.timing(opacity, {
          toValue: 0.8,
          duration: 100,
          useNativeDriver: false,
        }).start();
      },
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { 
          useNativeDriver: false,
          listener: (evt, gestureState) => {
            if (!isMounted.current) return;
          }
        }
      ),
      onPanResponderRelease: (evt, gestureState) => {
        if (!isMounted.current) return;
        
        pan.flattenOffset();
        
        let finalX = pan.x._value;
        let finalY = pan.y._value;
        
        const maxX = screenWidth * 0.3;
        const minX = -screenWidth * 0.3;
        finalX = Math.max(minX, Math.min(maxX, finalX));
        
        const maxY = screenHeight * 0.3;
        const minY = -screenHeight * 0.3;
        finalY = Math.max(minY, Math.min(maxY, finalY));
        
        if (isMounted.current) {
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
        }
      },
    })
  ).current;

  if (status !== "running" && status !== "paused") {
    return null;
  }

  if (isPloggingStartScreen()) {
    return null;
  }

  if (hideOnPlogging) {
    return null;
  }

  const toggleCollapse = () => {
    if (!isMounted.current) return;
    setIsCollapsed(!isCollapsed);
  };

  const goToPloggingScreen = () => {
    if (!isMounted.current) return;
    
    console.log('[FloatingPloggingIndicator] 플로깅 화면으로 이동');
    
    try {
      const navigationTimer = setTimeout(() => {
        if (isMounted.current) {
          navigation.navigate("Main", {
            screen: "홈",
            params: { screen: "PloggingStart" }
          });
        }
      }, 50);
      
      if (!isMounted.current) {
        clearTimeout(navigationTimer);
      }
      
    } catch (error) {
      console.error('[FloatingPloggingIndicator] 네비게이션 오류:', error);
    }
  };

  const safeFormatTime = (time) => {
    try {
      return formatTime ? formatTime(time || 0) : '00:00:00';
    } catch (error) {
      console.error('[FloatingPloggingIndicator] 시간 포맷 오류:', error);
      return '00:00:00';
    }
  };

  const safeFormatDistance = (distance) => {
    try {
      return formatDistance ? formatDistance(distance || 0) : '0km';
    } catch (error) {
      console.error('[FloatingPloggingIndicator] 거리 포맷 오류:', error);
      return '0km';
    }
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
          activeOpacity={0.8}
        >
          <View style={[styles.statusDot, { 
            backgroundColor: status === "running" ? "#4CAF50" : "#FFC107" 
          }]} />
          <Text style={styles.collapsedTime}>{safeFormatTime(time)}</Text>
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
        <View style={styles.dragHandle} />
        
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={goToPloggingScreen} 
            style={styles.headerLeft}
            activeOpacity={0.8}
          >
            <View style={[styles.statusDot, { 
              backgroundColor: status === "running" ? "#4CAF50" : "#FFC107" 
            }]} />
            <Text style={styles.title}>
              {status === "running" ? "플로깅 진행중" : "플로깅 일시정지"}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={toggleCollapse} 
            style={styles.closeButton}
            activeOpacity={0.8}
          >
            <Icon name="keyboard-arrow-down" size={screenWidth * 0.05} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressItem}>
            <Text style={styles.progressLabel}>시간</Text>
            <Text style={styles.progressValue}>{safeFormatTime(time)}</Text>
          </View>
          
          <View style={styles.progressItem}>
            <Text style={styles.progressLabel}>거리</Text>
            <Text style={styles.progressValue}>{safeFormatDistance(totalDistance)}</Text>
          </View>
          
          <View style={styles.progressItem}>
            <Text style={styles.progressLabel}>쓰레기</Text>
            <Text style={styles.progressValue}>{trashCount || 0}개</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.goButton}
          onPress={goToPloggingScreen}
          activeOpacity={0.8}
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