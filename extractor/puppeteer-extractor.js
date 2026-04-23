const puppeteer = require('puppeteer');

// Función para probar si una URL responde correctamente
async function testUrl(url) {
    return new Promise((resolve) => {
        const http = require('http');
        const https = require('https');
        const protocol = url.startsWith('https') ? https : http;
        
        const request = protocol.get(url, { method: 'HEAD', timeout: 5000 }, (response) => {
            resolve(response.statusCode === 200);
        });
        request.on('error', () => resolve(false));
        request.setTimeout(5000, () => {
            request.destroy();
            resolve(false);
        });
    });
}

async function extractM3U8(url) {
    console.log(`🔍 Extrayendo M3U8 de: ${url}`);
    
    let browser;
    try {
        browser = await puppeteer.launch({ 
            headless: "new",  // Cambiado a "new" para evitar warning
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        
        // Configurar User-Agent realista
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        
        let m3u8Urls = [];
        
        // Interceptar peticiones
        await page.setRequestInterception(true);
        page.on('request', request => {
            const requestUrl = request.url();
            if (requestUrl.includes('.m3u8')) {
                console.log('📡 M3U8 encontrado:', requestUrl.substring(0, 100) + '...');
                m3u8Urls.push(requestUrl);
            }
            request.continue();
        });
        
        // Navegar a la página
        await page.goto(url, { 
            waitUntil: 'networkidle2',
            timeout: 30000 
        });
        
        // Esperar para capturar todas las peticiones
        await page.waitForTimeout(8000);
        
        // También buscar en el código fuente
        const pageContent = await page.content();
        const m3u8Regex = /https?:\/\/[^\s"'<>]+\.m3u8[^\s"'<>]*/gi;
        const foundInHtml = pageContent.match(m3u8Regex) || [];
        m3u8Urls.push(...foundInHtml);
        
        await browser.close();
        
        // Eliminar duplicados
        m3u8Urls = [...new Set(m3u8Urls)];
        
        if (m3u8Urls.length === 0) {
            console.log('⚠️ No se encontró M3U8, usando URL original');
            return [url];
        }
        
        // Buscar URLs con cdndirector (las que suelen funcionar)
        let mejorUrl = null;
        for (const m3u8Url of m3u8Urls) {
            if (m3u8Url.includes('cdndirector')) {
                console.log('✅ URL encontrada (cdndirector):', m3u8Url.substring(0, 80));
                mejorUrl = m3u8Url;
                break;
            }
        }
        
        // Si no encontró cdndirector, tomar la primera que tenga 'cdn'
        if (!mejorUrl) {
            for (const m3u8Url of m3u8Urls) {
                if (m3u8Url.includes('cdn') && !m3u8Url.includes('dmxleo')) {
                    mejorUrl = m3u8Url;
                    break;
                }
            }
        }
        
        // Si aún no hay, tomar la primera
        if (!mejorUrl && m3u8Urls.length > 0) {
            mejorUrl = m3u8Urls[0];
        }
        
        if (mejorUrl) {
            console.log('🎯 URL seleccionada:', mejorUrl.substring(0, 80));
            return [mejorUrl];
        }
        
        return [url];
        
    } catch (error) {
        console.error('❌ Error en extractor:', error.message);
        if (browser) await browser.close();
        return [url];
    }
}

module.exports = { extractM3U8 };