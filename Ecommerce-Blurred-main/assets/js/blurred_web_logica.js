// === Menú hamburguesa ===

function toggleMenu() {
  const navLinks = document.getElementById('navLinks');
  navLinks.classList.toggle('show');
}



document.addEventListener('DOMContentLoaded', function () {
  // === Popup de usuario ===
  let usuario = null;
  try { usuario = JSON.parse(localStorage.getItem('usuario') || 'null'); } catch (_error) { usuario = null; }
  const popupNombre = document.getElementById('popup-nombre');
  const popupEmail = document.getElementById('popup-email');
  if (usuario && popupNombre && popupEmail) {
    popupNombre.textContent = usuario.nombre || '';
    popupEmail.textContent = usuario.correo || usuario.email || '';
  } else if (popupNombre && popupEmail) {
    popupNombre.textContent = 'Invitado';
    popupEmail.textContent = '';
  }

  // === Popup de carrito ===
  const listaCarrito = document.querySelector('.lista-carrito');
  const mensajeVacio = document.querySelector('.carrito-vacio');
  let carrito = {};
  try {
    const almacenado = localStorage.getItem("carrito");
    carrito = almacenado ? JSON.parse(almacenado) : {};
  } catch (e) {
    carrito = {};
  }

  if (listaCarrito && mensajeVacio) {
    listaCarrito.innerHTML = "";
    const items = Object.values(carrito);
    if (items.length === 0) {
      mensajeVacio.style.display = "block";
    } else {
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
  }

  // === Contador de carrito ===
  const contadorCarrito = document.querySelector(".contador-carrito");
  const totalProductos = Object.values(carrito).reduce((total, producto) => total + producto.cantidad, 0);
  if (contadorCarrito && contadorCarrito.id !== 'homeCartCount') {
    contadorCarrito.textContent = totalProductos;
    contadorCarrito.style.display = totalProductos > 0 ? "inline-block" : "none";
  }

  // === Redirección del icono de usuario según sesión ===
  const usuarioLink = document.getElementById('usuario-link');
  if (usuarioLink) {
    usuarioLink.addEventListener('click', function(e) {
      e.preventDefault();
      let usuario = null;
  try { usuario = JSON.parse(localStorage.getItem('usuario') || 'null'); } catch (_error) { usuario = null; }
      if (usuario) {
        window.location.href = '../pages/perfil.html';
      } else {
        window.location.href = '../pages/registro.html';
      }
    });
  }
});

function iniciarPago() {
  let carrito = {};
  try {
    const almacenado = localStorage.getItem("carrito");
    carrito = almacenado ? JSON.parse(almacenado) : {};
  } catch (e) {
    console.error("No se pudo leer el carrito");
    alert("No pudimos leer tu bolsa. Actualiza la página e inténtalo de nuevo.");
    return Promise.resolve();
  }

  const items = Object.entries(carrito).filter(([, producto]) => Number(producto.cantidad) > 0).map(([key, producto]) => ({
    id: producto.sku || key.split('::')[0],
    size: producto.talla || null,
    quantity: Number(producto.cantidad)
  }));

  if (items.length === 0) {
    alert("El carrito está vacío o contiene productos inválidos.");
    return Promise.resolve();
  }

  return fetch(`${window.BLURRED_API_URL || 'http://localhost:3000'}/create-checkout-session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items })
  })
    .then(async (res) => {
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'No se pudo iniciar el pago.');
      if (!data.url) throw new Error('El servidor no devolvió el enlace de pago.');
      window.location.assign(data.url);
    })
    .catch((err) => {
      console.error('Error al iniciar el pago:', err);
      alert(err.message || 'Hubo un error al iniciar el pago.');
    });
}
