/**
 * GESTOR DE JUEGO - VIKINGOS VS SAJONES
 * Controla biomas, portales y estados del mundo con efectos de sonido.
 */

const GameManager = {
    portalActivo: null,
    audioListener: null,
    sonidoPortal: null,

    bandoActual: (localStorage.getItem("bando") || "vikingos").endsWith('s') 
                  ? localStorage.getItem("bando") 
                  : (localStorage.getItem("bando") || "vikingo") + 's',

    configuracionPortales: {
        "bosque": { x: 30, z: 30, destino: "nieve", color: 0x00ffff },
        "nieve":  { x: -30, z: -30, destino: "fuego", color: 0xffaa00 },
        "fuego":  { x: 0, z: 40, destino: "bosque", color: 0x00ff00 }
    },

    init: function() {
        console.log("⚔️ GameManager Iniciado para:", this.bandoActual);
        
        // Inicializar sistema de audio
        this.prepararAudio();

        const bandoUI = document.getElementById("bandoTexto");
        if(bandoUI) {
            const clase = localStorage.getItem("clase") || "Guerrero";
            bandoUI.innerText = `${this.bandoActual.toUpperCase()}: ${clase.replace(/_/g, ' ')}`;
        }

        this.viajar("bosque");
    },

    prepararAudio: function() {
        // Creamos el listener y lo añadimos a la cámara global
        if (typeof camera !== 'undefined') {
            this.audioListener = new THREE.AudioListener();
            camera.add(this.audioListener);
            this.sonidoPortal = new THREE.Audio(this.audioListener);

            // Cargamos un sonido místico de portal
            const audioLoader = new THREE.AudioLoader();
            audioLoader.load('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3', (buffer) => {
                this.sonidoPortal.setBuffer(buffer);
                this.sonidoPortal.setVolume(0.5);
            });
        }
    },

    reproducirSonidoPortal: function() {
        if (this.sonidoPortal && this.sonidoPortal.buffer) {
            if (this.sonidoPortal.isPlaying) this.sonidoPortal.stop();
            this.sonidoPortal.play();
        }
    },

    crearPortalDeMapa: function(idBioma) {
        const config = this.configuracionPortales[idBioma];
        
        if (config && typeof VisualManager !== 'undefined') {
            if (this.portalActivo) {
                scene.remove(this.portalActivo);
            }

            this.portalActivo = VisualManager.crearPortal(config.x, config.z, config.destino);
            
            if (this.portalActivo && this.portalActivo.material) {
                this.portalActivo.material.color.setHex(config.color);
            }
            console.log(`🌀 Portal de salida hacia [${config.destino}] creado.`);
        }
    },

    checkViaje: function() {
        if (!this.portalActivo || typeof playerModel === 'undefined' || !playerModel) return;

        const dist = playerModel.position.distanceTo(this.portalActivo.position);

        if (dist < 4) { 
            const destino = this.portalActivo.userData.destino;
            this.reproducirSonidoPortal(); // <--- SONIDO AQUÍ
            this.viajar(destino);
        }
    },

    viajar: function(idNuevoMapa) {
        console.log("🚀 Iniciando viaje a: " + idNuevoMapa);
        const config = this.configuracionPortales[idNuevoMapa];

        if (!config) return;

        if (typeof VisualManager !== 'undefined') {
            VisualManager.limpiarEscena(scene);
            VisualManager.aplicarBioma(idNuevoMapa);
        }
        
        if (typeof window.cargarMapa === 'function') {
            window.cargarMapa(idNuevoMapa);
        }
        
        if (typeof playerModel !== 'undefined' && playerModel) {
            playerModel.position.set(0, 0, 0);
            
            if (typeof principalMixer !== 'undefined' && principalMixer) {
                console.log("🎬 Sincronizando mixer tras el viaje...");
            }
        }

        this.crearPortalDeMapa(idNuevoMapa);
    }
};

window.addEventListener('load', () => {
    setTimeout(() => {
        GameManager.init();
    }, 1500); 
});

function loopGameManager() {
    requestAnimationFrame(loopGameManager);
    GameManager.checkViaje();
}
loopGameManager();