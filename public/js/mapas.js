const CONFIG_MAPAS = {
    "bosque": {
        nombre: "Valle de Midgard",
        archivo: "mundo_vikingo.glb", // Este no se usa en el bosque por tu lógica de islas, pero lo dejamos por si acaso
        textura: "suelo_bosque.jpg", 
        colorNiebla: 0x445544,
        clima: "ninguno"
    },
    "nieve": {
        nombre: "Cumbres de Jötunheim",
        archivo: "mundo_nieve.glb",
        textura: "suelo_nieve.jpg",
        colorNiebla: 0xddddff,
        clima: "nieve"
    },
    "fuego": {
        nombre: "Tierras de Muspelheim",
        archivo: "mundo_fuego.glb",
        textura: "suelo_volcanico.jpg", // Nombre exacto según tu captura de archivos
        colorNiebla: 0x220000,
        clima: "ceniza"
    }
};