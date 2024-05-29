const tf = require("@tensorflow/tfjs-node");
const fs = require("fs");
const path = require("path");
const Jimp = require("jimp");

// Function to load and preprocess the images
async function loadImages(imageDir) {
 const files = fs.readdirSync(imageDir);
 const images = [];
 const labels = [];

 for (const file of files) {
  const imagePath = path.join(imageDir, file);
  const image = await Jimp.read(imagePath);
  const resizedImage = image.resize(32, 32).bitmap.data; // Resize to 32x32

  // Normalize pixel values
  const normalizedImage = [];
  for (let i = 0; i < resizedImage.length; i += 4) {
   normalizedImage.push(resizedImage[i] / 255);
   normalizedImage.push(resizedImage[i + 1] / 255);
   normalizedImage.push(resizedImage[i + 2] / 255);
  }

  images.push(normalizedImage);

  // Assuming file names are formatted as 'hex_color.png'
  const hex = path.basename(file, path.extname(file));
  const rgb = hexToRgb(hex);
  labels.push([rgb.r / 255, rgb.g / 255, rgb.b / 255]);
 }

 return { images, labels };
}

// Convert hex color to RGB
function hexToRgb(hex) {
 const bigint = parseInt(hex, 16);
 const r = (bigint >> 16) & 255;
 const g = (bigint >> 8) & 255;
 const b = bigint & 255;
 return { r, g, b };
}

// Train the model
async function trainModel() {
 const { images, labels } = await loadImages("./images");

 const xs = tf.tensor2d(images);
 const ys = tf.tensor2d(labels);

 const model = tf.sequential();
 model.add(tf.layers.dense({ inputShape: [32 * 32 * 3], units: 128, activation: "relu" }));
 model.add(tf.layers.dense({ units: 64, activation: "relu" }));
 model.add(tf.layers.dense({ units: 3, activation: "sigmoid" }));

 model.compile({ optimizer: "adam", loss: "meanSquaredError" });

 await model.fit(xs, ys, { epochs: 50 });

 await model.save("file://./model");

 console.log("Model trained and saved.");
}

trainModel();
