import faceapi from "./faceapi";
import loadModels from "./loadModels";
import { loadImage, createCanvas } from "canvas";
import fs from "fs";
import path from "path";

class FaceDetection {
  constructor() {
    this._detections = [];
  }

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

    detections.forEach(fd => {
      const bestMatch = this.getBestMatch(fd.descriptor);
      console.log(bestMatch);
      if (bestMatch._label === "unknown") {
        this._detections.push(
          new faceapi.LabeledFaceDescriptors(
            this._detections.length.toString(),
            [fd.descriptor]
          )
        );
      } else {
        // console.log(bestMatch);
        // console.log(this._detections[bestMatch._label]);
        this._detections[
          bestMatch._label
        ] = new faceapi.LabeledFaceDescriptors(bestMatch._label, [
          ...this._detections[bestMatch._label]._descriptors,
          fd.descriptor,
        ]);
      }
    });

    await this.debugImage(canvas, detections, imgPath);
    return detections;
  }

  get faceMatcher() {
    return this._detections.length
      ? new faceapi.FaceMatcher(this._detections)
      : null;
  }

  getBestMatch(descriptor) {
    let bestMatch;
    if (this.faceMatcher) {
      bestMatch = this.faceMatcher.findBestMatch(descriptor);
    } else {
      bestMatch = { _label: "unknown" };
    }
    return bestMatch;
  }

  async debugImage(image, detections, fileName) {
    return new Promise(resolve => {
      faceapi.draw.drawDetections(image, detections);
      // faceapi.draw.drawFaceLandmarks(image, detections);
      detections.forEach((result, i) => {
        // console.log(result);
        console.log(this._detections);
        const bestMatch = this.getBestMatch(result.descriptor);
        const box = detections[i].detection.box;
        const drawBox = new faceapi.draw.DrawBox(box, {
          label: bestMatch.toString(),
        });
        drawBox.draw(image);
      });

      const out = fs.createWriteStream(
        path.resolve(
          process.cwd(),
          "temp",
          fileName.replace(".", "").replace("/", "")
        )
      );
      const stream = image.createPNGStream();
      stream.pipe(out);
      stream.on("end", resolve);
    });
  }
}

export default FaceDetection;
