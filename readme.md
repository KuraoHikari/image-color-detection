- [Image Color Detection Neural Network](#image-color-detection-neural-network)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Usage](#usage)
  - [Functions](#functions)
    - [`loadImages(imageDir)`](#loadimagesimagedir)
    - [`hexToRgb(hex)`](#hextorgbhex)
    - [`trainModel()`](#trainmodel)
- [Image Processing Utilities](#image-processing-utilities)
  - [Dependencies](#dependencies)
  - [Utility Functions](#utility-functions)
    - [`createSolidColorImage(hexColor, width, height, filename)`](#createsolidcolorimagehexcolor-width-height-filename)
    - [`createGradientColorImage(hexColorStart, hexColorEnd, width, height, filename)`](#creategradientcolorimagehexcolorstart-hexcolorend-width-height-filename)
    - [`lerp(start, end, ratio)`](#lerpstart-end-ratio)
  - [Example Usage](#example-usage)
- [Color Detection API](#color-detection-api)
  - [Dependencies](#dependencies-1)
  - [Running the Server](#running-the-server)
  - [API Endpoints](#api-endpoints)
    - [POST /detect-color](#post-detect-color)
  - [Utilities](#utilities)
    - [Function: `rgbToHex(r, g, b)`](#function-rgbtohexr-g-b)
  - [Contributing](#contributing)
  - [Author](#author)
  - [License](#license)

<!-- TOC end -->

<!-- TOC --><a name="image-color-detection-neural-network"></a>

# Image Color Detection Neural Network

This Node.js application uses TensorFlow.js to create a neural network that predicts the dominant RGB color values of images. The images are processed and normalized to a size of 32x32 pixels, and the model is trained to output RGB values based on the dominant color in the images. The filenames of the images are expected to be in the format of their hex color values, e.g., `ff0000.png` for red.

<!-- TOC --><a name="prerequisites"></a>

## Prerequisites

Before running this application, ensure you have the following installed:

- Node.js
- npm (Node Package Manager)

<!-- TOC --><a name="installation"></a>

## Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/KuraoHikari/image-color-detection.git
   cd image-color-detection
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

<!-- TOC --><a name="usage"></a>

## Usage

To train the model with your dataset, follow these steps:

1. **Prepare your dataset:**
   Place your images in the `./images` directory. Ensure that each image is named after its dominant hex color value followed by the `.png` extension, e.g., `ff0000.png`.

2. **Run the training script:**

   ```bash
   node trainModel.js
   ```

   This will train a neural network model and save it to the `./model` directory.

<!-- TOC --><a name="functions"></a>

## Functions

<!-- TOC --><a name="loadimagesimagedir"></a>

### `loadImages(imageDir)`

- **Code** :

```js
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
```

- **Purpose**: Loads and preprocesses images from a specified directory.
- **Parameters**:
  - `imageDir`: Path to the directory containing the image files.
- **Returns**: An object containing two arrays: `images` and `labels`.

<!-- TOC --><a name="hextorgbhex"></a>

### `hexToRgb(hex)`

- **Code** :

```js
function hexToRgb(hex) {
 const bigint = parseInt(hex, 16);
 const r = (bigint >> 16) & 255;
 const g = (bigint >> 8) & 255;
 const b = bigint & 255;
 return { r, g, b };
}
```

- **Purpose**: Converts a hex color code to RGB values.
- **Parameters**:
  - `hex`: A string representing the color in hex format.
- **Returns**: An object with properties `r`, `g`, `b` representing red, green, and blue components.

<!-- TOC --><a name="trainmodel"></a>

### `trainModel()`

- **Code** :

```js
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
```

- **Purpose**: Trains the neural network model using images loaded from the `./images` directory.
- **Operations**:
  - Loads and preprocesses the images.
  - Defines and compiles the model.
  - Fits the model on the data.
  - Saves the trained model.

<!-- TOC --><a name="image-processing-utilities"></a>

# Image Processing Utilities

This repository contains utility functions to generate images with solid colors or gradient colors using Node.js and the Jimp image processing library.

<!-- TOC --><a name="dependencies"></a>

## Dependencies

- Jimp: An image processing library for Node.js

<!-- TOC --><a name="utility-functions"></a>

## Utility Functions

<!-- TOC --><a name="createsolidcolorimagehexcolor-width-height-filename"></a>

### `createSolidColorImage(hexColor, width, height, filename)`

**Code**:

```js
async function createSolidColorImage(hexColor, width, height, filename) {
 const color = Jimp.cssColorToHex(hexColor);
 const img = new Jimp(width, height, color);
 const outputPath = path.join(__dirname, "images", filename);
 await img.writeAsync(outputPath);
 console.log(`Solid color image ${outputPath} created with color ${hexColor}`);
}
```

**Purpose**: Creates an image of specified dimensions filled with a solid color.

**Parameters**:

- `hexColor` (String): The hex code of the color.
- `width` (Number): The width of the image in pixels.
- `height` (Number): The height of the image in pixels.
- `filename` (String): The name of the output file (saved in the `images` directory).

**Returns**: None. The function is asynchronous and logs a message upon successful creation of the image.

<!-- TOC --><a name="creategradientcolorimagehexcolorstart-hexcolorend-width-height-filename"></a>

### `createGradientColorImage(hexColorStart, hexColorEnd, width, height, filename)`

**Code**:

```js
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
```

**Purpose**: Creates an image of specified dimensions filled with a vertical gradient from `hexColorStart` to `hexColorEnd`.

**Parameters**:

- `hexColorStart` (String): The hex code for the start color of the gradient.
- `hexColorEnd` (String): The hex code for the end color of the gradient.
- `width` (Number): The width of the image in pixels.
- `height` (Number): The height of the image in pixels.
- `filename` (String): The name of the output file (saved in the `images` directory).

**Returns**: None. The function is asynchronous and logs a message upon successful creation of the gradient image.

<!-- TOC --><a name="lerpstart-end-ratio"></a>

### `lerp(start, end, ratio)`

**Code**:

```js
// Linear interpolation function
function lerp(start, end, ratio) {
 return Math.round(start + (end - start) * ratio);
}
```

**Purpose**: Performs linear interpolation between two values.

**Parameters**:

- `start` (Number): The start value.
- `end` (Number): The end value.
- `ratio` (Number): The ratio between 0 and 1 determining the interpolation level.

**Returns**: (Number) The interpolated value based on the input ratio.

<!-- TOC --><a name="example-usage"></a>

## Example Usage

To generate a solid color image:

```js
createSolidColorImage("#FF5733", 256, 256, "FF5733.png");
```

To generate a gradient color image `BUG, idk why :3`:

```js
createGradientColorImage("#FFFFFF", "#FF5733", 256, 256, "gradient_color.png");
```

<!-- TOC --><a name="color-detection-api"></a>

# Color Detection API

This project is a Node.js server utilizing TensorFlow.js, Jimp, and Express to detect colors in images. It provides an API endpoint where users can submit images in base64 format, and it returns the detected color in hex format.

<!-- TOC --><a name="dependencies-1"></a>

## Dependencies

- Express: A web application framework for Node.js.
- @tensorflow/tfjs-node: TensorFlow.js for Node.js.
- Jimp: An image processing library for Node.js.
- body-parser: Middleware to parse incoming request bodies.

<!-- TOC --><a name="running-the-server"></a>

## Running the Server

Make sure you have loaded the model into the `model` directory as per the expected path in the code (`./model/model.json`). Start the server with:

```bash
npm start
```

Or directly using Node:

```bash
node index.js
```

The server will start running on http://localhost:3000.

<!-- TOC --><a name="api-endpoints"></a>

## API Endpoints

<!-- TOC --><a name="post-detect-color"></a>

### POST /detect-color

Detects the main color of the provided image.

**Request Body**:

- `image`: A base64 encoded string of the image file.

**Response**:

- `hex`: Hexadecimal color value.
- `r`: Red component of the color.
- `g`: Green component of the color.
- `b`: Blue component of the color.

**Example Request**:

```bash
curl -X POST http://localhost:3000/detect-color \
-H 'Content-Type: application/json' \
-d '{"image":"[base64-encoded-image]"}'
```

**Example Response**:

```json
{
 "hex": "#ff5733",
 "r": 255,
 "g": 87,
 "b": 51
}
```

<!-- TOC --><a name="utilities"></a>

## Utilities

<!-- TOC --><a name="function-rgbtohexr-g-b"></a>

### Function: `rgbToHex(r, g, b)`

Converts RGB color values to hexadecimal string.

**Parameters**:

- `r` (Number): Red component.
- `g` (Number): Green component.
- `b` (Number): Blue component.

**Returns**:

- (String): Hexadecimal color value.

<!-- TOC --><a name="contributing"></a>

## Contributing

Contributions are welcome. Please fork the repository and submit a pull request with your changes.

<!-- TOC --><a name="author"></a>

## Author

- **Kurao Hikari** - _Initial work_ - [KuraoHikari](https://github.com/KuraoHikari)

<!-- TOC --><a name="license"></a>

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE) file for details.
