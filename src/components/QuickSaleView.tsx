import React, { useState } from 'react';
import { 
  Plus, 
  Minus, 
  Trash2, 
  CheckCircle2, 
  Search, 
  Sparkles, 
  Send, 
  DollarSign, 
  ShoppingBag, 
  Smartphone, 
  CreditCard, 
  BookOpen, 
  Zap,
  ArrowRight
} from 'lucide-react';
import { Product, SaleItem, PaymentMethod, Sale, StoreSettings } from '../types';
import { openWhatsApp, formatSaleReceipt } from '../utils/whatsapp';

interface QuickSaleViewProps {
  products: Product[];
  settings: StoreSettings;
  onRegisterSale: (sale: Omit<Sale, 'id' | 'timestamp' | 'date' | 'time'>) => Sale;
}

export const QuickSaleView: React.FC<QuickSaleViewProps> = ({
  products,
  settings,
  onRegisterSale,
}) => {
  const [saleMode, setSaleMode] = useState<'pos' | 'express' | 'smart'>('pos');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  
  // Estado para Carrito POS
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('efectivo');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');

  // Estado para Modo Express (entrada ultra sencilla)
  const [expressAmount, setExpressAmount] = useState('');
  const [expressConcept, setExpressConcept] = useState('');
  const [expressPayment, setExpressPayment] = useState<PaymentMethod>('efectivo');
  const [expressPhone, setExpressPhone] = useState('');

  // Estado para Modo Frase Inteligente
  const [smartText, setSmartText] = useState('');
  const [isSmartLoading, setIsSmartLoading] = useState(false);

  // Modal de venta exitosa
  const [lastRegisteredSale, setLastRegisteredSale] = useState<Sale | null>(null);

  // Filtrado de productos
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'todos' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  // Funciones de carrito
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        return prev.map(item => 
          item.productId === product.id 
            ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.price }
            : item
        );
      }
      return [
        ...prev, 
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          cost: product.cost,
          quantity: 1,
          subtotal: product.price,
        }
      ];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => {
      return prev
        .map(item => {
          if (item.productId === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 
              ? { ...item, quantity: newQty, subtotal: newQty * item.price }
              : null;
          }
          return item;
        })
        .filter(Boolean) as SaleItem[];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setCustomerName('');
    setCustomerPhone('');
    setNotes('');
  };

  const cartTotal = cart.reduce((acc, it) => acc + it.subtotal, 0);
  const cartCost = cart.reduce((acc, it) => acc + ((it.cost || it.price * 0.75) * it.quantity), 0);

  // Manejador para registrar venta de carrito POS
  const handleCheckoutPOS = () => {
    if (cart.length === 0) return;

    const newSale = onRegisterSale({
      items: cart,
      total: cartTotal,
      totalCost: cartCost,
      profit: cartTotal - cartCost,
      paymentMethod,
      customerName: customerName.trim() || undefined,
      customerPhone: customerPhone.trim() || undefined,
      notes: notes.trim() || undefined,
      source: 'pos',
    });

    setLastRegisteredSale(newSale);
    clearCart();
  };

  // Manejador para registrar venta Express
  const handleExpressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(expressAmount);
    if (isNaN(amountNum) || amountNum <= 0) return;

    const itemName = expressConcept.trim() || 'Venta rápida del hogar';
    const estimatedCost = amountNum * 0.75; // margen estimado de 25%

    const newSale = onRegisterSale({
      items: [
        {
          name: itemName,
          quantity: 1,
          price: amountNum,
          cost: estimatedCost,
          subtotal: amountNum,
        }
      ],
      total: amountNum,
      totalCost: estimatedCost,
      profit: amountNum - estimatedCost,
      paymentMethod: expressPayment,
      customerPhone: expressPhone.trim() || undefined,
      notes: 'Registro express sencillo',
      source: 'express',
    });

    setLastRegisteredSale(newSale);
    setExpressAmount('');
    setExpressConcept('');
    setExpressPhone('');
  };

  // Manejador para modo frase inteligente
  const handleSmartSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!smartText.trim()) return;

    setIsSmartLoading(true);
    try {
      const res = await fetch('/api/parse-quick-sale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quickText: smartText,
          products,
        }),
      });

      const data = await res.json();
      if (data.items && data.items.length > 0) {
        // Encontró artículos estructurados
        const parsedItems: SaleItem[] = data.items.map((it: any) => {
          const matchedProd = products.find(p => p.id === it.productId || p.name.toLowerCase() === it.name.toLowerCase());
          const unitPrice = matchedProd ? matchedProd.price : (it.price || 1);
          const unitCost = matchedProd ? matchedProd.cost : unitPrice * 0.75;
          const qty = it.quantity || 1;
          return {
            productId: matchedProd?.id,
            name: matchedProd ? matchedProd.name : it.name,
            quantity: qty,
            price: unitPrice,
            cost: unitCost,
            subtotal: unitPrice * qty,
          };
        });

        const total = parsedItems.reduce((acc, it) => acc + it.subtotal, 0);
        const totalCost = parsedItems.reduce((acc, it) => acc + ((it.cost || 0) * it.quantity), 0);

        const newSale = onRegisterSale({
          items: parsedItems,
          total,
          totalCost,
          profit: total - totalCost,
          paymentMethod: (data.paymentMethod as PaymentMethod) || 'efectivo',
          notes: `Detectado de apunte: "${smartText}"`,
          source: 'express',
        });

        setLastRegisteredSale(newSale);
        setSmartText('');
      } else {
        // Fallback básico con búsqueda simple de palabras
        const lower = smartText.toLowerCase();
        const matchedProds: SaleItem[] = [];
        products.forEach(p => {
          if (lower.includes(p.name.toLowerCase()) || lower.includes('azucar') && p.name.toLowerCase().includes('azúcar')) {
            matchedProds.push({
              productId: p.id,
              name: p.name,
              quantity: 1,
              price: p.price,
              cost: p.cost,
              subtotal: p.price,
            });
          }
        });

        if (matchedProds.length > 0) {
          const total = matchedProds.reduce((acc, it) => acc + it.subtotal, 0);
          const totalCost = matchedProds.reduce((acc, it) => acc + ((it.cost || 0) * it.quantity), 0);

          const newSale = onRegisterSale({
            items: matchedProds,
            total,
            totalCost,
            profit: total - totalCost,
            paymentMethod: 'efectivo',
            notes: `Apunte rápido: "${smartText}"`,
            source: 'express',
          });

          setLastRegisteredSale(newSale);
          setSmartText('');
        } else {
          // Si no detectó productos específicos, registrar como monto general
          const numMatch = smartText.match(/(\d+(?:\.\d{1,2})?)/);
          const amount = numMatch ? parseFloat(numMatch[1]) : 5.00;
          const newSale = onRegisterSale({
            items: [{ name: smartText, quantity: 1, price: amount, cost: amount * 0.75, subtotal: amount }],
            total: amount,
            totalCost: amount * 0.75,
            profit: amount * 0.25,
            paymentMethod: 'efectivo',
            source: 'express',
          });
          setLastRegisteredSale(newSale);
          setSmartText('');
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSmartLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Selector de tipo de ingreso */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 bg-slate-900/80 p-2 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setSaleMode('pos')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              saleMode === 'pos'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>1. Tocar Productos (POS)</span>
          </button>

          <button
            onClick={() => setSaleMode('express')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              saleMode === 'express'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>2. Entrada Express Sencilla</span>
          </button>

          <button
            onClick={() => setSaleMode('smart')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              saleMode === 'smart'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-emerald-300" />
            <span>3. Dictar / Escribir Frase</span>
          </button>
        </div>

        <div className="text-xs text-slate-400 px-2 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Ventas registradas al instante</span>
        </div>
      </div>

      {/* MODO 1: POS CON PRODUCTOS DE CASA */}
      {saleMode === 'pos' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Grilla de productos de casa */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-4">
            {/* Buscador y categorías */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar producto (ej: azúcar, aceite, arroz)..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                />
              </div>

              {/* Categorías */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {[
                  { id: 'todos', label: 'Todos' },
                  { id: 'abarrotes', label: 'Abarrotes' },
                  { id: 'lacteos', label: 'Lácteos' },
                  { id: 'bebidas', label: 'Bebidas' },
                  { id: 'limpieza', label: 'Limpieza' },
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                      selectedCategory === cat.id
                        ? 'bg-slate-700 text-white font-semibold'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Lista / Grid de productos con botón de un toque */}
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredProducts.map(product => {
                const inCart = cart.find(it => it.productId === product.id);
                return (
                  <div
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className={`relative p-3.5 rounded-2xl border transition-all cursor-pointer select-none group flex flex-col justify-between ${
                      inCart 
                        ? 'bg-emerald-950/20 border-emerald-500/50 shadow-md shadow-emerald-500/10' 
                        : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60'
                    }`}
                  >
                    {inCart && (
                      <span className="absolute -top-2 -right-2 bg-emerald-500 text-slate-950 text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-md">
                        {inCart.quantity}
                      </span>
                    )}

                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                          {product.unit}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Stock: {product.stock}
                        </span>
                      </div>

                      <h4 className="font-semibold text-slate-100 text-sm leading-snug line-clamp-2 group-hover:text-emerald-300 transition-colors">
                        {product.name}
                      </h4>
                    </div>

                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-800/80">
                      <div>
                        <span className="text-xs text-slate-400 block leading-none">Precio</span>
                        <span className="text-base font-extrabold text-white">
                          {settings.currencySymbol}{product.price.toFixed(2)}
                        </span>
                      </div>

                      <div className="w-8 h-8 rounded-xl bg-emerald-500/10 group-hover:bg-emerald-500 text-emerald-400 group-hover:text-white flex items-center justify-center transition-all">
                        <Plus className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Panel Lateral: Carrito / Cobro */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sticky top-28 shadow-xl flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-bold text-white text-base">Venta en Curso</h3>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                    {cart.reduce((a, b) => a + b.quantity, 0)} items
                  </span>
                </div>
                {cart.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Limpiar
                  </button>
                )}
              </div>

              {/* Lista de productos en carrito */}
              <div className="my-3 space-y-2 max-h-60 overflow-y-auto pr-1">
                {cart.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 flex flex-col items-center justify-center">
                    <ShoppingBag className="w-10 h-10 text-slate-400 mb-2" />
                    <p className="text-sm font-medium">No has agregado productos</p>
                    <p className="text-xs text-slate-400 mt-1">Toca cualquier producto a la izquierda (ej. Azúcar) para sumarlo.</p>
                  </div>
                ) : (
                  cart.map(item => (
                    <div 
                      key={item.productId}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 gap-2"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-200 truncate">{item.name}</p>
                        <p className="text-[11px] text-slate-400">
                          {settings.currencySymbol}{item.price.toFixed(2)} c/u
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center bg-slate-900 rounded-lg border border-slate-700 p-0.5">
                          <button
                            onClick={() => updateQuantity(item.productId!, -1)}
                            className="p-1 rounded text-slate-300 hover:text-white hover:bg-slate-800"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-xs font-bold text-white min-w-5 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.productId!, 1)}
                            className="p-1 rounded text-slate-300 hover:text-white hover:bg-slate-800"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="text-xs font-bold text-emerald-400 min-w-14 text-right">
                          {settings.currencySymbol}{item.subtotal.toFixed(2)}
                        </span>

                        <button
                          onClick={() => removeFromCart(item.productId!)}
                          className="text-slate-400 hover:text-rose-400 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Totalizador */}
              <div className="pt-3 border-t border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Total a Cobrar</span>
                  <span className="text-2xl font-black text-white">
                    {settings.currencySymbol}{cartTotal.toFixed(2)}
                  </span>
                </div>

                {/* Selección rápida de método de pago */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1.5 uppercase">
                    Método de Pago
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { id: 'efectivo', label: 'Efectivo', icon: DollarSign },
                      { id: 'transferencia', label: 'Transf.', icon: Smartphone },
                      { id: 'tarjeta', label: 'Tarjeta', icon: CreditCard },
                      { id: 'fiado', label: 'Fiado', icon: BookOpen },
                    ].map(m => {
                      const Icon = m.icon;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setPaymentMethod(m.id as PaymentMethod)}
                          className={`p-2 rounded-xl text-xs font-semibold flex flex-col items-center gap-1 border transition-all ${
                            paymentMethod === m.id
                              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                              : 'bg-slate-800/80 border-slate-700/60 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span className="text-[10px]">{m.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Datos opcionales del cliente para WhatsApp */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Nombre (opcional)"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    className="bg-slate-800/60 border border-slate-700/70 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                  <input
                    type="text"
                    placeholder="WhatsApp (+52...)"
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    className="bg-slate-800/60 border border-slate-700/70 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Botón Principal de Cobro */}
                <button
                  disabled={cart.length === 0}
                  onClick={handleCheckoutPOS}
                  className={`w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
                    cart.length > 0
                      ? 'bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white shadow-emerald-600/30 cursor-pointer'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Cobrar {settings.currencySymbol}{cartTotal.toFixed(2)}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODO 2: ENTRADA EXPRESS SENCILLA (Ingresar datos sencillos) */}
      {saleMode === 'express' && (
        <div className="max-w-xl mx-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Registro Express de Venta</h3>
                <p className="text-xs text-slate-400">
                  Ingresa solo el monto y concepto. Ideal para ventas de mostrador en 3 segundos.
                </p>
              </div>
            </div>

            <form onSubmit={handleExpressSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">
                  ¿Cuánto se cobró? ({settings.currencySymbol}) *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-emerald-400">
                    {settings.currencySymbol}
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    autoFocus
                    value={expressAmount}
                    onChange={e => setExpressAmount(e.target.value)}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-2xl pl-10 pr-4 py-3.5 text-2xl font-black text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">
                  ¿Qué se vendió? (Sencillo)
                </label>
                <input
                  type="text"
                  placeholder="Ej: 2 kilos de azúcar y 1 aceite"
                  value={expressConcept}
                  onChange={e => setExpressConcept(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all"
                />
              </div>

              {/* Botones de sugerencia rápida */}
              <div className="flex flex-wrap gap-2">
                {['Azúcar 1kg', 'Azúcar 2kg', 'Aceite 1L', 'Arroz 1kg', 'Leche + Huevos', 'Venta Variada'].map((sug, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setExpressConcept(sug)}
                    className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1.5 rounded-lg border border-slate-700/60 transition-colors"
                  >
                    + {sug}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">
                  Método de Pago
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'efectivo', label: 'Efectivo', icon: DollarSign },
                    { id: 'transferencia', label: 'Transferencia', icon: Smartphone },
                    { id: 'tarjeta', label: 'Tarjeta', icon: CreditCard },
                    { id: 'fiado', label: 'Fiado', icon: BookOpen },
                  ].map(m => {
                    const Icon = m.icon;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setExpressPayment(m.id as PaymentMethod)}
                        className={`p-3 rounded-2xl text-xs font-semibold flex flex-col items-center gap-1.5 border transition-all ${
                          expressPayment === m.id
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">
                  Teléfono del Cliente para Recibo WhatsApp (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej: +52 55 1234 5678"
                  value={expressPhone}
                  onChange={e => setExpressPhone(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-2xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-2xl font-bold text-base bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>Registrar Venta Inmediata</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODO 3: FRASE INTELIGENTE */}
      {saleMode === 'smart' && (
        <div className="max-w-xl mx-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Registro por Frase o Apunte</h3>
                <p className="text-xs text-slate-400">
                  Escribe en lenguaje natural lo vendido y la app calcula los precios de tu inventario.
                </p>
              </div>
            </div>

            <form onSubmit={handleSmartSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">
                  Describe la venta:
                </label>
                <textarea
                  rows={4}
                  value={smartText}
                  onChange={e => setSmartText(e.target.value)}
                  placeholder="Ejemplo: 'Vendí 3 kilos de azúcar blanca y 2 aceites pagado por transferencia'"
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-2xl p-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>

              {/* Ejemplos de un clic */}
              <div>
                <span className="text-[11px] text-slate-400 block mb-1.5">Probar con ejemplos rápidos:</span>
                <div className="space-y-1.5">
                  {[
                    '2 kilos de azúcar blanca y 1 litro de aceite en efectivo',
                    '3 bolsas de arroz y 1 docena de huevos pagado con transferencia',
                    '1 azúcar morena y 2 leches',
                  ].map((ex, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSmartText(ex)}
                      className="w-full text-left text-xs bg-slate-800/60 hover:bg-slate-800 text-slate-300 p-2.5 rounded-xl border border-slate-700/60 transition-colors flex items-center justify-between"
                    >
                      <span>"{ex}"</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSmartLoading || !smartText.trim()}
                className="w-full py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSmartLoading ? (
                  <span>Interpretando apunte...</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Interpretar y Registrar en el Día</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Venta Registrada con botón de WhatsApp */}
      {lastRegisteredSale && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl max-w-md w-full p-6 shadow-2xl text-center">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="text-2xl font-black text-white">¡Venta Registrada!</h3>
            <p className="text-xs text-slate-400 mt-1">
              Guardada en el balance diario y stock actualizado.
            </p>

            <div className="my-5 p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-left">
              <div className="flex justify-between items-center pb-2 border-b border-slate-700">
                <span className="text-xs text-slate-400">Total cobrado:</span>
                <span className="text-xl font-extrabold text-emerald-400">
                  {settings.currencySymbol}{lastRegisteredSale.total.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 text-xs">
                <span className="text-slate-400">Ganancia calculada:</span>
                <span className="font-semibold text-teal-300">
                  +{settings.currencySymbol}{lastRegisteredSale.profit.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-1 text-xs">
                <span className="text-slate-400">Método de pago:</span>
                <span className="font-semibold text-slate-200 capitalize">
                  {lastRegisteredSale.paymentMethod}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => {
                  const receiptText = formatSaleReceipt(lastRegisteredSale, settings);
                  openWhatsApp(lastRegisteredSale.customerPhone || '', receiptText);
                }}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Enviar Comprobante por WhatsApp</span>
              </button>

              <button
                onClick={() => setLastRegisteredSale(null)}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
              >
                Continuar / Registrar Otra Venta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
