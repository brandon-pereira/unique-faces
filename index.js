import FaceDetection from "./src/FaceDetection";
import ora from "ora";

(async function () {
  const spinner = ora("Initializing Face Detection Library").start();
  // Creates a new instance of facedetection library
  const faceDetection = new FaceDetection();
  // Loads all required ML models
  await faceDetection.init();
  // For each image, detect faces
  const images = [
    "./IMG_200.jpg",
    "./IMG_101.jpg",
    "./IMG_302.jpg",
    "./IMG_297.jpg",
  ];
  for (let imgPath of images) {
    spinner.start(`Processing ${imgPath}`);
    await faceDetection.findAllUniqueFaces(imgPath);
    spinner.succeed(`Processing ${imgPath}`);
  }
  spinner.stop();
  console.log(JSON.stringify(faceDetection._manifest));
})();
