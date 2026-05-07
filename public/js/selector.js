// --- CONFIGURACIÓN DE CLASES ---
const opciones = {
    vikingos: ["berserker", "Chamán", "Explorador_Vikingo", "Sanador_de_Odín"],
    sajones: ["Arquero_del_Reino", "Caballero_Sajón", "Mago_Real", "Monje_Sanador"]
};

let scene, camera, renderer, currentModel, mixer, clock = new THREE.Clock();

function initSelector3D() {
    const container = document.getElementById('visualizador-3d');
    if (!container) return;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 1.2, 3);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // Iluminación para resaltar el modelo
    scene.add(new THREE.AmbientLight(0xffffff, 1.2));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);

    animate();
    actualizarInterfaz(); // Llenar la lista al cargar
}

function cargarModelo3D(bando, clase) {
    if (currentModel) scene.remove(currentModel);
    
    const loader = new THREE.GLTFLoader();
    const dracoLoader = new THREE.DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
    loader.setDRACOLoader(dracoLoader);

    const loadingText = document.getElementById("loading-text");
    if (loadingText) loadingText.textContent = "Buscando guerrero...";

    // Ruta exacta según tus carpetas
    const ruta = `/models/${bando}/${clase}/personaje.glb`;

    loader.load(ruta, (gltf) => {
        currentModel = gltf.scene;
        currentModel.scale.set(1.2, 1.2, 1.2);
        currentModel.position.set(0, -0.5, 0);
        scene.add(currentModel);
        
        if (gltf.animations.length > 0) {
            mixer = new THREE.AnimationMixer(currentModel);
            mixer.clipAction(gltf.animations[0]).play();
        }
        if (loadingText) loadingText.textContent = "¡Guerrero listo!";
    }, undefined, (error) => {
        console.error("No se halló en:", ruta);
        if (loadingText) loadingText.textContent = "Error: Modelo no hallado";
    });
}

function actualizarInterfaz() {
    const bando = document.getElementById("bandoSelect").value;
    const claseSelect = document.getElementById("claseSelect");
    if (!claseSelect) return;

    claseSelect.innerHTML = "";
    opciones[bando].forEach(clase => {
        const option = document.createElement("option");
        option.value = clase;
        option.textContent = clase.replace(/_/g, ' ');
        claseSelect.appendChild(option);
    });

    cargarModelo3D(bando, claseSelect.value);
}

// --- FUNCIÓN ACTUALIZADA PARA EVITAR UNDEFINED ---
function confirmarSeleccion() {
    const nombreHeroe = document.getElementById("nombreInput").value.trim();
    const bando = document.getElementById("bandoSelect").value;
    const clase = document.getElementById("claseSelect").value;
    
    // Recuperamos quién es el usuario y en qué slot estamos trabajando
    const usuarioId = localStorage.getItem("nombreJugador");
    const slotIndex = localStorage.getItem("currentSlot") || 0;

    if (!nombreHeroe) return alert("¡Nombra a tu héroe!");

    // Sincronizamos los nombres de las variables con el servidor
    const datos = { 
        usuarioId: usuarioId, 
        nombreHeroe: nombreHeroe, 
        bando: bando, 
        clase: clase, 
        slotIndex: slotIndex 
    };

    fetch('/api/guardar-personaje', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
    })
    .then(res => res.json())
    .then(data => {
        if(data.success) {
            // Guardamos localmente para el uso inmediato del juego
            localStorage.setItem("bando", bando);
            localStorage.setItem("clase", clase);
            localStorage.setItem("nombreHeroe", nombreHeroe);
            
            // Regresamos al salón de héroes (perfil) para ver los 4 slots
            window.location.href = "/perfil";
        } else {
            alert("Error del servidor: " + data.message);
        }
    })
    .catch((err) => {
        console.error("Error al guardar:", err);
        alert("No se pudo conectar con el servidor.");
    });
}

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    if (mixer) mixer.update(delta);
    if (currentModel) currentModel.rotation.y += 0.005;
    renderer.render(scene, camera);
}

// Configurar eventos
document.addEventListener('DOMContentLoaded', () => {
    initSelector3D();
    
    document.getElementById("bandoSelect").addEventListener("change", actualizarInterfaz);
    document.getElementById("claseSelect").addEventListener("change", (e) => {
        cargarModelo3D(document.getElementById("bandoSelect").value, e.target.value);
    });
    document.getElementById("btnConfirmar").addEventListener("click", confirmarSeleccion);
});