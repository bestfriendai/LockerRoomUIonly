import { useRouter } from "expo-router";
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated
} from 'react-native';

import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowRight,
  Heart,
  Shield,
  Users,
  MessageCircle,
} from "lucide-react-native";
import { useAuth } from "../../providers/AuthProvider";

const { width } = Dimensions.get("window");

const onboardingData = [
  {
    id: 1,
    icon: Heart,
    title: "Welcome to\nLockerRoom Talk App",
    subtitle: "Anonymous dating reviews from real people",
    description: "Share your experiences, read others' stories, and make better dating decisions",
    gradient: ["#6366F1", "#8B5CF6"],
  },
  {
    id: 2,
    icon: Shield,
    title: "Safe &\nAnonymous",
    subtitle: "Your privacy is our priority",
    description: "Share honest reviews without revealing your identity. AI moderation keeps the community safe.",
    gradient: ["#8B5CF6", "#EC4899"],
  },
  {
    id: 3,
    icon: Users,
    title: "Real Reviews\nReal People",
    subtitle: "Authentic experiences from your community",
    description: "Read verified reviews from people in your area who've actually dated these individuals.",
    gradient: ["#EC4899", "#F97316"],
  },
  {
    id: 4,
    icon: MessageCircle,
    title: "Connect &\nChat",
    subtitle: "Join the conversation",
    description: "Participate in local chat rooms, ask questions, and get advice from the community.",
    gradient: ["#F97316", "#EAB308"],
  },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Only animate on initial mount
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / width);
    if (index !== currentIndex && index >= 0 && index < onboardingData.length) {
      setCurrentIndex(index);
    }
  };

  const nextSlide = () => {
    if (currentIndex < onboardingData.length - 1 && !isTransitioning) {
      setIsTransitioning(true);
      scrollViewRef.current?.scrollTo({
        x: (currentIndex + 1) * width,
        animated: true,
      });
      setTimeout(() => {
        setIsTransitioning(false);
      }, 300);
    }
  };

  const skipToAuth = () => {
    router.push("/(auth)/signin");
  };

  const currentData = onboardingData[currentIndex];

  return (
    <LinearGradient colors={currentData?.gradient as [string, string] || ["#6366F1", "#8B5CF6"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Skip Button */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={skipToAuth} style={styles.skipButton}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>

        {/* Content Slider */}
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          style={styles.scrollView}
        >
          {onboardingData.map((item, _index) => (
            <View key={item.id} style={styles.slide}>
              <View style={styles.contentContainer}>
                {/* Icon */}
                <View style={styles.iconContainer}>
                  <View style={styles.iconBackground}>
                    {React.createElement(item.icon, { color: "#FFFFFF", size: 48 })}
                  </View>
                </View>

                {/* Text Content */}
                <View style={styles.textContainer}>
                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={styles.subtitle}>{item.subtitle}</Text>
                  <Text style={styles.description}>{item.description}</Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Bottom Section */}
        <View style={styles.bottomSection}>
          {/* Page Indicators */}
          <View style={styles.indicatorContainer}>
            {onboardingData.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  {
                    backgroundColor:
                      index === currentIndex
                        ? "rgba(255, 255, 255, 1)"
                        : "rgba(255, 255, 255, 0.3)",
                    width: index === currentIndex ? 24 : 8,
                  },
                ]}
              />
            ))}
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            {currentIndex === onboardingData.length - 1 ? (
              <>
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={() => router.push("/(auth)/signup")}
                >
                  <Text style={styles.primaryButtonText}>Get Started</Text>
                  <ArrowRight color="#FFFFFF" size={20} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={() => router.push("/(auth)/signin")}
                >
                  <Text style={styles.secondaryButtonText}>I have an account</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity style={[styles.nextButton, isTransitioning && { opacity: 0.7 }]} onPress={nextSlide} disabled={isTransitioning}>
                <Text style={styles.nextButtonText}>Next</Text>
                <ArrowRight color="#FFFFFF" size={20} />
              </TouchableOpacity>
            )}
          </View>

          {/* Terms */}
          <Text style={styles.termsText}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bottomSection: {
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  buttonContainer: {
    gap: 16,
    marginBottom: 24,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  description: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 300,
    textAlign: "center",
  },
  iconBackground: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 60,
    height: 120,
    justifyContent: "center",
    width: 120,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  iconContainer: {
    marginBottom: 48,
  },
  indicator: {
    borderRadius: 4,
    height: 8,
  },
  indicatorContainer: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    marginBottom: 32,
  },
  nextButton: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 16,
    flexDirection: "row",
    gap: 12,
    justifyContent: "center",
    minWidth: 120,
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  nextButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 16,
    elevation: 4,
    flexDirection: "row",
    gap: 12,
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingVertical: 18,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  secondaryButton: {
    alignItems: "center",
    backgroundColor: "transparent",
    borderColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 16,
    borderWidth: 1.5,
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  secondaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  skipText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 16,
    fontWeight: "500",
  },
  slide: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    width,
  },
  subtitle: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
  },
  termsText: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 12,
    lineHeight: 16,
    paddingHorizontal: 16,
    textAlign: "center",
  },
  textContainer: {
    alignItems: "center",
    paddingHorizontal: 24,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "bold",
    lineHeight: 38,
    marginBottom: 16,
    textAlign: "center",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 24,
    paddingTop: 16,
  },
});