# ⚔️ Vikingos vs Sajones: Rebirth

Una experiencia **web 3D de alto rendimiento** construida con **Three.js y Node.js**, donde el honor y la estrategia se encuentran en un campo de batalla realista y optimizado.

Elige tu **bando y tu clase**, domina el terreno y lucha por la gloria en un mundo medieval interactivo con **animaciones fluidas y gráficos avanzados**.

---

# 🚀 Características Principales

## 🎭 Personajes Realistas y Animaciones

**Modelos Low-Poly Avanzados**  
Personajes con estructuras óseas (**rigging**) cargados mediante `GLTFLoader`.

**Sistema de Animación**  
Mezcla de estados (**State Machine**) para transiciones suaves entre:

- Idle
- Walk
- Attack
- Death

**Diversidad de Clases**

Soporte para diferentes clases organizadas por facción:

- Berserkers
- Arqueros
- Magos
- Guerreros

---

## 🌍 Gráficos y Optimización

**Compresión Draco**  
Uso de `DRACOLoader` para reducir el peso de los modelos 3D **hasta en un 90% sin pérdida de calidad**.

**Atmósfera Inmersiva**

- Niebla dinámica (Fog)
- Iluminación ambiental
- Sombras en tiempo real

**Zoom Híbrido**

Control de cámara adaptable mediante:

- Rueda del ratón
- Teclas **+ / -** (ideal para laptops)

---

## 👤 Gestión de Usuarios y Persistencia

**Autenticación Segura**

Registro e inicio de sesión con **encriptación de contraseñas mediante bcrypt**.

**Base de Datos Dual**

**SQLite**

- Persistencia de perfiles
- Clases
- Estadísticas del jugador

**localStorage**

- Gestión de sesión rápida
- Bando activo en el cliente

---

# 🛠️ Stack Tecnológico

| Tecnología | Uso |
|-------------|------|
| Three.js (r128) | Motor principal de renderizado 3D |
| Node.js + Express | Servidor backend y API REST |
| SQLite / Better-SQLite3 | Base de datos de usuarios |
| Draco Compression | Compresión de modelos 3D |
| Adobe Mixamo | Animaciones esqueléticas |

---

# 📂 Estructura del Proyecto

```
vikingos_vs_sajones_web
│
├── public
│   ├── css/          # Estilos del menú y UI
│   ├── js/           # Lógica de login y core del juego
│   └── models/       # Modelos 3D optimizados (.glb)
│       ├── vikingos/
│       │   └── Berserker/
│       │       ├── idle.glb
│       │       ├── walk.glb
│       │       ├── attack.glb
│       │       └── death.glb
│       │
│       └── sajones/
│           └── Caballero/
│
├── templates/        # Vistas HTML (Login, Selección, Juego)
├── database.db       # Datos del mundo
├── usuarios.db       # Registro de jugadores
└── server.js         # Servidor principal
```

---

# 🕹️ Cómo Empezar

## 📌 Requisitos Previos

- **Node.js v14 o superior**
- **npm**
- Conexión a internet (para cargar decodificadores Draco y librerías vía CDN)

---

## ⚙️ Instalación

Clona o descarga este repositorio.

Abre una terminal en la carpeta del proyecto:

```bash
cd vikingos-vs-sajones_web
```

Instala las dependencias necesarias:

```bash
npm install express better-sqlite3 bcrypt body-parser
```

---

## ▶️ Ejecutar el Servidor

```bash
node server.js
```

Luego abre tu navegador en:

```
http://localhost:3000
```

---

# 🎮 Controles del Juego

| Control | Acción |
|--------|--------|
| W A S D | Movimiento del guerrero |
| Click izquierdo | Ejecutar ataque |
| Rueda del mouse | Zoom In / Out |
| Teclas + / - | Zoom alternativo (Laptop) |

---

# 🔮 Futuras Mejoras

- [ ] Sistema de **portales** entre mapas  
- [ ] **Combate con colisiones** realistas  
- [ ] **Sistema de inventario** (armas y armaduras)  
- [ ] **Multijugador** con WebSockets  
- [ ] **IA enemiga** con patrullaje y ataque  
- [ ] **Mapa abierto más grande**

---

💡 Guía visual para colocar nuevos objetos (Guia de coordenadas)

-Z (Hacia el fondo)
                -500
                 |
   (-500, -500)  |  (500, -500)
         [RUINAS]|  [CASTILLO 1]
-X <-------------0-------------> +X (Derecha)
  -500           |           500
         [CAST. 2]|  [ACADEMIA]
   (-500, 500)   |  (500, 500)
                 |
                500
           +Z (Hacia la cámara)


           
# 👨‍💻 Autor

**Abismar Pichardo**

---

# 📜 Licencia

