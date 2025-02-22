import { View, Text, ImageBackground, useWindowDimensions } from "react-native";
import React, { useEffect } from "react";
import { useRouter } from "expo-router";

export default function SplashScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  
  useEffect(() => {
    setTimeout(() => {
        router.push("/(tabs)"); 
    }, 2000);
  }, []);

  return (
    <ImageBackground
      source={require("../../assets/images/splash-images.png")}
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
      resizeMode="cover"
    >
      <Text
        style={{
          fontSize: 34,
          fontWeight: "bold",
          color: "rgba(255, 255, 255, 0.9)",
          textShadowColor: "rgba(0, 0, 0, 0.8)",
          textShadowOffset: { width: 1, height: 1 },
          textShadowRadius: 5,
        }}
      >
        Leaf Guardian
      </Text>
      <Text style={{ marginTop: 10, color: "#fff" }}>LOADING ...</Text>
    </ImageBackground>
  );
}
