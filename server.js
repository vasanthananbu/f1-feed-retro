import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());

// Serve static files from the 'dist' directory
app.use(express.static(path.join(__dirname, 'dist')));

// Gemini API Proxy
app.post('/api/gemini/*', async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error('CRITICAL // GEMINI_API_KEY_MISSING_ON_SERVER');
    return res.status(500).json({ error: 'GEMINI_API_KEY_NOT_SET_ON_SERVER' });
  } else {
    const maskedKey = `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`;
    console.log(`SECURE_PROXY_ACTIVE // KEY_VALIDATED: ${maskedKey}`);
  }

  const pathSuffix = req.params[0];
  // Remove any existing key from the suffix to avoid duplicates
  const cleanSuffix = pathSuffix.split('?')[0];
  const targetUrl = `https://generativelanguage.googleapis.com/${cleanSuffix}?key=${apiKey}`;

  try {
    console.log(`PROXY_FORWARDING // TO: ${targetUrl.split('?')[0]}`);
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: 'PROXY_STREAM_ERROR' });
  }
});

// Handle SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`PRODUCTION_SERVER_ACTIVE // LISTENING_ON_PORT_${PORT}`);
  console.log(`LINK_STABLISHED // SERVING_RETRO_F1_FEED`);
});
