const axios = require("axios");
const fs = require("fs");

const image = fs.readFileSync("./images/ff0000.png", "base64");

axios
 .post("http://localhost:3000/detect-color", { image })
 .then((response) => {
  console.log("Detected color hex:", response.data.hex);
 })
 .catch((error) => {
  console.error("Error:", error);
 });
