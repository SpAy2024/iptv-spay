// Función para obtener URL M3U8 de Dailymotion
async function getDailymotionStreamUrl(videoUrl) {
    // Extraer ID del video (ej: xa0fwio)
    const match = videoUrl.match(/\/video\/([a-z0-9]+)/i);
    if (!match) return videoUrl;
    
    const videoId = match[1];
    
    // Usar la API pública de Dailymotion
    const apiUrl = `https://www.dailymotion.com/player/metadata/video/${videoId}`;
    
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        // Buscar la mejor calidad disponible
        if (data.qualities && data.qualities.auto) {
            return data.qualities.auto[0].url;
        }
        return videoUrl;
    } catch (error) {
        console.error(`Error obteniendo stream de ${videoId}:`, error);
        return videoUrl;
    }
}