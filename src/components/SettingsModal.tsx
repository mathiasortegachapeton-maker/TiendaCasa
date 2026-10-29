import React, { useState, useRef } from 'react';
import { 
  Settings as SettingsIcon, 
  X, 
  Check, 
  Store, 
  Phone, 
  DollarSign, 
  MapPin, 
  HardDrive, 
  Download, 
  Upload, 
  Trash2, 
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { StoreSettings } from '../types';
import { 
  exportAllLocalData, 
  importAllLocalData, 
  clearAllLocalSalesAndExpenses 
} from '../utils/storage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: StoreSettings;
  onSaveSettings: (settings: StoreSettings) => void;
  onDataReloaded?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onDataReloaded,
}) => {
  const [storeName, setStoreName] = useState(settings.storeName);
  const [ownerName, setOwnerName] = useState(settings.ownerName);
  const [whatsappPhone, setWhatsappPhone] = useState(settings.whatsappPhone);
  const [currencySymbol, setCurrencySymbol] = useState(settings.currencySymbol);
  const [address, setAddress] = useState(settings.address || '');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      storeName: storeName.trim() || 'Mi Tienda en Casa',
      ownerName: ownerName.trim() || 'Ventas del Día',
      whatsappPhone: whatsappPhone.trim(),
      currencySymbol: currencySymbol.trim() || '$',
      address: address.trim(),
    });
    onClose();
  };

  // Descargar copia de seguridad en JSON
  const handleExportBackup = () => {
    const dataStr = exportAllLocalData();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    link.href = url;
    link.download = `respaldo_tienda_${dateStr}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setStatusMessage('Copia de seguridad descargada con éxito');
    setTimeout(() => setStatusMessage(null), 3500);
  };

  // Importar copia de seguridad desde archivo JSON
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importAllLocalData(content);
        if (success) {
          setStatusMessage('¡Datos restaurados con éxito en este navegador!');
          if (onDataReloaded) onDataReloaded();
          setTimeout(() => {
            setStatusMessage(null);
            onClose();
          }, 1500);
        } else {
          alert('El archivo seleccionado no tiene un formato válido.');
        }
      }
    };
    reader.readAsText(file);
  };

  // Limpiar ventas y gastos del navegador actual
  const handleResetSales = () => {
    if (confirm('¿Estás seguro de reiniciar todas las ventas y gastos de este navegador a CERO? Tus productos y configuración se mantendrán.')) {
      clearAllLocalSalesAndExpenses();
      setStatusMessage('Ventas y gastos reiniciados a cero');
      if (onDataReloaded) onDataReloaded();
      setTimeout(() => {
        setStatusMessage(null);
        onClose();
      }, 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl max-h-[92vh] overflow-y-auto space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center">
              <SettingsIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Configuración del Negocio & Almacenamiento</h3>
              <p className="text-xs text-slate-400">Datos locales de tu tienda y opciones de privacidad</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Notificación de estado temporal */}
        {statusMessage && (
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* RECUADRO DE PRIVACIDAD: LOCALSTORAGE AISLADO */}
        <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
            <h4 className="text-xs font-bold uppercase tracking-wider">
              Almacenamiento 100% Local & Privado (LocalStorage)
            </h4>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Todos tus registros de ventas, gastos, productos y precios se guardan <strong>exclusivamente en este navegador</strong>. Cada persona o dispositivo que abre el enlace tiene su propia tienda independiente, sin cruzarse ni sincronizarse con otros.
          </p>
        </div>

        {/* FORMULARIO DE TIENDA */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1 flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-emerald-400" />
              <span>Nombre de la Tienda / Negocio</span>
            </label>
            <input
              type="text"
              required
              value={storeName}
              onChange={e => setStoreName(e.target.value)}
              placeholder="Ej: Abarrotes Don Pepe / Tienda Familiar"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>WhatsApp Negocio</span>
              </label>
              <input
                type="text"
                placeholder="+52 1 55 1234 5678"
                value={whatsappPhone}
                onChange={e => setWhatsappPhone(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                <span>Símbolo de Moneda</span>
              </label>
              <input
                type="text"
                value={currencySymbol}
                onChange={e => setCurrencySymbol(e.target.value)}
                placeholder="$ / S/ / €"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>Dirección o Zona de Entrega (Opcional)</span>
            </label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="Ej: Calle Las Flores 123 / Entrega en Barrio Norte"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/30 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Guardar Configuración</span>
            </button>
          </div>
        </form>

        {/* SECCIÓN DE GESTIÓN Y COPIA DE SEGURIDAD LOCAL */}
        <div className="pt-4 border-t border-slate-800 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5 text-indigo-400" />
            <span>Gestión de Datos Locales en Este Navegador</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={handleExportBackup}
              className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left text-xs text-slate-200 flex items-center justify-between transition-colors group cursor-pointer"
            >
              <div>
                <span className="font-bold text-white block group-hover:text-emerald-400">
                  Descargar Copia (.json)
                </span>
                <span className="text-[10px] text-slate-400">Guarda un archivo con todos tus datos</span>
              </div>
              <Download className="w-4 h-4 text-emerald-400 shrink-0" />
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left text-xs text-slate-200 flex items-center justify-between transition-colors group cursor-pointer"
            >
              <div>
                <span className="font-bold text-white block group-hover:text-indigo-400">
                  Restaurar Copia (.json)
                </span>
                <span className="text-[10px] text-slate-400">Cargar datos desde un respaldo</span>
              </div>
              <Upload className="w-4 h-4 text-indigo-400 shrink-0" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImportFile}
            />
          </div>

          <div className="pt-1">
            <button
              type="button"
              onClick={handleResetSales}
              className="w-full py-2.5 rounded-xl bg-slate-800/80 hover:bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:text-rose-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reiniciar solo Ventas y Gastos a Cero en este dispositivo</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
