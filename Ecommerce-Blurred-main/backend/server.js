require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const port = Number(process.env.PORT) || 3000;
const currency = 'cop';

// Precios canónicos en COP; el navegador solo envía identificador y cantidad.
const catalog = {
  'camiseta-oversize': { name: 'Camiseta Oversize', amount: 45000 },
  'jean-negro': { name: 'Jean Negro', amount: 85000 },
  'chaqueta-de-cuero': { name: 'Chaqueta de Cuero', amount: 65000 },
  'bermuda-de-coleccion': { name: 'Bermuda de Colección', amount: 45000 },
  'bermuda-oversize': { name: 'Bermuda Oversize', amount: 52000 },
  'mini-falda-bratz': { name: 'Mini Falda Bratz', amount: 84000 },
  'abrigo-alaska': { name: 'Abrigo Alaska', amount: 85000 },
  'abrigo-holly': { name: 'Abrigo Holly', amount: 78000 },
  hombre1: { name: 'Camiseta BoxyFit', amount: 60000 },
  hombre2: { name: 'Tech Pant Black', amount: 89000 },
  hombre3: { name: 'Basica Oversize', amount: 40000 },
  hombre4: { name: 'Camibuzo Neo Tribal Black', amount: 65000 },
  hombre5: { name: 'Sobretodo Cuerina', amount: 140000 },
};

app.use(cors({ origin: process.env.FRONTEND_ORIGIN || true }));
app.use(express.json({ limit: '32kb' }));
app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.get('/checkout-session/:id', async (req, res) => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) return res.status(503).json({ error: 'Los pagos no están configurados.' });
  if (!/^cs_(test|live)_[A-Za-z0-9]+$/.test(req.params.id)) return res.status(400).json({ error: 'La referencia de pago no es válida.' });
  try {
    const stripe = require('stripe')(secretKey);
    const session = await stripe.checkout.sessions.retrieve(req.params.id);
    return res.json({ payment_status: session.payment_status });
  } catch (error) {
    console.error('No se pudo consultar el checkout:', error.message);
    return res.status(404).json({ error: 'No encontramos esa sesión de pago.' });
  }
});
app.post('/create-checkout-session', async (req, res) => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) return res.status(503).json({ error: 'Los pagos no están configurados.' });
  const items = req.body && req.body.items;
  if (!Array.isArray(items) || items.length === 0 || items.length > 50) {
    return res.status(400).json({ error: 'El carrito no es válido.' });
  }
  const valid = items.every(item => item && typeof item.id === 'string' && catalog[item.id] && (!item.size || ['S', 'M', 'L', 'XL'].includes(item.size)) && Number.isInteger(Number(item.quantity)) && Number(item.quantity) > 0 && Number(item.quantity) <= 99);
  if (!valid) return res.status(400).json({ error: 'Hay productos con datos inválidos.' });
  try {
    const stripe = require('stripe')(secretKey);
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5500/pages';
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: items.map(item => ({
        price_data: { currency, product_data: { name: `${catalog[item.id].name}${item.size ? ` · Talla ${item.size}` : ''}` }, unit_amount: catalog[item.id].amount * 100 },
        quantity: Number(item.quantity),
      })),
      success_url: `${baseUrl}/compra.html?status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/compra.html?status=cancelled`,
    });
    return res.json({ url: session.url });
  } catch (error) {
    console.error('No se pudo crear el checkout:', error.message);
    return res.status(502).json({ error: 'No se pudo iniciar el pago. Inténtalo de nuevo.' });
  }
});
app.listen(port, () => console.log(`Backend escuchando en http://localhost:${port}`));
