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
  FileText
} from 'lucide-react';
import { Sale, StoreSettings } from '../types';
import { openWhatsApp, formatSaleReceipt } from '../utils/whatsapp';

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
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);

  // Filtrar ventas por fecha seleccionada
  const filteredSales = sales.filter(s => s.date === selectedDate);

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

  // Compartir cierre del día por WhatsApp
  const handleSendDaySummaryWhatsApp = () => {
    const text = `📊 *CIERRE Y REPORTE DE VENTAS DEL DÍA*\n` +
      `🏪 *${settings.storeName.toUpperCase()}*\n` +
      `📅 Fecha: ${selectedDate}\n` +
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
      `Generado automáticamente desde TiendaCasa.`;

    openWhatsApp(settings.whatsappPhone, text);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-white">Ventas & Cuadre de Caja</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
              Cálculo Automático
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Resumen en tiempo real de todos los ingresos, ganancias y desglose de formas de pago.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Selector de fecha */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="bg-transparent text-white focus:outline-none"
            />
          </div>

          {/* Botón WhatsApp Cierre */}
          <button
            onClick={handleSendDaySummaryWhatsApp}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Enviar Cierre por WhatsApp</span>
          </button>
        </div>
      </div>

      {/* Tarjetas de Métricas Principales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total del Día</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-white tracking-tight">
            {settings.currencySymbol}{totalAmount.toFixed(2)}
          </p>
          <span className="text-[11px] text-emerald-400 font-semibold mt-1 block">
            {totalTransactions} transacciones registradas
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
          Desglose de Formas de Pago
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

      {/* Historial de Ventas del Día */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-white text-base">
              Historial de Ventas ({selectedDate})
            </h3>
          </div>
          {filteredSales.length > 0 && (
            <button
              onClick={() => {
                if (confirm('¿Estás seguro de reiniciar las ventas de hoy? Esta acción no se puede deshacer.')) {
                  onClearTodaySales();
                }
              }}
              className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpiar Hoy</span>
            </button>
          )}
        </div>

        {filteredSales.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <ShoppingBag className="w-12 h-12 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-semibold">No hay ventas registradas en esta fecha</p>
            <p className="text-xs text-slate-400 mt-1">Usa la pestaña "Registrar Venta Rápida" o "Demandas & WhatsApp" para ingresar una venta.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {filteredSales.map(sale => (
              <div 
                key={sale.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/30 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                      {sale.time}
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
                      onClick={() => onDeleteSale(sale.id)}
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
    </div>
  );
};
