import React, { useState } from 'react';
import { Share2, X, Copy, Check, Send, ShoppingBag } from 'lucide-react';
import { Product, StoreSettings } from '../types';
import { formatCatalogMessage, openWhatsApp } from '../utils/whatsapp';

interface CustomerCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  settings: StoreSettings;
}

export const CustomerCatalogModal: React.FC<CustomerCatalogModalProps> = ({
  isOpen,
  onClose,
  products,
  settings,
}) => {
  const [copied, setCopied] = useState(false);
  const [targetPhone, setTargetPhone] = useState('');

  if (!isOpen) return null;

  const catalogText = formatCatalogMessage(products, settings);

  const handleCopy = () => {
    navigator.clipboard.writeText(catalogText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendWhatsApp = () => {
    openWhatsApp(targetPhone, catalogText);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Compartir Catálogo por WhatsApp</h3>
              <p className="text-xs text-slate-400">Precios actualizados de productos de casa listos para enviar</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Input opcional de número */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
            Enviar a un número específico (opcional):
          </label>
          <input
            type="text"
            placeholder="Ej: +52 55 1234 5678 (dejar en blanco para elegir en WhatsApp)"
            value={targetPhone}
            onChange={e => setTargetPhone(e.target.value)}
            className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Previsualización del texto */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-400">Texto formateado para WhatsApp:</span>
            <button
              onClick={handleCopy}
              className="text-xs text-slate-300 hover:text-white flex items-center gap-1"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado' : 'Copiar texto'}</span>
            </button>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#0b141a] border border-[#202c33] max-h-60 overflow-y-auto text-xs text-[#e9edef] whitespace-pre-wrap font-sans leading-relaxed">
            {catalogText}
          </div>
        </div>

        {/* Acciones */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
          >
            Cerrar
          </button>
          <button
            onClick={handleSendWhatsApp}
            className="flex-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Abrir en WhatsApp y Enviar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
