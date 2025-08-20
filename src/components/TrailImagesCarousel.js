// TrailImagesCarousel.js - 산책로 이미지 스크롤뷰 컴포넌트 (신규 생성)

import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Image,
  Text,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width: screenWidth } = Dimensions.get('window');

const TrailImagesCarousel = ({ 
  trailId, 
  img1, 
  img2,
  style,
  onImagePress 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageLoadErrors, setImageLoadErrors] = useState({ img1: false, img2: false });
  const [isLoading, setIsLoading] = useState(true);

  // 🔥 유효한 이미지들만 필터링 - null/undefined도 포함하여 기본 이미지 표시
  const images = [
    { id: 'img1', uri: img1, label: '산책로 이미지 1' },
    { id: 'img2', uri: img2, label: '산책로 이미지 2' }
  ].filter(img => img.uri && img.uri.trim() !== '' && img.uri !== 'string');

  // 🔥 이미지가 하나도 없으면 기본 이미지 하나 추가
  if (images.length === 0) {
    images.push({
      id: 'placeholder',
      uri: null,
      label: '기본 이미지'
    });
  }

  console.log(`[TrailImagesCarousel] 이미지 목록:`, images);

  useEffect(() => {
    // 이미지가 있으면 로딩 상태 해제
    setIsLoading(false);
  }, [images.length]);

  // 🔥 이미지 로드 에러 처리
  const handleImageError = (imageId) => {
    console.warn(`[TrailImagesCarousel] 이미지 로드 실패: ${imageId}`);
    setImageLoadErrors(prev => ({
      ...prev,
      [imageId]: true
    }));
  };

  // 🔥 이미지 로드 성공 처리
  const handleImageLoad = (imageId) => {
    console.log(`[TrailImagesCarousel] 이미지 로드 성공: ${imageId}`);
    setImageLoadErrors(prev => ({
      ...prev,
      [imageId]: false
    }));
  };

  // 🔥 스크롤 위치 변경 감지
  const handleScroll = (event) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const imageWidth = screenWidth * 0.8; // 이미지 너비
    const newIndex = Math.round(scrollPosition / imageWidth);
    setCurrentIndex(newIndex);
  };

  // 🔥 이미지가 없는 경우 - MainScreen과 동일한 스타일로 처리
  if (isLoading) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#418663" />
          <Text style={styles.loadingText}>이미지 로딩 중...</Text>
        </View>
      </View>
    );
  }

  if (images.length === 0) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.noImageContainer}>
          <Icon name="landscape" size={48} color="#CCC" />
          <Text style={styles.noImageText}>이미지 없음</Text>
        </View>
      </View>
    );
  }

  // 🔥 이미지 렌더링 - MainScreen 스타일과 동일하게 처리
  const renderImage = (image, index) => {
    const hasError = imageLoadErrors[image.id];
    
    if (hasError || !image.uri) {
      return (
        <View key={image.id || index} style={styles.imageContainer}>
          <View style={styles.errorContainer}>
            <Icon name="landscape" size={48} color="#CCC" />
            <Text style={styles.errorText}>이미지 없음</Text>
          </View>
        </View>
      );
    }

    return (
      <TouchableOpacity
        key={image.id || index}
        style={styles.imageContainer}
        onPress={() => onImagePress && onImagePress(image, index)}
        activeOpacity={0.9}
      >
        <Image
          source={{ uri: image.uri }}
          style={styles.image}
          resizeMode="cover"
          onError={() => handleImageError(image.id)}
          onLoad={() => handleImageLoad(image.id)}
          onLoadStart={() => console.log(`이미지 로드 시작: ${image.id}`)}
        />
        
        {/* 🔥 이미지 번호 표시 */}
        <View style={styles.imageNumber}>
          <Text style={styles.imageNumberText}>{index + 1}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, style]}>
      {/* 🔥 이미지 스크롤뷰 */}
      <ScrollView
        horizontal
        pagingEnabled={images.length > 1}
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContainer}
        style={styles.scrollView}
      >
        {images.map((image, index) => renderImage(image, index))}
      </ScrollView>

      {/* 🔥 페이지 인디케이터 (이미지가 2개 이상일 때만) */}
      {images.length > 1 && (
        <View style={styles.paginationContainer}>
          {images.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                index === currentIndex && styles.paginationDotActive
              ]}
            />
          ))}
        </View>
      )}

      {/* 🔥 이미지 카운터 */}
      <View style={styles.counterContainer}>
        <Text style={styles.counterText}>
          {currentIndex + 1} / {images.length}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 200,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  
  // 스크롤뷰 스타일
  scrollView: {
    flex: 1,
  },
  scrollContainer: {
    alignItems: 'center',
  },
  
  // 이미지 컨테이너
  imageContainer: {
    width: screenWidth * 0.8,
    height: 200,
    marginHorizontal: 5,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  
  // 이미지 스타일
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F0F0F0',
  },
  
  // 이미지 번호
  imageNumber: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  imageNumberText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  
  // 페이지 인디케이터
  paginationContainer: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  paginationDotActive: {
    backgroundColor: '#FFFFFF',
    transform: [{ scale: 1.2 }],
  },
  
  // 카운터
  counterContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  counterText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  
  // 로딩 상태
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
  },
  
  // 이미지가 없음
  noImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  noImageText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  
  // 에러 상태
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  errorText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});

export default TrailImagesCarousel;