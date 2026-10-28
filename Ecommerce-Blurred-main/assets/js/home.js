(() => {
  const $ = (selector) => document.querySelector(selector);
  const drawer = $('#cartDrawer');
  const backdrop = $('#cartBackdrop');
  const itemsNode = $('#drawerItems');
  const emptyNode = $('#drawerEmpty');
  const footerNode = $('#drawerFooter');
  const countNode = $('#homeCartCount');
  let cart = readCart();
  let toastTimer;

  function readCart() {
    try {
      const value = JSON.parse(localStorage.getItem('carrito') || '{}');
      return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
    } catch (_error) { return {}; }
  }
  function saveCart() {
    try { localStorage.setItem('carrito', JSON.stringify(cart)); }
    catch (_error) { showToast('No pudimos guardar tu bolsa en este dispositivo.'); }
  }
  function formatPrice(value) {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value);
  }
  function totalCount() { return Object.values(cart).reduce((sum, item) => sum + (Number(item.cantidad) || 0), 0); }
  function render() {
    const count = totalCount();
    countNode.textContent = count;
    countNode.style.display = count > 0 ? 'inline-flex' : 'none';
    $('#drawerCount').textContent = `(${count})`;
    itemsNode.replaceChildren();
    let subtotal = 0;
    Object.entries(cart).forEach(([id, item]) => {
      const quantity = Math.max(0, Number(item.cantidad) || 0);
      const price = Math.max(0, Number(item.precio) || 0);
      if (!quantity) return;
      subtotal += price * quantity;
      const row = document.createElement('article');
      row.className = 'drawer-item';
      const image = document.createElement('img');
      image.src = `../assets/images/${imageFor(item.sku || id)}`;
      image.alt = '';
      const details = document.createElement('div');
      const title = document.createElement('h3');
      title.textContent = item.nombre || 'Prenda Blurred';
      const meta = document.createElement('p');
      meta.textContent = item.talla ? `Talla ${item.talla} · Colección Blurred` : 'Colección Blurred';
      const controls = document.createElement('div');
      controls.className = 'quantity-controls';
      controls.innerHTML = `<button type="button" data-qty="-1" data-id="${escapeAttr(id)}" aria-label="Quitar una unidad">−</button><span>${quantity}</span><button type="button" data-qty="1" data-id="${escapeAttr(id)}" aria-label="Añadir una unidad">+</button>`;
      details.append(title, meta, controls);
      const priceNode = document.createElement('strong');
      priceNode.textContent = formatPrice(price * quantity);
      row.append(image, details, priceNode);
      itemsNode.append(row);
    });
    $('#cartSubtotal').textContent = formatPrice(subtotal);
    emptyNode.hidden = count > 0;
    footerNode.hidden = count === 0;
  }
  function imageFor(id) {
    const known = { hombre1:'hombre1.jpg', hombre2:'hombre2.jpg', 'abrigo-alaska':'mujer3.jpg', 'camiseta-oversize':'mujer1.jpg' };
    return known[id] || 'img1.jpg';
  }
  function escapeAttr(value) { return String(value).replace(/[&"'<>]/g, char => ({'&':'&amp;','"':'&quot;',"'":'&#39;','<':'&lt;','>':'&gt;'}[char])); }
  function showToast(message) {
    const toast = $('#homeToast'); toast.textContent = message; toast.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('show'), 2300);
  }
  function setDrawer(open) {
    drawer.classList.toggle('open', open); backdrop.classList.toggle('open', open);
    drawer.setAttribute('aria-hidden', String(!open)); document.body.classList.toggle('drawer-open', open);
    if (open) $('#closeCart').focus(); else $('#openCart').focus();
  }
  function addItem(button) {
    const { id, name, price } = button.dataset;
    if (!id || !name || !Number.isFinite(Number(price)) || Number(price) <= 0) return;
    if (cart[id]) cart[id].cantidad = (Number(cart[id].cantidad) || 0) + 1;
    else cart[id] = { nombre: name, precio: Number(price), cantidad: 1, categoria: 'destacados' };
    saveCart(); render(); showToast(`${name} se añadió a tu bolsa.`);
  }
  document.addEventListener('click', event => {
    const addButton = event.target.closest('[data-add]');
    if (addButton) addItem(addButton);
    const qtyButton = event.target.closest('[data-qty]');
    if (qtyButton) {
      const id = qtyButton.dataset.id;
      if (!cart[id]) return;
      cart[id].cantidad = (Number(cart[id].cantidad) || 0) + Number(qtyButton.dataset.qty);
      if (cart[id].cantidad <= 0) delete cart[id];
      saveCart(); render();
    }
  });
  $('#openCart').addEventListener('click', () => setDrawer(true));
  $('#closeCart').addEventListener('click', () => setDrawer(false));
  $('#continueShopping').addEventListener('click', () => setDrawer(false));
  backdrop.addEventListener('click', () => setDrawer(false));
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && drawer.classList.contains('open')) setDrawer(false); });
  $('#checkoutButton').addEventListener('click', () => {
    if (typeof window.iniciarPago !== 'function') { showToast('El servicio de pago no está disponible.'); return; }
    const button = $('#checkoutButton'); button.disabled = true; button.innerHTML = 'Conectando con Stripe… <i class="fa-solid fa-spinner fa-spin"></i>';
    window.iniciarPago().finally(() => { button.disabled = false; button.innerHTML = 'Continuar al pago <i class="fa-solid fa-arrow-right"></i>'; });
  });
  $('#homeSearch').addEventListener('input', event => {
    const query = event.target.value.trim().toLocaleLowerCase('es'); let visible = 0;
    document.querySelectorAll('.home-product').forEach(card => {
      const matches = card.dataset.search.includes(query); card.hidden = !matches; if (matches) visible++;
    });
    $('#noProducts').hidden = visible !== 0;
  });
  $('#menuToggle').addEventListener('click', event => {
    const open = $('#mainNav').classList.toggle('open'); event.currentTarget.setAttribute('aria-expanded', String(open));
  });
  $('#newsletterForm').addEventListener('submit', event => {
    event.preventDefault(); const email = $('#newsletterEmail');
    if (!email.reportValidity()) return;
    $('#newsletterMessage').textContent = '¡Listo! En esta demo, tu suscripción quedó registrada visualmente.';
    event.currentTarget.reset();
  });
  render();
  const fog = document.querySelector('.fondo-dinamico');
  if (fog) {
    const scenes = ['img1.jpg', 'img3.jpg', 'img6.jpg', 'img8.jpg', 'img10.jpg'];
    let scene = 0;
    fog.style.backgroundImage = `url('../assets/images/${scenes[scene]}')`;
    window.setInterval(() => {
      scene = (scene + 1) % scenes.length;
      fog.style.backgroundImage = `url('../assets/images/${scenes[scene]}')`;
    }, 9000);
  }
  if (new URLSearchParams(window.location.search).get('carrito') === 'abrir') setDrawer(true);
})();
