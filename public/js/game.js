/**
 * VIKINGOS VS SAJONES 
 * Versión: Mapa Cuadrado con 3 Islas en el Mar y Lógica de Muerte
 */

var scene, camera, renderer, playerModel, principalMixer, controls;
var barco; 
var navegando = false; 
var principalClock = new THREE.Clock();
var teclas = {};
var acciones = { idle: null, walk: null, attack: null, death: null };
var estadoActual = "idle";
var estaVivo = true;

const MAP_SIZE = 1000;
var objetosColision = [];
var islasPos = []; // Guardamos posiciones de islas para detectar tierra firme

const loader = new THREE.GLTFLoader();
const dracoLoader = new THREE.DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
loader.setDRACOLoader(dracoLoader);

const audioChoque = new Audio('sounds/choque.mp3');
audioChoque.volume = 0.5;

function initEngine() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB); 

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 10000);
    camera.position.set(0, 50, 100); 

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.outputEncoding = THREE.sRGBEncoding;
    document.body.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.minDistance = 30;
    controls.maxDistance = 800; // Aumentado para ver las islas lejanas
    controls.maxPolarAngle = Math.PI / 2.1;

    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const sun = new THREE.DirectionalLight(0xffffff, 1.2);
    sun.position.set(500, 1000, 500);
    scene.add(sun);

    crearNubes();
}

function crearNubes() {
    const nubeGeo = new THREE.SphereGeometry(5, 8, 8);
    const nubeMat = new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 });
    for(let i = 0; i < 60; i++) {
        const nube = new THREE.Group();
        for(let j = 0; j < 3; j++) {
            const parte = new THREE.Mesh(nubeGeo, nubeMat);
            parte.position.x = j * 4;
            parte.scale.set(1.5, Math.random() + 0.5, 1.2);
            nube.add(parte);
        }
        nube.position.set(Math.random()*4000-2000, 200, Math.random()*4000-2000);
        scene.add(nube);
    }
}

function generarNaturaleza(grupoMapa) {
    const modelosArboles = ['models/naturaleza/pino_1.glb', 'models/naturaleza/arbol_frondoso.glb', 'models/naturaleza/pino_alto.glb'];
    const posicionesFijas = [{x: -150, z: -135}, {x: 140, z: -260}, {x: -260, z: 125}, {x: 265, z: 270}, {x: -115, z: 280}, {x: 255, z: 115}];
    modelosArboles.forEach((ruta, index) => {
        loader.load(ruta, (gltf) => {
            const modeloBase = gltf.scene;
            posicionesFijas.forEach((pos) => {
                const arbol = modeloBase.clone();
                let s = (index === 0) ? 0.06 : (index === 2) ? 0.045 : 0.035;
                arbol.scale.set(s, s, s);
                arbol.position.set(pos.x + (index * 20), 0, pos.z + (index * 15));
                arbol.traverse((node) => { if (node.isMesh) { node.castShadow = true; node.receiveShadow = true; } });
                grupoMapa.add(arbol);
                objetosColision.push({ pos: arbol.position.clone(), radio: 2 });
            });
        });
    });
}

function cargarEstructurasEspeciales(grupoMapa) {
    const construcciones = [
        { archivo: 'ruinas_1.glb', x: 450, z: 50, escala: 0.03, rot: 0, radioC: 15 },
        { archivo: 'castillo_1.glb', x: 300, z: -300, escala: 0.03, rot: Math.PI, radioC: 25 },
        { archivo: 'castillo_2.glb', x: -180, z: 150, escala: 200, rot: Math.PI / 2, radioC: 30 }, 
        { archivo: 'academia_1.glb', x: 120, z: 120, escala: 200, rot: -Math.PI / 4, radioC: 20 }
    ];
    construcciones.forEach(obj => {
        loader.load(`models/estructuras/${obj.archivo}`, (gltf) => {
            const modelo = gltf.scene;
            modelo.scale.set(obj.escala, obj.escala, obj.escala);
            const caja = new THREE.Box3().setFromObject(modelo);
            modelo.position.set(obj.x, -caja.min.y, obj.z);
            modelo.rotation.y = obj.rot;
            modelo.traverse((node) => { if (node.isMesh) { node.castShadow = true; node.receiveShadow = true; } });
            grupoMapa.add(modelo);
            objetosColision.push({ pos: modelo.position.clone(), radio: obj.radioC });
        });
    });
}

