import React, { useState } from 'react';
import { 
  BookOpen, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  FileText, 
  Calendar, 
  Send, 
  ShieldCheck, 
  Layers, 
  PieChart, 
  Receipt,
  Trash2,
  X,
  Check
} from 'lucide-react';
import { Sale, Expense, Product, StoreSettings, PaymentMethod } from '../types';
import { openWhatsApp } from '../utils/whatsapp';

interface AccountingViewProps {
  sales: Sale[];
  expenses: Expense[];
  products: Product[];
  settings: StoreSettings;
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  onDeleteExpense: (id: string) => void;
}

export const AccountingView: React.FC<AccountingViewProps> = ({
  sales,
  expenses,
  products,
  settings,
  onAddExpense,
  onDeleteExpense,
}) => {
  const [activeTab, setActiveTab] = useState<'diario' | 'resultados' | 'balance' | 'gastos'>('diario');
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  // Formulario nuevo gasto
  const [concept, setConcept] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Expense['category']>('transporte');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('efectivo');
  const [notes, setNotes] = useState('');

  // Cálculos consolidados
  const totalSalesRevenue = sales.reduce((acc, s) => acc + s.total, 0);
  const totalCostOfGoods = sales.reduce((acc, s) => acc + s.totalCost, 0);
  const grossProfit = totalSalesRevenue - totalCostOfGoods;
  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const netIncome = grossProfit - totalExpenses;
  const grossMarginPercent = totalSalesRevenue > 0 ? ((grossProfit / totalSalesRevenue) * 100).toFixed(1) : '0';
  const netMarginPercent = totalSalesRevenue > 0 ? ((netIncome / totalSalesRevenue) * 100).toFixed(1) : '0';

  // Activos de la tienda
  const cashInHand = sales.filter(s => s.paymentMethod === 'efectivo').reduce((a, s) => a + s.total, 0) -
                     expenses.filter(e => e.paymentMethod === 'efectivo').reduce((a, e) => a + e.amount, 0);
  const bankBalance = sales.filter(s => s.paymentMethod === 'transferencia').reduce((a, s) => a + s.total, 0) -
                      expenses.filter(e => e.paymentMethod === 'transferencia').reduce((a, e) => a + e.amount, 0);
  const accountsReceivable = sales.filter(s => s.paymentMethod === 'fiado').reduce((a, s) => a + s.total, 0);
  const inventoryAssetValue = products.reduce((acc, p) => acc + (p.cost * p.stock), 0);
  const totalAssets = Math.max(0, cashInHand) + Math.max(0, bankBalance) + accountsReceivable + inventoryAssetValue;

  // Generar Asientos del Libro Diario basados en las operaciones reales
  interface FormattedJournalEntry {
    id: string;
    date: string;
    time: string;
    concept: string;
    rows: Array<{ account: string; debit: number; credit: number }>;
  }

  const journalEntries: FormattedJournalEntry[] = [];

  // Asientos por ventas
  sales.forEach(sale => {
    const cashAccount = sale.paymentMethod === 'efectivo' 
      ? '101 - Caja General (Efectivo)' 
      : sale.paymentMethod === 'transferencia' 
        ? '102 - Bancos / Billetera Móvil' 
        : sale.paymentMethod === 'fiado' 
          ? '103 - Cuentas por Cobrar (Clientes)' 
          : '104 - Cobros con Tarjeta';

    const itemsSummary = sale.items.map(it => `${it.quantity}x ${it.name}`).join(', ');

    // 1. Asiento de ingreso por la venta
    journalEntries.push({
      id: `je-sale-${sale.id}`,
      date: sale.date,
      time: sale.time,
      concept: `Venta de mercadería (${itemsSummary})`,
      rows: [
        { account: cashAccount, debit: sale.total, credit: 0 },
        { account: '701 - Ingresos por Ventas de Abarrotes', debit: 0, credit: sale.total },
        { account: '691 - Costo de Ventas (Mercadería Despachada)', debit: sale.totalCost, credit: 0 },
        { account: '201 - Inventario de Mercadería en Almacén', debit: 0, credit: sale.totalCost },
      ],
    });
  });

  // Asientos por gastos
  expenses.forEach(exp => {
    const paymentAccount = exp.paymentMethod === 'efectivo' ? '101 - Caja General' : '102 - Bancos / Transferencia';
    const expenseAccount = {
      transporte: '631 - Gastos de Transporte y Fletes',
      empaques: '632 - Gastos de Empaque y Bolsas',
      servicios: '633 - Gastos de Servicios Básicos',
      mercaderia: '201 - Compra directa de insumos/mercadería',
      otros: '639 - Otros Gastos Operativos',
    }[exp.category];

    journalEntries.push({
      id: `je-exp-${exp.id}`,
      date: exp.date,
      time: exp.time,
      concept: `Pago de gasto: ${exp.concept}`,
      rows: [
        { account: expenseAccount, debit: exp.amount, credit: 0 },
        { account: paymentAccount, debit: 0, credit: exp.amount },
      ],
    });
  });

  // Ordenar cronológicamente (más recientes primero)
  journalEntries.sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));

  // Totales de Debe y Haber del Libro Diario
  const totalDebit = journalEntries.reduce((acc, je) => acc + je.rows.reduce((rAcc, row) => rAcc + row.debit, 0), 0);
  const totalCredit = journalEntries.reduce((acc, je) => acc + je.rows.reduce((rAcc, row) => rAcc + row.credit, 0), 0);
  const isJournalBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(amount);
    if (!concept.trim() || isNaN(amountNum) || amountNum <= 0) return;

    const now = new Date();
    onAddExpense({
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().split(' ')[0].substring(0, 5),
      concept: concept.trim(),
      amount: amountNum,
      category,
      paymentMethod,
      notes: notes.trim() || undefined,
    });

    setConcept('');
    setAmount('');
    setNotes('');
    setIsExpenseModalOpen(false);
  };

  const handleShareAccountingWhatsApp = () => {
    const text = `📊 *ESTADO FINANCIERO Y RESULTADOS*\n` +
      `🏪 *${settings.storeName.toUpperCase()}*\n` +
      `📅 Fecha de emisión: ${new Date().toLocaleDateString('es-ES')}\n` +
      `--------------------------------\n` +
      `💰 *Ingresos por Ventas:* ${settings.currencySymbol}${totalSalesRevenue.toFixed(2)}\n` +
      `📦 *Costo de Mercadería:* -${settings.currencySymbol}${totalCostOfGoods.toFixed(2)}\n` +
      `📈 *Utilidad Bruta:* ${settings.currencySymbol}${grossProfit.toFixed(2)} (${grossMarginPercent}%)\n` +
      `💸 *Gastos Operativos:* -${settings.currencySymbol}${totalExpenses.toFixed(2)}\n` +
      `🏆 *UTILIDAD NETA LIMPIA:* ${settings.currencySymbol}${netIncome.toFixed(2)} (${netMarginPercent}%)\n\n` +
      `*ACTIVOS DE LA TIENDA:*\n` +
      `• Efectivo Disponible: ${settings.currencySymbol}${Math.max(0, cashInHand).toFixed(2)}\n` +
      `• Bancos / Transferencias: ${settings.currencySymbol}${Math.max(0, bankBalance).toFixed(2)}\n` +
      `• Inventario en Bodega: ${settings.currencySymbol}${inventoryAssetValue.toFixed(2)}\n` +
      `• Fiados por Cobrar: ${settings.currencySymbol}${accountsReceivable.toFixed(2)}\n` +
      `--------------------------------\n` +
      `Generado desde el Módulo Contable de TiendaCasa.`;

    openWhatsApp(settings.whatsappPhone, text);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Encabezado Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-white">Contabilidad & Estados Financieros</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Partida Doble
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Libro Diario estructurado, Estado de Resultados (P&L), Balance de Activos y Control de Gastos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpenseModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-400 border border-rose-500/20 font-bold text-xs transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>+ Registrar Gasto</span>
          </button>

          <button
            onClick={handleShareAccountingWhatsApp}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-lg shadow-emerald-600/30 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Enviar Balance a WhatsApp</span>
          </button>
        </div>
      </div>

      {/* Tarjetas de Resumen Financiero Rápido */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Ventas Totales
          </span>
          <p className="text-2xl font-black text-white">
            {settings.currencySymbol}{totalSalesRevenue.toFixed(2)}
          </p>
          <span className="text-[11px] text-emerald-400 font-semibold mt-1 block">
            {sales.length} transacciones de venta
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Costo de Mercadería (COGS)
          </span>
          <p className="text-2xl font-black text-amber-300">
            {settings.currencySymbol}{totalCostOfGoods.toFixed(2)}
          </p>
          <span className="text-[11px] text-slate-400 font-medium mt-1 block">
            Valor de compra de lo vendido
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Gastos Operativos
          </span>
          <p className="text-2xl font-black text-rose-400">
            {settings.currencySymbol}{totalExpenses.toFixed(2)}
          </p>
          <span className="text-[11px] text-rose-300 font-medium mt-1 block">
            Fletes, empaques y servicios
          </span>
        </div>

        <div className="bg-slate-900 border border-emerald-500/30 p-4 rounded-3xl bg-gradient-to-br from-emerald-950/20 to-slate-900">
          <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block mb-1">
            Utilidad Neta Limpia
          </span>
          <p className={`text-2xl font-black ${netIncome >= 0 ? 'text-emerald-300' : 'text-rose-400'}`}>
            {settings.currencySymbol}{netIncome.toFixed(2)}
          </p>
          <span className="text-[11px] text-emerald-400 font-semibold mt-1 block">
            Margen neto del {netMarginPercent}%
          </span>
        </div>
      </div>

      {/* Pestañas de Navegación Contable */}
      <div className="flex border-b border-slate-800 gap-2 overflow-x-auto no-scrollbar">
        {[
          { id: 'diario', label: '📖 Libro Diario (Asientos Contables)', icon: BookOpen },
          { id: 'resultados', label: '📈 Estado de Resultados (P&L)', icon: TrendingUp },
          { id: 'balance', label: '🏛️ Balance de Activos y Caja', icon: Layers },
          { id: 'gastos', label: '💸 Control de Gastos y Egresos', icon: Receipt },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* SECCIÓN 1: LIBRO DIARIO */}
      {activeTab === 'diario' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-900 p-4 rounded-2xl border border-slate-800">
            <div>
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <span>Libro Diario General</span>
                {isJournalBalanced ? (
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-semibold">
                    ✓ Balanceado (Sumas Iguales)
                  </span>
                ) : (
                  <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-semibold">
                    Revisar Cuadre
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Registro cronológico con partida doble de cada venta y gasto registrado en la tienda.
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Movimientos</span>
              <span className="text-sm font-mono font-bold text-slate-200">
                Debe: {settings.currencySymbol}{totalDebit.toFixed(2)} | Haber: {settings.currencySymbol}{totalCredit.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Listado de Asientos Contables */}
          <div className="space-y-3">
            {journalEntries.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400">
                <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-white">No hay asientos registrados aún</p>
                <p className="text-xs text-slate-400 mt-1">Registra una venta o un gasto para ver el Libro Diario en tiempo real.</p>
              </div>
            ) : (
              journalEntries.map((entry, idx) => (
                <div key={entry.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-md">
                  {/* Encabezado del Asiento */}
                  <div className="bg-slate-800/60 px-4 py-2.5 border-b border-slate-800 flex flex-wrap items-center justify-between text-xs gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold bg-slate-900 px-2 py-0.5 rounded text-emerald-400">
                        Asiento #{journalEntries.length - idx}
                      </span>
                      <span className="text-slate-400">{entry.date} {entry.time}</span>
                    </div>
                    <span className="font-semibold text-slate-200">{entry.concept}</span>
                  </div>

                  {/* Tabla del Asiento */}
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-slate-400 border-b border-slate-800/60 text-[10px] uppercase tracking-wider bg-slate-950/20">
                        <th className="py-2 px-4">Cuenta Contable</th>
                        <th className="py-2 px-4 text-right w-28">Debe (Débito)</th>
                        <th className="py-2 px-4 text-right w-28">Haber (Crédito)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40">
                      {entry.rows.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-slate-800/20">
                          <td className={`py-2 px-4 ${row.credit > 0 ? 'pl-8 text-slate-300' : 'font-semibold text-white'}`}>
                            {row.account}
                          </td>
                          <td className="py-2 px-4 text-right font-mono text-emerald-400">
                            {row.debit > 0 ? `${settings.currencySymbol}${row.debit.toFixed(2)}` : '-'}
                          </td>
                          <td className="py-2 px-4 text-right font-mono text-indigo-300">
                            {row.credit > 0 ? `${settings.currencySymbol}${row.credit.toFixed(2)}` : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SECCIÓN 2: ESTADO DE RESULTADOS (PÉRDIDAS Y GANANCIAS) */}
      {activeTab === 'resultados' && (
        <div className="max-w-3xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="text-center pb-4 border-b border-slate-800">
            <h3 className="text-xl font-black text-white">Estado de Resultados (P&L)</h3>
            <p className="text-xs text-slate-400 mt-1">
              {settings.storeName} • Cuentas consolidadas en formato fácil de entender
            </p>
          </div>

          <div className="space-y-4 text-sm">
            {/* Ingresos por Ventas */}
            <div className="flex justify-between items-center py-2 border-b border-slate-800 font-bold text-white">
              <span>(+) Ingresos Brutos por Ventas</span>
              <span className="text-emerald-400 font-mono text-base">
                {settings.currencySymbol}{totalSalesRevenue.toFixed(2)}
              </span>
            </div>

            {/* Costo de Ventas */}
            <div className="flex justify-between items-center py-2 border-b border-slate-800 text-slate-300 pl-4">
              <span>(-) Costo de Mercadería Vendida (COGS)</span>
              <span className="text-amber-300 font-mono">
                -{settings.currencySymbol}{totalCostOfGoods.toFixed(2)}
              </span>
            </div>

            {/* Utilidad Bruta */}
            <div className="flex justify-between items-center py-3 bg-slate-800/40 px-4 rounded-xl font-bold text-white">
              <div>
                <span>(=) Utilidad Bruta</span>
                <span className="text-xs text-slate-400 block font-normal">
                  Margen de ganancia comercial sobre productos
                </span>
              </div>
              <span className="text-teal-300 font-mono text-lg">
                {settings.currencySymbol}{grossProfit.toFixed(2)} ({grossMarginPercent}%)
              </span>
            </div>

            {/* Gastos Operativos */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                (-) Gastos Operativos del Negocio:
              </span>
              {['transporte', 'empaques', 'servicios', 'otros'].map(cat => {
                const catTotal = expenses.filter(e => e.category === cat).reduce((a, b) => a + b.amount, 0);
                if (catTotal === 0) return null;
                return (
                  <div key={cat} className="flex justify-between items-center text-xs text-slate-400 pl-4">
                    <span className="capitalize">• Gasto en {cat}</span>
                    <span className="font-mono text-rose-400">-{settings.currencySymbol}{catTotal.toFixed(2)}</span>
                  </div>
                );
              })}
              <div className="flex justify-between items-center text-xs font-semibold text-rose-300 pl-4 pt-1">
                <span>Total Gastos Operativos</span>
                <span className="font-mono">-{settings.currencySymbol}{totalExpenses.toFixed(2)}</span>
              </div>
            </div>

            {/* UTILIDAD NETA FINAL */}
            <div className="mt-6 p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-800/60 to-slate-800/40 border border-emerald-500/40 flex justify-between items-center">
              <div>
                <span className="text-xs uppercase font-extrabold text-emerald-400 tracking-wider block">
                  (=) UTILIDAD NETA LIMPIA
                </span>
                <span className="text-xs text-slate-400">
                  Ganancia real después de reponer mercadería y pagar gastos
                </span>
              </div>
              <span className={`text-2xl sm:text-3xl font-black font-mono ${netIncome >= 0 ? 'text-emerald-300' : 'text-rose-400'}`}>
                {settings.currencySymbol}{netIncome.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* SECCIÓN 3: BALANCE DE ACTIVOS Y CAJA */}
      {activeTab === 'balance' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-400" />
              <span>Activos Corrientes (Disponibles Hoy)</span>
            </h3>
            <p className="text-xs text-slate-400">
              ¿Dónde está el dinero y los recursos del negocio en este momento?
            </p>

            <div className="space-y-3 pt-2 text-sm">
              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <div>
                  <span className="font-semibold text-white block">💵 Efectivo Físico en Caja</span>
                  <span className="text-[11px] text-slate-400">Dinero en mano tras ventas y pagos</span>
                </div>
                <span className="font-mono font-bold text-emerald-400 text-base">
                  {settings.currencySymbol}{Math.max(0, cashInHand).toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <div>
                  <span className="font-semibold text-white block">📱 Saldo en Banco / Transferencias</span>
                  <span className="text-[11px] text-slate-400">Cobros recibidos por canales digitales</span>
                </div>
                <span className="font-mono font-bold text-indigo-300 text-base">
                  {settings.currencySymbol}{Math.max(0, bankBalance).toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <div>
                  <span className="font-semibold text-white block">📦 Mercadería en Bodega (Inventario)</span>
                  <span className="text-[11px] text-slate-400">Valor de costo del stock de azúcar, arroz, etc.</span>
                </div>
                <span className="font-mono font-bold text-teal-300 text-base">
                  {settings.currencySymbol}{inventoryAssetValue.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <div>
                  <span className="font-semibold text-white block">📝 Cuentas por Cobrar (Fiados)</span>
                  <span className="text-[11px] text-slate-400">Dinero pendiente de pago por vecinos</span>
                </div>
                <span className="font-mono font-bold text-amber-300 text-base">
                  {settings.currencySymbol}{accountsReceivable.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
              <span className="font-bold text-white text-sm">TOTAL ACTIVOS DE LA TIENDA:</span>
              <span className="text-xl font-black text-emerald-400 font-mono">
                {settings.currencySymbol}{totalAssets.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-white text-base mb-2">Salud Financiera & Liquidez</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Tener un control contable claro te permite saber exactamente cuánto dinero tienes libre para reinvertir en bultos de azúcar, aceite y arroz a precio mayorista.
              </p>

              <div className="mt-5 space-y-3">
                <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/50">
                  <span className="text-xs font-bold text-slate-300 block mb-1">
                    🎯 Capital de Trabajo Inmediato:
                  </span>
                  <p className="text-xs text-slate-400">
                    Cuentas con <strong className="text-emerald-400">{settings.currencySymbol}{(Math.max(0, cashInHand) + Math.max(0, bankBalance)).toFixed(2)}</strong> disponibles entre efectivo y bancos listos para compras inmediatas.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/50">
                  <span className="text-xs font-bold text-slate-300 block mb-1">
                    ⚠️ Riesgo en Fiados:
                  </span>
                  <p className="text-xs text-slate-400">
                    {accountsReceivable > 0 
                      ? `Tienes ${settings.currencySymbol}${accountsReceivable.toFixed(2)} pendientes en la calle. Te recomendamos cobrar antes de otorgar nuevos créditos.` 
                      : '¡Excelente! No tienes cuentas por cobrar pendientes de fiado.'}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleShareAccountingWhatsApp}
              className="mt-6 w-full py-3.5 rounded-2xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-2 shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Enviar Reporte Contable por WhatsApp</span>
            </button>
          </div>
        </div>
      )}

      {/* SECCIÓN 4: CONTROL DE GASTOS Y EGRESOS */}
      {activeTab === 'gastos' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-900 p-4 rounded-2xl border border-slate-800">
            <div>
              <h3 className="font-bold text-white text-base">Registro de Egresos y Gastos</h3>
              <p className="text-xs text-slate-400">
                Registra fletes, bolsas, pasajes o servicios para descontarlos automáticamente de la ganancia.
              </p>
            </div>
            <button
              onClick={() => setIsExpenseModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>+ Nuevo Gasto</span>
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            {expenses.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <Receipt className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-white">No hay gastos registrados</p>
                <p className="text-xs text-slate-400 mt-1">Registra gastos como bolsas o transporte para calcular tu ganancia neta exacta.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/60">
                {expenses.map(exp => (
                  <div key={exp.id} className="p-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono font-bold text-slate-400">{exp.date} {exp.time}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 capitalize">
                          {exp.category}
                        </span>
                        <span className="text-xs text-slate-400 capitalize">
                          • Pago en {exp.paymentMethod}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-white">{exp.concept}</p>
                      {exp.notes && <p className="text-xs text-slate-400">{exp.notes}</p>}
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-base font-black text-rose-400 font-mono">
                        -{settings.currencySymbol}{exp.amount.toFixed(2)}
                      </span>
                      <button
                        onClick={() => onDeleteExpense(exp.id)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400"
                        title="Eliminar gasto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal para Registrar Gasto */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Receipt className="w-5 h-5 text-rose-400" />
                <span>Registrar Gasto o Egreso</span>
              </h3>
              <button
                onClick={() => setIsExpenseModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Concepto del Gasto *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Bolsas de plástico, Flete de azúcar, Recibo luz..."
                  value={concept}
                  onChange={e => setConcept(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Monto ({settings.currencySymbol}) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm font-bold text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Categoría
                  </label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="transporte">Transporte / Fletes</option>
                    <option value="empaques">Bolsas / Empaques</option>
                    <option value="servicios">Servicios Básicos</option>
                    <option value="mercaderia">Compra Mercadería</option>
                    <option value="otros">Otros Gastos</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Método de Pago
                </label>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-500"
                >
                  <option value="efectivo">Efectivo de Caja</option>
                  <option value="transferencia">Transferencia Bancaria</option>
                  <option value="tarjeta">Tarjeta</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Nota Adicional (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Detalles adicionales..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-rose-600/30"
                >
                  <Check className="w-4 h-4" />
                  <span>Guardar Gasto</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
