export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://eco-waste-ai-frontend.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { imageData, candidateLabels } = req.body;

    if (!imageData || !candidateLabels) {
      return res.status(400).json({ error: 'Missing image data or labels' });
    }

    const HF_API_TOKEN = process.env.HUGGING_FACE_API_TOKEN;
    const MODEL_URL = "https://router.huggingface.co/hf-inference/models/openai/clip-vit-base-patch32";

    const response = await fetch(MODEL_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HF_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: imageData,
        parameters: { candidate_labels: candidateLabels },
      }),
    });

    const results = await response.json();
    res.status(200).json({ results });

  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
}
