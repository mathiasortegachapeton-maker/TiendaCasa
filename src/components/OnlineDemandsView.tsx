import React, { useState } from 'react';
import { 
  MessageSquare, 
  Sparkles, 
  Send, 
  CheckCircle, 
  Copy, 
  Check, 
  Phone, 
  ShoppingBag, 
  AlertCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import { Product, StoreSettings, Sale, DemandAnalysisResult } from '../types';
import { openWhatsApp } from '../utils/whatsapp';

interface OnlineDemandsViewProps {
  products: Product[];
  settings: StoreSettings;
  onRegisterSale: (sale: Omit<Sale, 'id' | 'timestamp' | 'date' | 'time'>) => Sale;
}

export const OnlineDemandsView: React.FC<OnlineDemandsViewProps> = ({
  products,
  settings,
  onRegisterSale,
}) => {
  const [customerMessage, setCustomerMessage] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [result, setResult] = useState<DemandAnalysisResult | null>(null);
  const [saleConverted, setSaleConverted] = useState(false);

  // Plantillas de demandas frecuentes para probar al instante
  const demoDemands = [
    {
      title: 'Pedido de Azúcar y Aceite',
      message: 'Hola buenas tardes, ¿tienen azúcar blanca y aceite vegetal? Necesito 3 kilos de azúcar y 2 botellas de aceite. ¿Cuánto sería el total?',
      phone: '+52 55 9876 5432',
    },
    {
      title: 'Cotización Desayuno (Huevos, Leche, Azúcar)',
      message: 'Buenas, me puede apartar 1 docena de huevos, 2 litros de leche y 1 kg de azúcar morena para recoger hoy en la tarde? Gracias.',
      phone: '',
    },
    {
      title: 'Consulta Arroz y Café',
      message: 'Vecina buenas, ¿a cómo está el kilo de arroz superior y si tienen café molido disponible? Quisiera 4 bolsas de arroz y 1 café.',
      phone: '',
    },
  ];

  // Plantillas de respuestas rápidas para WhatsApp
  const quickTemplates = [
    {
      label: '📍 Pedir Dirección',
      text: `¡Perfecto! Tu pedido está confirmado. 🛵 Por favor envíanos tu dirección exacta o ubicación compartida para llevártelo en breve.`,
    },
    {
      label: '💳 Datos de Pago',
      text: `Puedes realizar tu pago por transferencia móvil o efectivo al recibir. Si es transferencia, el número de cuenta es: [Ingresar Cuenta / Teléfono Móvil]. ¡Muchas gracias!`,
    },
    {
      label: '⏰ En Preparación',
      text: `¡Listo! Ya estamos empacando tus productos con mucho cuidado. En unos 15 a 20 minutos sale hacia tu domicilio. 📦✨`,
    },
  ];

  const handleProcessDemand = async (messageToUse?: string, phoneToUse?: string) => {
    const text = messageToUse || customerMessage;
    const phone = phoneToUse !== undefined ? phoneToUse : customerPhone;

    if (!text.trim()) return;

    setIsLoading(true);
    setSaleConverted(false);

    try {
      const response = await fetch('/api/respond-demand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientMessage: text,
          products,
          storeName: settings.storeName,
          customerPhone: phone,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setResult({
          whatsappResponse: data.whatsappResponse,
          detectedProducts: data.detectedProducts || [],
          estimatedTotal: data.estimatedTotal || 0,
          customerPhone: phone,
        });
      }
    } catch (err) {
      console.error('Error al responder demanda:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result?.whatsappResponse) return;
    navigator.clipboard.writeText(result.whatsappResponse);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendWhatsApp = () => {
    if (!result?.whatsappResponse) return;
    openWhatsApp(result.customerPhone || customerPhone, result.whatsappResponse);
  };

  // Convertir la demanda en venta automática para registrar en el día
  const handleConvertToSale = () => {
    if (!result || result.detectedProducts.length === 0) return;

    const saleItems = result.detectedProducts.map(p => {
      const matched = products.find(prod => prod.name.toLowerCase() === p.name.toLowerCase());
      const cost = matched ? matched.cost : p.price * 0.75;
      return {
        productId: matched?.id,
        name: p.name,
        quantity: p.quantity,
        price: p.price,
        cost,
        subtotal: p.subtotal,
      };
    });

    const total = saleItems.reduce((acc, it) => acc + it.subtotal, 0);
    const totalCost = saleItems.reduce((acc, it) => acc + (it.cost * it.quantity), 0);

    onRegisterSale({
      items: saleItems,
      total,
      totalCost,
      profit: total - totalCost,
      paymentMethod: 'transferencia',
      customerPhone: result.customerPhone || customerPhone || undefined,
      notes: `Venta originada por demanda en línea WhatsApp: "${customerMessage.substring(0, 60)}..."`,
      source: 'demanda_whatsapp',
    });

    setSaleConverted(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* COLUMNA IZQUIERDA: Formulario de Demanda y Mensaje */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Demandas en Línea</h2>
                <p className="text-xs text-slate-400">
                  Pega el mensaje recibido por WhatsApp o redes para cotizar y responder al instante.
                </p>
              </div>
            </div>

            {/* Teléfono del cliente */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Teléfono WhatsApp del Cliente (Opcional)</span>
              </label>
              <input
                type="text"
                placeholder="Ej: +52 1 55 1234 5678 (con código de país)"
                value={customerPhone}
                onChange={e => setCustomerPhone(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all"
              />
            </div>

            {/* Mensaje o demanda recibida */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
                Mensaje recibido del cliente *
              </label>
              <textarea
                rows={4}
                value={customerMessage}
                onChange={e => setCustomerMessage(e.target.value)}
                placeholder="Ej: 'Hola buenas tardes, ¿tienen azúcar blanca y aceite? Necesito 3 kilos de azúcar y 2 aceites. ¿Cuánto sale?'"
                className="w-full bg-slate-800/80 border border-slate-700 rounded-2xl p-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all leading-relaxed"
              />
            </div>

            {/* Botón de Generar Respuesta */}
            <button
              onClick={() => handleProcessDemand()}
              disabled={isLoading || !customerMessage.trim()}
              className="w-full py-3.5 rounded-2xl font-bold text-sm bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Analizando inventario y redactando...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generar Respuesta para WhatsApp ✨</span>
                </>
              )}
            </button>
          </div>

          {/* Demandas de prueba con un clic */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-5">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span>O probar con mensajes de ejemplo frecuentes:</span>
            </h4>
            <div className="space-y-2">
              {demoDemands.map((demo, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setCustomerMessage(demo.message);
                    setCustomerPhone(demo.phone);
                    handleProcessDemand(demo.message, demo.phone);
                  }}
                  className="p-3 rounded-2xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 hover:border-emerald-500/40 cursor-pointer transition-all group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-200 group-hover:text-emerald-300 transition-colors">
                      {demo.title}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      Probar <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2">
                    "{demo.message}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: Vista previa de WhatsApp y Conversión a Venta */}
        <div className="lg:col-span-6 space-y-6">
          {result ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                  <h3 className="font-bold text-white text-base">Respuesta Lista para WhatsApp</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copiado' : 'Copiar'}</span>
                  </button>
                </div>
              </div>

              {/* Burbuja estilo WhatsApp */}
              <div className="p-4 rounded-2xl bg-[#0b141a] border border-[#202c33] text-slate-100 font-sans shadow-inner">
                <div className="text-[11px] text-emerald-400 font-bold mb-2 flex items-center gap-1">
                  <span>🟢 Vista previa del mensaje</span>
                </div>
                <div className="bg-[#005c4b]/80 text-[#e9edef] p-4 rounded-2xl rounded-tl-none text-sm whitespace-pre-wrap leading-relaxed shadow-sm">
                  {result.whatsappResponse}
                </div>
              </div>

              {/* Desglose de productos identificados */}
              {result.detectedProducts && result.detectedProducts.length > 0 && (
                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-300 uppercase">
                      Artículos detectados en la demanda:
                    </span>
                    <span className="text-xs font-extrabold text-emerald-400">
                      Total: {settings.currencySymbol}{result.estimatedTotal.toFixed(2)}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {result.detectedProducts.map((p, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs text-slate-300 bg-slate-900/60 px-3 py-1.5 rounded-lg">
                        <span>• {p.quantity}x {p.name}</span>
                        <span className="font-semibold text-slate-100">
                          {settings.currencySymbol}{p.subtotal.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Botones de acción clave: Enviar por WhatsApp y Registrar Venta Automática */}
              <div className="space-y-3 pt-2">
                <button
                  onClick={handleSendWhatsApp}
                  className="w-full py-4 rounded-2xl font-bold text-base bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2.5 cursor-pointer active:scale-98"
                >
                  <Send className="w-5 h-5" />
                  <span>Enviar por WhatsApp al Cliente</span>
                </button>

                {/* BOTÓN MÁGICO: Registrar como venta automática en el día */}
                <button
                  disabled={saleConverted || result.detectedProducts.length === 0}
                  onClick={handleConvertToSale}
                  className={`w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 border transition-all ${
                    saleConverted
                      ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-400 cursor-default'
                      : 'bg-indigo-600 hover:bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-600/20 cursor-pointer active:scale-98'
                  }`}
                >
                  {saleConverted ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span>¡Venta registrada automáticamente en el día!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Registrar Demanda como Venta del Día ({settings.currencySymbol}{result.estimatedTotal.toFixed(2)})</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Estado vacío / esperando mensaje */
            <div className="bg-slate-900 border border-slate-800 border-dashed rounded-3xl p-10 text-center flex flex-col items-center justify-center min-h-[360px]">
              <div className="w-16 h-16 rounded-3xl bg-slate-800 flex items-center justify-center text-slate-400 mb-4">
                <MessageSquare className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">
                Respuestas Automáticas a Demandas
              </h3>
              <p className="text-xs text-slate-400 max-w-sm leading-relaxed mb-6">
                Escribe o pega una consulta de cliente a la izquierda (por ejemplo sobre el azúcar, arroz, aceite u otros abarrotes) y aquí verás la respuesta generada lista para WhatsApp con un solo clic.
              </p>
              <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20">
                <Sparkles className="w-4 h-4" />
                <span>Cálculo automático de precios e inventario</span>
              </div>
            </div>
          )}

          {/* Plantillas rápidas de cortesía */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-5">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
              Plantillas Rápidas para Enviar por WhatsApp:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {quickTemplates.map((tmpl, idx) => (
                <button
                  key={idx}
                  onClick={() => openWhatsApp(customerPhone, tmpl.text)}
                  className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-left border border-slate-700/60 transition-colors"
                >
                  <span className="text-xs font-semibold text-slate-200 block mb-1">
                    {tmpl.label}
                  </span>
                  <span className="text-[10px] text-slate-400 line-clamp-2">
                    {tmpl.text}
                  </span>
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
