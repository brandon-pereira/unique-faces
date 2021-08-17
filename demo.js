import FaceDetection from "./src/FaceDetection";
import path from "path";
import ora from "ora";
import { mkdir, readdir, remove } from "fs-extra";

(async function () {
  const spinner = ora("Initializing Face Detection Library").start();
  const inputPath = path.resolve("../wedding/scripts/input");
  const outputDir = path.resolve("../wedding/public/facedetection");
  // delete then remake directory
  await remove(outputDir);
  await mkdir(outputDir);
  const images = (await readdir(inputPath)).filter(img => img.endsWith(".jpg"));
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