function crearBarco() {
    const grupoBarco = new THREE.Group();
    loader.load('/models/barco_vikingo.glb', (gltf) => {
        const modeloReal = gltf.scene;
        modeloReal.scale.set(2.2, 2.2, 2.2); 
        grupoBarco.add(new THREE.PointLight(0xffffff, 3, 100));
        modeloReal.traverse((node) => { if (node.isMesh) { node.castShadow = true; node.receiveShadow = true; } });
        grupoBarco.add(modeloReal);
    });
    grupoBarco.position.set(480, -1.2, 0); 
    scene.add(grupoBarco);
    return grupoBarco;
}

window.cargarMapa = function(idMapa) {
    const mapaAnterior = scene.getObjectByName("MapaActual");
    if(mapaAnterior) scene.remove(mapaAnterior);
    if (typeof VisualManager !== 'undefined') VisualManager.limpiarEscena(scene);
    if(barco) { scene.remove(barco); barco = null; navegando = false; }
    objetosColision = []; 
    islasPos = [];

    const grupoMapa = new THREE.Group();
    grupoMapa.name = "MapaActual";
    
    if (typeof VisualManager !== 'undefined') VisualManager.aplicarBioma(idMapa);

    const datos = CONFIG_MAPAS[idMapa];

    if (idMapa === "bosque") {
        const loaderTex = new THREE.TextureLoader();
        const texBosque = loaderTex.load(`models/mapas/texturas/${datos.textura}`);
        texBosque.wrapS = texBosque.wrapT = THREE.RepeatWrapping;
        texBosque.repeat.set(5, 5); 
        
        const matSuelo = new THREE.MeshStandardMaterial({ map: texBosque, roughness: 1, color: 0x888888 });
        const matAgua = new THREE.MeshStandardMaterial({ color: 0x003399, roughness: 0.1, metalness: 0.5 });

        // Agua de fondo extendida
        const agua = new THREE.Mesh(new THREE.PlaneGeometry(5000, 5000), matAgua);
        agua.rotation.x = -Math.PI / 2;
        agua.position.y = -2.5;
        grupoMapa.add(agua);

        // Suelo Principal
        const geoSuelo = new THREE.PlaneGeometry(MAP_SIZE, MAP_SIZE);
        const sueloPrincipal = new THREE.Mesh(geoSuelo, matSuelo);
        sueloPrincipal.rotation.x = -Math.PI / 2;
        sueloPrincipal.receiveShadow = true;
        grupoMapa.add(sueloPrincipal);

        // --- 3 ISLAS EN EL MAR (FUERA DEL CUADRADO 1000x1000) ---
        const geoIsla = new THREE.CircleGeometry(100, 32);
        const matIsla = new THREE.MeshStandardMaterial({ color: 0x228B22 });

        const posIslas = [
            {x: 850, z: -400}, 
            {x: 850, z: 400}, 
            {x: -850, z: -400}
        ];

        posIslas.forEach(p => {
            const isla = new THREE.Mesh(geoIsla, matIsla);
            isla.rotation.x = -Math.PI / 2;
            isla.position.set(p.x, 0.1, p.z);
            grupoMapa.add(isla);
            islasPos.push(new THREE.Vector3(p.x, 0.1, p.z));
        });

        generarNaturaleza(grupoMapa);
        cargarEstructurasEspeciales(grupoMapa);
        barco = crearBarco(); 
    }

    scene.add(grupoMapa);
    scene.background = new THREE.Color(0x87CEEB); 
    scene.fog = new THREE.Fog(0x87CEEB, 500, 5000); 

    if(typeof ocultarCarga === 'function') ocultarCarga();
};

