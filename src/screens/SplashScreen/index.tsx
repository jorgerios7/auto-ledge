import React, { useEffect, useRef } from 'react';
import { View, Text, ActivityIndicator, Animated } from 'react-native';
import { styles } from './styles';
import { colors } from '../../theme/colors';

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const contentFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animação em cascata para um efeito ultra-premium
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      Animated.timing(contentFadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    });

    const timer = setTimeout(() => {
      onFinish();
    }, 4000); // 4 segundos para apreciar a animação de introdução

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Animated.Image 
          source={require('../../../assets/splash-icon.png')} 
          style={[
            styles.logoImage, 
            { 
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]} 
          resizeMode="contain"
        />
        
        <Animated.View style={[styles.loadingSection, { opacity: contentFadeAnim }]}>
          <ActivityIndicator size="small" color={colors.accent} style={styles.spinner} />
          
          <Text style={styles.title}>AUTO LEDGE</Text>
          <Text style={styles.subtitle}>GERENCIAMENTO INTELIGENTE</Text>
        </Animated.View>
      </View>
    </View>
  );
}
