const axios = require("axios");
const fs = require("fs");

const image = fs.readFileSync("./images/673AB7.png", "base64");

axios
 .post("http://localhost:3000/detect-color", { image })
 .then((response) => {
  console.log("Detected color hex:", response.data.hex);
 })
 .catch((error) => {
  console.error("Error:", error);
 });
