import axios from "axios";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  let { imageData } = req.body;

  if (!imageData) {
    return res.status(400).json({ error: "No image data provided" });
  }

  // remove "data:image/jpeg;base64,"
  if (imageData.includes("base64,")) {
    imageData = imageData.split("base64,")[1];
  }

  try {
    const response = await axios({
      method: "POST",
      url: "https://serverless.roboflow.com/waste-classification-uwqfy/1",
      params: { api_key: process.env.ROBOFLOW_API_KEY },
      data: imageData,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      timeout: 20000,
    });

    return res.status(200).json({ results: response.data });

  } catch (err) {
    return res.status(500).json({
      error: "Failed to classify image",
      details: err.response?.data || err.message,
    });
  }
}

