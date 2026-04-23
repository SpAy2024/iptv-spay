const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;  // Cambiado a 3001 para evitar conflicto

// Habilitar CORS para todas las peticiones
app.use(cors());

// Proxy para la API de Dailymotion
app.use('/api', createProxyMiddleware({
    target: 'https://www.dailymotion.com',
    changeOrigin: true,
    pathRewrite: {
        '^/api': '/player/metadata'
    },
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Origin': 'https://www.dailymotion.com',
        'Referer': 'https://www.dailymotion.com/'
    },
    onProxyReq: (proxyReq, req, res) => {
        console.log(`🔄 Proxy: ${req.method} ${req.url} → ${proxyReq.path}`);
    }
}));

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('Proxy de Dailymotion funcionando 🚀');
});

app.listen(PORT, () => {
    console.log(`✅ Proxy rodando en http://localhost:${PORT}`);
    console.log(`📡 Usa: http://localhost:${PORT}/api/video/ID_DEL_VIDEO`);
});