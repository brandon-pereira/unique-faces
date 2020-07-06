import "@tensorflow/tfjs-node";
import * as faceapi from "face-api.js";
import { Canvas, Image } from "canvas";
import fetch from "node-fetch";

// Make face-api.js use that fetch implementation
faceapi.env.monkeyPatch({ fetch: fetch });
faceapi.env.monkeyPatch({ Canvas, Image });

export default faceapi;
