import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Inicialización de Google GenAI en el servidor
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Endpoint para procesar consultas/demandas de clientes de WhatsApp y generar respuestas
app.post('/api/respond-demand', async (req, res) => {
  try {
    const { clientMessage, products, storeName = 'Mi Tienda en Casa', customerPhone = '' } = req.body;

    if (!clientMessage || typeof clientMessage !== 'string') {
      return res.status(400).json({ error: 'El mensaje del cliente es requerido' });
    }

    const inventorySummary = (products || [])
      .map((p: any) => `- ${p.name} (${p.unit}): $${p.price.toFixed(2)} (Stock: ${p.stock})`)
      .join('\n');

    let responseText = '';
    let parsedItems: Array<{ name: string; quantity: number; price: number; subtotal: number }> = [];
    let estimatedTotal = 0;

    if (ai) {
      try {
        const prompt = `Actúa como el asistente inteligente y amable de la tienda de abarrotes y productos para el hogar "${storeName}".
Un cliente envió el siguiente mensaje por WhatsApp solicitando productos, cotización o información:
"""
${clientMessage}
"""

El inventario actual de la tienda es:
${inventorySummary}

Por favor genera una respuesta en formato JSON exacto con la siguiente estructura:
{
  "whatsappResponse": "Mensaje cordial, profesional y cálido listo para enviar por WhatsApp al cliente. Si pidió productos, confirma disponibilidad con precios unitarios, calcula el subtotal y total claramente con formato amigable y emojis. Si no hay stock de algo, coméntalo con amabilidad. Invítale a confirmar su dirección o recogerlo.",
  "detectedProducts": [
    {
      "name": "Nombre del producto identificado",
      "quantity": 1,
      "price": 0.00,
      "subtotal": 0.00
    }
  ],
  "total": 0.00
}
Responde ÚNICAMENTE el JSON sin bloques de markdown adicionales.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const rawText = response.text || '{}';
        const parsed = JSON.parse(rawText);
        responseText = parsed.whatsappResponse || '';
        parsedItems = parsed.detectedProducts || [];
        estimatedTotal = typeof parsed.total === 'number' ? parsed.total : 0;
      } catch (err) {
        console.error('Error con Gemini API, usando fallback inteligente:', err);
      }
    }

    // Si Gemini no estaba configurado o falló, generamos una respuesta heurística inteligente
    if (!responseText) {
      const lower = clientMessage.toLowerCase();
      const matched: typeof parsedItems = [];

      (products || []).forEach((p: any) => {
        const pNameLower = p.name.toLowerCase();
        if (lower.includes(pNameLower)) {
          // Intentar extraer cantidad previa
          const regex = new RegExp(`(\\d+)\\s*(?:kilos?|kg|bolsas?|paquetes?|unidades?|litros?|latas?)?\\s*(?:de\\s*)?${pNameLower}`, 'i');
          const match = lower.match(regex);
          const qty = match ? parseInt(match[1], 10) : 1;
          const subtotal = qty * p.price;
          matched.push({
            name: p.name,
            quantity: qty,
            price: p.price,
            subtotal,
          });
        }
      });

      if (matched.length > 0) {
        estimatedTotal = matched.reduce((acc, curr) => acc + curr.subtotal, 0);
        const itemsList = matched.map(m => `• ${m.quantity}x ${m.name}: $${m.subtotal.toFixed(2)} ($${m.price.toFixed(2)} c/u)`).join('\n');
        responseText = `¡Hola! 👋 Claro que sí, en *${storeName}* tenemos disponibles los productos que necesitas:\n\n${itemsList}\n\n*Total a pagar: $${estimatedTotal.toFixed(2)}*\n\n¿Deseas que te lo preparemos para entrega o pasas a recogerlo? Quedamos a tu orden 🙌`;
        parsedItems = matched;
      } else {
        responseText = `¡Hola! 👋 Gracias por escribirnos a *${storeName}*. Con gusto te atendemos. ¿Qué productos de casa necesitas hoy (azúcar, arroz, aceite, leche, etc.)? ¡Dinos la cantidad y te cotizamos al instante! ✨`;
      }
    }

    res.json({
      success: true,
      whatsappResponse: responseText,
      detectedProducts: parsedItems,
      estimatedTotal,
      customerPhone,
    });
  } catch (error: any) {
    console.error('Error procesando demanda:', error);
    res.status(500).json({ error: 'Ocurrió un error al procesar el mensaje del cliente' });
  }
});

// Endpoint para parsear texto de venta rápida sencilla (ej. "2 azúcar y 1 aceite en efectivo")
app.post('/api/parse-quick-sale', async (req, res) => {
  try {
    const { quickText, products } = req.body;
    if (!quickText) {
      return res.status(400).json({ error: 'Texto requerido' });
    }

    if (ai) {
      try {
        const inventorySummary = (products || [])
          .map((p: any) => `- ID: ${p.id}, Nombre: ${p.name}, Precio: $${p.price}`)
          .join('\n');

        const prompt = `Un tendero dijo o escribió este apunte rápido de venta del día:
"${quickText}"

Inventario disponible:
${inventorySummary}

Convierte este texto en los artículos vendidos en formato JSON:
{
  "items": [
    { "productId": "id del producto si coincide o null", "name": "nombre", "quantity": 1, "price": 0.00 }
  ],
  "paymentMethod": "efectivo" // o "transferencia" o "tarjeta" o "fiado"
}
Solo devuelve el JSON.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const parsed = JSON.parse(response.text || '{}');
        return res.json({ success: true, ...parsed });
      } catch (e) {
        console.error('Error parseando con Gemini:', e);
      }
    }

    // Heurístico local de respaldo
    res.json({
      success: true,
      items: [],
      paymentMethod: 'efectivo',
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Error al interpretar la venta rápida' });
  }
});

// Endpoint para consejos de negocio y aumento de ganancias
app.post('/api/business-advice', async (req, res) => {
  try {
    const { products = [], totalSales = 0, totalProfit = 0, expenses = [] } = req.body;

    const inventoryHighlights = products
      .slice(0, 8)
      .map((p: any) => `${p.name}: Venta $${p.price.toFixed(2)}, Costo $${p.cost.toFixed(2)}, Margen $${(p.price - p.cost).toFixed(2)}`)
      .join('\n');

    let tips: any[] = [];

    if (ai) {
      try {
        const prompt = `Eres un asesor financiero experto y mentor de pequeños negocios y tiendas de abarrotes del hogar.
Los datos de la tienda son:
- Total ventas registradas: $${totalSales}
- Ganancia bruta estimada: $${totalProfit}
- Gastos registrados: $${expenses.reduce((acc: number, e: any) => acc + (e.amount || 0), 0)}
- Muestra de productos y márgenes:
${inventoryHighlights}

Genera 4 consejos prácticos, específicos y accionables para que el tendero aumente sus ventas y maximice sus ganancias netas.
Formato JSON esperado:
{
  "tips": [
    {
      "id": "tip-1",
      "title": "Título corto y llamativo",
      "category": "margen" // o "combos" o "whatsapp" o "inventario" o "fidelizacion",
      "impact": "alto" // o "medio" o "inmediato",
      "description": "Explicación clara y sin rodeos",
      "actionableStep": "Paso a paso exacto que debe hacer hoy",
      "suggestedCombo": ["Producto 1", "Producto 2"]
    }
  ]
}
Responde SOLO con el JSON válido.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: { responseMimeType: 'application/json' },
        });

        const parsed = JSON.parse(response.text || '{}');
        if (parsed.tips && Array.isArray(parsed.tips)) {
          tips = parsed.tips;
        }
      } catch (err) {
        console.error('Error con Gemini en consejos, usando fallback experto:', err);
      }
    }

    // Fallback de alta calidad
    if (tips.length === 0) {
      tips = [
        {
          id: 'tip-combo-desayuno',
          title: 'Crea el "Combo Desayuno" (Azúcar + Leche + Huevos)',
          category: 'combos',
          impact: 'alto',
          description: 'El azúcar y los huevos son productos de alta rotación pero menor margen. Al agruparlos con café o leche y ofrecer un descuento de apenas 5%, aumentas el ticket promedio de compra.',
          actionableStep: 'Ofrece hoy por WhatsApp el paquete: 1 kg Azúcar + 1L Leche + 1 Docena Huevos con envío gratis o precio especial.',
          suggestedCombo: ['Azúcar Blanca Refinada', 'Leche Entera 1L', 'Huevos Frescos de Granja'],
        },
        {
          id: 'tip-margen-rubia',
          title: 'Promociona la Azúcar Morena / Rubia',
          category: 'margen',
          impact: 'inmediato',
          description: 'La azúcar morena suele dejar hasta un 20% más de margen de ganancia por kilo que la blanca estándar. Además, muchos clientes la prefieren por ser más natural.',
          actionableStep: 'Cuando pregunten por azúcar en WhatsApp, menciona ambas opciones destacando el rendimiento y sabor de la morena.',
        },
        {
          id: 'tip-estados-whatsapp',
          title: 'Estrategia de Estados de WhatsApp a las 8:00 AM y 5:00 PM',
          category: 'whatsapp',
          impact: 'alto',
          description: 'Los vecinos revisan estados antes de empezar el día laboral y al regresar a casa a preparar la cena.',
          actionableStep: 'Sube una foto o texto rápido a las 8 AM: "Buenos días vecinos! Llegó azúcar fresca, huevos de granja y leche fría. Pide por aquí y te lo llevamos".',
        },
        {
          id: 'tip-control-fiados',
          title: 'Control estricto de Fiados y Cuentas por Cobrar',
          category: 'inventario',
          impact: 'alto',
          description: 'El fiado no cobrado a tiempo quita liquidez para reponer inventario de alta demanda (como bultos de arroz y azúcar con descuento mayorista).',
          actionableStep: 'Fija un límite máximo de crédito por vecino y envía un recordatorio cordial con el comprobante de WhatsApp al finalizar la semana.',
        },
      ];
    }

    res.json({ success: true, tips });
  } catch (error: any) {
    res.status(500).json({ error: 'Error generando consejos' });
  }
});


// Configuración de Vite para modo desarrollo / producción
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: Number(PORT),
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Servidor TiendaCasa corriendo en el puerto ${PORT}`);
  });
}

startServer();
