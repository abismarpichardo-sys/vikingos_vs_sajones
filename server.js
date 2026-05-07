const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const fs = require("fs"); 
const app = express();

app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

const templates = path.join(__dirname, "public/templates");
const DB_PATH = path.join(__dirname, "usuarios.db");

// --- 📊 CARGA INICIAL DE BASE DE DATOS ---
// Intentamos leer el archivo. Si no existe, inicializamos como objeto vacío.
let baseDatosSimulada = {};
if (fs.existsSync(DB_PATH)) {
    try {
        const contenido = fs.readFileSync(DB_PATH, "utf8");
        baseDatosSimulada = JSON.parse(contenido);
        console.log("✅ Datos persistentes cargados correctamente.");
    } catch (error) {
        console.log("⚠️ Error al leer usuarios.db, se iniciará una base vacía.");
        baseDatosSimulada = {};
    }
}

// --- 📂 API: OBTENER PERSONAJES DEL USUARIO ---
app.get("/api/mis-personajes/:usuario", (req, res) => {
    const usuario = req.params.usuario;
    const datos = baseDatosSimulada[usuario] || { bando: null, personajes: [] };
    res.json(datos);
});

// --- ⚔️ API: GUARDAR PERSONAJE ---
app.post("/api/guardar-personaje", (req, res) => {
    const { usuarioId, nombreHeroe, bando, clase, slotIndex } = req.body;

    if (!usuarioId || !nombreHeroe) {
        return res.status(400).json({ success: false, message: "Datos incompletos" });
    }

    // 1. Inicializar usuario si no existe
    if (!baseDatosSimulada[usuarioId]) {
        baseDatosSimulada[usuarioId] = { bando: bando, personajes: [] };
    }

    const cuenta = baseDatosSimulada[usuarioId];

    // 2. REGLA: Validar bando único
    if (cuenta.bando && cuenta.bando !== bando) {
        return res.status(400).json({ 
            success: false, 
            message: `Tu cuenta ya pertenece al bando ${cuenta.bando}.` 
        });
    }

    // 3. REGLA: Máximo 4 personajes
    const slotNum = parseInt(slotIndex);
    if (cuenta.personajes.length >= 4 && !cuenta.personajes.find(p => p.slot === slotNum)) {
        return res.status(400).json({ 
            success: false, 
            message: "Límite de 4 guerreros alcanzado." 
        });
    }

    // 4. Guardar o Actualizar en el slot correspondiente
    const nuevoPersonaje = { nombre: nombreHeroe, clase, bando, slot: slotNum };
    const indexExistente = cuenta.personajes.findIndex(p => p.slot === slotNum);

    if (indexExistente !== -1) {
        cuenta.personajes[indexExistente] = nuevoPersonaje;
    } else {
        cuenta.personajes.push(nuevoPersonaje);
    }

    // --- 💾 GUARDADO FÍSICO EN ARCHIVO ---
    // Esto evita que los datos se borren al reiniciar el servidor
    try {
        fs.writeFileSync(DB_PATH, JSON.stringify(baseDatosSimulada, null, 2));
        console.log(`💾 Guardado en disco: ${nombreHeroe} para el usuario ${usuarioId}`);
    } catch (err) {
        console.error("❌ Error guardando en el archivo usuarios.db:", err);
    }

    // 🚩 LOG LIMPIO EN TERMINAL
    console.log(`-------------------------------------------`);
    console.log(`[LOG] Guerrero: ${usuarioId} | Héroe: ${nombreHeroe} | Clase: ${clase} | Slot: ${slotNum}`);
    console.log(`-------------------------------------------`);

    res.json({ success: true, bandoAsignado: cuenta.bando });
});

// --- 🗺️ RUTAS DE NAVEGACIÓN ---
app.get("/", (req, res) => res.sendFile(path.join(templates, "index.html")));
app.get("/login-page", (req, res) => res.sendFile(path.join(templates, "login.html")));
app.get("/perfil", (req, res) => res.sendFile(path.join(templates, "perfil.html")));
app.get("/seleccion", (req, res) => res.sendFile(path.join(templates, "seleccion.html")));
app.get("/menu", (req, res) => res.sendFile(path.join(templates, "menu.html")));
app.get("/game", (req, res) => res.sendFile(path.join(templates, "game.html")));

app.post("/login", (req, res) => {
    res.redirect("/perfil");
});

// --- 🚀 INICIO ---
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`-------------------------------------------`);
    console.log(`⚔️  SISTEMA DE SLOTS CON PERSISTENCIA ACTIVO ⚔️`);
    console.log(`📍 Accede aquí: http://localhost:${PORT}`);
    console.log(`-------------------------------------------`);
});