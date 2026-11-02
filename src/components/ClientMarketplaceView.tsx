import React, { useState, useMemo } from 'react';
import { 
  Store, 
  ShoppingBag, 
  Search, 
  Phone, 
  MessageSquare, 
  MapPin, 
  Clock, 
  Star, 
  Plus, 
  Minus, 
  ExternalLink, 
  Check, 
  ArrowLeft, 
  Send, 
  Copy, 
  User, 
  LogOut,
  Sparkles,
  ShoppingBasket
} from 'lucide-react';
import { StoreListing, StoreCategory, UserProfile } from '../types';
import { openWhatsAppChat } from '../utils/whatsapp';

interface ClientMarketplaceViewProps {
  userProfile: UserProfile | null;
  stores: StoreListing[];
  currencySymbol?: string;
  onSwitchToEntrepreneur: () => void;
  onOpenRoleModal: () => void;
}

const CATEGORIES: Array<{ key: StoreCategory | 'todos'; label: string; icon: string }> = [
  { key: 'todos', label: 'Todos los Rubros', icon: '🏪' },
  { key: 'alimentos_caseros', label: 'Alimentos & Repostería', icon: '🥟' },
  { key: 'abarrotes_hogar', label: 'Abarrotes & Despensa', icon: '🛒' },
  { key: 'belleza_cuidado', label: 'Belleza & Cuidado Natural', icon: '✨' },
  { key: 'ropa_moda', label: 'Ropa & Accesorios', icon: '🧵' },
  { key: 'bebidas_postres', label: 'Bebidas, Café & Granola', icon: '☕' },
  { key: 'artesanias_hogar', label: 'Artesanías & Decoración', icon: '🌿' },
];

