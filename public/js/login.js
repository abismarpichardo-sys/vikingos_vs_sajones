/**
 * VIKINGOS VS SAJONES - Lógica de Inicio de Sesión Sincronizada
 */

document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');

    if (form) {
        form.addEventListener('submit', function(e) {
            // 1. Obtenemos el nombre del guerrero del input
            const usernameInput = document.querySelector('input[name="username"]');
            const username = usernameInput ? usernameInput.value.trim() : "";

            if (username) {
                // 2. Lo guardamos en el localStorage para que el Perfil y el Juego lo reconozcan
                localStorage.setItem("nombreJugador", username);
                
                // 3. Limpiamos cualquier rastro de sesiones anteriores para evitar errores
                localStorage.removeItem("bandoBloqueado");
                localStorage.removeItem("currentSlot");
                
                console.log(`⚔️ Preparando el viaje para el guerrero: ${username}`);
            }
            
            // El formulario seguirá su curso hacia el action="/login" del servidor
        });
    }
});

// Función por si necesitas mostrar el panel con alguna animación
function mostrarLogin() {
    const panel = document.getElementById("loginPanel");
    if (panel) {
        panel.style.display = "block";
        panel.style.opacity = "0";
        setTimeout(() => {
            panel.style.transition = "opacity 1s";
            panel.style.opacity = "1";
        }, 100);
    }
}