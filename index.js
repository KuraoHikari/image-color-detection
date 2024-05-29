const express = require("express");
const tf = require("@tensorflow/tfjs-node");
const Jimp = require("jimp");
const bodyParser = require("body-parser");

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let model;

// Load the trained model
async function loadModel() {
 model = await tf.loadLayersModel("file://./model/model.json");
}

// Endpoint to detect color hex
app.post("/detect-color", async (req, res) => {
 const imageBuffer = Buffer.from(req.body.image, "base64");
 const image = await Jimp.read(imageBuffer);
 const resizedImage = image.resize(32, 32).bitmap.data;

 const normalizedImage = [];
 for (let i = 0; i < resizedImage.length; i += 4) {
  normalizedImage.push(resizedImage[i] / 255);
  normalizedImage.push(resizedImage[i + 1] / 255);
  normalizedImage.push(resizedImage[i + 2] / 255);
 }

 const input = tf.tensor2d([normalizedImage]);
 const prediction = model.predict(input);
 const [r, g, b] = prediction.dataSync();

 const hex = rgbToHex(r * 255, g * 255, b * 255);
 res.json({ hex, r, g, b });
});

// Convert RGB to hex
function rgbToHex(r, g, b) {
 return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

loadModel().then(() => {
 app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
 });
});
