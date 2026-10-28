document.getElementById('abrir-chatbot').onclick = function() {
  const ventana = document.getElementById('chatbot-ventana');
  ventana.style.display = (ventana.style.display === 'block') ? 'none' : 'block';
};
document.getElementById('cerrar-chatbot').onclick = function() {
  document.getElementById('chatbot-ventana').style.display = 'none';
};

const chatInput = document.getElementById('chat-input');
const chatBox = document.getElementById('chat-box');
const chatForm = document.getElementById('chat-form');

chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const userMessage = chatInput.value.trim();
  if (!userMessage) return;

  appendMessage('Tú', userMessage);
  chatInput.value = '';

  // Muestra mensaje de "escribiendo..." y guarda el elemento
  const botMsg = appendMessage('BlurredBot', '<em>Escribiendo...</em>');

  // --- CONTEXTO PERSONALIZADO ---
  const contexto = `
Eres el asistente virtual de la tienda Blurred, una tienda de moda urbana en Pereira, Colombia.

Solo puedes responder preguntas relacionadas con:
- Nuestros productos (camisetas, jeans, chaquetas, bermudas, abrigos, mini faldas, etc.)
- Haces envíos a todo el país Colombiano.
- Eventos (por ejemplo: Fiesta de Fin de Año el 31 de diciembre, lanzamientos, descuentos, DJ en vivo, etc.)
- Ubicación: Av circunvalar, Cra. 13 #8-60 segundo piso, Pereira, Risaralda.
- Contacto: Instagram @blurred_xr, WhatsApp +57 317 8861221.
- Secciones del sitio web: Catálogo, Hombres, Mujeres, Eventos, Contacto.
- Cómo comprar, registro, inicio de sesión, perfil y carrito de compras.

Si te preguntan algo fuera de estos temas, responde amablemente que solo puedes ayudar sobre la tienda Blurred y sus servicios.

Ejemplos de respuestas:
- Si preguntan por los envíos: "Hacemos envíos a todo el país colombiano. Puedes realizar tu compra en línea y te lo enviamos a tu dirección."
- Si preguntan por productos: "Puedes ver nuestro catálogo completo en la sección 'Catálogo' del menú."
- Si preguntan por eventos: "¡No te pierdas nuestros próximos eventos! Consulta la sección 'Eventos' para más información."
- Si preguntan por contacto: "Puedes contactarnos en Instagram @blurred_xr o WhatsApp +57 317 8861221."
- Si preguntan por ubicación: "Estamos en Av circunvalar, Cra. 13 #8-60 segundo piso, Pereira, Risaralda."

No respondas sobre temas ajenos a la tienda Blurred.
Responde siempre de manera breve, clara y amable, ademas no te extiendas demasiado en tus respuestas, que sean claras y concisas de manera corta.
`;

  try {
    const response = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3.2',
        messages: [
          { role: 'system', content: contexto },
          { role: 'user', content: userMessage }
        ],
        keep_alive: '30m',
        options: {
          num_predict: 120,
          num_ctx: 1024
        }
      })
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let aiResponse = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const parts = chunk.trim().split('\n').filter(Boolean);

      for (let part of parts) {
        const data = JSON.parse(part);
        if (data.message && data.message.content) {
          aiResponse += data.message.content;
          botMsg.innerHTML = `<strong><span class="bot-name">BlurredBot:</span></strong> <span>${aiResponse}</span>`;
        }
      }
    }
  } catch (err) {
    botMsg.innerHTML = `<strong><span class="bot-name">BlurredBot:</span></strong> <span style="color:red">Error al conectar con el backend.</span>`;
    console.error(err);
  }
});

function appendMessage(sender, text) {
  const message = document.createElement('div');
  if (sender === 'BlurredBot') {
    message.innerHTML = `<strong><span class="bot-name">${sender}:</span></strong> <span>${text}</span>`;
  } else {
    message.innerHTML = `<strong>${sender}:</strong> <span>${text}</span>`;
  }
  message.style.fontFamily = 'Arial, sans-serif';
  chatBox.appendChild(message);
  chatBox.scrollTop = chatBox.scrollHeight;
  return message;
}
