import { StatusBar } from 'expo-status-bar';
import React , {useState} from 'react';
import { StyleSheet, Text, View, TextInput, Image, Button } from 'react-native';
import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';
import {fetch} from '@tensorflow/tfjs-react-native';
import * as jpeg from 'jpeg-js';
// import RNFS from 'react-native-fs';
import ImgToBase64 from 'react-native-image-base64';




export default function App() {
  const [ url, setUrl] = useState('./assets/tiger_shark_0.jpg')
  const [displayText, setDisplayText] = useState("Loading");

  const getPrediction = async () => {
    setDisplayText("Getting TF model ready")
    await tf.ready();
    // mobile net is an online dummy neural network
    setDisplayText("Loading MobileNet, the dummy neural network")
    const model = await mobilenet.load()
    setDisplayText("loading image")
    // response = await readFile('./assets/tiger_shark_0.jpg', "base64").then(data => {
    //   console.log(data);
    // });
    // const response = await ImgToBase64.getBase64String('./assets/tiger_shark_0.jpg')
    // const response = await fetch('https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcTeRfYy1eYpHbvYNzKpsQpsY1SaN9VSWhTudA&usqp=CAU', {}, {isBinary: true})

    const image = require('./assets/tiger_shark_0.jpg');
    setDisplayText("image asset path image")
    const imageAssetPath = Image.resolveAssetSource(image);
    setDisplayText("calling fetch")
    setDisplayText(imageAssetPath.uri)

    const response = await fetch(imageAssetPath.uri, {}, { isBinary: true });

    setDisplayText("generating buffer")
    const imageData = await response.arrayBuffer()
    setDisplayText("getting image tensor")
    const imageTensor = imageToTensor(imageData)
    setDisplayText("getting classification results")
    const prediction = await model.classify(imageTensor)
    setDisplayText(JSON.stringify(prediction))
  }

  const imageToTensor = (rawData) => {
    const {width, height, data} = jpeg.decode(rawData, {useTArray: true})
    const buffer = new Uint8Array(width * height * 3)
    let offset = 0;
    for (let i=0; i < buffer.length; i=+3) {
      buffer[i] = data[offset] //Red
      buffer[i+1] = data[offset+1] //Green
      buffer[i+2] = data[offset+2] //Blue
      offset += 4 //skips alpha value
    }
    return tf.tensor3d(buffer, [height, width, 3])

  }

  return (
    <View style={styles.container}>
      <Text>Add your jpg file here</Text>
      <TextInput style={{ height:40, width:"90%",borderColor:"gray", borderWidth:1}}
    onTextChange={text=>setUrl(text)}
    value={url}></TextInput>
    <Image style={styles.imageStyle} source={require('./assets/tiger_shark_0.jpg')}></Image>
    <Button
    title="Classify Image"
    onPress={()=>{getPrediction(url)}}></Button>
    <Text>{displayText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageStyle: {
    width:200,
    height: 200
  }
});
