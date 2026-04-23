const fs = require('fs');
const path = require('path');

function build() {
    console.log('🚀 Generando playlists M3U desde canales.json...\n');
    
    const canalesPath = path.join(__dirname, '../data/canales.json');
    
    if (!fs.existsSync(canalesPath)) {
        console.error('❌ No se encuentra data/canales.json');
        process.exit(1);
    }
    
    const data = JSON.parse(fs.readFileSync(canalesPath, 'utf8'));
    const canales = data.canales.filter(c => c.activo === true);
    
    console.log(`📡 Procesando ${canales.length} canales activos...\n`);
    
    // Construir URLs finales
    const urlsFinales = {};
    
    for (const canal of canales) {
        if (canal.dailymotion_id) {
            urlsFinales[canal.id] = `https://www.dailymotion.com/embed/video/${canal.dailymotion_id}`;
            console.log(`✅ ${canal.nombre} → Dailymotion embed`);
        } else if (canal.web_url && canal.web_url.includes('.m3u8')) {
            urlsFinales[canal.id] = canal.web_url;
            console.log(`📺 ${canal.nombre} → M3U8 directo`);
        } else {
            urlsFinales[canal.id] = canal.web_url;
            console.log(`🌐 ${canal.nombre} → Web URL`);
        }
    }
    
    // Crear carpeta public si no existe
    const publicDir = path.join(__dirname, '../public');
    if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
        console.log('📁 Carpeta public creada');
    }
    
    // Agrupar por país
    const porPais = {};
    canales.forEach(canal => {
        if (!porPais[canal.pais]) porPais[canal.pais] = [];
        porPais[canal.pais].push(canal);
    });
    
    console.log('\n📝 Generando archivos M3U...');
    
    // Generar archivo por país
    for (const [pais, canalesDelPais] of Object.entries(porPais)) {
        let contenido = '#EXTM3U\n';
        contenido += `# Playlist - ${pais}\n`;
        contenido += `# Generado: ${new Date().toISOString()}\n`;
        contenido += `# Total canales: ${canalesDelPais.length}\n\n`;
        
        for (const canal of canalesDelPais) {
            const streamUrl = urlsFinales[canal.id];
            contenido += `#EXTINF:-1 tvg-id="${canal.id}" tvg-name="${canal.nombre}" tvg-logo="${canal.logo}",${canal.nombre}\n`;
            contenido += `${streamUrl}\n`;
        }
        
        const filename = `${pais.toLowerCase()}.m3u`;
        const filepath = path.join(publicDir, filename);
        fs.writeFileSync(filepath, contenido, 'utf8');
        console.log(`✅ ${filename} (${canalesDelPais.length} canales) - ${filepath}`);
    }
    
    // Archivo completo
    let completo = '#EXTM3U\n';
    completo += '# Playlist completa - Todos los países\n';
    completo += `# Generado: ${new Date().toISOString()}\n\n`;
    
    for (const [pais, canalesDelPais] of Object.entries(porPais)) {
        completo += `\n# ===== ${pais.toUpperCase()} =====\n`;
        for (const canal of canalesDelPais) {
            const streamUrl = urlsFinales[canal.id];
            completo += `#EXTINF:-1 tvg-id="${canal.id}" tvg-name="${canal.nombre}" tvg-logo="${canal.logo}" group-title="${pais}",${canal.nombre}\n`;
            completo += `${streamUrl}\n`;
        }
    }
    
    const completoPath = path.join(publicDir, 'playlist.m3u');
    fs.writeFileSync(completoPath, completo, 'utf8');
    console.log('✅ playlist.m3u (completo)');
    
    console.log('\n🎉 ¡Playlists generadas exitosamente!');
    console.log(`📂 Archivos generados en: ${publicDir}`);
}

build();