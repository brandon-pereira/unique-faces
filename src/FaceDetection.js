import faceapi from "./faceapi";
import loadModels from "./loadModels";
import { loadImage, createCanvas } from "canvas";
import fs from "fs";
import path from "path";

class FaceDetection {
  //   constructor() {}

  async init() {
    await loadModels(faceapi);
  }

  loadImage() {}

  async findAllUniqueFaces(imgPath) {
    const img = await loadImage(imgPath);
    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, img.width, img.height);
    const detections = await faceapi
      .detectAllFaces(canvas)
      .withFaceLandmarks()
      .withFaceDescriptors();
    await this.debugImage(canvas, detections, imgPath);
    return detections;
  }

  async debugImage(image, detections, fileName) {
    faceapi.draw.drawDetections(image, detections);
    faceapi.draw.drawFaceLandmarks(image, detections);
    const out = fs.createWriteStream(
      path.resolve(
        process.cwd(),
        "temp",
        fileName.replace(".", "").replace("/", "")
      )
    );
    const stream = image.createPNGStream();
    stream.pipe(out);
  }
}

export default FaceDetection;
