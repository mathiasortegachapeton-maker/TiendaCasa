import { Product, Sale, StoreSettings } from '../types';

/**
 * Limpia un número telefónico para formato internacional de WhatsApp
 * Ejemplo: +52 1 55 1234 5678 -> 5215512345678
 */
export function sanitizePhone(phone: string): string {
  return phone.replace(/[^\d]/g, '');
}

/**
 * Genera el enlace de WhatsApp (wa.me)
 */
export function createWhatsAppLink(phone: string, text: string): string {
  const cleanPhone = sanitizePhone(phone);
  const encoded = encodeURIComponent(text);
  if (cleanPhone) {
    return `https://wa.me/${cleanPhone}?text=${encoded}`;
  }
  return `https://wa.me/?text=${encoded}`;
}

/**
 * Abre WhatsApp en una nueva pestaña o aplicación nativa
 */
export function openWhatsApp(phone: string, text: string): void {
  const url = createWhatsAppLink(phone, text);
  window.open(url, '_blank');
}

/**
 * Genera el texto del comprobante de venta para WhatsApp
 */
export function formatSaleReceipt(sale: Sale, settings: StoreSettings): string {
  const currency = settings.currencySymbol;
  const itemsText = sale.items
    .map(it => `• ${it.quantity}x ${it.name} -> ${currency}${(it.price * it.quantity).toFixed(2)}`)
    .join('\n');

  const paymentText = {
    efectivo: '💵 Efectivo',
    transferencia: '📱 Transferencia / Pago Móvil',
    tarjeta: '💳 Tarjeta',
    fiado: '📝 Fiado (Pendiente)',
  }[sale.paymentMethod];

  return `🧾 *COMPROBANTE DE COMPRA*\n` +
    `🏪 *${settings.storeName.toUpperCase()}*\n` +
    `📅 Fecha: ${sale.date} - ${sale.time}\n` +
    (sale.customerName ? `👤 Cliente: ${sale.customerName}\n` : '') +
    `--------------------------------\n` +
    `*PRODUCTOS:*\n` +
    `${itemsText}\n` +
    `--------------------------------\n` +
    `*TOTAL: ${currency}${sale.total.toFixed(2)}*\n` +
    `*Forma de pago:* ${paymentText}\n` +
    (sale.notes ? `📌 Nota: ${sale.notes}\n` : '') +
    `\n¡Muchas gracias por su compra! 🙌\nEsperamos atenderle pronto de nuevo. ✨`;
}

/**
 * Genera el catálogo completo de productos para compartir por WhatsApp
 */
export function formatCatalogMessage(products: Product[], settings: StoreSettings): string {
  const currency = settings.currencySymbol;
  
  // Agrupar por categoría
  const categorias: Record<string, Product[]> = {
    'Abarrotes & Esenciales': products.filter(p => p.category === 'abarrotes'),
    'Lácteos y Desayuno': products.filter(p => p.category === 'lacteos'),
    'Bebidas': products.filter(p => p.category === 'bebidas'),
    'Limpieza y Hogar': products.filter(p => p.category === 'limpieza'),
    'Otros': products.filter(p => p.category === 'otros'),
  };

  let msg = `🛒 *CATÁLOGO DE PRODUCTOS DE CASA*\n` +
    `🏪 *${settings.storeName.toUpperCase()}*\n` +
    `Precios actualizados para el día de hoy:\n\n`;

  for (const [catName, prods] of Object.entries(categorias)) {
    if (prods.length > 0) {
      msg += `*--- ${catName} ---*\n`;
      prods.forEach(p => {
        msg += `• *${p.name}* (${p.unit}): ${currency}${p.price.toFixed(2)}${p.stock <= 5 && p.stock > 0 ? ' _(¡Últimas unidades!)_' : ''}\n`;
      });
      msg += `\n`;
    }
  }

  msg += `📲 *Para hacer tu pedido:* Responde directamente con los productos que necesitas y te los alistamos con gusto. ¡Envío y atención rápida!`;
  return msg;
}
