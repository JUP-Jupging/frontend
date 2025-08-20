// components/TrailImagesCarousel.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width: screenWidth } = Dimensions.get('window');

const TrailImagesCarousel = ({ trailId, img1, img2, style, onImagePress }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState({});

  // 이미지 배열 생성 (유효한 이미지만)
  const images = [
    img1 && { uri: img1, label: '산책로 이미지 1', index: 0 },
    img2 && { uri: img2, label: '산책로 이미지 2', index: 1 },
  ].filter(Boolean);

  console.log('🖼️ [TrailImagesCarousel] 렌더링:', {
    trailId,
    img1: !!img1,
    img2: !!img2,
    imageCount: images.length
  });

  // 이미지가 없는 경우
  if (images.length === 0) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.noImageContainer}>
          <Icon name="image-not-supported" size={48} color="#CCCCCC" />
          <Text style={styles.noImageText}>이미지가 없습니다</Text>
        </View>
      </View>
    );
  }

  // 이미지 에러 처리
  const handleImageError = (index) => {
    console.warn(`⚠️ [TrailImagesCarousel] 이미지 ${index} 로드 실패`);
    setImageErrors(prev => ({
      ...prev,
      [index]: true
    }));
  };

  // 이미지 클릭 처리
  const handleImagePress = (image) => {
    console.log('🖼️ [TrailImagesCarousel] 이미지 클릭:', image.label);
    if (onImagePress) {
      onImagePress(image, image.index);
    }
  };

  // 이미지 렌더링
  const renderImage = (image, index) => {
    const hasError = imageErrors[image.index];

    if (hasError) {
      return (
        <View key={`error-${index}`} style={styles.imageContainer}>
          <View style={styles.errorImageContainer}>
            <Icon name="broken-image" size={48} color="#CCCCCC" />
            <Text style={styles.errorImageText}>이미지 로드 실패</Text>
          </View>
        </View>
      );
    }

    return (
      <TouchableOpacity 
        key={`image-${index}`}
        style={styles.imageContainer}
        onPress={() => handleImagePress(image)}
        activeOpacity={0.8}
      >
        <Image
          source={{ uri: image.uri }}
          style={styles.image}
          resizeMode="cover"
          onError={() => handleImageError(image.index)}
        />
        
        {/* 이미지 라벨 오버레이 */}
        <View style={styles.imageOverlay}>
          <Text style={styles.imageLabel}>{image.label}</Text>
          <Icon name="fullscreen" size={20} color="#FFFFFF" />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, style]}>
      {/* 이미지가 1개인 경우 */}
      {images.length === 1 && (
        <View style={styles.singleImageContainer}>
          {renderImage(images[0], 0)}
        </View>
      )}

      {/* 이미지가 2개인 경우 */}
      {images.length === 2 && (
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(event) => {
            const newIndex = Math.round(
              event.nativeEvent.contentOffset.x / screenWidth
            );
            setCurrentIndex(newIndex);
          }}
          style={styles.scrollView}
        >
          {images.map((image, index) => renderImage(image, index))}
        </ScrollView>
      )}

      {/* 페이지 인디케이터 (이미지가 2개일 때만) */}
      {images.length === 2 && (
        <View style={styles.indicatorContainer}>
          {images.map((_, index) => (
            <View
              key={`indicator-${index}`}
              style={[
                styles.indicator,
                currentIndex === index && styles.activeIndicator
              ]}
            />
          ))}
        </View>
      )}

      {/* 이미지 카운터 */}
      <View style={styles.counterContainer}>
        <Text style={styles.counterText}>
          {images.length > 1 ? `${currentIndex + 1} / ${images.length}` : '1 / 1'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F5F5F5',
  },
  
  // 단일 이미지
  singleImageContainer: {
    width: '100%',
    height: 200,
  },
  
  // 스크롤뷰
  scrollView: {
    width: '100%',
    height: 200,
  },
  
  // 이미지 컨테이너
  imageContainer: {
    width: screenWidth - 40, // 패딩 고려
    height: 200,
    position: 'relative',
  },
  
  // 이미지
  image: {
    width: '100%',
    height: '100%',
  },
  
  // 이미지 오버레이
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  imageLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  
  // 에러 이미지
  errorImageContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  
  errorImageText: {
    marginTop: 8,
    fontSize: 12,
    color: '#999999',
    fontWeight: '500',
  },
  
  // 이미지 없음
  noImageContainer: {
    height: 200,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  
  noImageText: {
    marginTop: 8,
    fontSize: 14,
    color: '#999999',
    fontWeight: '500',
  },
  
  // 페이지 인디케이터
  indicatorContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    gap: 6,
  },
  
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  
  activeIndicator: {
    backgroundColor: '#FFFFFF',
  },
  
  // 카운터
  counterContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  
  counterText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default TrailImagesCarousel;