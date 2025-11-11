/*import express from 'express';
import cors from 'cors';
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 8080;
const HF_API_TOKEN = process.env.HUGGING_FACE_API_TOKEN;

const MODEL_URL = "https://router.huggingface.co/hf-inference/models/openai/clip-vit-base-patch32";

// ✅ Explicit CORS setup
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'https://eco-waste-ai-frontend.vercel.app'
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  // ✅ This allows credentials or cookies if needed
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // ✅ Handle preflight
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

app.use(express.json({ limit: '10mb' }));

app.get('/', (req, res) => {
  res.status(200).json({ status: 'Server operational', api: 'Ready to receive POST requests at /api/classify' });
});

app.post('/api/classify', async (req, res) => {
  try {
    if (!HF_API_TOKEN) {
      return res.status(500).json({ error: 'Server configuration error: Missing API Token.' });
    }

    const { imageData, candidateLabels } = req.body;

    if (!imageData || !candidateLabels) {
      return res.status(400).json({ error: 'Missing image data or candidate labels in the request body.' });
    }

    const hfResponse = await fetch(MODEL_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${HF_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: imageData,
        parameters: { candidate_labels: candidateLabels },
      }),
    });

    if (!hfResponse.ok) {
      const errorText = await hfResponse.text();
      console.error('Hugging Face API Error:', hfResponse.status, errorText);
      return res.status(hfResponse.status).json({
        error: 'Hugging Face Inference API failed',
        details: errorText,
      });
    }

    const classificationResults = await hfResponse.json();
    res.json({ results: classificationResults });

  } catch (error) {
    console.error('Server error during classification:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});*/
