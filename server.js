const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
const templates = path.join(__dirname, "public/templates");

// --- RUTAS DE NAVEGACIÓN ---
app.get("/", (req, res) => res.sendFile(path.join(templates, "index.html")));
app.get("/login-page", (req, res) => res.sendFile(path.join(templates, "login.html")));
app.get("/seleccion", (req, res) => res.sendFile(path.join(templates, "seleccion.html")));
app.get("/menu", (req, res) => res.sendFile(path.join(templates, "menu.html")));
app.get("/game", (req, res) => res.sendFile(path.join(templates, "game.html")));

// --- LÓGICA DE LOGIN ---
app.post("/login", (req, res) => {
    // Aquí iría tu validación de DB (sqlite)
    // Al tener éxito, mandamos al PERFIL (Selección)
    res.redirect("/seleccion");
});

app.listen(3000, () => console.log("Servidor Medieval en http://localhost:3000"));