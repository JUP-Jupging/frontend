// UIOverlayComponents.js - UI 오버레이 컴포넌트들 분리

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

/**
 * 로딩 카드 컴포넌트
 */
export const LoadingCard = ({ title, subtitle }) => (
  <View style={styles.loadingCard}>
    <Text style={styles.loadingTitle}>{title || "🔍 로딩 중..."}</Text>
    <Text style={styles.loadingText}>{subtitle || "잠시만 기다려주세요"}</Text>
  </View>
);

/**
 * 산책로 안내 카드 컴포넌트
 */
export const TrailInstructionCard = ({ 
  trail, 
  isNear, 
  onTrailPress 
}) => (
  <View style={styles.instructionCard}>
    <Text style={styles.instructionTitle}>🎯 가장 가까운 산책로</Text>
    <Text style={styles.instructionText}>
      {trail.name}{"\n"}
      거리: {trail.distanceToUser?.toFixed(0)}m
    </Text>
    <Text style={[
      styles.instructionSubText,
      { color: isNear ? "rgba(255, 255, 255, 0.9)" : "rgba(255, 193, 7, 0.9)" }
    ]}>
      {isNear ? "플로깅 시작 가능한 거리입니다" : "조금 더 가까이 이동해주세요"}
    </Text>
    {!isNear && onTrailPress && (
      <TouchableOpacity 
        style={styles.selectTrailButton}
        onPress={onTrailPress}
      >
        <Text style={styles.selectTrailButtonText}>산책로 정보 보기</Text>
      </TouchableOpacity>
    )}
  </View>
);

/**
 * 데이터 없음 카드 컴포넌트
 */
export const NoDataCard = ({ 
  title, 
  message, 
  onRetry 
}) => (
  <View style={styles.noDataCard}>
    <Text style={styles.noDataTitle}>{title || "🔍 데이터 없음"}</Text>
    <Text style={styles.noDataText}>{message || "데이터를 찾을 수 없습니다"}</Text>
    {onRetry && (
      <TouchableOpacity 
        style={styles.retryButton}
        onPress={onRetry}
      >
        <Text style={styles.retryButtonText}>다시 시도</Text>
      </TouchableOpacity>
    )}
  </View>
);

/**
 * 코스 정보 카드 컴포넌트
 */
export const CourseInfoCard = ({ courseInfo }) => {
  if (!courseInfo) return null;
  
  return (
    <View style={styles.courseInfoCard}>
      <Text style={styles.courseInfoTitle}>{courseInfo.name}</Text>
      <View style={styles.courseInfoDetails}>
        <Text style={styles.courseInfoText}>난이도: {courseInfo.difficulty}</Text>
        <Text style={styles.courseInfoText}>거리: {courseInfo.distance}</Text>
        {courseInfo.duration && (
          <Text style={styles.courseInfoText}>소요시간: {courseInfo.duration}</Text>
        )}
        {courseInfo.reportCount !== undefined && (
          <Text style={styles.courseInfoText}>쓰레기 신고: {courseInfo.reportCount}개</Text>
        )}
      </View>
    </View>
  );
};

/**
 * 시작 버튼 컴포넌트
 */
export const StartButton = ({ 
  isDisabled, 
  buttonText, 
  onPress 
}) => (
  <TouchableOpacity 
    style={[
      styles.overlayStartButton, 
      isDisabled && styles.overlayStartButtonDisabled
    ]} 
    onPress={onPress}
    disabled={isDisabled}
  >
    <Text style={[
      styles.overlayStartButtonText,
      isDisabled && styles.overlayStartButtonTextDisabled
    ]}>
      {buttonText || "시작"}
    </Text>
  </TouchableOpacity>
);

/**
 * 거리 정보 표시 컴포넌트
 */
export const DistanceInfo = ({ 
  distance, 
  maxDistance, 
  isWarning = false 
}) => {
  if (!distance) return null;

  const isNear = distance <= maxDistance;
  const text = isNear 
    ? `✅ 산책로와 ${distance.toFixed(0)}m 거리 (시작 가능)`
    : `⚠️ 산책로와 ${distance.toFixed(0)}m 거리 (너무 멀음)`;

  return (
    <View style={[styles.distanceInfo, isWarning && styles.distanceInfoWarning]}>
      <Text style={[styles.distanceText, isWarning && styles.distanceTextWarning]}>
        {text}
      </Text>
    </View>
  );
};

/**
 * 쓰레기 데이터 로딩 정보 컴포넌트
 */
export const TrashLoadingInfo = () => (
  <View style={styles.trashLoadingInfo}>
    <Text style={styles.trashLoadingText}>🗑️ 산책로 쓰레기 정보 로딩 중...</Text>
  </View>
);

/**
 * 메인 오버레이 컨테이너 컴포넌트
 */
export const MainOverlayContainer = ({ children, status }) => {
  if (status !== "idle") return null;
  
  return (
    <View style={styles.overlayControls}>
      {children}
    </View>
  );
};

/**
 * 플로깅 상태별 UI 렌더러
 */
