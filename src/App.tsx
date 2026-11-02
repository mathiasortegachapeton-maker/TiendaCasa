import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { QuickSaleView } from './components/QuickSaleView';
import { OnlineDemandsView } from './components/OnlineDemandsView';
import { ProductsView } from './components/ProductsView';
import { DailySummaryView } from './components/DailySummaryView';
import { CustomerCatalogModal } from './components/CustomerCatalogModal';
import { SettingsModal } from './components/SettingsModal';
import { AccountingView } from './components/AccountingView';
import { ProfitAdvisorView } from './components/ProfitAdvisorView';
import { WhatsAppGuideModal } from './components/WhatsAppGuideModal';
import { RoleOnboardingModal } from './components/RoleOnboardingModal';
import { ClientMarketplaceView } from './components/ClientMarketplaceView';
import { Product, Sale, StoreSettings, Expense, UserProfile, UserRole, StoreListing, StoreCategory } from './types';
import { 
  loadProducts, 
  saveProducts, 
  loadSales, 
  saveSales, 
  loadSettings, 
  saveSettings,
  loadExpenses,
  saveExpenses,
  loadUserProfile,
  saveUserProfile,
  clearUserProfile,
  loadDirectoryStores,
  getLocalDateString,
  getLocalTimeString
} from './utils/storage';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'pos' | 'demands' | 'products' | 'summary' | 'accounting' | 'advisor'>('pos');
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [settings, setSettings] = useState<StoreSettings>(loadSettings());
  
  // Estado de Perfil y Rol
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [currentRole, setCurrentRole] = useState<UserRole>('emprendedor');
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  // Directorio de tiendas para clientes
  const [communityStores, setCommunityStores] = useState<StoreListing[]>([]);

  // Modales adicionales
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isWhatsAppGuideOpen, setIsWhatsAppGuideOpen] = useState(false);

  // Notificación flotante / Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Carga inicial
  useEffect(() => {
    const loadedProds = loadProducts();
    const loadedSales = loadSales();
    const loadedExpenses = loadExpenses();
    const loadedSettings = loadSettings();
    const loadedProfile = loadUserProfile();

    setProducts(loadedProds);
    setSales(loadedSales);
    setExpenses(loadedExpenses);
    setSettings(loadedSettings);
    setUserProfile(loadedProfile);

    if (loadedProfile) {
      setCurrentRole(loadedProfile.role);
    } else {
      // Si entra por primera vez, mostramos la pantalla de selección de rol
      setIsRoleModalOpen(true);
    }

    // Inicializar tiendas comunitarias sincronizando la tienda local
    const initialStores = loadDirectoryStores({
      settings: loadedSettings,
      products: loadedProds,
      profile: loadedProfile,
    });
    setCommunityStores(initialStores);
  }, []);

  // Sincronizar directorio de tiendas cada vez que cambien productos, settings o perfil
  useEffect(() => {
    const updated = loadDirectoryStores({
      settings,
      products,
      profile: userProfile,
    });
    setCommunityStores(updated);
  }, [settings, products, userProfile]);

  // Manejador de Registro / Elección de Rol
  const handleSelectRoleAndSave = (
    profile: UserProfile, 
    extraStoreInfo?: { storeName: string; category: StoreCategory; phone: string }
  ) => {
    saveUserProfile(profile);
    setUserProfile(profile);
    setCurrentRole(profile.role);
    setIsRoleModalOpen(false);

    if (extraStoreInfo) {
      const updatedSettings: StoreSettings = {
        ...settings,
        storeName: extraStoreInfo.storeName || settings.storeName,
        whatsappPhone: extraStoreInfo.phone || settings.whatsappPhone,
        ownerName: profile.name || settings.ownerName,
      };
      setSettings(updatedSettings);
      saveSettings(updatedSettings);
    }

    showToast(
      profile.role === 'emprendedor'
        ? `¡Bienvenido al panel de tu tienda!`
        : `¡Bienvenido al directorio de tiendas de emprendedores!`
    );
  };

  // Manejador de gastos
  const handleAddExpense = (expData: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...expData,
      id: `exp-${Date.now()}`,
    };
    const updated = [newExpense, ...expenses];
    setExpenses(updated);
    saveExpenses(updated);
    showToast(`Gasto de ${settings.currencySymbol}${newExpense.amount.toFixed(2)} registrado`);
  };

  const handleDeleteExpense = (id: string) => {
    if (confirm('¿Deseas eliminar este gasto?')) {
      const updated = expenses.filter(e => e.id !== id);
      setExpenses(updated);
      saveExpenses(updated);
      showToast('Gasto eliminado');
    }
  };

  // Guardar cambios en productos
  const handleAddProduct = (newProdData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...newProdData,
      id: `prod-${Date.now()}`,
    };
    const updated = [newProduct, ...products];
    setProducts(updated);
    saveProducts(updated);
    showToast(`Producto "${newProduct.name}" agregado con éxito`);
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    const updated = products.map(p => p.id === updatedProduct.id ? updatedProduct : p);
    setProducts(updated);
    saveProducts(updated);
    showToast(`"${updatedProduct.name}" actualizado`);
  };

  const handleDeleteProduct = (id: string) => {
    const target = products.find(p => p.id === id);
    if (!target) return;
    if (confirm(`¿Deseas eliminar "${target.name}"?`)) {
      const updated = products.filter(p => p.id !== id);
      setProducts(updated);
      saveProducts(updated);
      showToast(`Producto eliminado`);
    }
  };

  // Registrar venta
  const handleRegisterSale = (saleData: Omit<Sale, 'id' | 'timestamp' | 'date' | 'time'>): Sale => {
    const now = new Date();
    const dateStr = getLocalDateString(now);
    const timeStr = getLocalTimeString(now);

    const newSale: Sale = {
      ...saleData,
      id: `sale-${Date.now()}`,
      timestamp: now.toISOString(),
      date: dateStr,
      time: timeStr,
    };

    // Actualizar stock de los productos que correspondan
    if (newSale.items && newSale.items.length > 0) {
      const updatedProds = products.map(p => {
        const itemSold = newSale.items.find(it => it.productId === p.id);
        if (itemSold) {
          const newStock = Math.max(0, p.stock - itemSold.quantity);
          return { ...p, stock: newStock };
        }
        return p;
      });
      setProducts(updatedProds);
      saveProducts(updatedProds);
    }

    const updatedSales = [newSale, ...sales];
    setSales(updatedSales);
    saveSales(updatedSales);

    showToast(`¡Venta de ${settings.currencySymbol}${newSale.total.toFixed(2)} guardada permanentemente!`);
    return newSale;
  };

  // Eliminar venta
  const handleDeleteSale = (saleId: string) => {
    const updated = sales.filter(s => s.id !== saleId);
    setSales(updated);
    saveSales(updated);
    showToast('Venta anulada del registro permanente');
  };

  // Limpiar ventas de hoy
  const handleClearTodaySales = () => {
    const todayStr = getLocalDateString();
    const updated = sales.filter(s => s.date !== todayStr);
    setSales(updated);
    saveSales(updated);
    showToast('Ventas de hoy reiniciadas');
  };

  // Guardar configuración
  const handleSaveSettings = (newSettings: StoreSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
    showToast('Configuración guardada');
  };

  // Ventas de hoy para el header
  const todayStr = getLocalDateString();
  const todaySales = sales.filter(s => s.date === todayStr);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-slate-950 px-4 py-2.5 rounded-2xl shadow-2xl font-bold text-xs flex items-center gap-2 animate-bounce">
          <span>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Renderizado Condicional según el Rol: Cliente o Emprendedor */}
      {currentRole === 'cliente' ? (
        <ClientMarketplaceView
          userProfile={userProfile}
          stores={communityStores}
          currencySymbol={settings.currencySymbol}
          onSwitchToEntrepreneur={() => setCurrentRole('emprendedor')}
          onOpenRoleModal={() => setIsRoleModalOpen(true)}
        />
      ) : (
        <>
          {/* Header Principal de Emprendedor */}
          <Header
            currentTab={currentTab}
            setCurrentTab={setCurrentTab}
            settings={settings}
            sales={sales}
            todaySales={todaySales}
            userProfile={userProfile}
            onOpenSettings={() => setIsSettingsModalOpen(true)}
            onShareCatalog={() => setIsCatalogModalOpen(true)}
            onOpenWhatsAppGuide={() => setIsWhatsAppGuideOpen(true)}
            onSwitchToClient={() => setCurrentRole('cliente')}
            onOpenRoleModal={() => setIsRoleModalOpen(true)}
          />

          {/* Contenido según pestaña activa del Emprendedor */}
          <main className="flex-1 pb-16">
            {currentTab === 'pos' && (
              <QuickSaleView
                products={products}
                settings={settings}
                onRegisterSale={handleRegisterSale}
              />
            )}

            {currentTab === 'demands' && (
              <OnlineDemandsView
                products={products}
                settings={settings}
                onRegisterSale={handleRegisterSale}
              />
            )}

            {currentTab === 'products' && (
              <ProductsView
                products={products}
                settings={settings}
                onAddProduct={handleAddProduct}
                onUpdateProduct={handleUpdateProduct}
                onDeleteProduct={handleDeleteProduct}
                onShareCatalog={() => setIsCatalogModalOpen(true)}
              />
            )}

            {currentTab === 'summary' && (
              <DailySummaryView
                sales={sales}
                settings={settings}
                onDeleteSale={handleDeleteSale}
                onClearTodaySales={handleClearTodaySales}
              />
            )}

            {currentTab === 'accounting' && (
              <AccountingView
                sales={sales}
                expenses={expenses}
                products={products}
                settings={settings}
                onAddExpense={handleAddExpense}
                onDeleteExpense={handleDeleteExpense}
              />
            )}

            {currentTab === 'advisor' && (
              <ProfitAdvisorView
                products={products}
                sales={sales}
                expenses={expenses}
                settings={settings}
              />
            )}
          </main>
        </>
      )}

      {/* Modal para Selección de Rol / Registro */}
      <RoleOnboardingModal
        isOpen={isRoleModalOpen}
        onSelectRoleAndSave={handleSelectRoleAndSave}
        onClose={() => setIsRoleModalOpen(false)}
        canCancel={Boolean(userProfile)}
      />

      {/* Modal para Compartir Catálogo en WhatsApp */}
      <CustomerCatalogModal
        isOpen={isCatalogModalOpen}
        onClose={() => setIsCatalogModalOpen(false)}
        products={products}
        settings={settings}
      />

      {/* Modal Guía de Conexión con WhatsApp */}
      <WhatsAppGuideModal
        isOpen={isWhatsAppGuideOpen}
        onClose={() => setIsWhatsAppGuideOpen(false)}
        settings={settings}
      />

      {/* Modal de Configuración y Gestión Local */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        onDataReloaded={() => {
          setProducts(loadProducts());
          setSales(loadSales());
          setExpenses(loadExpenses());
          setSettings(loadSettings());
          showToast('Datos locales del navegador actualizados');
        }}
      />
    </div>
  );
}
