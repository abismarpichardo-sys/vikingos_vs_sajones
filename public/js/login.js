/**
 * VIKINGOS VS SAJONES - Lógica de Inicio de Sesión
 */

function mostrarLogin() {
    const panel = document.getElementById("loginPanel");
    if (panel) {
        panel.style.display = "block";
    }
}

// Esta función se activará cuando el usuario haga clic en el botón
function entrarJuego(event) {
    // 1. Mostramos el mensaje épico
    alert("⚔️ ¡Las puertas del reino se abren! Entrando al mundo de Vikingos vs Sajones...");
    
    // 2. No necesitamos hacer un "window.location" aquí 
    // porque el atributo 'action="/login"' del HTML se encarga 
    // de hablar con el servidor.
}

// OPCIONAL: Si quieres manejar el login por AJAX (más profesional)
// puedes usar este código para interceptar el envío:
/*
document.querySelector('form').addEventListener('submit', function(e) {
    console.log("Enviando credenciales al Valhalla...");
});
*/