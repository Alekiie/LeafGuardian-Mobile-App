import { View, Text } from "react-native";
import React from "react";

export default function SplashScreen() {
  return (
    <View
      style={{
        display: "flex",
        flex: 1,
        backgroundColor: "#1B4332",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text
        style={{
          color: "white",
          fontSize: 30,
          fontWeight: "bold",
          fontStyle: "normal",
        }}
      >
        Leaf Guardian
      </Text>
    </View>
  );
}
