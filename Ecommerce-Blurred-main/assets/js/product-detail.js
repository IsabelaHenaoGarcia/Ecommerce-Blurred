(() => {
  const page = document.querySelector('.product-detail');
  const sizeButtons = [...document.querySelectorAll('[data-size]')];
  const toast = document.querySelector('#productToast');
  let selectedSize = '';
  let toastTimer;
  sizeButtons.forEach(button => button.addEventListener('click', () => {
    sizeButtons.forEach(option => option.classList.toggle('selected', option === button));
    selectedSize = button.dataset.size;
    document.querySelector('#sizeError').textContent = '';
  }));
  document.querySelector('#addToBag').addEventListener('click', () => {
    if (!selectedSize) { document.querySelector('#sizeError').textContent = 'Elige una talla para continuar.'; return; }
    const { productId, productName, productPrice, productCategory } = page.dataset;
    const key = `${productId}::${selectedSize}`;
    let cart = {};
    try {
      const stored = JSON.parse(localStorage.getItem('carrito') || '{}');
      if (stored && typeof stored === 'object' && !Array.isArray(stored)) cart = stored;
    } catch (_error) { cart = {}; }
    if (cart[key]) cart[key].cantidad = (Number(cart[key].cantidad) || 0) + 1;
    else cart[key] = { sku: productId, talla: selectedSize, nombre: productName, precio: Number(productPrice), cantidad: 1, categoria: productCategory };
    try { localStorage.setItem('carrito', JSON.stringify(cart)); }
    catch (_error) { toast.textContent = 'No pudimos guardar tu bolsa en este dispositivo.'; toast.classList.add('show'); return; }
    toast.textContent = `${productName}, talla ${selectedSize}, se añadió a tu bolsa.`;
    toast.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
  });
})();
