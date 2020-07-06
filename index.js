import FaceDetection from "./src/FaceDetection";

(async function () {
  // Creates a new instance of facedetection library
  const faceDetection = new FaceDetection();
  // Loads all required ML models
  await faceDetection.init();
  // For each image, detect faces
  const images = ["./IMG_200.jpg", "./IMG_201.jpg", "./pp.jpg"];
  for (let imgPath of images) {
    await faceDetection.findAllUniqueFaces(imgPath);
  }
})();
