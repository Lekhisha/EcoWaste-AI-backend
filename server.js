import express from 'express';
import cors from 'cors';
import 'dotenv/config';
// Note: Node.js v18+ supports the global fetch function. 
// If you encounter a 'fetch is not defined' error, you must run: npm install node-fetch@2 && npm install -D @types/node-fetch@2
// and then change the lines below to: import fetch from 'node-fetch'; 

// ✅ Hugging Face API token (Kept secure on the server)
const HF_API_TOKEN = process.env.HUGGING_FACE_API_TOKEN;
// 🧠 Hugging Face API endpoint for image classification
const MODEL_URL =
 "https://router.huggingface.co/hf-inference/models/google/vit-base-patch16-224";

const app = express();
const PORT = 8080;

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Increased limit for large image uploads (10MB)
app.use(express.json({ limit: '10mb' }));

// 🌐 Root GET route for server status/welcome
app.get('/', (req, res) => {
    res.status(200).json({ status: 'Server operational', api: 'Ready to receive POST requests at /api/classify' });
});

// Primary classification route: Sends image to Hugging Face
app.post('/api/classify', async (req, res) => {
    try {
        // 🚨 DEBUG: Log the entire body to see what the frontend sent
        console.log('Received request body keys:', Object.keys(req.body));
        
        // We expect the frontend to send a JSON body like: { imageData: "data:image/jpeg;base64,..." }
        const { imageData } = req.body;

        if (!imageData) {
            return res.status(400).json({ error: 'No image data provided in the request body. (Check Content-Type and key name)' });
        }

        // 1. Strip the base64 header (e.g., 'data:image/jpeg;base64,')
        const base64Data = imageData.replace(/^data:image\/\w+;base64,/, "");
        
        // 2. Convert base64 string to a binary Buffer, which the HF API expects
        const imageBuffer = Buffer.from(base64Data, 'base64');
        
        // 3. Make the secure request to the Hugging Face Inference API
        const hfResponse = await fetch(MODEL_URL, {
            method: 'POST',
            headers: {
                // IMPORTANT: Use the token for authorization
                Authorization: `Bearer ${HF_API_TOKEN}`,
                // IMPORTANT: Content type must be binary (octet-stream) for image models
                'Content-Type': 'application/octet-stream',
            },
            body: imageBuffer // Send the raw binary Buffer
        });

        if (!hfResponse.ok) {
            const errorText = await hfResponse.text();
            console.error('Hugging Face API Error:', errorText);
            // Propagate the specific error back to the client
            return res.status(hfResponse.status).json({ 
                error: 'Hugging Face Inference API failed', 
                details: errorText 
            });
        }

        // 4. Parse the results (which is an array of classification objects)
        const classificationResults = await hfResponse.json();
        
        // Send the results back to the frontend
        res.json({ results: classificationResults });

    } catch (error) {
        console.error('Server error during classification:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});