function cargarPersonaje() {
    const heroeData = JSON.parse(localStorage.getItem("personajeJugando"));
    const bando = heroeData ? heroeData.bando.toLowerCase() : "vikingos";
    const clase = heroeData ? heroeData.clase : "Berserker";
    const rutaPJ = `/models/${bando}/${clase}/personaje.glb`;
    loader.load(rutaPJ, (gltf) => {
        playerModel = gltf.scene;
        playerModel.scale.set(1.8, 1.8, 1.8);
        scene.add(playerModel);
        principalMixer = new THREE.AnimationMixer(playerModel);
        ["Idle", "Walk", "attack", "death"].forEach(a => {
            loader.load(`/models/animaciones/${a}.glb`, (animGltf) => {
                const action = principalMixer.clipAction(animGltf.animations[0]);
                acciones[a.toLowerCase()] = action;
                if(a === "Idle") action.play();
            });
        });
    });
}

function cambiarAnimacion(nombre) {
    if (!acciones[nombre] || estadoActual === nombre || !estaVivo) return;
    if (estadoActual === "attack" && acciones.attack.isRunning()) return;
    if (acciones[estadoActual]) acciones[estadoActual].fadeOut(0.2);
    acciones[nombre].reset().fadeIn(0.2).play();
    estadoActual = nombre;
    if(nombre === "death") {
        estaVivo = false;
        setTimeout(() => {
            playerModel.position.set(0, 0, 0);
            playerModel.position.y = 0;
            estaVivo = true;
            cambiarAnimacion("idle");
        }, 3000);
    }
}

function animate() {
    requestAnimationFrame(animate);
    const delta = principalClock.getDelta();
    if (principalMixer) principalMixer.update(delta);
    if (playerModel && estaVivo) {
        
        // --- LÓGICA DE TIERRA FIRME Y HUNDIMIENTO ---
        const enMapaPrincipal = Math.abs(playerModel.position.x) < 500 && Math.abs(playerModel.position.z) < 500;
        let enIslaPequena = false;
        islasPos.forEach(isla => {
            if (playerModel.position.distanceTo(isla) < 100) enIslaPequena = true;
        });

        if (!enMapaPrincipal && !enIslaPequena && !navegando) {
            playerModel.position.y -= 5 * delta;
            if (playerModel.position.y < -3) cambiarAnimacion("death");
        } else if (!navegando) {
            playerModel.position.y = 0;
        }

        let mX = 0, mZ = 0;
        const vel = (navegando ? 45 : 30) * delta;
        const ang = controls.getAzimuthalAngle();
        if (teclas['w']) { mX += Math.sin(ang); mZ += Math.cos(ang); }
        if (teclas['s']) { mX -= Math.sin(ang); mZ -= Math.cos(ang); }
        if (teclas['a']) { mX += Math.sin(ang + Math.PI/2); mZ += Math.cos(ang + Math.PI/2); }
        if (teclas['d']) { mX -= Math.sin(ang + Math.PI/2); mZ -= Math.cos(ang + Math.PI/2); }

        if (mX !== 0 || mZ !== 0) {
            let nX = playerModel.position.x + mX * vel;
            let nZ = playerModel.position.z + mZ * vel;
            
            // Límite del Mar (1500) - No infinito
            if (Math.abs(nX) < 1500 && Math.abs(nZ) < 1500) {
                let nY = navegando ? barco.position.y + 0.8 : playerModel.position.y;
                if (navegando && barco) {
                    barco.position.x += (nX - playerModel.position.x);
                    barco.position.z += (nZ - playerModel.position.z);
                }
                camera.position.x += (nX - playerModel.position.x);
                camera.position.z += (nZ - playerModel.position.z);
                playerModel.position.set(nX, nY, nZ);
                playerModel.rotation.y = Math.atan2(mX, mZ);
                cambiarAnimacion("walk");
            }
        } else {
            if (estadoActual !== "death") cambiarAnimacion("idle");
        }
        controls.target.copy(playerModel.position);
        controls.update();
    }
    renderer.render(scene, camera);
}

window.addEventListener('keydown', (e) => { 
    teclas[e.key.toLowerCase()] = true; 
    if (e.key.toLowerCase() === 'e' && playerModel && barco && estaVivo) {
        if (playerModel.position.distanceTo(barco.position) < 35) navegando = !navegando;
    }
});
window.addEventListener('keyup', (e) => { teclas[e.key.toLowerCase()] = false; });

initEngine();
cargarPersonaje();
animate();