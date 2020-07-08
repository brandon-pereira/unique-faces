import faceapi from "./faceapi";
import loadModels from "./loadModels";
import { loadImage, createCanvas } from "canvas";
import fs from "fs";
import path from "path";

class FaceDetection {
  constructor() {
    this._detections = [];
    this._manifest = {
      photos: {},
      users: {},
    };
  }

  async init() {
    await loadModels(faceapi);
  }

  async loadImage(imgPath) {
    const img = await loadImage(imgPath);
    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, img.width, img.height);
    return canvas;
  }

  async getAllFaces(canvas) {
    return faceapi
      .detectAllFaces(canvas)
      .withFaceLandmarks()
      .withFaceDescriptors();
  }

  async addToManifest(faceId, imagePath, face) {
    // add user to photo
    let photo = this._manifest.photos[imagePath];
    if (!photo) {
      photo = {};
      this._manifest.photos[imagePath] = photo;
    }
    photo[faceId] = face.alignedRect._box;
    // add photo to user
    let user = this._manifest.users[faceId];
    if (!user) {
      user = {
        photos: [],
        mainPhoto: await this.generateThumbnail(faceId, face),
      };
      this._manifest.users[faceId] = user;
    }
    user.photos.push(imagePath);
  }

  async generateThumbnail() {
    return "todo.jpg";
  }

  async findAllUniqueFaces(imgPath) {
    const canvas = await this.loadImage(imgPath);
    const detections = await this.getAllFaces(canvas);
    // for each face
    detections.forEach(face => {
      // see if we've seen this person
      let bestMatch = this.getBestMatch(face);
      // if we haven't seen them, save them
      if (bestMatch._label === "unknown") {
        bestMatch = this.createNewFace(face);
      } else {
        // else, add to existing face
        this.addToExistingFace(bestMatch._label, face);
      }
      this.addToManifest(bestMatch._label, imgPath, face);
    });

    // await this.debugImage(canvas, detections, imgPath);
    return detections;
  }

  get faceMatcher() {
    return this._detections.length
      ? new faceapi.FaceMatcher(this._detections)
      : null;
  }

  getBestMatch(face) {
    let bestMatch;
    if (this.faceMatcher) {
      bestMatch = this.faceMatcher.findBestMatch(face.descriptor);
    } else {
      bestMatch = { _label: "unknown" };
    }
    return bestMatch;
  }

  addToExistingFace(faceId, face) {
    const match = this._detections[faceId];
    this._detections[faceId] = new faceapi.LabeledFaceDescriptors(faceId, [
      ...match._descriptors,
      face.descriptor,
    ]);
  }

  createNewFace(face) {
    this._detections.push(
      new faceapi.LabeledFaceDescriptors(this._detections.length.toString(), [
        face.descriptor,
      ])
    );
    return this._detections[this._detections.length - 1];
  }

  async debugImage(image, detections, fileName) {
    return new Promise(resolve => {
      faceapi.draw.drawDetections(image, detections);
      // faceapi.draw.drawFaceLandmarks(image, detections);
      detections.forEach((result, i) => {
        const bestMatch = this.getBestMatch(result);
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
