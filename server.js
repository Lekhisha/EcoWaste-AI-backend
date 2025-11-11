import express from 'express';
import cors from 'cors';
import 'dotenv/config';

const app = express();
const PORT = 8080;

const HF_API_TOKEN = process.env.HUGGING_FACE_API_TOKEN;

// ✅ CORRECT MODEL: Use CLIP Zero-Shot Classification Model URL
const MODEL_URL = "https://router.huggingface.co/hf-inference/models/openai/clip-vit-base-patch32";

app.use(cors({
    // CORS is correct for allowing both local and deployed frontend
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175','https://eco-waste-ai-frontend.vercel.app'],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));

app.get('/', (req, res) => {
    res.status(200).json({ status: 'Server operational', api: 'Ready to receive POST requests at /api/classify' });
});

app.post('/api/classify', async (req, res) => {
    try {
        if (!HF_API_TOKEN) {
            return res.status(500).json({ error: 'Server configuration error: Missing API Token.' });
        }

        // ✅ FIX 1: Extract both keys from the frontend
        const { imageData, candidateLabels } = req.body;

        if (!imageData || !candidateLabels) {
            return res.status(400).json({ error: 'Missing image data or candidate labels in the request body.' });
        }
        
        // CLIP Zero-Shot expects JSON: { image: base64_string, parameters: { candidate_labels: [list] } }
        const hfResponse = await fetch(MODEL_URL, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${HF_API_TOKEN}`,
                // ✅ FIX 2: Content type must be application/json for CLIP Zero-Shot
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                image: imageData, // Send the full base64 string
                parameters: {
                    candidate_labels: candidateLabels,
                },
            }),
        });

        if (!hfResponse.ok) {
            const errorText = await hfResponse.text();
            console.error('Hugging Face API Error:', hfResponse.status, errorText);
            return res.status(hfResponse.status).json({ 
                error: 'Hugging Face Inference API failed', 
                details: errorText 
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
});