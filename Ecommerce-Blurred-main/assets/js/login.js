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

  const form = document.getElementById('form-login');
  const errorDiv = document.getElementById('login-error');

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    const correo = form.correo.value.trim();
    const password = form.password.value.trim();

    // Validación de campos vacíos
    if (!correo || !password) {
      errorDiv.textContent = 'Por favor, completa todos los campos.';
      errorDiv.style.display = 'block';
      return;
    }

    // Buscar usuario en el array de usuarios
    const usuarios = JSON.parse(localStorage.getItem('usuarios_blurred')) || [];
    const usuario = usuarios.find(u => u.correo === correo && u.password === password);

    if (usuario) {
      localStorage.setItem('usuario', JSON.stringify(usuario));
      errorDiv.style.display = 'none';
      window.location.href = '../pages/perfil.html';
    } else {
      errorDiv.textContent = 'Correo o contraseña incorrectos.';
      errorDiv.style.display = 'block';
    }
  });

  form.correo.addEventListener('input', function() {
    errorDiv.style.display = 'none';
  });

  form.password.addEventListener('input', function() {
    errorDiv.style.display = 'none';
  });
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