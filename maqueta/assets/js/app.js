/* ================================================== */
/* ARCHIVO PRINCIPAL DE JAVASCRIPT - PELUQUERÍA CANINA */
/* ================================================== */

// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    console.log('Peluquería Canina - JavaScript cargado correctamente');

    // ================================================== //
    // LÓGICA DE LOGIN Y REDIRECCIÓN
    // ================================================== //
    
    const formularioLogin = document.getElementById('formulario-login');
    
    if (formularioLogin) {
        formularioLogin.addEventListener('submit', function(evento) {
            // Prevenir el envío del formulario
            evento.preventDefault();
            
            // Obtener los valores del email y contraseña
            const emailLogin = document.getElementById('email-login');
            const passwordLogin = document.getElementById('password-login');
            
            if (emailLogin && passwordLogin) {
                const email = emailLogin.value.trim();
                const password = passwordLogin.value.trim();
                
                // Lógica de autenticación simple
                if (email === 'admin@pelupet.cl' && password === 'admin123') {
                    // Credenciales de administrador
                    alert('¡Bienvenido, Administrador! Redirigiendo al panel de administración...');
                    // Redirigir al panel de administración
                    window.location.href = 'admin/index.html';
                } else {
                    // Cualquier otro caso (cliente)
                    alert('¡Bienvenido! Has iniciado sesión como cliente. Redirigiendo...');
                    // Redirigir a la página principal
                    window.location.href = 'index.html';
                }
            }
        });
    }

    // ================================================== //
    // LÓGICA DE VALIDACIÓN DE REGISTRO
    // ================================================== //
    
    const formularioRegistro = document.getElementById('formulario-registro');
    
    if (formularioRegistro) {
        formularioRegistro.addEventListener('submit', function(evento) {
            // Prevenir el envío del formulario
            evento.preventDefault();
            
            // Obtener los campos del formulario
            const nombreCompleto = document.getElementById('nombre-completo');
            const emailRegistro = document.getElementById('email-registro');
            const passwordRegistro = document.getElementById('password-registro');
            const confirmarPassword = document.getElementById('confirmar-password');
            
            let esValido = true;
            
            // Validar campo nombre completo
            if (nombreCompleto) {
                if (nombreCompleto.value.trim() === '') {
                    nombreCompleto.classList.add('is-invalid');
                    esValido = false;
                } else {
                    nombreCompleto.classList.remove('is-invalid');
                    nombreCompleto.classList.add('is-valid');
                }
            }
            
            // Validar campo email
            if (emailRegistro) {
                if (emailRegistro.value.trim() === '') {
                    emailRegistro.classList.add('is-invalid');
                    esValido = false;
                } else {
                    emailRegistro.classList.remove('is-invalid');
                    emailRegistro.classList.add('is-valid');
                }
            }
            
            // Validar campo contraseña
            if (passwordRegistro) {
                if (passwordRegistro.value.trim() === '') {
                    passwordRegistro.classList.add('is-invalid');
                    esValido = false;
                } else {
                    passwordRegistro.classList.remove('is-invalid');
                    passwordRegistro.classList.add('is-valid');
                }
            }
            
            // Validar confirmación de contraseña
            if (confirmarPassword) {
                if (confirmarPassword.value.trim() === '') {
                    confirmarPassword.classList.add('is-invalid');
                    esValido = false;
                } else if (passwordRegistro && confirmarPassword.value !== passwordRegistro.value) {
                    confirmarPassword.classList.add('is-invalid');
                    // Cambiar mensaje de error dinámicamente
                    const feedbackElement = confirmarPassword.nextElementSibling;
                    if (feedbackElement && feedbackElement.classList.contains('invalid-feedback')) {
                        feedbackElement.textContent = 'Las contraseñas no coinciden.';
                    }
                    esValido = false;
                } else {
                    confirmarPassword.classList.remove('is-invalid');
                    confirmarPassword.classList.add('is-valid');
                    // Restaurar mensaje original
                    const feedbackElement = confirmarPassword.nextElementSibling;
                    if (feedbackElement && feedbackElement.classList.contains('invalid-feedback')) {
                        feedbackElement.textContent = 'Debes confirmar tu contraseña.';
                    }
                }
            }
            
            // Si todos los campos son válidos
            if (esValido) {
                alert('¡Registro exitoso! Bienvenido a PeluPet. Ahora puedes iniciar sesión.');
                // Opcional: redirigir a login
                window.location.href = 'login.html';
            }
        });
    }

    // ================================================== //
    // LÓGICA DE VALIDACIÓN DE CONTACTO
    // ================================================== //
    
    const formularioContacto = document.getElementById('formulario-contacto');
    
    if (formularioContacto) {
        formularioContacto.addEventListener('submit', function(evento) {
            // Prevenir el envío del formulario
            evento.preventDefault();
            
            // Obtener los campos del formulario
            const nombreContacto = document.getElementById('nombre-contacto');
            const emailContacto = document.getElementById('email-contacto');
            const mensajeContacto = document.getElementById('mensaje-contacto');
            
            let esValido = true;
            
            // Validar campo nombre
            if (nombreContacto) {
                if (nombreContacto.value.trim() === '') {
                    nombreContacto.classList.add('is-invalid');
                    esValido = false;
                } else {
                    nombreContacto.classList.remove('is-invalid');
                    nombreContacto.classList.add('is-valid');
                }
            }
            
            // Validar campo email
            if (emailContacto) {
                if (emailContacto.value.trim() === '') {
                    emailContacto.classList.add('is-invalid');
                    esValido = false;
                } else {
                    emailContacto.classList.remove('is-invalid');
                    emailContacto.classList.add('is-valid');
                }
            }
            
            // Validar campo mensaje
            if (mensajeContacto) {
                if (mensajeContacto.value.trim() === '') {
                    mensajeContacto.classList.add('is-invalid');
                    esValido = false;
                } else {
                    mensajeContacto.classList.remove('is-invalid');
                    mensajeContacto.classList.add('is-valid');
                }
            }
            
            // Si todos los campos son válidos
            if (esValido) {
                alert('¡Mensaje enviado correctamente! Te contactaremos pronto.');
                // Limpiar el formulario
                formularioContacto.reset();
                // Remover todas las clases de validación
                const campos = formularioContacto.querySelectorAll('.form-control');
                campos.forEach(campo => {
                    campo.classList.remove('is-valid', 'is-invalid');
                });
            }
        });
    }

    // ================================================== //
    // FUNCIONES ADICIONALES PARA MEJORAR LA EXPERIENCIA
    // ================================================== //
    
    // Remover clases de validación cuando el usuario empiece a escribir
    const todosLosCampos = document.querySelectorAll('.form-control');
    
    todosLosCampos.forEach(campo => {
        campo.addEventListener('input', function() {
            // Remover clases de validación mientras el usuario escribe
            this.classList.remove('is-valid', 'is-invalid');
        });
    });
    
    // Efecto smooth scroll para enlaces internos
    const enlacesInternos = document.querySelectorAll('a[href^="#"]');
    
    enlacesInternos.forEach(enlace => {
        enlace.addEventListener('click', function(evento) {
            const href = this.getAttribute('href');
            
            if (href !== '#' && href !== '') {
                evento.preventDefault();
                const elemento = document.querySelector(href);
                
                if (elemento) {
                    elemento.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
    
    // Mensaje de confirmación para enlaces del carrito (simulación)
    const enlacesCarrito = document.querySelectorAll('a[href="#"]:not([data-bs-toggle])');
    
    enlacesCarrito.forEach(enlace => {
        if (enlace.textContent.includes('Carrito') || enlace.textContent.includes('Ver Detalle')) {
            enlace.addEventListener('click', function(evento) {
                evento.preventDefault();
                
                if (this.textContent.includes('Carrito')) {
                    alert('Función de carrito en desarrollo. Próximamente disponible.');
                } else if (this.textContent.includes('Ver Detalle')) {
                    // Simular navegación a detalle (en una aplicación real sería dinámico)
                    window.location.href = 'detalle-servicio.html';
                }
            });
        }
    });
    
    console.log('Todas las funcionalidades de JavaScript han sido inicializadas correctamente.');
});