export const ClientMarketplaceView: React.FC<ClientMarketplaceViewProps> = ({
  userProfile,
  stores,
  currencySymbol = '$',
  onSwitchToEntrepreneur,
  onOpenRoleModal,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<StoreCategory | 'todos'>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStore, setSelectedStore] = useState<StoreListing | null>(null);

  // Carrito de compras temporal por tienda seleccionada: { [productId: string]: quantity }
  const [cartQuantities, setCartQuantities] = useState<Record<string, number>>({});
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  // Filtrado de tiendas por rubro y búsqueda
  const filteredStores = useMemo(() => {
    return stores.filter((st) => {
      // Filtro por categoría/rubro
      const matchesCategory = selectedCategory === 'todos' || st.category === selectedCategory;

      // Filtro por texto de búsqueda (nombre de tienda, dueño, o productos que vende)
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesCategory;

      const matchesStore = st.name.toLowerCase().includes(q) ||
        st.ownerName.toLowerCase().includes(q) ||
        st.description.toLowerCase().includes(q);

      const matchesProduct = st.products.some(p => p.name.toLowerCase().includes(q));

      return matchesCategory && (matchesStore || matchesProduct);
    });
  }, [stores, selectedCategory, searchQuery]);

  // Manejador para cambiar cantidad en el carrito de la tienda
  const handleQuantityChange = (productId: string, delta: number) => {
    setCartQuantities(prev => {
      const current = prev[productId] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const copy = { ...prev };
        delete copy[productId];
        return copy;
      }
      return { ...prev, [productId]: next };
    });
  };

  // Resumen del pedido actual
  const currentCartItems = useMemo(() => {
    if (!selectedStore) return [];
    return Object.entries(cartQuantities)
      .map(([pid, qty]) => {
        const prod = selectedStore.products.find(p => p.id === pid);
        if (!prod || qty <= 0) return null;
        return {
          product: prod,
          quantity: qty,
          subtotal: prod.price * qty,
        };
      })
      .filter((item): item is { product: any; quantity: number; subtotal: number } => item !== null);
  }, [selectedStore, cartQuantities]);

  const cartTotal = useMemo(() => {
    return currentCartItems.reduce((acc, it) => acc + it.subtotal, 0);
  }, [currentCartItems]);

  const cartTotalItemsCount = useMemo(() => {
    return currentCartItems.reduce((acc, it) => acc + it.quantity, 0);
  }, [currentCartItems]);

  // Generar mensaje de pedido para WhatsApp
  const generateWhatsAppMessage = () => {
    if (!selectedStore) return '';
    const clientName = userProfile?.name || 'Cliente';
    let text = `¡Hola ${selectedStore.ownerName}! Vi tu tienda *${selectedStore.name}* en TiendaCasa.\n\n`;
    
    if (currentCartItems.length > 0) {
      text += `Me gustaría hacer el siguiente pedido:\n`;
      currentCartItems.forEach(it => {
        text += `• ${it.quantity}x ${it.product.name} - ${currencySymbol}${it.subtotal.toFixed(2)}\n`;
      });
      text += `\n*Total a pagar: ${currencySymbol}${cartTotal.toFixed(2)}*\n\n`;
      text += `¿Tienes disponibilidad y cuándo podrías entregarlo o prepararlo? ¡Muchas gracias!\n- De parte de: ${clientName}`;
    } else {
      text += `Quisiera consultar sobre tus productos disponibles y métodos de entrega. ¡Muchas gracias!\n- De parte de: ${clientName}`;
    }

    return text;
  };

  const handleSendWhatsAppOrder = () => {
    if (!selectedStore) return;
    const phone = selectedStore.whatsappPhone;
    const msg = generateWhatsAppMessage();
    openWhatsAppChat(phone, msg);
  };

  const handleCopyOrderText = () => {
    const msg = generateWhatsAppMessage();
    navigator.clipboard.writeText(msg).then(() => {
      setCopiedSuccess(true);
      setTimeout(() => setCopiedSuccess(false), 2500);
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Barra Superior del Cliente */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center font-bold">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-white text-base sm:text-lg tracking-tight">
                  TiendaCasa
                </h1>
                <span className="text-[10px] font-bold text-teal-400 bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Directorio de Emprendedores
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Variedad de tiendas caseras organizadas por rubro · Pedidos directos a WhatsApp
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Indicador de Usuario */}
            <div className="hidden md:flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/60 text-xs">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-300 font-medium">
                {userProfile?.name || 'Invitado'}
              </span>
              {userProfile?.isGuest ? (
                <span className="text-[10px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded">
                  Modo Invitado
                </span>
              ) : (
                <span className="text-[10px] text-teal-400 font-mono">
                  {userProfile?.email}
                </span>
              )}
            </div>

            {/* Botón para cambiar a Emprendedor */}
            <button
              onClick={onSwitchToEntrepreneur}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20"
              title="Ir al panel de ventas y administración"
            >
              <Store className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Modo Emprendedor</span>
            </button>

            {/* Cambiar Rol / Salir */}
            <button
              onClick={onOpenRoleModal}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all text-xs"
              title="Cambiar de Rol o Iniciar con otro correo"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero y Buscador */}
      <section className="bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800 py-6 sm:py-8 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Compra directo del hogar de los emprendedores</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Descubre Tiendas y Productos Caseros
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            Explora las tiendas por su rubro, revisa sus productos con precios reales y haz tu pedido directamente al WhatsApp del vendedor.
          </p>

          {/* Barra de Búsqueda */}
          <div className="pt-2 max-w-xl mx-auto">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Busca por tienda, rubro o producto (ej: azúcar, empanadas, jabón)..."
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-teal-400 shadow-xl"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                >
                  ✕ Limpiar
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Filtro por Rubros / Categorías */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-4 w-full">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          {CATEGORIES.map(cat => {
            const isActive = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 border ${
                  isActive
                    ? 'bg-teal-500 text-slate-950 border-teal-400 shadow-md shadow-teal-500/20'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Grid de Tiendas */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-20 flex-1 w-full">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-semibold text-slate-400">
            Mostrando <strong className="text-white">{filteredStores.length}</strong> {filteredStores.length === 1 ? 'tienda disponible' : 'tiendas disponibles'}
          </p>
          {selectedCategory !== 'todos' && (
            <button
              onClick={() => setSelectedCategory('todos')}
              className="text-xs text-teal-400 hover:underline"
            >
              Ver todos los rubros
            </button>
          )}
        </div>

        {filteredStores.length === 0 ? (
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-10 text-center max-w-md mx-auto my-8">
            <Store className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white">No se encontraron tiendas</h3>
            <p className="text-xs text-slate-400 mt-1">
              Prueba buscando otro término o seleccionando "Todos los Rubros".
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('todos');
              }}
              className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
            >
              Restablecer filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredStores.map((st) => (
              <div
                key={st.id}
                onClick={() => {
                  setSelectedStore(st);
                  setCartQuantities({});
                }}
                className={`group bg-slate-900 border rounded-2xl p-5 hover:border-teal-500/50 transition-all cursor-pointer flex flex-col justify-between shadow-lg hover:shadow-teal-500/5 hover:-translate-y-0.5 ${
                  st.isUserStore ? 'border-emerald-500/50 bg-emerald-950/10' : 'border-slate-800'
                }`}
              >
                <div>
                  {/* Encabezado de la Tarjeta */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-medium text-slate-400">
                          {st.categoryLabel}
                        </span>
                        {st.isUserStore && (
                          <span className="text-[10px] bg-emerald-500 text-slate-950 font-bold px-2 py-0.5 rounded-full">
                            Tu Tienda
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-white group-hover:text-teal-300 transition-colors mt-0.5">
                        {st.name}
                      </h3>
                      <p className="text-xs text-teal-400 font-medium">
                        Por {st.ownerName}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 bg-slate-800/80 px-2 py-1 rounded-lg text-amber-400 text-xs font-bold border border-slate-700/60">
                      <Star className="w-3 h-3 fill-amber-400" />
                      <span>{st.rating || 5.0}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                    {st.description}
                  </p>

                  {/* Ubicación y Despacho */}
                  <div className="mt-3 pt-3 border-t border-slate-800/60 space-y-1 text-[11px] text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">{st.location}</span>
                    </div>
                    {st.deliveryInfo && (
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="truncate">{st.deliveryInfo}</span>
                      </div>
                    )}
                  </div>

                  {/* Previsualización de productos */}
                  <div className="mt-3 pt-3 border-t border-slate-800/60">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1.5">
                      Productos destacados ({st.products.length}):
                    </span>
                    <div className="space-y-1">
                      {st.products.slice(0, 3).map((prod) => (
                        <div key={prod.id} className="flex items-center justify-between text-xs">
                          <span className="text-slate-300 truncate max-w-[180px]">{prod.name}</span>
                          <span className="font-bold text-teal-300 tabular-nums">
                            {currencySymbol}{prod.price.toFixed(2)}
                          </span>
                        </div>
                      ))}
                      {st.products.length > 3 && (
                        <p className="text-[10px] text-slate-500 italic">
                          +{st.products.length - 3} productos más en catálogo
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Pie de tarjeta con WhatsApp directo */}
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="font-mono text-emerald-400 font-semibold">
                      {st.whatsappPhone || 'Disponible'}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="px-3 py-1.5 rounded-xl bg-teal-500/10 hover:bg-teal-500 text-teal-300 hover:text-slate-950 font-bold text-xs border border-teal-500/30 transition-all flex items-center gap-1"
                  >
                    <span>Ver Catálogo</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal / Vista Detallada de la Tienda Seleccionada */}
      {selectedStore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden my-6 flex flex-col max-h-[90vh]">
            {/* Cabecera de la Tienda */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-800 relative">
              <button
                onClick={() => setSelectedStore(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 text-xs font-semibold"
              >
                Cerrar ✕
              </button>

              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-teal-400">
                  {selectedStore.categoryLabel}
                </span>
                <span className="text-slate-500">·</span>
                <span className="text-xs text-slate-300">
                  Emprendedor: <strong>{selectedStore.ownerName}</strong>
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-white">
                {selectedStore.name}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {selectedStore.description}
              </p>

              {/* Contacto Directo con el Emprendedor */}
              <div className="mt-4 p-3 bg-slate-950/70 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      Número de WhatsApp del Vendedor
                    </span>
                    <span className="text-sm font-bold text-white font-mono">
                      {selectedStore.whatsappPhone || 'No registrado aún'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSendWhatsAppOrder}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all hover:scale-105"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Chatear por WhatsApp</span>
                </button>
              </div>
            </div>

            {/* Listado de Productos de la Tienda */}
            <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider">
                  Catálogo de Productos Disponibles
                </h3>
                <span className="text-xs text-slate-500">
                  Elige las cantidades deseadas para tu pedido
                </span>
              </div>

              {selectedStore.products.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">
                  Esta tienda aún no tiene productos publicados en su catálogo.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {selectedStore.products.map((prod) => {
                    const qty = cartQuantities[prod.id] || 0;
                    return (
                      <div
                        key={prod.id}
                        className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                          qty > 0 
                            ? 'bg-teal-500/10 border-teal-500/40 text-white' 
                            : 'bg-slate-950 border-slate-800/80 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-white">
                              {prod.name}
                            </h4>
                            {prod.unit && (
                              <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                                /{prod.unit}
                              </span>
                            )}
                          </div>
                          {prod.description && (
                            <p className="text-xs text-slate-400 mt-0.5">
                              {prod.description}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                          <div className="text-right">
                            <span className="text-base font-black text-teal-300 tabular-nums">
                              {currencySymbol}{prod.price.toFixed(2)}
                            </span>
                          </div>

                          {/* Controles de Cantidad */}
                          <div className="flex items-center bg-slate-900 border border-slate-700 rounded-xl p-1">
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(prod.id, -1)}
                              disabled={qty === 0}
                              className="p-1 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-8 text-center text-xs font-bold text-white tabular-nums">
                              {qty}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(prod.id, 1)}
                              className="p-1 rounded-lg bg-teal-500/20 text-teal-300 hover:bg-teal-500 hover:text-slate-950 transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Barra de Pedido / Carrito (Footer del Modal) */}
            <div className="p-4 sm:p-5 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">
                  Total del Pedido ({cartTotalItemsCount} {cartTotalItemsCount === 1 ? 'artículo' : 'artículos'})
                </span>
                <span className="text-xl font-black text-teal-400 tabular-nums">
                  {currencySymbol}{cartTotal.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleCopyOrderText}
                  title="Copiar texto del pedido"
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  {copiedSuccess ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span className="hidden sm:inline">
                    {copiedSuccess ? 'Copiado' : 'Copiar Texto'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleSendWhatsAppOrder}
                  className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95"
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {cartTotalItemsCount > 0 ? 'Pedir por WhatsApp' : 'Contactar por WhatsApp'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
