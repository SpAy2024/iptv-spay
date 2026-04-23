const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Habilitar CORS para todas las peticiones
app.use(cors());

// Middleware para logging
app.use((req, res, next) => {
    console.log(`📡 ${req.method} ${req.url}`);
    next();
});

// Ruta de prueba (solo para verificar que el proxy está vivo)
app.get('/', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'Proxy de Dailymotion funcionando 🚀',
        endpoints: {
            metadata: '/api/video/:id'
        }
    });
});

// Endpoint para obtener metadatos de Dailymotion
app.get('/api/video/:id', async (req, res) => {
    const videoId = req.params.id;
    console.log(`🎬 Solicitando metadatos para video: ${videoId}`);
    
    try {
        const apiUrl = `https://www.dailymotion.com/player/metadata/video/${videoId}`;
        const response = await fetch(apiUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Origin': 'https://www.dailymotion.com',
                'Referer': 'https://www.dailymotion.com/',
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        console.log(`✅ Metadatos obtenidos para ${videoId}`);
        res.json(data);
        
    } catch (error) {
        console.error(`❌ Error obteniendo metadatos para ${videoId}:`, error.message);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`✅ Proxy rodando en http://localhost:${PORT}`);
    console.log(`📡 Usa: http://localhost:${PORT}/api/video/xa0fwio`);
});

// Agrega este endpoint después de los otros
app.get('/proxy', async (req, res) => {
    const targetUrl = req.query.url;
    if (!targetUrl) return res.status(400).json({ error: 'Missing url parameter' });
    
    try {
        const response = await fetch(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        const data = await response.text();
        res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
        res.send(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});