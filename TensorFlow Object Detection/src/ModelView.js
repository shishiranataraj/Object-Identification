import * as mobilenet from '@tensorflow-models/mobilenet';
import { Camera } from 'expo-camera';
import React from 'react';
import { StyleSheet, useWindowDimensions, View , Button} from 'react-native';
import useScreenRecording from "use-screen-recording";

import { CustomTensorCamera } from './CustomTensorCamera';
import { LoadingView } from './LoadingView';
import { PredictionList } from './PredictionList';
import { useTensorFlowModel } from './useTensorFlow';

export function ModelView() {
  const model = useTensorFlowModel(mobilenet);
  const [predictions, setPredictions] = React.useState([]);

  if (!model) {
    return <LoadingView>Loading TensorFlow model</LoadingView>;
  }

  return (
    <View
      style={{ flex: 1, backgroundColor: "black", justifyContent: "center" }}
    >
      <PredictionList predictions={predictions} />
      <View style={{ borderRadius: 20, overflow: "hidden" }}>
        <ModelCamera model={model} setPredictions={setPredictions} />
      </View>
    </View>
  );
}

function ModelCamera({ model, setPredictions }) {
  const raf = React.useRef(null);
  const size = useWindowDimensions();

  React.useEffect(() => {
    return () => {
      cancelAnimationFrame(raf.current);
    };
  }, []);

  const onReady = React.useCallback(
    (images) => {
      const loop = async () => {
        const nextImageTensor = images.next().value;
        const predictions = await model.classify(nextImageTensor);
        setPredictions(predictions);
        raf.current = requestAnimationFrame(loop);
      };
      loop();
    },
    [setPredictions]
  );
  const { isRecording, recording, toggleRecording } = useScreenRecording();

  return React.useMemo(
    () => (
      <View>
      <CustomTensorCamera
        width={size.width}
        style={styles.camera}
        type={Camera.Constants.Type.back}
        onReady={onReady}
        autorender
      />
      <Button onClick={toggleRecording}>
        {isRecording ? "Stop" : "Start Recording"}
      </Button>

      {!!recording && (
        <video autoPlay src={recording && URL.createObjectURL(recording)} />
      )}
      </View>
      
    ),
    [onReady, size.width]
  );
}

const styles = StyleSheet.create({
  camera: {
    zIndex: 0,
  },
});
