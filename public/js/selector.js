let bandoActual = "vikingos";
let razaIndex = 0;
const opciones = {
    vikingos: ["Berserker", "Chamán", "Explorador_Vikingo", "Sanador_de_Odín"],
    sajones: ["Arquero_del_Reino", "Caballero_Sajón", "Mago_Real", "Monje_Sanador"]
};

let scene, camera, renderer, currentModel, mixer, clock = new THREE.Clock();

function initSelector3D() {
    const container = document.getElementById('canvas-preview');
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 1.5, 4);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // LUZ TIPO ANTORCHA (Naranja cálida)
    const ambientLight = new THREE.AmbientLight(0xffcc88, 0.8); 
    scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0xffaa00, 2, 10);
    pointLight.position.set(2, 3, 2);
    scene.add(pointLight);

    animate();
    actualizarVista();
}

function cargarModeloPreview(bando, raza) {
    if (currentModel) scene.remove(currentModel);
    const loader = new THREE.GLTFLoader();
    const dracoLoader = new THREE.DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
    loader.setDRACOLoader(dracoLoader);

    loader.load(`/models/${bando}/${raza}/personaje.glb`, (gltf) => {
        currentModel = gltf.scene;
        currentModel.scale.set(1.5, 1.5, 1.5);
        currentModel.position.y = -1; 
        scene.add(currentModel);
        if (gltf.animations.length > 0) {
            mixer = new THREE.AnimationMixer(currentModel);
            mixer.clipAction(gltf.animations[0]).play();
        }
    });
}

function cambiarBando(b) { bandoActual = b; razaIndex = 0; actualizarVista(); }
function cambiarRaza(d) {
    razaIndex = (razaIndex + d + opciones[bandoActual].length) % opciones[bandoActual].length;
    actualizarVista();
}
function actualizarVista() {
    const raza = opciones[bandoActual][razaIndex];
    document.getElementById("nombre-raza").innerText = raza.replace(/_/g, " ");
    cargarModeloPreview(bandoActual, raza);
}

function confirmarSeleccion() {
    const nombre = document.getElementById("nombre-jugador").value.trim();
    if(!nombre) return alert("Escribe tu nombre, guerrero");
    localStorage.setItem("nombreJugador", nombre);
    localStorage.setItem("bando", bandoActual);
    localStorage.setItem("clase", opciones[bandoActual][razaIndex]);
    window.location.href = "/game";
}

function animate() {
    requestAnimationFrame(animate);
    if (mixer) mixer.update(clock.getDelta());
    if (currentModel) currentModel.rotation.y += 0.005;
    renderer.render(scene, camera);
}
window.onload = initSelector3D;