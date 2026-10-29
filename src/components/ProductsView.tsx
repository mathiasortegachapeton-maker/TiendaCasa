import React, { useState } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  DollarSign, 
  TrendingUp, 
  Layers, 
  Share2,
  Calculator,
  Tag,
  Truck,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Product, StoreSettings } from '../types';

interface ProductsViewProps {
  products: Product[];
  settings: StoreSettings;
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onShareCatalog: () => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  products,
  settings,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onShareCatalog,
}) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Estado para Edición Rápida en Línea (Inline)
  const [inlineEditingId, setInlineEditingId] = useState<string | null>(null);
  const [inlineName, setInlineName] = useState('');
  const [inlinePrice, setInlinePrice] = useState('');
  const [inlineCost, setInlineCost] = useState('');
  const [inlineStock, setInlineStock] = useState('');

  // Form State para Modal de Producto
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState<Product['category']>('abarrotes');
  const [unit, setUnit] = useState('kg');
  const [stock, setStock] = useState('50');

  // Modo de Costos: 'directo' (costo unitario libre) o 'mayorista' (calcular desde bulto/saco/caja)
  const [costMode, setCostMode] = useState<'directo' | 'mayorista'>('directo');
  const [unitCost, setUnitCost] = useState('');
  const [wholesalePrice, setWholesalePrice] = useState('');
  const [wholesaleUnits, setWholesaleUnits] = useState('50');
  const [packagingOrFreightCost, setPackagingOrFreightCost] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');

  // Abrir modal de creación
  const openCreateModal = () => {
    setEditingProduct(null);
    setName('');
    setBrand('');
    setCategory('abarrotes');
    setUnit('kg');
    setStock('30');
    setCostMode('directo');
    setUnitCost('0.90');
    setWholesalePrice('');
    setWholesaleUnits('50');
    setPackagingOrFreightCost('0.05');
    setSellingPrice('1.30');
    setIsModalOpen(true);
  };

  // Abrir modal de edición completa
  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setName(product.name);
    setBrand(product.brand || '');
    setCategory(product.category);
    setUnit(product.unit);
    setStock(product.stock.toString());
    
    if (product.wholesalePrice && product.wholesaleUnits) {
      setCostMode('mayorista');
      setWholesalePrice(product.wholesalePrice.toString());
      setWholesaleUnits(product.wholesaleUnits.toString());
      setUnitCost((product.wholesalePrice / product.wholesaleUnits).toFixed(2));
    } else {
      setCostMode('directo');
      setUnitCost(product.cost.toString());
      setWholesalePrice('');
      setWholesaleUnits('50');
    }

    setPackagingOrFreightCost(product.packagingOrFreightCost ? product.packagingOrFreightCost.toString() : '');
    setSellingPrice(product.price.toString());
    setIsModalOpen(true);
  };

  // Cálculo reactivo del costo total
  const calculatedBaseCost = costMode === 'mayorista' 
    ? (parseFloat(wholesalePrice) && parseFloat(wholesaleUnits) ? parseFloat(wholesalePrice) / parseFloat(wholesaleUnits) : 0)
    : (parseFloat(unitCost) || 0);

  const extraCost = parseFloat(packagingOrFreightCost) || 0;
  const finalRealCost = calculatedBaseCost + extraCost;
  const parsedSellingPrice = parseFloat(sellingPrice) || 0;
  const netUnitProfit = parsedSellingPrice - finalRealCost;
  const marginPercent = parsedSellingPrice > 0 ? ((netUnitProfit / parsedSellingPrice) * 100).toFixed(1) : '0';

  // Atajos para fijar margen de ganancia automático
  const applyProfitMargin = (percent: number) => {
    if (finalRealCost > 0) {
      const suggestedPrice = finalRealCost * (1 + percent / 100);
      setSellingPrice(suggestedPrice.toFixed(2));
    }
  };

  // Guardar producto desde el modal
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || parsedSellingPrice <= 0) return;

    const realCostToSave = finalRealCost > 0 ? finalRealCost : parsedSellingPrice * 0.75;
    const stockNum = parseInt(stock, 10) || 0;
    const wholesalePriceNum = costMode === 'mayorista' ? parseFloat(wholesalePrice) : undefined;
    const wholesaleUnitsNum = costMode === 'mayorista' ? parseFloat(wholesaleUnits) : undefined;
    const packagingCostNum = extraCost > 0 ? extraCost : undefined;

    if (editingProduct) {
      onUpdateProduct({
        ...editingProduct,
        name: name.trim(),
        brand: brand.trim() || undefined,
        category,
        price: parsedSellingPrice,
        cost: realCostToSave,
        wholesalePrice: wholesalePriceNum,
        wholesaleUnits: wholesaleUnitsNum,
        packagingOrFreightCost: packagingCostNum,
        unit,
        stock: stockNum,
      });
    } else {
      onAddProduct({
        name: name.trim(),
        brand: brand.trim() || undefined,
        category,
        price: parsedSellingPrice,
        cost: realCostToSave,
        wholesalePrice: wholesalePriceNum,
        wholesaleUnits: wholesaleUnitsNum,
        packagingOrFreightCost: packagingCostNum,
        unit,
        stock: stockNum,
        featured: true,
      });
    }

    setIsModalOpen(false);
  };

  // Iniciar edición rápida inline
  const startInlineEdit = (p: Product) => {
    setInlineEditingId(p.id);
    setInlineName(p.name);
    setInlinePrice(p.price.toString());
    setInlineCost(p.cost.toString());
    setInlineStock(p.stock.toString());
  };

  // Guardar edición rápida inline
  const saveInlineEdit = (p: Product) => {
    const newPrice = parseFloat(inlinePrice);
    const newCost = parseFloat(inlineCost);
    const newStock = parseInt(inlineStock, 10);

    if (!inlineName.trim() || isNaN(newPrice) || newPrice <= 0) {
      setInlineEditingId(null);
      return;
    }

    onUpdateProduct({
      ...p,
      name: inlineName.trim(),
      price: newPrice,
      cost: isNaN(newCost) ? p.cost : newCost,
      stock: isNaN(newStock) ? p.stock : newStock,
    });

    setInlineEditingId(null);
  };

  const filtered = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                          (p.brand && p.brand.toLowerCase().includes(search.toLowerCase()));
    const matchesCat = categoryFilter === 'todos' || p.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const totalStockUnits = products.reduce((acc, p) => acc + p.stock, 0);
  const totalCostValuation = products.reduce((acc, p) => acc + (p.cost * p.stock), 0);
  const totalRetailValuation = products.reduce((acc, p) => acc + (p.price * p.stock), 0);
  const totalPotentialProfit = totalRetailValuation - totalCostValuation;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Encabezado y Acciones */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-white">Catálogo & Personalización de Costos</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
              Costos Propios
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Personaliza los nombres de tus productos, ingresa tus costos reales de compra o bulto mayorista y fija tus precios.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onShareCatalog}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 font-semibold text-xs transition-all shadow-sm"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Compartir WhatsApp</span>
          </button>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-lg shadow-emerald-600/30 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Nuevo Producto Personalizado</span>
          </button>
        </div>
      </div>

      {/* Tarjetas de Métricas de Costo y Ganancia */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-xl bg-slate-800 text-slate-400">
              <DollarSign className="w-4 h-4" />
            </div>
            <span className="text-xs text-slate-400">Inversión en Costos de Compra</span>
          </div>
          <p className="text-xl font-black text-white pl-1">
            {settings.currencySymbol}{totalCostValuation.toFixed(2)}
          </p>
          <span className="text-[11px] text-slate-400 pl-1">Dinero invertido en bodega</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            <span className="text-xs text-slate-400">Valor de Venta Estimado</span>
          </div>
          <p className="text-xl font-black text-emerald-400 pl-1">
            {settings.currencySymbol}{totalRetailValuation.toFixed(2)}
          </p>
          <span className="text-[11px] text-emerald-300 font-semibold pl-1">
            {totalStockUnits} unidades totales en existencias
          </span>
        </div>

        <div className="bg-slate-900 border border-emerald-500/30 p-4 rounded-3xl bg-gradient-to-br from-emerald-950/20 to-slate-900">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-xs text-teal-300 font-bold">Ganancia Neta Potencial</span>
          </div>
          <p className="text-xl font-black text-teal-300 pl-1">
            +{settings.currencySymbol}{totalPotentialProfit.toFixed(2)}
          </p>
          <span className="text-[11px] text-teal-400 pl-1">
            Margen neto promedio: {totalRetailValuation > 0 ? ((totalPotentialProfit / totalRetailValuation) * 100).toFixed(0) : 0}%
          </span>
        </div>
      </div>

      {/* Filtros y Buscador */}
      <div className="flex flex-col sm:flex-row gap-3 bg-slate-900 p-3 rounded-2xl border border-slate-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre personalizado o marca (ej: Azúcar, Arroz, Manuelita)..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {[
            { id: 'todos', label: 'Todos' },
            { id: 'abarrotes', label: 'Abarrotes' },
            { id: 'lacteos', label: 'Lácteos' },
            { id: 'bebidas', label: 'Bebidas' },
            { id: 'limpieza', label: 'Limpieza' },
          ].map(c => (
            <button
              key={c.id}
              onClick={() => setCategoryFilter(c.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                categoryFilter === c.id
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla con Edición Rápida y Desglose de Costos Reales */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span>💡 <strong>Consejo del Tendero:</strong> Puedes editar el nombre o costo directamente en la fila con el botón de edición rápida o pulsar en el lápiz para abrir la calculadora de bulto/saco.</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-800/40 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3.5 px-4">Producto & Personalización</th>
                <th className="py-3.5 px-4">Categoría</th>
                <th className="py-3.5 px-4">Costo Real Unitario</th>
                <th className="py-3.5 px-4">Precio Venta</th>
                <th className="py-3.5 px-4">Ganancia Neta</th>
                <th className="py-3.5 px-4">Stock</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm">
              {filtered.map(product => {
                const isInline = inlineEditingId === product.id;
                const profitPerUnit = product.price - product.cost;
                const margin = product.price > 0 ? ((profitPerUnit / product.price) * 100).toFixed(0) : '0';

                return (
                  <tr key={product.id} className="hover:bg-slate-800/30 transition-colors">
                    {/* Nombre y Marca */}
                    <td className="py-3.5 px-4 font-semibold text-white">
                      {isInline ? (
                        <div className="space-y-1">
                          <input
                            type="text"
                            value={inlineName}
                            onChange={e => setInlineName(e.target.value)}
                            className="bg-slate-800 border border-emerald-500 rounded-lg px-2.5 py-1 text-xs text-white w-full"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                            <Package className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-100 block">{product.name}</span>
                            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-normal">
                              <span>Unidad: {product.unit}</span>
                              {product.brand && (
                                <span className="text-emerald-400/90 font-medium bg-emerald-500/10 px-1.5 py-0.2 rounded">
                                  {product.brand}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Categoría */}
                    <td className="py-3.5 px-4">
                      <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 capitalize">
                        {product.category}
                      </span>
                    </td>

                    {/* Costo Real */}
                    <td className="py-3.5 px-4">
                      {isInline ? (
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-slate-400">{settings.currencySymbol}</span>
                          <input
                            type="number"
                            step="0.01"
                            value={inlineCost}
                            onChange={e => setInlineCost(e.target.value)}
                            className="bg-slate-800 border border-emerald-500 rounded-lg px-2 py-1 text-xs text-white w-20 font-mono"
                          />
                        </div>
                      ) : (
                        <div>
                          <span className="font-mono font-bold text-slate-200">
                            {settings.currencySymbol}{product.cost.toFixed(2)}
                          </span>
                          {product.wholesalePrice && product.wholesaleUnits ? (
                            <span className="block text-[10px] text-slate-400 font-sans">
                              (Saco: {settings.currencySymbol}{product.wholesalePrice} ÷ {product.wholesaleUnits}{product.unit})
                            </span>
                          ) : product.packagingOrFreightCost ? (
                            <span className="block text-[10px] text-slate-400 font-sans">
                              (+{settings.currencySymbol}{product.packagingOrFreightCost.toFixed(2)} flete/bolsa)
                            </span>
                          ) : null}
                        </div>
                      )}
                    </td>

                    {/* Precio de Venta */}
                    <td className="py-3.5 px-4">
                      {isInline ? (
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-slate-400">{settings.currencySymbol}</span>
                          <input
                            type="number"
                            step="0.01"
                            value={inlinePrice}
                            onChange={e => setInlinePrice(e.target.value)}
                            className="bg-slate-800 border border-emerald-500 rounded-lg px-2 py-1 text-xs text-white w-20 font-mono font-bold text-emerald-400"
                          />
                        </div>
                      ) : (
                        <span className="font-mono font-extrabold text-emerald-400 text-base">
                          {settings.currencySymbol}{product.price.toFixed(2)}
                        </span>
                      )}
                    </td>

                    {/* Ganancia Neta */}
                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-mono font-bold text-teal-300 text-xs block">
                          +{settings.currencySymbol}{profitPerUnit.toFixed(2)} / {product.unit}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                          {margin}% margen
                        </span>
                      </div>
                    </td>

                    {/* Stock */}
                    <td className="py-3.5 px-4">
                      {isInline ? (
                        <input
                          type="number"
                          value={inlineStock}
                          onChange={e => setInlineStock(e.target.value)}
                          className="bg-slate-800 border border-emerald-500 rounded-lg px-2 py-1 text-xs text-white w-16"
                        />
                      ) : (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                          {product.stock} {product.unit}
                        </span>
                      )}
                    </td>

                    {/* Acciones */}
                    <td className="py-3.5 px-4 text-right">
                      {isInline ? (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => saveInlineEdit(product)}
                            className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white"
                            title="Guardar cambios rápidos"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setInlineEditingId(null)}
                            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                            title="Cancelar"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => startInlineEdit(product)}
                            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                            title="Edición rápida en línea"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => openEditModal(product)}
                            className="p-2 rounded-lg bg-slate-800/80 hover:bg-emerald-600 text-emerald-400 hover:text-white transition-colors"
                            title="Calculadora de costos y personalización completa"
                          >
                            <Calculator className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteProduct(product.id)}
                            className="p-2 rounded-lg bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Avanzado de Personalización y Calculadora de Costos Reales */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl max-h-[92vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {editingProduct ? 'Personalizar Producto y Costos Reales' : 'Nuevo Producto Personalizado'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Ajusta los nombres a tu tienda y calcula el costo exacto de compra
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              {/* SECCIÓN 1: NOMBRE Y PERSONALIZACIÓN */}
              <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" />
                  1. Nombre y Marca a gusto del Vendedor
                </span>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Nombre del Producto *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Azúcar Blanca Especial, Arroz Superior Doña Rosa..."
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                      Marca o Proveedor (Opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Manuelita, San Carlos, Molino Central..."
                      value={brand}
                      onChange={e => setBrand(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                      Unidad de Medida
                    </label>
                    <select
                      value={unit}
                      onChange={e => setUnit(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="kg">kg (kilo)</option>
                      <option value="litro">litro</option>
                      <option value="bolsa">bolsa</option>
                      <option value="docena">docena</option>
                      <option value="paquete">paquete</option>
                      <option value="unidad">unidad</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECCIÓN 2: CALCULADORA DE COSTOS REALES PROPIOS */}
              <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <Calculator className="w-3.5 h-3.5" />
                    2. ¿Cómo compras este producto? (Tus Costos Propios)
                  </span>
                </div>

                {/* Selector modo de compra */}
                <div className="grid grid-cols-2 gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setCostMode('directo')}
                    className={`py-1.5 text-xs font-bold rounded-lg transition-colors ${
                      costMode === 'directo'
                        ? 'bg-emerald-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Costo Unitario Libre
                  </button>
                  <button
                    type="button"
                    onClick={() => setCostMode('mayorista')}
                    className={`py-1.5 text-xs font-bold rounded-lg transition-colors ${
                      costMode === 'mayorista'
                        ? 'bg-emerald-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Por Saco / Bulto / Caja
                  </button>
                </div>

                {costMode === 'directo' ? (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                      Costo Unitario de Compra ({settings.currencySymbol}) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="0.00"
                      value={unitCost}
                      onChange={e => setUnitCost(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white font-mono font-bold focus:outline-none focus:border-emerald-500"
                    />
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      Lo que pagas por cada {unit} directamente.
                    </span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                          Costo del Saco/Caja ({settings.currencySymbol})
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Ej: 45.00"
                          value={wholesalePrice}
                          onChange={e => setWholesalePrice(e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono font-bold focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                          ¿Cuántos {unit} trae?
                        </label>
                        <input
                          type="number"
                          placeholder="Ej: 50"
                          value={wholesaleUnits}
                          onChange={e => setWholesaleUnits(e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs flex justify-between items-center text-slate-300">
                      <span>Costo unitario calculado:</span>
                      <span className="font-mono font-bold text-emerald-400">
                        {settings.currencySymbol}{calculatedBaseCost.toFixed(2)} por {unit}
                      </span>
                    </div>
                  </div>
                )}

                {/* Gastos adicionales por unidad (bolsa o flete proporcional) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-slate-400" />
                      Gasto Extra por Unidad (Bolsa o Flete) (Opcional):
                    </span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Ej: 0.05 por bolsa plástica"
                    value={packagingOrFreightCost}
                    onChange={e => setPackagingOrFreightCost(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* COSTO TOTAL REAL */}
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 flex justify-between items-center">
                  <span className="text-xs font-bold text-white uppercase">Costo Real Total:</span>
                  <span className="text-base font-black text-rose-300 font-mono">
                    {settings.currencySymbol}{finalRealCost.toFixed(2)} / {unit}
                  </span>
                </div>
              </div>

              {/* SECCIÓN 3: PRECIO DE VENTA Y MARGEN */}
              <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5" />
                  3. Precio de Venta al Público y Ganancia
                </span>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold text-slate-300 uppercase">
                      Precio de Venta al Cliente ({settings.currencySymbol}) *
                    </label>
                    {/* Atajos de margen */}
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-slate-400">Margen rápido:</span>
                      {[20, 30, 40, 50].map(pct => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => applyProfitMargin(pct)}
                          className="text-[10px] font-bold bg-slate-700 hover:bg-emerald-600 text-slate-200 hover:text-white px-1.5 py-0.5 rounded transition-colors"
                        >
                          +{pct}%
                        </button>
                      ))}
                    </div>
                  </div>

                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={sellingPrice}
                    onChange={e => setSellingPrice(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-lg font-black text-emerald-400 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Desglose de Ganancia Neta Calculada */}
                <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-white block">Tu Ganancia Neta Limpia:</span>
                    <span className="text-[11px] text-slate-400">Por cada {unit} que vendas</span>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-black text-emerald-400 font-mono block">
                      +{settings.currencySymbol}{netUnitProfit > 0 ? netUnitProfit.toFixed(2) : '0.00'}
                    </span>
                    <span className="text-[10px] text-teal-300 font-bold">
                      {marginPercent}% margen sobre venta
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Stock en Existencia ({unit})
                  </label>
                  <input
                    type="number"
                    value={stock}
                    onChange={e => setStock(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Botones de acción del Modal */}
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Guardar Producto y Costos</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