export const PloggingStatusRenderer = ({ 
  entryMode,
  isLoading,
  nearestTrail,
  selectedRoute,
  courseInfo,
  canStartPlogging,
  trailStartCoords,
  onTrailPress,
  onRetrySearch,
  onStart,
  MAX_DISTANCE_TO_START
}) => {
  console.log('🎯 [PloggingStatusRenderer] 렌더링:', {
    entryMode,
    isLoading,
    hasNearestTrail: !!nearestTrail,
    hasSelectedRoute: !!selectedRoute,
    canStartPlogging
  });

  // 메인 모드가 아니면 코스 정보와 시작 버튼 표시
  if (entryMode !== 'main') {
    return (
      <>
        <CourseInfoCard courseInfo={courseInfo} />
        <StartButton 
          isDisabled={!canStartPlogging && trailStartCoords}
          buttonText={(!canStartPlogging && trailStartCoords) ? "거리가 너무 멀어요" : "시작"}
          onPress={onStart}
        />
      </>
    );
  }

  // 로딩 중
  if (isLoading) {
    return <LoadingCard title="🔍 가장 가까운 산책로 검색 중..." />;
  }

  // 산책로 발견했지만 아직 선택되지 않은 경우
  if (nearestTrail && !selectedRoute) {
    const distance = nearestTrail.distanceToUser;
    const isNear = distance <= MAX_DISTANCE_TO_START;
    
    return (
      <>
        <TrailInstructionCard
          trail={nearestTrail}
          isNear={isNear}
          onTrailPress={!isNear ? onTrailPress : undefined}
        />
        {/* 🔥 가까운 산책로가 있으면 항상 시작 버튼 표시 */}
        <StartButton 
          isDisabled={false}
          buttonText="시작"
          onPress={onStart}
        />
      </>
    );
  }

  // 산책로가 선택된 경우 (자동 선택 포함)
  if (selectedRoute) {
    return (
      <>
        <CourseInfoCard courseInfo={courseInfo} />
        <StartButton 
          isDisabled={false}
          buttonText="시작"
          onPress={onStart}
        />
      </>
    );
  }

  // 산책로를 찾지 못한 경우
  if (!nearestTrail && !isLoading) {
    return (
      <>
        <NoDataCard
          title="🔍 주변 산책로 없음"
          message="현재 위치 주변에 등록된 산책로가 없습니다"
          onRetry={onRetrySearch}
        />
        {/* 🔥 산책로가 없어도 플로깅 시작할 수 있게 버튼 추가 */}
        <StartButton 
          isDisabled={false}
          buttonText="산책로 없이 시작"
          onPress={onStart}
        />
      </>
    );
  }

  // 기본 시작 버튼 (fallback)
  return (
    <StartButton 
      isDisabled={false}
      buttonText="플로깅 시작"
      onPress={onStart}
    />
  );
};

const styles = StyleSheet.create({
  // 로딩 카드
  loadingCard: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 15,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    width: '100%',
  },
  loadingTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#418663",
    textAlign: "center",
    marginBottom: 8,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
    textAlign: "center",
  },

  // 안내 카드
  instructionCard: {
    backgroundColor: "rgba(66, 134, 99, 0.9)",
    borderRadius: 15,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    width: '100%',
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 8,
    lineHeight: 20,
  },
  instructionSubText: {
    fontSize: 12,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
  },
  selectTrailButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 8,
    alignSelf: "center",
  },
  selectTrailButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },

  // 데이터 없음 카드
  noDataCard: {
    backgroundColor: "rgba(255, 193, 7, 0.1)",
    borderWidth: 2,
    borderColor: "rgba(255, 193, 7, 0.3)",
    borderRadius: 15,
    padding: 16,
    marginBottom: 16,
    width: '100%',
    alignItems: 'center',
  },
  noDataTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FF8F00",
    textAlign: "center",
    marginBottom: 8,
  },
  noDataText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: "#418663",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },

  // 코스 정보 카드
  courseInfoCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 15,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "#418663",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    width: '100%',
  },
  courseInfoTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#418663",
    textAlign: "center",
    marginBottom: 8,
  },
  courseInfoDetails: {
    alignItems: "center",
  },
  courseInfoText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 4,
  },

  // 시작 버튼
  overlayStartButton: { 
    flexDirection: "row", 
    alignItems: "center", 
    backgroundColor: "#418663", 
    borderRadius: 25, 
    paddingVertical: 15, 
    paddingHorizontal: 40, 
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.3, 
    shadowRadius: 8, 
    elevation: 8,
    width: '100%',
    justifyContent: 'center',
  },
  overlayStartButtonDisabled: {
    backgroundColor: "#CCCCCC"
  },
  overlayStartButtonText: { 
    color: "#FFFFFF", 
    fontSize: 18, 
    fontWeight: "600" 
  },
  overlayStartButtonTextDisabled: {
    color: "#888888"
  },

  // 거리 정보
  distanceInfo: {
    backgroundColor: "#E8F5E8",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0"
  },
  distanceInfoWarning: {
    backgroundColor: "#FFF3E0"
  },
  distanceText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#388E3C",
    textAlign: "center"
  },
  distanceTextWarning: {
    color: "#F57C00"
  },

  // 쓰레기 데이터 로딩 정보
  trashLoadingInfo: {
    backgroundColor: "#E3F2FD",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0"
  },
  trashLoadingText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1976D2",
    textAlign: "center"
  },

  // 오버레이 컨테이너
  overlayControls: { 
    position: 'absolute', 
    bottom: screenHeight * 0.1, 
    left: 0, 
    right: 0, 
    alignItems: 'center', 
    zIndex: 100,
    paddingHorizontal: 20,
  },
});

export default {
  LoadingCard,
  TrailInstructionCard,
  NoDataCard,
  CourseInfoCard,
  StartButton,
  DistanceInfo,
  TrashLoadingInfo,
  MainOverlayContainer,
  PloggingStatusRenderer
};