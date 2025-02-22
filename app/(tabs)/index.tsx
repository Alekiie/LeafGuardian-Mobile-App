import { Link } from "expo-router";
import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  Platform,
  ActivityIndicator,
  Image,
  Dimensions,
} from "react-native";
import * as ImagePicker from "expo-image-picker";

const { width, height } = Dimensions.get("window");

export default function HomeScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);



  const formatDescription = (description: string) => {
    if (!description) return null;

    // Split the description by full stops
    const sentences = description.split(".").filter((sentence) => sentence.trim() !== "");

    return sentences.map((sentence, index) => (
      <View key={index} style={styles.bulletPointContainer}>
        <Text style={styles.bulletPoint}>•</Text>
        <Text style={styles.bulletText}>{sentence.trim()}.</Text>
      </View>
    ));
  };

  const requestPermissions = async () => {
    if (Platform.OS === "android") {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: galleryStatus } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      return status === "granted" && galleryStatus === "granted";
    } else {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: galleryStatus } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      return status === "granted" && galleryStatus === "granted";
    }
  };

  const pickImage = async (source: "camera" | "gallery") => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      alert("Permissions required to proceed.");
      return;
    }

    let result;
    if (source === "camera") {
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        base64: false,
      });
    } else {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        base64: false,
      });
    }

    if (!result.canceled && result.assets.length > 0) {
      const imageUri = result.assets[0].uri;
      setSelectedImage(imageUri);
      sendToBackend(imageUri);
      setModalVisible(false); // Close the selection modal
    }
  };

  const sendToBackend = async (imageUri: string) => {
    setLoading(true);
    setPrediction(null); // Reset previous predictions

    let formData = new FormData();
    formData.append("file", {
      uri: imageUri,
      name: "leaf.jpg",
      type: "image/jpeg",
    } as any);

    try {
      const response = await fetch("https://stable-cowbird-needed.ngrok-free.app/predict", {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const result = await response.json();
      setPrediction(result);
    } catch (error) {
      console.error("Error sending image:", error);
      alert("Failed to process the image. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>LeafGuardian</Text>
        <Text style={styles.subtitle}>Diagnose Plant Diseases with Ease</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Scan a Leaf</Text>
        <Text style={styles.cardDescription}>
          Take a photo to identify diseases.
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.buttonText}>Start Scan</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>My Scans</Text>
        <Text style={styles.cardDescription}>
          View history of scanned leaves.
        </Text>
        <Link href="/history" style={styles.button}>
          <Text style={styles.buttonText}>View History</Text>
        </Link>
      </View>

      {/* Modal for Choosing Camera or Gallery */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choose an Option</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => pickImage("camera")}
            >
              <Text style={styles.modalButtonText}>Capture from Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => pickImage("gallery")}
            >
              <Text style={styles.modalButtonText}>Upload from Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: "red" }]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Loader while waiting for results */}
      {loading && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loaderText}>Processing Image...</Text>
        </View>
      )}

      {/* Modal for displaying results */}
      {prediction && (
        <Modal visible={true} transparent={true} animationType="fade">
          <View style={styles.predictionModalContainer}>
            <View style={styles.predictionModalContent}>
              <Text style={styles.modalTitle}>Prediction Results</Text>
              <ScrollView style={styles.predictionScrollView}>
                {selectedImage && (
                  <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
                )}

                <View style={styles.resultHighlight}>
                  <Text style={styles.resultText}>Disease Name:</Text>
                  <Text style={styles.resultValue}>{prediction["Disease name"]}</Text>
                </View>

                <View style={styles.resultHighlight}>
                  <Text style={styles.resultText}>Description:</Text>
                  <View style={styles.descriptionContainer}>
                    {formatDescription(prediction["Description"])}
                  </View>
                </View>

                <View style={styles.resultHighlight}>
                  <Text style={styles.resultText}>Suggestions:</Text>
                  <Text style={styles.resultValue}>{prediction["Suggestions"]}</Text>
                </View>
              </ScrollView>

              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "red", marginTop: 10 }]}
                onPress={() => setPrediction(null)}
              >
                <Text style={styles.modalButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E0F8D8",
  },
  header: {
    padding: 20,
    backgroundColor: "#4CAF50",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  title: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
  },
  subtitle: {
    color: "#f0f0f0",
    fontSize: 16,
    marginTop: 5,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    margin: 20,
    padding: 20,
    borderRadius: 10,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  cardDescription: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#388E3C",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: width * 0.85,
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    elevation: 5,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 20,
  },
  modalButton: {
    width: "100%",
    padding: 15,
    backgroundColor: "#388E3C",
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  imagePreview: {
    width: 300,
    height: 250,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#4CAF50",
  },
  loaderContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  loaderText: {
    fontSize: 18,
    marginTop: 10,
    color: "#4CAF50",
  },
  predictionModalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  predictionModalContent: {
    width: width * 0.9,
    maxHeight: height * 0.8,
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  predictionScrollView: {
    width: "100%",
  },
  resultHighlight: {
    width: "100%",
    backgroundColor: "#E0F8D8",
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
  },
  resultText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2E7D32",
  },
  resultValue: {
    fontSize: 16,
    color: "#444",
    marginTop: 5,
  },
  descriptionContainer: {
    width: "100%",
    marginTop: 10,
  },
  bulletPointContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 5,
  },
  bulletPoint: {
    fontSize: 16,
    marginRight: 10,
    color: "#2E7D32",
  },
  bulletText: {
    fontSize: 16,
    color: "#444",
    flex: 1,
  },
});