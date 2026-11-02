import React, { useState } from 'react';
import { Store, ShoppingBag, Mail, User, Phone, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { UserProfile, UserRole, StoreCategory } from '../types';

interface RoleOnboardingModalProps {
  isOpen: boolean;
  onSelectRoleAndSave: (profile: UserProfile, extraStoreInfo?: { storeName: string; category: StoreCategory; phone: string }) => void;
  onClose?: () => void;
  canCancel?: boolean;
}

export const RoleOnboardingModal: React.FC<RoleOnboardingModalProps> = ({
  isOpen,
  onSelectRoleAndSave,
  onClose,
  canCancel = false,
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('emprendedor');
  const [isClientGuest, setIsClientGuest] = useState(false);

  // Formulario Emprendedor
  const [entrepreneurEmail, setEntrepreneurEmail] = useState('');
  const [entrepreneurName, setEntrepreneurName] = useState('');
  const [storeName, setStoreName] = useState('Mi Tienda en Casa');
  const [storeCategory, setStoreCategory] = useState<StoreCategory>('abarrotes_hogar');
  const [entrepreneurPhone, setEntrepreneurPhone] = useState('');

  // Formulario Cliente
  const [clientEmail, setClientEmail] = useState('');
  const [clientName, setClientName] = useState('');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleEntrepreneurSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!entrepreneurEmail.trim()) {
      setErrorMsg('Por favor ingresa tu correo electrónico para continuar como emprendedor.');
      return;
    }
    if (!entrepreneurEmail.includes('@') || !entrepreneurEmail.includes('.')) {
      setErrorMsg('Por favor ingresa un correo electrónico válido.');
      return;
    }

    const profile: UserProfile = {
      id: `user-${Date.now()}`,
      role: 'emprendedor',
      email: entrepreneurEmail.trim(),
      name: entrepreneurName.trim() || 'Emprendedor',
      storeName: storeName.trim() || 'Mi Tienda en Casa',
      storeCategory: storeCategory,
      phone: entrepreneurPhone.trim(),
      isGuest: false,
      registeredAt: new Date().toISOString(),
    };

    onSelectRoleAndSave(profile, {
      storeName: storeName.trim() || 'Mi Tienda en Casa',
      category: storeCategory,
      phone: entrepreneurPhone.trim(),
    });
  };

  const handleClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientEmail.trim()) {
      setErrorMsg('Por favor ingresa tu correo electrónico, o elije la opción de Invitado.');
      return;
    }
    if (!clientEmail.includes('@') || !clientEmail.includes('.')) {
      setErrorMsg('Por favor ingresa un correo electrónico válido.');
      return;
    }

    const profile: UserProfile = {
      id: `client-${Date.now()}`,
      role: 'cliente',
      email: clientEmail.trim(),
      name: clientName.trim() || 'Cliente Amigo',
      isGuest: false,
      registeredAt: new Date().toISOString(),
    };

    onSelectRoleAndSave(profile);
  };

  const handleGuestClientContinue = () => {
    const profile: UserProfile = {
      id: `guest-${Date.now()}`,
      role: 'cliente',
      name: 'Invitado',
      isGuest: true,
      registeredAt: new Date().toISOString(),
    };
    onSelectRoleAndSave(profile);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Cabecera de Bienvenida */}
        <div className="p-6 sm:p-8 bg-gradient-to-b from-slate-800/80 to-slate-900 border-b border-slate-800 text-center relative">
          {canCancel && onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 text-xs font-semibold"
            >
              Cerrar ✕
            </button>
          )}

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Bienvenido a TiendaCasa</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            ¿Cómo deseas ingresar hoy?
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-md mx-auto">
            Selecciona tu perfil para ingresar. Puedes cambiar de rol en cualquier momento desde el menú.
          </p>

          {/* Selector de Rol Principal */}
          <div className="grid grid-cols-2 gap-3 mt-6">
            <button
              type="button"
              onClick={() => {
                setSelectedRole('emprendedor');
                setErrorMsg(null);
              }}
              className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                selectedRole === 'emprendedor'
                  ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-lg shadow-emerald-500/10'
                  : 'bg-slate-800/50 border-slate-700/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2.5 rounded-xl ${
                  selectedRole === 'emprendedor' ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-700 text-slate-300'
                }`}>
                  <Store className="w-5 h-5" />
                </div>
                {selectedRole === 'emprendedor' && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                )}
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">Soy Emprendedor</h3>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                  Gestión de ventas, libro diario, costos y catálogo WhatsApp
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedRole('cliente');
                setErrorMsg(null);
              }}
              className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                selectedRole === 'cliente'
                  ? 'bg-teal-500/15 border-teal-500 text-white shadow-lg shadow-teal-500/10'
                  : 'bg-slate-800/50 border-slate-700/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2.5 rounded-xl ${
                  selectedRole === 'cliente' ? 'bg-teal-400 text-slate-950 font-bold' : 'bg-slate-700 text-slate-300'
                }`}>
                  <ShoppingBag className="w-5 h-5" />
                </div>
                {selectedRole === 'cliente' && (
                  <CheckCircle2 className="w-4 h-4 text-teal-400" />
                )}
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">Soy Cliente</h3>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                  Explorar variedad de tiendas por rubro y pedir por WhatsApp
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Mensaje de Error si lo hay */}
        {errorMsg && (
          <div className="px-6 py-2 bg-rose-500/10 border-b border-rose-500/20 text-rose-400 text-xs font-medium text-center">
            {errorMsg}
          </div>
        )}

        {/* Formulario según Rol Elegido */}
        <div className="p-6 sm:p-8">
          {selectedRole === 'emprendedor' ? (
            <form onSubmit={handleEntrepreneurSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Tu Correo Electrónico <strong className="text-emerald-400">*</strong></span>
                </label>
                <input
                  type="email"
                  required
                  value={entrepreneurEmail}
                  onChange={(e) => setEntrepreneurEmail(e.target.value)}
                  placeholder="ejemplo@correo.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Identifica tu cuenta y mantiene tus registros seguros en este dispositivo.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Tu Nombre o Apodo</span>
                  </label>
                  <input
                    type="text"
                    value={entrepreneurName}
                    onChange={(e) => setEntrepreneurName(e.target.value)}
                    placeholder="Ej: Doña María"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                    <Store className="w-3.5 h-3.5 text-slate-400" />
                    <span>Nombre de tu Tienda</span>
                  </label>
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="Ej: Antojitos Doña María"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Rubro / Tipo de Negocio
                  </label>
                  <select
                    value={storeCategory}
                    onChange={(e) => setStoreCategory(e.target.value as StoreCategory)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500"
                  >
                    <option value="alimentos_caseros">Alimentos & Repostería Casera</option>
                    <option value="abarrotes_hogar">Abarrotes & Despensa de Casa</option>
                    <option value="belleza_cuidado">Belleza & Cuidado Personal</option>
                    <option value="ropa_moda">Ropa & Accesorios</option>
                    <option value="artesanias_hogar">Artesanías & Decoración</option>
                    <option value="bebidas_postres">Bebidas, Café & Postres</option>
                    <option value="servicios">Servicios & Reparaciones</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>WhatsApp para Pedidos</span>
                  </label>
                  <input
                    type="tel"
                    value={entrepreneurPhone}
                    onChange={(e) => setEntrepreneurPhone(e.target.value)}
                    placeholder="+591 7XXXXXXX"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                <span>Entrar como Emprendedor</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <div className="space-y-5">
              {/* Opción Rápida: Invitado */}
              <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">
                      Acceso Inmediato
                    </span>
                    <span className="text-[10px] bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded-full font-semibold">
                      Sin registro previo
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white mt-1">
                    Entrar como Invitado
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Explora el directorio de tiendas, productos y contacta a los emprendedores al instante.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleGuestClientContinue}
                  className="w-full sm:w-auto shrink-0 px-5 py-2.5 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-transform hover:scale-105 active:scale-95 shadow-md shadow-teal-500/10"
                >
                  <span>Continuar como Invitado</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-800"></div>
                <span className="flex-shrink mx-4 text-xs text-slate-500 uppercase tracking-wider font-semibold">
                  O ingresa con tu correo
                </span>
                <div className="flex-grow border-t border-slate-800"></div>
              </div>

              {/* Registro de Cliente con Correo */}
              <form onSubmit={handleClientSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-teal-400" />
                    <span>Tu Correo Electrónico</span>
                  </label>
                  <input
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="cliente@correo.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-teal-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Tu Nombre (Opcional)</span>
                  </label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Ej: Carlos Suárez"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-teal-400"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm border border-slate-700 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                >
                  <span>Registrarme como Cliente</span>
                  <ArrowRight className="w-4 h-4 text-teal-400" />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
