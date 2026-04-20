const VisualManager = {
    particulasClima: null,
    loaderTextura: new THREE.TextureLoader(), // Loader reutilizable

    // 1. Limpia portales, clima y el suelo base
    limpiarEscena: function(scene) {
        const aEliminar = [];
        scene.traverse(obj => {
            if (obj.name === "sistemaClima" || obj.userData.esPortal || obj.name === "sueloBase") {
                aEliminar.push(obj);
            }
        });
        aEliminar.forEach(obj => scene.remove(obj));
        this.particulasClima = null;
    },

    // 2. Aplica atmósfera y TEXTURA de suelo
    aplicarBioma: function(idMapa) {
        const datos = CONFIG_MAPAS[idMapa];
        if (!datos) return;

        // Niebla extendida para ver islas lejanas
        scene.background = new THREE.Color(datos.colorNiebla);
        scene.fog = new THREE.Fog(datos.colorNiebla, 50, 2500); 

        // --- SOLUCIÓN: Solo creamos el suelo base si NO es el bosque ---
        // Esto evita que el cuadrado de 1200x12000 tape el agua y las islas del game.js
        if (idMapa !== "bosque") {
            this.crearCuadranteBase(datos.textura, datos.colorNiebla);
        }

        // Efectos de partículas
        if (datos.clima === "nieve") {
            this.crearClimaEfecto(0xffffff);
        } else if (datos.clima === "ceniza") {
            this.crearClimaEfecto(0x444444); 
        }

        console.log("📍 Bioma aplicado: " + idMapa);
    },

    // 3. Crea el suelo con textura repetida (Baldosas)
    crearCuadranteBase: function(nombreArchivo, colorRespaldo) {
        if (!nombreArchivo) {
            const geo = new THREE.PlaneGeometry(1200, 1200);
            const mat = new THREE.MeshStandardMaterial({ color: colorRespaldo });
            const suelo = new THREE.Mesh(geo, mat);
            suelo.rotation.x = -Math.PI / 2;
            suelo.position.y = -0.5;
            suelo.name = "sueloBase";
            scene.add(suelo);
            return;
        }

        this.loaderTextura.load(`models/mapas/texturas/${nombreArchivo}`, (textura) => {
            textura.wrapS = textura.wrapT = THREE.RepeatWrapping;
            textura.repeat.set(25, 25); 

            const geo = new THREE.PlaneGeometry(1200, 1200);
            const mat = new THREE.MeshStandardMaterial({ 
                map: textura,
                roughness: 1 
            });

            const suelo = new THREE.Mesh(geo, mat);
            suelo.rotation.x = -Math.PI / 2;
            suelo.position.y = -0.55; 
            suelo.name = "sueloBase";
            suelo.receiveShadow = true;
            scene.add(suelo);
        });
    },

    // 4. Sistema de partículas (Cae nieve o ceniza)
    crearClimaEfecto: function(colorHex) {
        const cantidad = 2000;
        const geo = new THREE.BufferGeometry();
        const posiciones = new Float32Array(cantidad * 3);

        for (let i = 0; i < cantidad * 3; i++) {
            posiciones[i] = (Math.random() - 0.5) * 500; 
        }

        geo.setAttribute('position', new THREE.BufferAttribute(posiciones, 3));
        const mat = new THREE.PointsMaterial({
            color: colorHex,
            size: 0.5,
            transparent: true,
            opacity: 0.6
        });

        this.particulasClima = new THREE.Points(geo, mat);
        this.particulasClima.name = "sistemaClima";
        scene.add(this.particulasClima);
    },

    actualizarClima: function() {
        if (this.particulasClima) {
            const coords = this.particulasClima.geometry.attributes.position.array;
            for (let i = 1; i < coords.length; i += 3) {
                coords[i] -= 0.2; 
                if (coords[i] < -5) coords[i] = 80; 
            }
            this.particulasClima.geometry.attributes.position.needsUpdate = true;
        }
    },

    crearPortal: function(x, z, destino) {
        const geo = new THREE.TorusGeometry(2.5, 0.2, 16, 100);
        const mat = new THREE.MeshBasicMaterial({ color: 0x00ffff, wireframe: true });
        const portal = new THREE.Mesh(geo, mat);
        portal.position.set(x, 3, z);
        portal.userData = { esPortal: true, destino: destino };
        scene.add(portal);
        return portal;
    }
};