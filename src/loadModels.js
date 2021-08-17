import path from "path";

const MODELS_URL = path.join(__dirname, "../model");

export default async function (faceapi) {
  // Load the face recognition models
  await faceapi.nets.faceRecognitionNet.loadFromDisk(
    MODELS_URL + "/face_recognition"
  );
  await faceapi.nets.ssdMobilenetv1.loadFromDisk(
    MODELS_URL + "/ssd_mobilenetv1"
  );
  await faceapi.nets.faceLandmark68Net.loadFromDisk(
    MODELS_URL + "/face_landmark_68"
  );
}
