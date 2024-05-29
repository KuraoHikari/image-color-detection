const Jimp = require("jimp");
const path = require("path");

// Function to create a solid color image
async function createSolidColorImage(hexColor, width, height, filename) {
 const color = Jimp.cssColorToHex(hexColor);
 const img = new Jimp(width, height, color);
 const outputPath = path.join(__dirname, "images", filename);
 await img.writeAsync(outputPath);
 console.log(`Solid color image ${outputPath} created with color ${hexColor}`);
}

// Function to create a gradient color image
async function createGradientColorImage(hexColorStart, hexColorEnd, width, height, filename) {
 const img = new Jimp(width, height);

 const startColor = Jimp.cssColorToHex(hexColorStart);
 const endColor = Jimp.cssColorToHex(hexColorEnd);

 for (let y = 0; y < height; y++) {
  const ratio = y / (height - 1);
  const r = lerp((startColor >> 24) & 255, (endColor >> 24) & 255, ratio);
  const g = lerp((startColor >> 16) & 255, (endColor >> 16) & 255, ratio);
  const b = lerp((startColor >> 8) & 255, (endColor >> 8) & 255, ratio);
  const color = Jimp.rgbaToInt(r, g, b, 255);

  for (let x = 0; x < width; x++) {
   img.setPixelColor(color, x, y);
  }
 }
 const outputPath = path.join(__dirname, "images", filename);
 await img.writeAsync(outputPath);
 console.log(`Gradient color image ${filename} created from ${hexColorStart} to ${hexColorEnd}`);
}

// Linear interpolation function
function lerp(start, end, ratio) {
 return Math.round(start + (end - start) * ratio);
}

// Create a 100x100 image with solid red color
createSolidColorImage("#ff0000", 100, 100, "ff0000.png");

// Create a 100x100 image with solid green color
createSolidColorImage("#00ff00", 100, 100, "00ff00.png");

// Create a 100x100 image with solid blue color
createSolidColorImage("#0000ff", 100, 100, "0000ff.png");

// Create a 100x100 image with a gradient from blue to white
createGradientColorImage("#0000ff", "#ffffff", 100, 100, "gradient_blue_white.png");

// Example of Solid Color Image - Deep Purple
createSolidColorImage("#673AB7", 100, 100, "solid_purple.png");

// Example of Gradient Color Image - Orange to Black
createGradientColorImage("#FFA500", "#000000", 100, 100, "gradient_orange_black.png");

// Example of Solid Color Image - Vibrant Turquoise
createSolidColorImage("#40E0D0", 100, 100, "solid_turquoise.png");

// Example of Gradient Color Image - Light Pink to Deep Blue
createGradientColorImage("#FFB6C1", "#0000FF", 100, 100, "gradient_pink_blue.png");
