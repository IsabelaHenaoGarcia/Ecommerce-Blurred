function toggleMenu() {
  const navLinks = document.getElementById('navLinks');
  navLinks.classList.toggle('show');
}

// Función para filtrar productos
function filtrarProductos() {
  const filtroNombre = document.getElementById("filtroNombre").value.toLowerCase();
  const filtroCategoria = document.getElementById("filtroCategoria").value;
  const barraBusquedaSuperior = document.querySelector(".search-bar input").value.toLowerCase();

  const nombreFiltroActivo = filtroNombre || barraBusquedaSuperior;

  document.querySelectorAll(".producto").forEach(producto => {
    const nombreProducto = producto.querySelector("h3").textContent.toLowerCase();
    const categoriaProducto = producto.getAttribute("data-categoria");

    const coincideNombre = nombreProducto.includes(nombreFiltroActivo);
    const coincideCategoria = filtroCategoria === "" || filtroCategoria === categoriaProducto;

    producto.style.display = (coincideNombre && coincideCategoria) ? "block" : "none";
  });
}

function mostrarMensaje(mensaje) {
  const contenedor = document.querySelector('.mensaje-container');
  const divMensaje = document.createElement('div');
  divMensaje.classList.add('mensaje');
  divMensaje.textContent = mensaje;

  contenedor.appendChild(divMensaje);

  setTimeout(() => {
    divMensaje.remove();
  }, 3000);
}

let carrito = {};
try {
  const almacenado = localStorage.getItem("carrito");
  carrito = almacenado ? JSON.parse(almacenado) : {};
} catch (e) {
  console.error("Error al leer el carrito desde localStorage", e);
  carrito = {};
}

// Función para actualizar carrito en localStorage
function guardarCarrito() {
  localStorage.setItem("carrito", JSON.stringify(carrito));
}

// Función para obtener total de productos en carrito (sumar cantidades)
function totalProductosCarrito() {
  return Object.values(carrito).reduce((total, producto) => total + producto.cantidad, 0);
}

// Función para actualizar el contador en el DOM
function actualizarContadorCarrito() {
  const contadorElemento = document.querySelector(".contador-carrito");
  const total = totalProductosCarrito();
  contadorElemento.textContent = total;
  contadorElemento.style.display = total > 0 ? "inline-block" : "none";
}

// Función para añadir producto al carrito
function anadirProducto(id, nombre, precio, categoria) {
  if(carrito[id]) {
    carrito[id].cantidad++;
  } else {
    carrito[id] = { nombre, cantidad: 1, precio, categoria };
  }
  guardarCarrito();
  actualizarContadorCarrito();
  actualizarResumenCarrito();
  mostrarMensaje(`Producto ${nombre} añadido al carrito`);
}

function quitarProducto(id) {
  if (carrito[id]) {
    const nombreProducto = carrito[id].nombre; // Guardamos el nombre antes

    carrito[id].cantidad--;
    if (carrito[id].cantidad <= 0) {
      delete carrito[id];
      mostrarMensaje(`Producto ${nombreProducto} eliminado del carrito`);
    } else {
      mostrarMensaje(`Producto ${nombreProducto} quitado del carrito`);
    }

    guardarCarrito();
    actualizarContadorCarrito();
    actualizarResumenCarrito();
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const botonesAnadir = document.querySelectorAll(".btn-anadir");
  const botonesQuitar = document.querySelectorAll(".btn-quitar");

  botonesAnadir.forEach(boton => {
    boton.addEventListener("click", function () {
      const producto = this.closest(".producto");
      const id = producto.getAttribute("data-id");
      const nombre = producto.querySelector("h3").textContent;
      const precioTexto = producto.querySelector("p").textContent.replace("$", "").replace(/\./g, "");
      const precio = parseFloat(precioTexto);
      const categoria = producto.getAttribute("data-categoria");

      anadirProducto(id, nombre, precio, categoria);
    });
  });

  botonesQuitar.forEach(boton => {
    boton.addEventListener("click", function () {
      const producto = this.closest(".producto");
      const id = producto.getAttribute("data-id");

      quitarProducto(id);
    });
  });

  actualizarContadorCarrito();
  actualizarResumenCarrito();
});

function actualizarResumenCarrito() {
  const listaCarrito = document.querySelector(".lista-carrito");
  const mensajeVacio = document.querySelector(".carrito-vacio");

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



// Eventos de filtrado
document.getElementById("filtroNombre").addEventListener("input", filtrarProductos);
document.getElementById("filtroCategoria").addEventListener("change", filtrarProductos);
document.querySelector(".search-bar input").addEventListener("input", filtrarProductos); 

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