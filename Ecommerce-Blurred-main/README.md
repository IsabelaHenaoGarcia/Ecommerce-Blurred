# Blurred — tienda de moda

Tienda web estática en español con catálogo, páginas de categoría, registro e inicio de sesión locales, perfil, carrito y un backend Express para crear sesiones de pago con Stripe. La interfaz y la lógica son tradicionales; el proyecto no necesita funciones generativas ni servicios de IA.

## Estructura

```text
.
├── index.html                 # Entrada que abre la tienda
├── pages/                     # Home, tienda, fichas de producto y páginas de cuenta/compra
├── assets/
│   ├── css/                   # Hojas de estilo
│   ├── js/                    # Lógica del navegador
│   └── images/                # Fotografías del catálogo
└── backend/                   # API Express y configuración de Stripe
```

## Requisitos

- Node.js 18 o superior.
- Dependencias del backend instaladas desde `backend/`.
- Una clave secreta de Stripe para habilitar pagos (opcional para explorar la tienda).

## Ejecución local

1. En una terminal, instala e inicia el backend:

   ```bash
   cd backend
   npm install
   ```

2. Para pagos, copia `.env.example` a `.env` y configura `STRIPE_SECRET_KEY`. Nunca publiques ese archivo ni incluyas la clave secreta en el frontend.

3. Inicia la API:

   ```bash
   npm start
   ```

4. Sirve la carpeta raíz con un servidor estático, por ejemplo VS Code Live Server, y abre `index.html`. Con Live Server en el puerto 5500 las URLs locales de retorno de Stripe quedan preparadas. La API expone `GET /health`, `POST /create-checkout-session` y `GET /checkout-session/:id` para verificar el pago.

## Datos y límites actuales

Las cuentas y el carrito se guardan en `localStorage`; no existe persistencia ni autenticación de servidor. Los productos y precios cobrados se validan en el catálogo del backend en COP. Actualiza ese catálogo junto con la tienda al añadir productos. Configura `FRONTEND_URL` y `FRONTEND_ORIGIN` para el entorno que vayas a utilizar.
