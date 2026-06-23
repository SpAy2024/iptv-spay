// Inicializar reproductor
let player = null;
let currentHls = null;

// Función para cargar canal
function loadChannel(url, channelName) {
    console.log('Cargando canal:', channelName);
    console.log('URL:', url);
    
    // Actualizar nombre del canal
    document.getElementById('currentChannel').innerHTML = `
        <strong>📺 ${channelName}</strong>
    `;
    
    // Si ya existe un reproductor HLS, destruirlo
    if (currentHls) {
        currentHls.destroy();
        currentHls = null;
    }
    
    const video = document.getElementById('videoPlayer');
    
    // Si el video ya tiene src, reiniciar
    if (video.src) {
        video.pause();
        video.src = '';
    }
    
    // Determinar si es HLS o MP4
    if (url.includes('.m3u8')) {
        // Usar HLS.js para streams m3u8
        if (Hls.isSupported()) {
            currentHls = new Hls({
                debug: false,
                enableWorker: true,
                lowLatencyMode: true
            });
            currentHls.loadSource(url);
            currentHls.attachMedia(video);
            currentHls.on(Hls.Events.MANIFEST_PARSED, function() {
                video.play().catch(e => console.log('Error reproduciendo:', e));
            });
            currentHls.on(Hls.Events.ERROR, function(event, data) {
                console.error('Error HLS:', data);
                if (data.fatal) {
                    switch(data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            console.log('Error de red, reintentando...');
                            currentHls.startLoad();
                            break;
                        default:
                            console.error('Error fatal');
                            break;
                    }
                }
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            // Safari nativo
            video.src = url;
            video.addEventListener('loadedmetadata', function() {
                video.play();
            });
        }
    } else {
        // Si es URL directa de video
        video.src = url;
        video.play().catch(e => console.log('Error:', e));
    }
}

// Asignar eventos a los botones de reproducción
document.addEventListener('DOMContentLoaded', function() {
    // Esperar a que los datos de canales estén disponibles
    setTimeout(() => {
        const playButtons = document.querySelectorAll('.btn-play');
        playButtons.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const url = this.dataset.url;
                const channelItem = this.closest('.channel-item');
                const channelName = channelItem.querySelector('.channel-name').textContent;
                loadChannel(url, channelName);
            });
        });
        
        // También permitir click en toda la fila
        const channelItems = document.querySelectorAll('.channel-item');
        channelItems.forEach(item => {
            item.addEventListener('click', function() {
                const btn = this.querySelector('.btn-play');
                if (btn) {
                    const url = btn.dataset.url;
                    const channelName = this.querySelector('.channel-name').textContent;
                    loadChannel(url, channelName);
                }
            });
        });
    }, 500);
});