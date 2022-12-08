import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Camera } from "expo-camera";
import * as MediaLibrary from "expo-media-library";
import ImageColors from 'react-native-image-colors'
import { manipulateAsync, FlipType, SaveFormat } from "expo-image-manipulator";
import Button from "./components/Button";
import TakenImage from "./components/TakenImage";

export default function App() {
  const [showInitialScreen, setShowInitialScreen] = useState(true);
  const [showCamera, setShowCamera] = useState(false);
  const [image, setImage] = useState(null);
  const [bottomImageUri, setBottomImageUri] = useState("");
  const [topImageUri, setTopImageUri] = useState("");
  const [bottomImageColorCode, setBottomImageColorCode] = useState("");
  const [topImageColorCode, setTopImageColorCode] = useState("");
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
    setImage(null);
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

  onPictureSaved = (photo) => {
    
    setImage(photo.uri);
    
    setMasksImagesUris(450, 350, "top", photo);
    setMasksImagesUris(1800, 2850, "bottom", photo);

    
    fetchColors('top');
    fetchColors('bottom');
    
    console.log(bottomImageColorCode, ': bottomImageColorCode');
    console.log(topImageColorCode, ': topImageColorCode');
  };

  const setMasksImagesUris = async (x, y, position, photo) => { 
    const manipResult = await manipulateAsync(
      photo.uri,
      [
        {
          crop: {
            height: 800,
            width: 800,
            originX: x,
            originY: y,
          },
        },
      ],
      { compress: 1, format: SaveFormat.PNG }
    );

    if (position == 'bottom') {
      setBottomImageUri(manipResult.uri);
    }

    if (position == "top") {
      setTopImageUri(manipResult.uri);
    }
  };
  
  const fetchColors = async (position) => {
    
    if (position == 'bottom') {
      
      const result = await ImageColors.getColors(bottomImageUri);
      const hsvCode = getHsvColorCode(result.dominant);
      console.log(hsvCode, ": hsvCode");
      setBottomImageColorCode(hsvCode);

    } else {
      
      const result = await ImageColors.getColors(topImageUri);
      const hsvCode = getHsvColorCode(result.dominant);
      console.log(hsvCode, ": hsvCode");
      setTopImageColorCode(hsvCode);
    }
  };
  
  function getHsvColorCode(hex) {

    const rgbCode = convertHexToRgb(hex);
    const hsvCode = convertRgbToHsv(rgbCode.r, rgbCode.g, rgbCode.b)

    return hsvCode;
  }

  function convertHexToRgb(hex) {
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  function convertRgbToHsv(r, g, b) {

    r /= 255, g /= 255, b /= 255;
  
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, v = max;
  
    var d = max - min;
    s = max == 0 ? 0 : d / max;
  
    if (max == min) {
      h = 0; // achromatic
    } else {
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
  
      h /= 6;
    }
  
    return [ h, s, v ];
  }

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
