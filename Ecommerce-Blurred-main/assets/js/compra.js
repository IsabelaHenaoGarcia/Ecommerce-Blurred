(() => {
  const status = new URLSearchParams(window.location.search).get('status');
  const eyebrow = document.querySelector('#resultEyebrow');
  const title = document.querySelector('#resultTitle');
  const message = document.querySelector('#resultMessage');
  const mark = document.querySelector('#resultMark');
  const primary = document.querySelector('#resultPrimary');

  if (status === 'success') {
    eyebrow.textContent = 'VERIFICANDO TU PAGO';
    title.textContent = 'Un momento, por favor.';
    message.textContent = 'Estamos confirmando el estado de tu pago con Stripe.';
    primary.href = '../pages/blurred_web.html';
    primary.innerHTML = 'Volver al inicio <i class="fa-solid fa-arrow-right"></i>';
    const sessionId = new URLSearchParams(window.location.search).get('session_id');
    if (!sessionId) { showVerificationError(); return; }
    fetch(`${window.BLURRED_API_URL || 'http://localhost:3000'}/checkout-session/${encodeURIComponent(sessionId)}`)
      .then(async response => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || 'No se pudo verificar el pago.');
        if (data.payment_status !== 'paid') throw new Error('Stripe todavía no confirma el pago.');
        eyebrow.textContent = 'PAGO CONFIRMADO';
        title.textContent = 'Gracias por elegir Blurred.';
        message.textContent = 'Tu pago fue recibido. Stripe enviará el comprobante al correo asociado a tu método de pago.';
        mark.innerHTML = '<i class="fa-solid fa-check"></i>';
        try { localStorage.removeItem('carrito'); } catch (_error) { /* La confirmación no depende del almacenamiento local. */ }
      })
      .catch(showVerificationError);
  } else if (status === 'cancelled') {
    eyebrow.textContent = 'TU BOLSA SIGUE AQUÍ';
    title.textContent = 'El pago quedó pendiente.';
    message.textContent = 'No se realizó ningún cobro. Puedes volver a tu bolsa y continuar cuando quieras.';
    mark.classList.add('cancelled');
    mark.innerHTML = '<i class="fa-solid fa-arrow-rotate-left"></i>';
    primary.href = '../pages/blurred_web.html#coleccion';
    primary.innerHTML = 'Volver a la colección <i class="fa-solid fa-arrow-right"></i>';
  } else {
    eyebrow.textContent = 'BLURRED · CHECKOUT';
    title.textContent = 'Tu compra, a tu ritmo.';
    message.textContent = 'Desde aquí puedes volver a la tienda y descubrir la colección.';
  }

  function showVerificationError(error) {
    eyebrow.textContent = 'PAGO AÚN SIN CONFIRMAR';
    title.textContent = 'Estamos revisando tu pedido.';
    message.textContent = `${error && error.message ? error.message : 'No pudimos verificar el pago ahora.'} Conservamos tu bolsa; contáctanos si ya recibiste un comprobante de Stripe.`;
    mark.classList.add('cancelled');
    mark.innerHTML = '<i class="fa-solid fa-clock"></i>';
    primary.href = '../pages/contacto.html';
    primary.innerHTML = 'Contactar a Blurred <i class="fa-solid fa-arrow-right"></i>';
  }
})();
