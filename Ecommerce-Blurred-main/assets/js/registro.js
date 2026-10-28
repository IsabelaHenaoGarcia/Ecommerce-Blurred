// --- Registro de usuario ---
document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('form-registro');
  if (!form) return;

  form.addEventListener('submit', function(event) {
    event.preventDefault();
    const nombre = document.getElementById('nombre').value.trim();
    const correo = document.getElementById('correo').value.trim();
    const password = document.getElementById('password').value;
    const confirmar = document.getElementById('confirmar').value;

    // Validar campos vacíos
    if (!nombre || !correo || !password || !confirmar) {
      mostrarToastError('Por favor, completa todos los campos.');
      return;
    }

    // Validar formato de correo
    const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
    if (!correoValido) {
      mostrarToastError('Ingresa un correo electrónico válido.');
      return;
    }

    // Validar contraseñas iguales
    if (password !== confirmar) {
      mostrarToastError('Las contraseñas no coinciden.');
      return;
    }

    let usuarios = JSON.parse(localStorage.getItem('usuarios_blurred')) || [];
    if (usuarios.some(u => u.correo === correo)) {
      mostrarToastError('Este correo ya está registrado.');
      return;
    }

    // Guardar usuario
    usuarios.push({ nombre, correo, password });
    localStorage.setItem('usuarios_blurred', JSON.stringify(usuarios));
    localStorage.setItem('usuario', JSON.stringify({ nombre, correo, password })); // Inicia sesión automáticamente

    mostrarToastExito();
    form.reset();

    setTimeout(() => {
      window.location.href = '../pages/perfil.html';
    }, 1200);
  });
});

function mostrarToastExito() {
  const toast = document.getElementById('toast-exito');
  toast.classList.add('mostrar');
  setTimeout(() => {
    toast.classList.remove('mostrar');
  }, 2500);
}

function mostrarToastError(mensaje) {
  const toast = document.getElementById('toast-error');
  toast.textContent = mensaje;
  toast.classList.add('mostrar');
  setTimeout(() => {
    toast.classList.remove('mostrar');
  }, 2500);
}

// --- Carrito ---
let carrito = {};
try {
  const almacenado = localStorage.getItem("carrito");
  carrito = almacenado ? JSON.parse(almacenado) : {};
} catch (e) {
  carrito = {};
}

function totalProductosCarrito() {
  return Object.values(carrito).reduce((total, producto) => total + producto.cantidad, 0);
}

function actualizarContadorCarrito() {
  const contadorElemento = document.querySelector(".contador-carrito");
  const total = totalProductosCarrito();
  if (contadorElemento) {
    contadorElemento.textContent = total;
    contadorElemento.style.display = total > 0 ? "inline-block" : "none";
  }
}

function actualizarResumenCarrito() {
  const listaCarrito = document.querySelector(".lista-carrito");
  const mensajeVacio = document.querySelector(".carrito-vacio");

  if (!listaCarrito || !mensajeVacio) return;

  listaCarrito.innerHTML = "";

  const items = Object.values(carrito);
  if (items.length === 0) {
    mensajeVacio.style.display = "block";
    return;
  }

  mensajeVacio.style.display = "none";

  let total = 0;

  items.forEach(producto => {
    const li = document.createElement("li");
    const subtotal = producto.precio * producto.cantidad;
    total += subtotal;
    li.textContent = `${producto.nombre} × ${producto.cantidad} - $${subtotal.toLocaleString()}`;
    listaCarrito.appendChild(li);
  });

  const totalLi = document.createElement("li");
  totalLi.textContent = `🧾 Total: $${total.toLocaleString()}`;
  totalLi.style.fontWeight = "bold";
  totalLi.style.marginTop = "10px";
  listaCarrito.appendChild(totalLi);
}

document.addEventListener("DOMContentLoaded", function () {
  actualizarContadorCarrito();
  actualizarResumenCarrito();
});

// Redirección del icono de usuario según sesión
document.addEventListener('DOMContentLoaded', function() {
  const usuarioIcono = document.querySelector('.usuario-icono');
  if (usuarioIcono) {
    usuarioIcono.addEventListener('click', function(e) {
      e.preventDefault();
      const usuario = JSON.parse(localStorage.getItem('usuario'));
      if (usuario) {
        window.location.href = '../pages/perfil.html';
      } else {
        window.location.href = '../pages/registro.html';
      }
    });
  }
});

// Lógica de popup de usuario igual que blurred_web_logica.js
document.addEventListener('DOMContentLoaded', function () {
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  const popupNombre = document.getElementById('popup-nombre');
  const popupEmail = document.getElementById('popup-email');
  const usuarioContainer = document.querySelector('.usuario-container');

  function mostrarDatosUsuario() {
    if (usuario && popupNombre && popupEmail) {
      popupNombre.textContent = usuario.nombre || '';
      popupEmail.textContent = usuario.correo || usuario.email || '';
    }
  }

  function mostrarInvitado() {
    if (popupNombre && popupEmail) {
      popupNombre.textContent = 'Invitado';
      popupEmail.textContent = '';
    }
  }

  // Inicialmente muestra invitado
  mostrarInvitado();

  // Al pasar el mouse por el icono o popup, muestra datos reales
  if (usuarioContainer) {
    usuarioContainer.addEventListener('mouseenter', mostrarDatosUsuario);
    usuarioContainer.addEventListener('mouseleave', mostrarInvitado);
  }
});