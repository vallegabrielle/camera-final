import { StyleSheet, ImageBackground, View } from 'react-native'
import Button from './Button';

export default function TakenImage({ image, openCamera, saveImage }) {
  return (
    <View style={styles.default}>
      <ImageBackground
        source={{ uri: image }}
        style={styles.image}
      ></ImageBackground>
      <View style={styles.takenPictureOptionsContainer}>
        <Button
          title="Nova foto"
          icon="retweet"
          color="white"
          size={40}
          onPress={openCamera}
        />
        <Button
          title="Usar foto"
          icon="check"
          color="white"
          size={40}
          onPress={saveImage}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  default: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    flex: 1,
    alignSelf: "stretch",
    width: null,
  },
  takenPictureOptionsContainer: {
    flex: 0.1,
    flexDirection: "row",
    width: "100%",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: "black",
  },
});
