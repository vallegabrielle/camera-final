import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Camera } from "expo-camera";
import * as MediaLibrary from "expo-media-library";
import { manipulateAsync, FlipType, SaveFormat } from "expo-image-manipulator";
import Button from "./components/Button";
import TakenImage from "./components/TakenImage";

export default function App() {
  const [showInitialScreen, setShowInitialScreen] = useState(true);
  const [showCamera, setShowCamera] = useState(false);
  const [image, setImage] = useState(null);
  const [bottomImageUri, setBottomImageUri] = useState("");
  const [topImageUri, setTopImageUri] = useState("");
  const [hasPermission, setHasPermission] = useState(false);
  const cameraRef = useRef(null);

  useEffect(() => {
    (async () => {
      MediaLibrary.requestPermissionsAsync();
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status == "granted");
    })();
  }, []);

  function openCamera() {
    setShowCamera(true);
    setShowInitialScreen(false);
    setImage(null);
  }

  function goInitialScreen() {
    setShowCamera(false);
    setShowInitialScreen(true);
  }

  async function saveImage() {
    if (image) {
      try {
        await MediaLibrary.createAssetAsync(image);
        alert("Image saved successfully");
        setImage(null);
      } catch (e) {
        console.log(e);
      }
    }
  }

  async function takePhoto() {
    if (cameraRef) {
      try {
        const data = await cameraRef.current.takePictureAsync({
          onPictureSaved: this.onPictureSaved,
        });
      } catch (e) {
        console.log(e);
      }
    }
  }

  onPictureSaved = async (photo) => {
    
    setImage(photo.uri);
    
    const setMasksImagesUris = async (x, y, position) => { 
      const manipResult = await manipulateAsync(
        photo.uri,
        [
          {
            crop: {
              height: 1000,
              width: 1000,
              originX: x,
              originY: y,
            },
          },
        ],
        { compress: 1, format: SaveFormat.PNG }
      );

      if (position == 'bottom') {
        setBottomImageUri(manipResult.uri);
        // console.log("bottom: ", manipResult.uri);
      }

      if (position == "top") {
        setTopImageUri(manipResult.uri);
        // console.log("top: ", manipResult.uri);
      }
    };

    setMasksImagesUris(110, 70, "top");
    setMasksImagesUris(110, 70, "bottom");

  };
  
  if (!hasPermission) {
    return (
      <View style={styles.default}>
        <Text style={styles.text}>Sem acesso a camera</Text>
      </View>
    );
  }

  if (hasPermission && !showCamera && showInitialScreen) {
    return (
      <View style={styles.default}>
        <Button icon="camera" size={70} color="black" onPress={openCamera} />
      </View>
    );
  }

  if (image) {
    return (
      <TakenImage image={image} openCamera={openCamera} saveImage={saveImage} />
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        style={styles.camera}
        type={Camera.Constants.Type.back}
        ref={cameraRef}
      >
        <View style={[styles.cameraMask, styles.cameraMaskBottom]}></View>
        <View style={[styles.cameraMask, styles.cameraMaskTop]}></View>
      </Camera>
      <View style={styles.cameraIconsContainer}>
        <Button icon="back" size={40} onPress={goInitialScreen} />
        <Button icon="camera" size={40} onPress={takePhoto} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
  },
  camera: {
    flex: 1,
    borderRadius: 20,
  },
  openCameraButton: {
    alignItems: "center",
    justifyContent: "center",
  },
  default: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 18,
    color: "black",
  },
  cameraIconsContainer: {
    flex: 0.1,
    backgroundColor: "black",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  cameraMask: {
    flex: 1,
    width: 110,
    height: 110,
    backgroundColor: "transparent",
    position: "absolute",
    borderWidth: 2,
    borderColor: "lightgray",
  },
  cameraMaskBottom: {
    bottom: 100,
    right: 60,
  },
  cameraMaskTop: {
    top: 100,
    left: 60,
  },
});
