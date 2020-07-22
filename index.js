import FaceDetection from "./src/FaceDetection";
import path from "path";
import ora from "ora";
import { readdir } from "fs-extra";

(async function () {
  const spinner = ora("Initializing Face Detection Library").start();
  const inputPath = path.resolve("./input");
  const outputDir = path.resolve("../wedding/public/facedetection");
  const images = await readdir(inputPath);
  // Creates a new instance of facedetection library
  const faceDetection = new FaceDetection({
    outputDir,
  });
  // Loads all required ML models
  await faceDetection.init();
  // For each image, detect faces
  for (let imgPath of images) {
    spinner.start(`Processing ${imgPath}`);
    await faceDetection.findAllUniqueFaces(path.join(inputPath, imgPath));
    spinner.succeed(`Processing ${imgPath}`);
  }
  spinner.start(`Exporting manifest`);
  await faceDetection.export();
  spinner.succeed(`Exporting manifest`);
  spinner.stop();
})();
