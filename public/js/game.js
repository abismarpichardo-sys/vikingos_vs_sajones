/**
 * VIKINGOS VS SAJONES 
 * Versión: Mapa con Colisiones y Árboles Ajustados
 */

var scene, camera, renderer, playerModel, principalMixer, controls;
var barco; 
var navegando = false; 
var principalClock = new THREE.Clock();
var teclas = {};
var acciones = { idle: null, walk: null, attack: null, death: null };
var estadoActual = "idle";
var estaVivo = true;

// Arreglo para almacenar objetos con los que el personaje choca
var objetosColision = [];

const loader = new THREE.GLTFLoader();
const dracoLoader = new THREE.DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
loader.setDRACOLoader(dracoLoader);

// --- PRECARGA DE SONIDO ---
const audioChoque = new Audio('sounds/choque.mp3');
audioChoque.volume = 0.5;

function initEngine() {
    scene = new THREE.Scene();

    // Fondo Celeste Claro
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

    // Luces potentes de día
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
    const modelosArboles = [
        'models/naturaleza/pino_1.glb', 
        'models/naturaleza/arbol_frondoso.glb', 
        'models/naturaleza/pino_alto.glb'
    ];

    const posicionesFijas = [
        {x: -150, z: -135}, {x: 140, z: -260}, {x: -260, z: 125},
        {x: 265, z: 270}, {x: -115, z: 280}, {x: 255, z: 115}
    ];

    modelosArboles.forEach((ruta, index) => {
        loader.load(ruta, (gltf) => {
            const modeloBase = gltf.scene;
            
            posicionesFijas.forEach((pos) => {
                const arbol = modeloBase.clone();
                
                let s = 0.04; 
                if (index === 0) s = 0.06; 
                else if (index === 2) s = 0.045; 
                else s = 0.035;

                arbol.scale.set(s, s, s);
                const offsetX = (index * 20); 
                const offsetZ = (index * 15);
                arbol.position.set(pos.x + offsetX, 0, pos.z + offsetZ);
                arbol.rotation.y = (pos.x + pos.z); 

                arbol.traverse((node) => {
                    if (node.isMesh) {
                        node.castShadow = true;
                        node.receiveShadow = true;
                    }
                });
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
            const minY = caja.min.y;

            modelo.position.set(obj.x, -minY, obj.z);
            modelo.rotation.y = obj.rot;

            modelo.traverse((node) => {
                if (node.isMesh) {
                    node.castShadow = true;
                    node.receiveShadow = true;
                }
            });

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
        
        const luzBarco = new THREE.PointLight(0xffffff, 3, 100);
        luzBarco.position.set(0, 10, 0); 
        grupoBarco.add(luzBarco);

        modeloReal.traverse((node) => {
            if (node.isMesh) {
                node.castShadow = true;
                node.receiveShadow = true;
                if(node.material) node.material.emissive = new THREE.Color(0x111111);
            }
        });
        grupoBarco.add(modeloReal);
    });
    grupoBarco.position.set(490, -1.2, 0); 
    scene.add(grupoBarco);
    return grupoBarco;
}

window.cargarMapa = function(idMapa) {
    const mapaAnterior = scene.getObjectByName("MapaActual");
    if(mapaAnterior) scene.remove(mapaAnterior);
    if (typeof VisualManager !== 'undefined') VisualManager.limpiarEscena(scene);
    if(barco) { scene.remove(barco); barco = null; navegando = false; }
    objetosColision = []; 

    const grupoMapa = new THREE.Group();
    grupoMapa.name = "MapaActual";
    
    if (typeof VisualManager !== 'undefined') VisualManager.aplicarBioma(idMapa);

    const datos = CONFIG_MAPAS[idMapa];

    if (idMapa === "bosque") {
        const loaderTex = new THREE.TextureLoader();
        const texBosque = loaderTex.load(`models/mapas/texturas/${datos.textura}`);
        texBosque.wrapS = texBosque.wrapT = THREE.RepeatWrapping;
        texBosque.repeat.set(40, 40);
        
        const matSuelo = new THREE.MeshStandardMaterial({ map: texBosque, roughness: 1, color: 0x888888 });
        const matAgua = new THREE.MeshStandardMaterial({ color: 0x003399, roughness: 0.1, metalness: 0.5 });

        const agua = new THREE.Mesh(new THREE.PlaneGeometry(15000, 15000), matAgua);
        agua.rotation.x = -Math.PI / 2;
        agua.position.y = -2.5;
        grupoMapa.add(agua);

        const sueloPrincipal = new THREE.Mesh(new THREE.PlaneGeometry(1000, 1000), matSuelo);
        sueloPrincipal.rotation.x = -Math.PI / 2;
        sueloPrincipal.receiveShadow = true;
        grupoMapa.add(sueloPrincipal);

        // --- TU ISLA RECUPERADA ---
        const islaPequena = new THREE.Mesh(new THREE.CircleGeometry(150, 32), matSuelo);
        islaPequena.rotation.x = -Math.PI / 2;
        islaPequena.position.set(1200, -0.2, 0); 
        grupoMapa.add(islaPequena);

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
    const bando = localStorage.getItem("bando") || "vikingos";
    const clase = localStorage.getItem("clase") || "Berserker";
    const rutaPJ = `/models/${bando}/${clase}/personaje.glb`;
    loader.load(rutaPJ, (gltf) => {
        playerModel = gltf.scene;
        playerModel.scale.set(1.8, 1.8, 1.8);
        scene.add(playerModel);
        principalMixer = new THREE.AnimationMixer(playerModel);
        const anims = ["Idle", "Walk", "attack", "death"];
        anims.forEach(a => {
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
        setTimeout(respawn, 3000); // Reseteo tras 3 seg
    }
}

function respawn() {
    playerModel.position.set(0, 0, 0);
    camera.position.set(0, 50, 100);
    // RESCATE DEL BARCO: Lo devuelve a su punto inicial
    if(barco) {
        barco.position.set(490, -1.2, 0);
        navegando = false;
    }
    estaVivo = true;
    cambiarAnimacion("idle");
}

window.addEventListener('keydown', (e) => { 
    const key = e.key.toLowerCase();
    teclas[key] = true; 
    if (key === 'e' && playerModel && barco && estaVivo) {
        const dist = playerModel.position.distanceTo(barco.position);
        if (dist < 35) navegando = !navegando;
    }
});
window.addEventListener('keyup', (e) => { teclas[e.key.toLowerCase()] = false; });

function hayColision(nx, nz) {
    if (navegando) return false; 
    for (let obj of objetosColision) {
        let dx = nx - obj.pos.x;
        let dz = nz - obj.pos.z;
        let distancia = Math.sqrt(dx * dx + dz * dz);
        if (distancia < obj.radio) {
            audioChoque.currentTime = 0; // Para que suene cada vez que choca
            audioChoque.play().catch(() => {});
            return true;
        }
    }
    return false;
}

function animate() {
    requestAnimationFrame(animate);
    const delta = principalClock.getDelta();
    if (principalMixer) principalMixer.update(delta);
    if (typeof VisualManager !== 'undefined') VisualManager.actualizarClima();

    if (playerModel) {
        if (estaVivo) {
            // LÓGICA DE HUNDIMIENTO MEJORADA
            const fueraDeIsla = Math.abs(playerModel.position.x) > 500 || Math.abs(playerModel.position.z) > 500;
            const sobreIslaPequena = playerModel.position.distanceTo(new THREE.Vector3(1200, 0, 0)) < 150;
            
            if (fueraDeIsla && !sobreIslaPequena && !navegando) {
                playerModel.position.y -= 5 * delta; // Se hunde visiblemente
                if (playerModel.position.y < -3.5) {
                    cambiarAnimacion("death");
                }
            } else if (!navegando) {
                playerModel.position.y = 0;
            }

            const atacando = acciones.attack && acciones.attack.isRunning();
            if (!atacando && estadoActual !== "death") {
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
                    
                    if (!hayColision(nX, nZ)) {
                        let nY = navegando ? barco.position.y + 0.8 : playerModel.position.y;
                        if (navegando && barco) {
                            barco.position.x += (nX - playerModel.position.x);
                            barco.position.z += (nZ - playerModel.position.z);
                            barco.position.y = -1.2 + Math.sin(Date.now() * 0.002) * 0.3;
                            nY = barco.position.y + 0.8; 
                        }
                        camera.position.x += (nX - playerModel.position.x);
                        camera.position.z += (nZ - playerModel.position.z);
                        playerModel.position.set(nX, nY, nZ);
                        playerModel.rotation.y = Math.atan2(mX, mZ);
                        cambiarAnimacion("walk");
                    }
                } else {
                    if (navegando && barco) {
                        barco.position.y = -1.2 + Math.sin(Date.now() * 0.002) * 0.3;
                        playerModel.position.y = barco.position.y + 0.8;
                    }
                    cambiarAnimacion("idle");
                }
            }
        }
        controls.target.copy(playerModel.position);
        controls.update();
    }
    renderer.render(scene, camera);
}

initEngine();
cargarPersonaje();
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});