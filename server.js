const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const fs = require("fs"); 
const app = express();

// --- ⚙️ CONFIGURACIÓN Y MIDDLEWARES ---
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

const templates = path.join(__dirname, "public/templates");
const DB_PATH = path.join(__dirname, "usuarios.db");

// --- 📊 CARGA INICIAL DE BASE DE DATOS ---
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

    if (!baseDatosSimulada[usuarioId]) {
        baseDatosSimulada[usuarioId] = { bando: bando, personajes: [] };
    }

    const cuenta = baseDatosSimulada[usuarioId];

    if (cuenta.bando && cuenta.bando !== bando) {
        return res.status(400).json({ 
            success: false, 
            message: `Tu cuenta ya pertenece al bando ${cuenta.bando}.` 
        });
    }

    const slotNum = parseInt(slotIndex);
    const nuevoPersonaje = { nombre: nombreHeroe, clase, bando, slot: slotNum };
    const indexExistente = cuenta.personajes.findIndex(p => p.slot === slotNum);

    if (indexExistente !== -1) {
        cuenta.personajes[indexExistente] = nuevoPersonaje;
    } else {
        cuenta.personajes.push(nuevoPersonaje);
    }

    // Guardar en disco
    try {
        fs.writeFileSync(DB_PATH, JSON.stringify(baseDatosSimulada, null, 2));
        console.log(`💾 Personaje guardado: ${nombreHeroe} para ${usuarioId}`);
    } catch (err) {
        console.error("❌ Error guardando en usuarios.db:", err);
    }

    res.json({ success: true, bandoAsignado: cuenta.bando });
});

// --- 📝 RUTA: REGISTRO DE NUEVOS USUARIOS ---
app.post("/registro", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send("Nombre de usuario y contraseña son requeridos.");
    }

    // Verificar si el usuario ya existe
    if (baseDatosSimulada[username]) {
        return res.send("El nombre de guerrero ya está en uso. <a href='/login-page'>Intenta iniciar sesión</a>");
    }

    // Crear el nuevo usuario
    baseDatosSimulada[username] = {
        password: password, // Nota: En producción usar bcrypt para encriptar
        bando: null,
        personajes: []
    };

    // Persistir en el archivo .db
    try {
        fs.writeFileSync(DB_PATH, JSON.stringify(baseDatosSimulada, null, 2));
        console.log(`✨ Nuevo guerrero registrado: ${username}`);
        res.redirect("/login-page"); // Redirige al login tras éxito
    } catch (err) {
        console.error("❌ Error al escribir en usuarios.db:", err);
        res.status(500).send("Error interno al crear la cuenta.");
    }
});

// --- 🗺️ RUTAS DE NAVEGACIÓN ---
app.get("/", (req, res) => res.sendFile(path.join(templates, "index.html")));
app.get("/login-page", (req, res) => res.sendFile(path.join(templates, "login.html")));
app.get("/perfil", (req, res) => res.sendFile(path.join(templates, "perfil.html")));
app.get("/seleccion", (req, res) => res.sendFile(path.join(templates, "seleccion.html")));
app.get("/menu", (req, res) => res.sendFile(path.join(templates, "menu.html")));
app.get("/game", (req, res) => res.sendFile(path.join(templates, "game.html")));

app.post("/login", (req, res) => {
    // Aquí podrías validar la contraseña contra baseDatosSimulada[username].password
    res.redirect("/perfil");
});

// --- 🚀 INICIO DEL SERVIDOR ---
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`-------------------------------------------`);
    console.log(`⚔️  SISTEMA DE VIKINGOS VS SAJONES ACTIVO ⚔️`);
    console.log(`📍 URL: http://localhost:${PORT}`);
    console.log(`-------------------------------------------`);
});