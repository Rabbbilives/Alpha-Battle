import React, { useEffect, useRef } from "react";
import {View, Text, StyleSheet, ImageBackground, Image, Animated,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/src/navigation/types";

// 👇 tell TS that SplashScreen is part of RootStackParamList
type SplashScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Splash"
>;

const SplashScreen = () => {
  const navigation = useNavigation<SplashScreenNavigationProp>();
  const loaderValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace("Home"); // ✅ no TS error now
    }, 10000);

    Animated.timing(loaderValue, {
      toValue: 1,
      duration: 10000,
      useNativeDriver: false,
    }).start();

    return () => clearTimeout(timer);
  }, [navigation, loaderValue]);

  const loaderWidth = loaderValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <ImageBackground
      source={require("@/src/assets/images/splash-bg.png")}
      style={styles.background}
    >
      <View style={styles.overlay} />
      <View style={styles.container}>
        <Image
          source={require("@/src/assets/images/splash-icon.png")}
          style={styles.logo}
        />
        <Text style={styles.title}>ALPHA BATTLE</Text>
        <Text style={styles.normal}>UNLEASH THE BATTLE WITHIN</Text>

        <View style={styles.loaderContainer}>
          <Animated.View style={[styles.loader, { width: loaderWidth }]} />
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  logo: {
    width: 150,
    height: 150,
    resizeMode: "contain",
    marginBottom: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#FFFFFF",
    fontFamily: "SpaceMono-Regular",
    textShadowColor: "rgba(0, 255, 255, 0.75)",
    textShadowOffset: { width: -2, height: 2 },
    textShadowRadius: 10,
    marginBottom: 20,
  },
  normal: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    fontFamily: "SpaceMono-Regular",
  },
  loaderContainer: {
    width: "80%",
    height: 10,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 5,
    overflow: "hidden",
    marginTop: 20,
  },
  loader: {
    height: "100%",
    backgroundColor: "#00FFFF",
    borderRadius: 5,
  },
});

export default SplashScreen;
