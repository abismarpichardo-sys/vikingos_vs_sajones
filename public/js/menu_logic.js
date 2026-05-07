/**
 * VIKINGOS VS SAJONES - Lógica del Menú Principal
 * Flujo: Perfil -> Menú -> Juego
 * Estado: Optimizado con Cache Busting y Estilo Medieval
 */

let miniScene, miniCamera, miniRenderer, miniMixer, miniClock;

// --- 1. NAVEGACIÓN Y FLUJO DEL JUEGO ---

/**
 * Función para entrar al mapa de juego.
 * Verifica que el usuario tenga bando y clase antes de permitir la entrada.
 */
function irAJugar() {
    const bando = localStorage.getItem("bando");
    const clase = localStorage.getItem("clase");
    const nombre = localStorage.getItem("nombreJugador");

    if (bando && clase && nombre) {
        alert(`¡Prepárate ${nombre}! Entrando al campo de batalla...`);
        // Redirigir a la ruta del juego definida en el servidor
        window.location.href = "/game"; 
    } else {
        alert("🛡️ ¡Alto ahí! Antes de la batalla, debes definir tu perfil (Nombre, Bando y Clase).");
        verPersonaje(); // Abre el modal automáticamente
    }
}

function salir() {
    if (confirm("¿Seguro que quieres retirarte al inicio, Guerrero?")) {
        window.location.href = "/";
    }
}

// --- 2. GESTIÓN DEL PERSONAJE (MODAL Y 3D) ---

function verPersonaje() {
    if (document.getElementById("modalPersonaje")) return;

    const modal = document.createElement("div");
    modal.id = "modalPersonaje";
    // Estilo Medieval / Dark
    modal.style = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.9); display:flex; justify-content:center; align-items:center; z-index:2000; color:white; font-family:'MedievalSharp', cursive, serif;";

    modal.innerHTML = `
        <div style="background:#1a1612; padding:25px; border:3px solid #c5a059; border-radius:5px; display:flex; gap:20px; max-width:850px; width:95%; box-shadow: 0 0 50px rgba(0, 0, 0, 0.9);">
            
            <div id="contenedor3D" style="width:320px; height:420px; background:#0a0a0a; border: 1px solid #444; border-radius:5px; position:relative; overflow:hidden;">
                <div id="loadingMini" style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); color:#c5a059; font-weight:bold; text-align:center; font-size:0.8em;">
                    INVOCANDO GUERRERO...
                </div>
            </div>
            
            <div style="flex:1; display:flex; flex-direction:column;">
                <h2 style="color:#c5a059; margin-top:0; border-bottom: 2px solid #c5a059; padding-bottom: 10px; text-transform:uppercase; letter-spacing:2px;">Perfil del Guerrero</h2>
                
                <label style="font-size: 0.8em; color: #c5a059; margin-top:10px;">NOMBRE DEL PERSONAJE</label>
                <input type="text" id="inputNombre" value="${localStorage.getItem("nombreJugador") || ''}" placeholder="Escribe tu nombre..." style="width:93%; padding:10px; margin-bottom:15px; background:#2a241e; color:#d2b48c; border:1px solid #5d4e3a;">

                <label style="font-size: 0.8em; color: #c5a059;">BANDO</label>
                <select id="selectBando" onchange="actualizarClases()" style="width:100%; padding:10px; margin-bottom:15px; background:#2a241e; color:white; border:1px solid #5d4e3a;">
                    <option value="vikingos" ${localStorage.getItem("bando") === 'vikingos' ? 'selected' : ''}>Vikingos</option>
                    <option value="sajones" ${localStorage.getItem("bando") === 'sajones' ? 'selected' : ''}>Sajones</option>
                </select>

                <label style="font-size: 0.8em; color: #c5a059;">CLASE</label>
                <select id="selectClase" onchange="actualizarPrevisualizacion()" style="width:100%; padding:10px; margin-bottom:15px; background:#2a241e; color:white; border:1px solid #5d4e3a;">
                </select>

                <div style="background:#2a241e; padding:15px; border-left: 4px solid #c5a059; margin-bottom: 20px;">
                    <p style="margin:0; color:#c5a059; font-size:0.8em; font-weight:bold; text-transform:uppercase;">Atributos de Clase:</p>
                    <ul id="listaAtributos" style="list-style:none; padding:10px 0 0 0; font-size:0.85em; color:#d2b48c; line-height:1.4;"></ul>
                </div>

                <div style="display:flex; gap:10px; margin-top:auto;">
                    <button onclick="guardarPersonaje()" style="flex:2; padding:15px; background:#c5a059; color:#1a1612; font-weight:bold; cursor:pointer; border:none; text-transform:uppercase;">Guardar Cambios</button>
                    <button onclick="cerrarModal()" style="flex:1; padding:15px; background:#444; color:white; cursor:pointer; border:none;">Volver</button>
                </div>
            </div>
        </div>`;
    
    document.body.appendChild(modal);
    actualizarClases();
    iniciar3D();
}

