import React from 'react';
import { 
  Store, 
  MessageSquare, 
  Zap, 
  Package, 
  BarChart3, 
  Share2, 
  Settings as SettingsIcon,
  DollarSign,
  TrendingUp,
  ShoppingBag,
  BookOpen
} from 'lucide-react';
import { StoreSettings, Sale } from '../types';

interface HeaderProps {
  currentTab: 'pos' | 'demands' | 'products' | 'summary' | 'accounting' | 'advisor';
  setCurrentTab: (tab: 'pos' | 'demands' | 'products' | 'summary' | 'accounting' | 'advisor') => void;
  settings: StoreSettings;
  todaySales: Sale[];
  onOpenSettings: () => void;
  onShareCatalog: () => void;
  onOpenWhatsAppGuide: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  settings,
  todaySales,
  onOpenSettings,
  onShareCatalog,
  onOpenWhatsAppGuide,
}) => {
  const totalToday = todaySales.reduce((acc, s) => acc + s.total, 0);
  const profitToday = todaySales.reduce((acc, s) => acc + s.profit, 0);

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 shadow-md">
      {/* Barra superior con métricas del día */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-white text-base sm:text-lg tracking-tight">
                {settings.storeName}
              </h1>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Abarrotes & Casa
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Ventas rápidas, Libro Diario y conexión a WhatsApp
            </p>
          </div>
        </div>

        {/* Resumen rápido de hoy y botones */}
        <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto py-1">
          <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/60">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
            <div className="text-left">
              <span className="text-[10px] text-slate-400 uppercase font-medium block leading-none">Hoy</span>
              <span className="text-sm font-bold text-emerald-400">
                {settings.currencySymbol}{totalToday.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/60">
            <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div className="text-left">
              <span className="text-[10px] text-slate-400 uppercase font-medium block leading-none">Ganancia</span>
              <span className="text-sm font-bold text-teal-300">
                {settings.currencySymbol}{profitToday.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 pl-1">
            <button
              onClick={onOpenWhatsAppGuide}
              title="¿Cómo conectar con WhatsApp?"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 text-xs font-semibold shadow-sm transition-all"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Conectar WhatsApp</span>
            </button>

            <button
              onClick={onShareCatalog}
              title="Compartir catálogo por WhatsApp"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-all hover:scale-105 active:scale-95"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Catálogo</span>
            </button>

            <button
              onClick={onOpenSettings}
              title="Configuración de tienda y WhatsApp"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
            >
              <SettingsIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Navegación por pestañas */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setCurrentTab('pos')}
          className={`flex items-center gap-2 py-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm border-b-2 transition-all whitespace-nowrap ${
            currentTab === 'pos'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>⚡ Venta Rápida</span>
        </button>

        <button
          onClick={() => setCurrentTab('demands')}
          className={`flex items-center gap-2 py-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm border-b-2 transition-all whitespace-nowrap relative ${
            currentTab === 'demands'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Demandas & WhatsApp</span>
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        </button>

        <button
          onClick={() => setCurrentTab('products')}
          className={`flex items-center gap-2 py-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm border-b-2 transition-all whitespace-nowrap ${
            currentTab === 'products'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Productos</span>
        </button>

        <button
          onClick={() => setCurrentTab('summary')}
          className={`flex items-center gap-2 py-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm border-b-2 transition-all whitespace-nowrap ${
            currentTab === 'summary'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Caja del Día</span>
        </button>

        <button
          onClick={() => setCurrentTab('accounting')}
          className={`flex items-center gap-2 py-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm border-b-2 transition-all whitespace-nowrap ${
            currentTab === 'accounting'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Contabilidad & Libro Diario</span>
        </button>

        <button
          onClick={() => setCurrentTab('advisor')}
          className={`flex items-center gap-2 py-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm border-b-2 transition-all whitespace-nowrap ${
            currentTab === 'advisor'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span>Consejos para Más Ganancias</span>
        </button>
      </nav>
    </header>
  );
};
