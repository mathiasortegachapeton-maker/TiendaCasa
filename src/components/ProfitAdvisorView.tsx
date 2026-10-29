import React, { useState } from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  Percent, 
  Package, 
  Send, 
  Lightbulb, 
  CheckCircle2, 
  Flame, 
  Clock, 
  Target, 
  DollarSign,
  ArrowRight,
  Share2
} from 'lucide-react';
import { Product, Sale, Expense, StoreSettings, BusinessTip } from '../types';
import { openWhatsApp } from '../utils/whatsapp';

interface ProfitAdvisorViewProps {
  products: Product[];
  sales: Sale[];
  expenses: Expense[];
  settings: StoreSettings;
}

export const ProfitAdvisorView: React.FC<ProfitAdvisorViewProps> = ({
  products,
  sales,
  expenses,
  settings,
}) => {
  const [loadingAi, setLoadingAi] = useState(false);
  const [customTips, setCustomTips] = useState<BusinessTip[]>([]);

  const totalSales = sales.reduce((a, s) => a + s.total, 0);
  const totalProfit = sales.reduce((a, s) => a + s.profit, 0);

  // Ordenar productos por margen de ganancia
  const productsWithMargin = [...products].map(p => ({
    ...p,
    marginAmount: p.price - p.cost,
    marginPercent: p.price > 0 ? ((p.price - p.cost) / p.price) * 100 : 0,
  })).sort((a, b) => b.marginPercent - a.marginPercent);

  const highestMarginProducts = productsWithMargin.slice(0, 3);
  const lowestMarginProducts = [...productsWithMargin].reverse().slice(0, 3);

  // Combos sugeridos con cálculo de precio y botón para compartir en WhatsApp
  const suggestedCombos = [
    {
      name: 'Combo Desayuno Esencial',
      items: ['Azúcar Blanca Refinada', 'Leche Entera 1L', 'Huevos Frescos de Granja'],
      originalPrice: 1.25 + 1.50 + 2.80,
      comboPrice: 5.20,
      discount: '5%',
      benefit: 'Aumenta el ticket promedio y rota productos lácteos frescos.',
    },
    {
      name: 'Canasta Básica de la Semana',
      items: ['Azúcar Morena / Rubia', 'Arroz Grano Superior', 'Aceite Vegetal 1 Litro', 'Fideos / Pastas 500g'],
      originalPrice: 1.35 + 1.45 + 2.90 + 1.10,
      comboPrice: 6.30,
      discount: '7%',
      benefit: 'Fideliza a las familias para que compren todo su mercado contigo y no en el supermercado.',
    },
    {
      name: 'Dúo Dulzura y Café',
      items: ['Café Tostado y Molido (250g)', 'Azúcar Blanca Refinada'],
      originalPrice: 3.50 + 1.25,
      comboPrice: 4.50,
      discount: '5%',
      benefit: 'Aprovecha el alto margen del café para incentivar la compra junto al azúcar.',
    },
  ];

  const handleShareComboWhatsApp = (combo: typeof suggestedCombos[0]) => {
    const text = `🔥 *OFERTA ESPECIAL EN ${settings.storeName.toUpperCase()}*\n\n` +
      `📦 *${combo.name.toUpperCase()}*\n` +
      `Incluye:\n` +
      combo.items.map(it => `✓ ${it}`).join('\n') +
      `\n\n💰 *Precio normal:* ${settings.currencySymbol}${combo.originalPrice.toFixed(2)}\n` +
      `💥 *PRECIO COMBO HOY:* ${settings.currencySymbol}${combo.comboPrice.toFixed(2)} (${combo.discount} de ahorro)\n\n` +
      `📲 Pídelo respondiendo a este mensaje. ¡Llevamos a domicilio o apartamos tu pedido! ✨`;

    openWhatsApp(settings.whatsappPhone, text);
  };

  const handleFetchAiAdvice = async () => {
    setLoadingAi(true);
    try {
      const response = await fetch('/api/business-advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          products,
          totalSales,
          totalProfit,
          expenses,
        }),
      });

      const data = await response.json();
      if (data.success && data.tips) {
        setCustomTips(data.tips);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-white">Consejos para Mejorar Ventas y Ganancias</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Estrategias Comerciales
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Diagnóstico de márgenes, creación de combos ganadores y tácticas de WhatsApp para maximizar tu utilidad neta.
          </p>
        </div>

        <button
          onClick={handleFetchAiAdvice}
          disabled={loadingAi}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-bold text-xs transition-all shadow-lg shadow-emerald-600/30 cursor-pointer disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4" />
          <span>{loadingAi ? 'Analizando tu tienda...' : 'Pedir Diagnóstico Inteligente con IA ✨'}</span>
        </button>
      </div>

      {/* SECCIÓN 1: DIAGNÓSTICO DE MÁRGENES DE TUS PRODUCTOS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Productos de Mayor Margen (Tus joyas de ganancia) */}
        <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Flame className="w-5 h-5 text-emerald-400" />
              <span>Tus Productos con Más Margen de Ganancia</span>
            </h3>
            <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
              ¡Impúlsalos más!
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Cada vez que vendes uno de estos, dejas más dinero limpio en tu bolsillo.
          </p>

          <div className="space-y-3">
            {highestMarginProducts.map(p => (
              <div key={p.id} className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-white text-sm">{p.name}</h4>
                  <span className="text-xs text-slate-400">
                    Costo: {settings.currencySymbol}{p.cost.toFixed(2)} → Venta: {settings.currencySymbol}{p.price.toFixed(2)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-base font-black text-emerald-400 block font-mono">
                    +{settings.currencySymbol}{p.marginAmount.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-teal-300 font-bold bg-teal-500/10 px-2 py-0.5 rounded-md">
                    {p.marginPercent.toFixed(0)}% margen
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 text-xs text-emerald-300">
            💡 <strong>Estrategia Clave:</strong> Cuando un cliente pida azúcar blanca, ofrécele también café o azúcar morena: "Vecina, ¿le pongo también el café tostado o un azúcar morena que rinde el doble?".
          </div>
        </div>

        {/* Productos Gancho (Alta rotación pero menor margen) */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Target className="w-5 h-5 text-amber-400" />
              <span>Productos Gancho (Tráfico Vecinal)</span>
            </h3>
            <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full">
              Uso Estratégico
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Productos que todos buscan a diario. Tienen margen ajustado pero traen a los clientes a tu puerta o chat.
          </p>

          <div className="space-y-3">
            {lowestMarginProducts.map(p => (
              <div key={p.id} className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-white text-sm">{p.name}</h4>
                  <span className="text-xs text-slate-400">
                    Costo: {settings.currencySymbol}{p.cost.toFixed(2)} → Venta: {settings.currencySymbol}{p.price.toFixed(2)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-base font-black text-amber-300 block font-mono">
                    +{settings.currencySymbol}{p.marginAmount.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold bg-slate-800 px-2 py-0.5 rounded-md">
                    {p.marginPercent.toFixed(0)}% margen
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/20 text-xs text-amber-300">
            💡 <strong>Cómo ganar más con el azúcar:</strong> Compra el saco o bulto cerrado de 50 kg con proveedores mayoristas para bajar el costo por kilo un 15% a 20%, multiplicando tu ganancia.
          </div>
        </div>
      </div>

      {/* SECCIÓN 2: COMBOS GANADORES LISTOS PARA WHATSAPP */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Package className="w-6 h-6 text-emerald-400" />
              <span>Combos Promocionales para Elevar tu Venta Diaria</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Si vendes solo 1 kilo de azúcar cobras $1.25. Si vendes el combo cobras más de $5.00 con un solo cliente.
            </p>
          </div>
          <span className="text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 font-semibold self-start sm:self-auto">
            1 Clic para WhatsApp
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {suggestedCombos.map((combo, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700/60 hover:border-emerald-500/40 transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                    Ahorro {combo.discount}
                  </span>
                  <span className="text-xs text-slate-400 line-through">
                    {settings.currencySymbol}{combo.originalPrice.toFixed(2)}
                  </span>
                </div>

                <h4 className="text-base font-bold text-white mb-2 group-hover:text-emerald-300 transition-colors">
                  {combo.name}
                </h4>

                <ul className="text-xs text-slate-300 space-y-1 mb-4">
                  {combo.items.map((it, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>

                <p className="text-[11px] text-slate-400 mb-4 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                  🎯 {combo.benefit}
                </p>
              </div>

              <div>
                <div className="flex items-baseline justify-between mb-3 pt-3 border-t border-slate-700">
                  <span className="text-xs text-slate-400 font-semibold">Precio Oferta:</span>
                  <span className="text-2xl font-black text-emerald-400 font-mono">
                    {settings.currencySymbol}{combo.comboPrice.toFixed(2)}
                  </span>
                </div>

                <button
                  onClick={() => handleShareComboWhatsApp(combo)}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Publicar Combo en WhatsApp</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECCIÓN 3: CONSEJOS GENERADOS POR IA O ESTRATEGIAS EXPERTAS */}
      {customTips.length > 0 && (
        <div className="bg-slate-900 border border-indigo-500/30 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-indigo-400" />
            <h3 className="text-xl font-bold text-white">Diagnóstico Específico para tu Tienda</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {customTips.map(tip => (
              <div key={tip.id} className="p-4 rounded-2xl bg-slate-800/70 border border-slate-700/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">{tip.category}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">
                    Impacto {tip.impact}
                  </span>
                </div>
                <h4 className="font-bold text-white text-sm">{tip.title}</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{tip.description}</p>
                <div className="p-2.5 rounded-xl bg-slate-900 text-xs text-emerald-300 font-medium">
                  👉 Acción recomendada: {tip.actionableStep}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECCIÓN 4: LAS 4 REGLAS DE ORO DEL TENDERO RENTABLE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-black">
            1
          </div>
          <h4 className="font-bold text-white text-sm">Fidelización por Reposición</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Una familia promedio compra 1 kg de azúcar y 1 aceite cada semana. Si les escribes un mensaje cordial los viernes: "¿Te falta azúcar o aceite para el fin de semana?", aseguras la venta antes que vayan a otra tienda.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center font-black">
            2
          </div>
          <h4 className="font-bold text-white text-sm">Precios Redondos para Cambio Rápido</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Tener productos en múltiplos fáciles (ej. $1.00, $1.50, $2.00) agiliza el cambio en efectivo y evita perder ventas en horas pico de mostrador.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-black">
            3
          </div>
          <h4 className="font-bold text-white text-sm">Estados de WhatsApp Interactivos</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Publica fotos sencillas tomadas con tu celular de los bultos de azúcar recién llegados o los huevos frescos. La gente compra lo que ve fresco y disponible en su zona.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-black">
            4
          </div>
          <h4 className="font-bold text-white text-sm">Cero Dinero Parado</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            No compres en exceso mercadería de baja rotación. Es mejor reinvertir rápido el efectivo en azúcar, arroz y leche que se venden todos los días.
          </p>
        </div>
      </div>
    </div>
  );
};