function cerrarModal() {
    if (document.getElementById("modalPersonaje")) {
        document.getElementById("modalPersonaje").remove();
        // Limpiar memoria de Three.js
        miniRenderer.dispose();
    }
}

function actualizarClases() {
    const bando = document.getElementById("selectBando").value;
    const select = document.getElementById("selectClase");
    const claseGuardada = localStorage.getItem("clase");
    
    const opciones = {
        "vikingos": ["berserker", "Chamán", "Explorador_Vikingo", "Sanador_de_Odín"],
        "sajones": ["Arquero_del_Reino", "Caballero_Sajón", "Mago_Real", "Monje_Sanador"]
    };

    select.innerHTML = opciones[bando].map(c => 
        `<option value="${c}" ${claseGuardada === c ? 'selected' : ''}>${c.replace(/_/g,' ')}</option>`
    ).join('');
    
    actualizarPrevisualizacion();
}

function iniciar3D() {
    const container = document.getElementById("contenedor3D");
    miniScene = new THREE.Scene();
    miniClock = new THREE.Clock();
    miniCamera = new THREE.PerspectiveCamera(45, 320/420, 0.1, 100);
    miniCamera.position.set(0, 1.2, 3.5);
    
    miniRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    miniRenderer.setSize(320, 420);
    miniRenderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(miniRenderer.domElement);
    
    miniScene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 1.5));
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 5, 5);
    miniScene.add(light);
    
    function animate() {
        if (!document.getElementById("modalPersonaje")) return;
        requestAnimationFrame(animate);
        const delta = miniClock.getDelta();
        if (miniMixer) miniMixer.update(delta);
        miniRenderer.render(miniScene, miniCamera);
    }
    animate();
}

function actualizarPrevisualizacion() {
    const bando = document.getElementById("selectBando").value;
    const clase = document.getElementById("selectClase").value;
    const loader = new THREE.GLTFLoader();
    const loadingText = document.getElementById("loadingMini");

    // Limpiar modelos previos (mantener solo luces)
    miniScene.children = miniScene.children.filter(c => c.isLight);

    if(loadingText) {
        loadingText.style.display = "block";
        loadingText.innerText = "LLAMANDO AL GUERRERO...";
    }

    const version = new Date().getTime(); 
    // Asegúrate de que las rutas coincidan con tus carpetas reales
    const rutaModelo = `/models/${bando}/${clase}/personaje.glb?v=${version}`;

    loader.load(rutaModelo, (gltf) => {
        const model = gltf.scene;
        model.position.y = -1;
        model.scale.set(1.4, 1.4, 1.4);
        miniScene.add(model);
        
        if(loadingText) loadingText.style.display = "none";
        
        // Animación Idle automática
        miniMixer = new THREE.AnimationMixer(model);
        const rutaAnim = `/models/animaciones/Idle.glb?v=${version}`;
        
        loader.load(rutaAnim, (a) => {
            if(a.animations[0]) miniMixer.clipAction(a.animations[0]).play();
        });

    }, undefined, (e) => {
        if(loadingText) loadingText.innerText = "MODELO NO ENCONTRADO";
        console.error("Ruta fallida: " + rutaModelo);
    });

    document.getElementById("listaAtributos").innerHTML = `
        <li>⚔️ <b>Maestría:</b> ${clase.includes('Mago') || clase.includes('Chamán') ? 'Mágica' : 'Física'}</li>
        <li>🛡️ <b>Resistencia:</b> Media-Alta</li>
    `;
}

function guardarPersonaje() {
    const nombre = document.getElementById("inputNombre").value;
    if (!nombre) return alert("¡Tu guerrero necesita un nombre!");

    localStorage.setItem("nombreJugador", nombre);
    localStorage.setItem("bando", document.getElementById("selectBando").value);
    localStorage.setItem("clase", document.getElementById("selectClase").value);
    
    alert("✅ Cambios guardados. El destino de " + nombre + " ha sido sellado.");
    cerrarModal();
}

// --- 3. FUNCIONES DE INTERFAZ ---

function verMapa() { 
    alert("🗺️ MAPA DEL REINO:\nMidgard, Jötunheim y Muspelheim te esperan."); 
}

function abrirInventario() { 
    alert("🎒 TU MOCHILA: Vacía por ahora. ¡Ve a la guerra para conseguir botín!"); 
}

function abrirConfiguracion() { 
    alert("⚙️ AJUSTES: El sonido y la calidad gráfica se configurarán en la batalla."); 
}