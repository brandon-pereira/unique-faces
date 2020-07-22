import faceapi from "./faceapi";
import loadModels from "./loadModels";
import { loadImage, createCanvas } from "canvas";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { writeJSON } from "fs-extra";

class FaceDetection {
  constructor(opts = {}) {
    this._outputDir = opts.outputDir || "output";
    this._detections = [];
    this._manifest = {
      photos: [],
      users: {},
    };
  }
  async export() {
    await writeJSON(
      path.join(this._outputDir, "manifest.json"),
      this._manifest
    );
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

  async addToManifest(faceId, imagePath, face, canvas) {
    // add user to photo
    let photo = this._manifest.photos.find(
      photo => photo.id === this.getFileName(imagePath)
    );
    if (!photo) {
      photo = {
        id: this.getFileName(imagePath),
        faces: {},
      };
      this._manifest.photos.push(photo);
    }
    photo.faces[faceId] = face.alignedRect._box;
    // add photo to user
    let user = this._manifest.users[faceId];
    if (!user) {
      user = {
        photos: [],
        mainPhoto: await this.generateThumbnail(faceId, face, canvas),
      };
      this._manifest.users[faceId] = user;
    }
    user.photos.push(this.getFileName(imagePath));
  }

  async generateThumbnail(faceId, face, canvas) {
    return new Promise((resolve, reject) => {
      const fileName = `${faceId}.jpg`;
      const outputPath = path.resolve(this._outputDir, fileName);
      const pic = this.cropCanvas(
        canvas,
        face.alignedRect._box.x,
        face.alignedRect._box.y,
        face.alignedRect._box.width,
        face.alignedRect._box.height
      );
      const out = fs.createWriteStream(outputPath);
      const stream = pic.createPNGStream();
      stream.pipe(out);
      stream.on("end", resolve(fileName));
      stream.on("error", reject(err));
    });
  }

  async findAllUniqueFaces(imgPath) {
    const canvas = await this.loadImage(imgPath);
    const detections = await this.getAllFaces(canvas);
    // for each face
    const promises = detections.map(async face => {
      // see if we've seen this person
      let bestMatch = this.getBestMatch(face);
      // if we haven't seen them, save them
      if (bestMatch._label === "unknown") {
        bestMatch = this.createNewFace(face);
      } else {
        // else, add to existing face
        this.addToExistingFace(bestMatch._label, face);
      }
      await this.addToManifest(bestMatch._label, imgPath, face, canvas);
    });
    await Promise.all(promises);
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
    const match = this._detections.find(
      detection => detection._label === faceId
    );

    this._detections[faceId] = new faceapi.LabeledFaceDescriptors(faceId, [
      ...match._descriptors,
      face.descriptor,
    ]);
  }

  createNewFace(face) {
    this._detections.push(
      new faceapi.LabeledFaceDescriptors(this.generateUUID(), [face.descriptor])
    );
    return this._detections[this._detections.length - 1];
  }

  generateUUID() {
    return crypto.randomBytes(16).toString("hex");
  }

  cropCanvas(canvas, x, y, width, height) {
    // create a temp canvas
    const newCanvas = createCanvas(width, height);
    // draw the canvas in the new resized temp canvas
    newCanvas
      .getContext("2d")
      .drawImage(canvas, x, y, width, height, 0, 0, width, height);
    return newCanvas;
  }

  getFileName(filePath) {
    return filePath.split("/").pop();
  }
}

export default FaceDetection;
