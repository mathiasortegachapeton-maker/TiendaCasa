import React, { useState } from 'react';
import { 
  BarChart3, 
  DollarSign, 
  TrendingUp, 
  ShoppingBag, 
  Calendar, 
  Send, 
  Trash2, 
  Smartphone, 
  CreditCard, 
  BookOpen, 
  Download,
  Share2,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Sale, StoreSettings } from '../types';
import { openWhatsApp, formatSaleReceipt } from '../utils/whatsapp';
import { getLocalDateString } from '../utils/storage';

interface DailySummaryViewProps {
  sales: Sale[];
  settings: StoreSettings;
  onDeleteSale: (id: string) => void;
  onClearTodaySales: () => void;
}

export const DailySummaryView: React.FC<DailySummaryViewProps> = ({
  sales,
  settings,
  onDeleteSale,
  onClearTodaySales,
}) => {
  const todayStr = getLocalDateString();
  const [filterMode, setFilterMode] = useState<'all' | 'today' | 'custom'>('all');
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [saleToDelete, setSaleToDelete] = useState<Sale | null>(null);

  // Filtrar ventas según el modo seleccionado
  const filteredSales = filterMode === 'all'
    ? sales
    : filterMode === 'today'
      ? sales.filter(s => s.date === todayStr)
      : sales.filter(s => s.date === selectedDate);

  // Totales
  const totalAmount = filteredSales.reduce((acc, s) => acc + s.total, 0);
  const totalProfit = filteredSales.reduce((acc, s) => acc + s.profit, 0);
  const totalTransactions = filteredSales.length;
  const averageTicket = totalTransactions > 0 ? totalAmount / totalTransactions : 0;

  // Desglose por método de pago
  const cashTotal = filteredSales.filter(s => s.paymentMethod === 'efectivo').reduce((acc, s) => acc + s.total, 0);
  const transferTotal = filteredSales.filter(s => s.paymentMethod === 'transferencia').reduce((acc, s) => acc + s.total, 0);
  const cardTotal = filteredSales.filter(s => s.paymentMethod === 'tarjeta').reduce((acc, s) => acc + s.total, 0);
  const creditTotal = filteredSales.filter(s => s.paymentMethod === 'fiado').reduce((acc, s) => acc + s.total, 0);

  // Compartir reporte por WhatsApp
  const handleSendSummaryWhatsApp = () => {
    const reportTitle = filterMode === 'all' 
      ? 'HISTORIAL TOTAL ACUMULADO' 
      : filterMode === 'today'
        ? `CIERRE DE HOY (${todayStr})`
        : `REPORTE DE VENTAS (${selectedDate})`;

    const text = `📊 *${reportTitle}*\n` +
      `🏪 *${settings.storeName.toUpperCase()}*\n` +
      `📅 Fecha de emisión: ${getLocalDateString()}\n` +
      `--------------------------------\n` +
      `💰 *Total Cobrado:* ${settings.currencySymbol}${totalAmount.toFixed(2)}\n` +
      `📈 *Ganancia Estimada:* ${settings.currencySymbol}${totalProfit.toFixed(2)}\n` +
      `🛍️ *Ventas Realizadas:* ${totalTransactions}\n` +
      `🎯 *Ticket Promedio:* ${settings.currencySymbol}${averageTicket.toFixed(2)}\n\n` +
      `*DESGLOSE POR FORMA DE PAGO:*\n` +
      `• 💵 Efectivo en Caja: ${settings.currencySymbol}${cashTotal.toFixed(2)}\n` +
      `• 📱 Transferencias / Móvil: ${settings.currencySymbol}${transferTotal.toFixed(2)}\n` +
      `• 💳 Tarjeta: ${settings.currencySymbol}${cardTotal.toFixed(2)}\n` +
      `• 📝 Fiado por cobrar: ${settings.currencySymbol}${creditTotal.toFixed(2)}\n` +
      `--------------------------------\n` +
      `Generado desde TiendaCasa (Guardado Permanente).`;

    openWhatsApp(settings.whatsappPhone, text);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-white">Ventas & Cuadre de Caja</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Guardado Permanente
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Tus datos se mantienen guardados de forma indefinida en tu navegador hasta que decidas borrarlos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Botón WhatsApp Cierre */}
          <button
            onClick={handleSendSummaryWhatsApp}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Enviar Reporte por WhatsApp</span>
          </button>
        </div>
      </div>

      {/* Selector de Rango de Vista: Permanente vs Hoy vs Fecha */}
      <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-2xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              filterMode === 'all'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Todo el Historial Acumulado ({sales.length})</span>
          </button>

          <button
            onClick={() => setFilterMode('today')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              filterMode === 'today'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Solo Hoy ({sales.filter(s => s.date === todayStr).length})</span>
          </button>

          <button
            onClick={() => setFilterMode('custom')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              filterMode === 'custom'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800'
            }`}
          >
            <span>Por Fecha Específica</span>
          </button>
        </div>

        {filterMode === 'custom' && (
          <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="bg-transparent text-white focus:outline-none"
            />
          </div>
        )}
      </div>

      {/* Tarjetas de Métricas Principales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {filterMode === 'all' ? 'Total Acumulado' : filterMode === 'today' ? 'Total de Hoy' : 'Total en Fecha'}
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-white tracking-tight">
            {settings.currencySymbol}{totalAmount.toFixed(2)}
          </p>
          <span className="text-[11px] text-emerald-400 font-semibold mt-1 block">
            {totalTransactions} {totalTransactions === 1 ? 'venta registrada' : 'ventas registradas'}
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ganancia Neta</span>
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-teal-300 tracking-tight">
            {settings.currencySymbol}{totalProfit.toFixed(2)}
          </p>
          <span className="text-[11px] text-teal-400 font-semibold mt-1 block">
            Margen de utilidad calculado
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Efectivo en Caja</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-amber-300 tracking-tight">
            {settings.currencySymbol}{cashTotal.toFixed(2)}
          </p>
          <span className="text-[11px] text-slate-400 font-medium mt-1 block">
            Dinero físico a rendir
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Transferencias</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Smartphone className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-indigo-300 tracking-tight">
            {settings.currencySymbol}{transferTotal.toFixed(2)}
          </p>
          <span className="text-[11px] text-slate-400 font-medium mt-1 block">
            Pagos digitales verificados
          </span>
        </div>
      </div>

      {/* Desglose de Caja por Método de Pago */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
          Desglose de Formas de Pago ({filterMode === 'all' ? 'Todo el Historial' : filterMode === 'today' ? 'Hoy' : selectedDate})
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-800/60 border border-slate-700/60 p-3.5 rounded-2xl">
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>Efectivo</span>
            </div>
            <p className="text-lg font-bold text-white">
              {settings.currencySymbol}{cashTotal.toFixed(2)}
            </p>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 p-3.5 rounded-2xl">
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <Smartphone className="w-4 h-4 text-indigo-400" />
              <span>Transferencia</span>
            </div>
            <p className="text-lg font-bold text-white">
              {settings.currencySymbol}{transferTotal.toFixed(2)}
            </p>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 p-3.5 rounded-2xl">
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <CreditCard className="w-4 h-4 text-blue-400" />
              <span>Tarjeta</span>
            </div>
            <p className="text-lg font-bold text-white">
              {settings.currencySymbol}{cardTotal.toFixed(2)}
            </p>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 p-3.5 rounded-2xl">
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>Fiado / Deuda</span>
            </div>
            <p className="text-lg font-bold text-white">
              {settings.currencySymbol}{creditTotal.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Historial de Ventas */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-white text-base">
              {filterMode === 'all' 
                ? `Historial Permanente de Ventas (${sales.length} registros guardados)`
                : filterMode === 'today'
                  ? `Ventas del Día de Hoy (${todayStr})`
                  : `Ventas de la Fecha (${selectedDate})`}
            </h3>
          </div>

          {filterMode !== 'all' && sales.length > filteredSales.length && (
            <button
              onClick={() => setFilterMode('all')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 transition-colors"
            >
              <span>Ver todo el historial ({sales.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {filteredSales.length === 0 ? (
          <div className="py-12 text-center text-slate-400 px-4">
            <ShoppingBag className="w-12 h-12 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-white">
              {filterMode === 'today'
                ? 'Hoy aún no has registrado ventas'
                : 'No hay ventas en este filtro'}
            </p>
            {sales.length > 0 ? (
              <div className="mt-3">
                <p className="text-xs text-slate-400 mb-3">
                  Tu historial permanente tiene <strong>{sales.length} ventas guardadas</strong> con un total de <strong>{settings.currencySymbol}{sales.reduce((a, b) => a + b.total, 0).toFixed(2)}</strong>.
                </p>
                <button
                  onClick={() => setFilterMode('all')}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  Ver Todo el Historial Permanente
                </button>
              </div>
            ) : (
              <p className="text-xs text-slate-400 mt-1">
                Usa la pestaña "⚡ Venta Rápida" para registrar tu primera venta. Se guardará permanentemente en este dispositivo.
              </p>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {filteredSales.map(sale => (
              <div 
                key={sale.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/30 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded-md">
                      📅 {sale.date} {sale.time}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 capitalize">
                      {sale.paymentMethod}
                    </span>
                    {sale.source === 'demanda_whatsapp' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
                        WhatsApp
                      </span>
                    )}
                    {sale.customerName && (
                      <span className="text-xs text-slate-400">
                        • {sale.customerName}
                      </span>
                    )}
                  </div>

                  <p className="text-sm font-semibold text-slate-200">
                    {sale.items.map(it => `${it.quantity}x ${it.name}`).join(', ')}
                  </p>

                  {sale.notes && (
                    <p className="text-xs text-slate-400 italic">
                      Nota: {sale.notes}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
                  <div className="text-left sm:text-right">
                    <span className="text-lg font-black text-white block leading-none">
                      {settings.currencySymbol}{sale.total.toFixed(2)}
                    </span>
                    <span className="text-xs font-medium text-teal-400">
                      Ganancia: +{settings.currencySymbol}{sale.profit.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Botón enviar recibo por WhatsApp */}
                    <button
                      onClick={() => {
                        const receiptText = formatSaleReceipt(sale, settings);
                        openWhatsApp(sale.customerPhone || '', receiptText);
                      }}
                      title="Enviar comprobante por WhatsApp"
                      className="p-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white transition-all cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                    </button>

                    {/* Botón anular */}
                    <button
                      onClick={() => setSaleToDelete(sale)}
                      title="Anular venta"
                      className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Seguro para Anular Venta Individual */}
      {saleToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">¿Anular esta venta?</h3>
            <p className="text-xs text-slate-400">
              Venta de <strong>{settings.currencySymbol}{saleToDelete.total.toFixed(2)}</strong> del {saleToDelete.date} {saleToDelete.time}. Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setSaleToDelete(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  onDeleteSale(saleToDelete.id);
                  setSaleToDelete(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md"
              >
                Sí, Anular
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
