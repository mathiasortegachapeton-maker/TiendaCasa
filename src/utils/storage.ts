import { Product, Sale, StoreSettings, Expense, UserProfile, StoreListing, StoreCategory } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-azucar-blanca',
    name: 'Azúcar Blanca Refinada',
    category: 'abarrotes',
    price: 1.25,
    cost: 0.90,
    unit: 'kg',
    stock: 45,
    featured: true,
  },
  {
    id: 'prod-azucar-morena',
    name: 'Azúcar Morena / Rubia',
    category: 'abarrotes',
    price: 1.35,
    cost: 1.00,
    unit: 'kg',
    stock: 30,
    featured: true,
  },
  {
    id: 'prod-arroz-extra',
    name: 'Arroz Grano Superior',
    category: 'abarrotes',
    price: 1.45,
    cost: 1.10,
    unit: 'kg',
    stock: 55,
    featured: true,
  },
  {
    id: 'prod-aceite-1l',
    name: 'Aceite Vegetal 1 Litro',
    category: 'abarrotes',
    price: 2.90,
    cost: 2.25,
    unit: 'litro',
    stock: 24,
    featured: true,
  },
  {
    id: 'prod-leche-entera',
    name: 'Leche Entera 1L',
    category: 'lacteos',
    price: 1.50,
    cost: 1.15,
    unit: 'litro',
    stock: 32,
    featured: true,
  },
  {
    id: 'prod-huevos-docena',
    name: 'Huevos Frescos de Granja',
    category: 'abarrotes',
    price: 2.80,
    cost: 2.10,
    unit: 'docena',
    stock: 20,
    featured: true,
  },
  {
    id: 'prod-harina-trigo',
    name: 'Harina de Trigo Todo Uso',
    category: 'abarrotes',
    price: 1.20,
    cost: 0.85,
    unit: 'kg',
    stock: 28,
  },
  {
    id: 'prod-cafe-molido',
    name: 'Café Tostado y Molido (250g)',
    category: 'bebidas',
    price: 3.50,
    cost: 2.60,
    unit: 'bolsa',
    stock: 18,
    featured: true,
  },
  {
    id: 'prod-sal-yodada',
    name: 'Sal de Mesa Yodada',
    category: 'abarrotes',
    price: 0.65,
    cost: 0.40,
    unit: 'kg',
    stock: 40,
  },
  {
    id: 'prod-fideos-tallarin',
    name: 'Fideos / Pastas 500g',
    category: 'abarrotes',
    price: 1.10,
    cost: 0.75,
    unit: 'paquete',
    stock: 35,
  },
  {
    id: 'prod-jabon-ropa',
    name: 'Jabón en Barra para Ropa',
    category: 'limpieza',
    price: 1.20,
    cost: 0.80,
    unit: 'unidad',
    stock: 25,
  },
  {
    id: 'prod-papel-higienico',
    name: 'Papel Higiénico (Pack 4 rollos)',
    category: 'limpieza',
    price: 2.30,
    cost: 1.60,
    unit: 'pack',
    stock: 22,
  },
];

export const DEFAULT_SETTINGS: StoreSettings = {
  storeName: 'Mi Tienda en Casa',
  ownerName: 'Ventas del Día',
  whatsappPhone: '',
  currencySymbol: '$',
  address: 'Atención a Domicilio y Local',
  welcomeMessage: '¡Hola! Bienvenidos a nuestra tienda de productos para el hogar. Consulta precios o haz tu pedido aquí:',
};

// Generar ventas iniciales de demostración para el día de hoy
export function getInitialDemoSales(): Sale[] {
  const today = new Date().toISOString().split('T')[0];
  return [
    {
      id: 'sale-demo-1',
      timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
      date: today,
      time: '09:15',
      items: [
        { productId: 'prod-azucar-blanca', name: 'Azúcar Blanca Refinada', quantity: 2, price: 1.25, cost: 0.90, subtotal: 2.50 },
        { productId: 'prod-leche-entera', name: 'Leche Entera 1L', quantity: 2, price: 1.50, cost: 1.15, subtotal: 3.00 },
      ],
      total: 5.50,
      totalCost: 4.10,
      profit: 1.40,
      paymentMethod: 'efectivo',
      customerName: 'Vecina Carmen',
      source: 'pos',
    },
    {
      id: 'sale-demo-2',
      timestamp: new Date(Date.now() - 3600000 * 1.5).toISOString(),
      date: today,
      time: '11:40',
      items: [
        { productId: 'prod-aceite-1l', name: 'Aceite Vegetal 1 Litro', quantity: 1, price: 2.90, cost: 2.25, subtotal: 2.90 },
        { productId: 'prod-arroz-extra', name: 'Arroz Grano Superior', quantity: 3, price: 1.45, cost: 1.10, subtotal: 4.35 },
      ],
      total: 7.25,
      totalCost: 5.55,
      profit: 1.70,
      paymentMethod: 'transferencia',
      customerName: 'Don Luis (WhatsApp)',
      source: 'demanda_whatsapp',
    },
  ];
}

export function loadProducts(): Product[] {
  try {
    const data = localStorage.getItem('tienda_casa_products');
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('Error cargando productos', e);
  }
  return INITIAL_PRODUCTS;
}

export function saveProducts(products: Product[]): void {
  try {
    localStorage.setItem('tienda_casa_products', JSON.stringify(products));
  } catch (e) {
    console.error('Error guardando productos', e);
  }
}

/**
 * Obtiene la fecha local en formato YYYY-MM-DD según la zona horaria del usuario
 */
export function getLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Obtiene la hora local en formato HH:mm según la zona horaria del usuario
 */
export function getLocalTimeString(d: Date = new Date()): string {
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function loadSales(): Sale[] {
  try {
    const data = localStorage.getItem('tienda_casa_sales');
    if (data !== null) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    }
    // Respaldo de seguridad permanente por si se reinició la clave primaria
    const backupData = localStorage.getItem('tienda_casa_sales_permanent_backup');
    if (backupData !== null) {
      const parsedBackup = JSON.parse(backupData);
      if (Array.isArray(parsedBackup)) {
        localStorage.setItem('tienda_casa_sales', backupData);
        return parsedBackup;
      }
    }
  } catch (e) {
    console.error('Error cargando ventas locales', e);
  }
  return [];
}

export function saveSales(sales: Sale[]): void {
  try {
    const serialized = JSON.stringify(sales);
    localStorage.setItem('tienda_casa_sales', serialized);
    // Doble respaldo permanente para asegurar que no se pierdan los datos
    localStorage.setItem('tienda_casa_sales_permanent_backup', serialized);
  } catch (e) {
    console.error('Error guardando ventas locales en este navegador', e);
  }
}

export function loadSettings(): StoreSettings {
  try {
    const data = localStorage.getItem('tienda_casa_settings');
    if (data !== null) return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
  } catch (e) {
    console.error('Error cargando configuración local', e);
  }
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: StoreSettings): void {
  try {
    localStorage.setItem('tienda_casa_settings', JSON.stringify(settings));
  } catch (e) {
    console.error('Error guardando configuración local en este navegador', e);
  }
}

export function loadExpenses(): Expense[] {
  try {
    const data = localStorage.getItem('tienda_casa_expenses');
    if (data !== null) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    }
    const backupData = localStorage.getItem('tienda_casa_expenses_permanent_backup');
    if (backupData !== null) {
      const parsedBackup = JSON.parse(backupData);
      if (Array.isArray(parsedBackup)) {
        localStorage.setItem('tienda_casa_expenses', backupData);
        return parsedBackup;
      }
    }
  } catch (e) {
    console.error('Error cargando gastos locales', e);
  }
  return [];
}

export function saveExpenses(expenses: Expense[]): void {
  try {
    const serialized = JSON.stringify(expenses);
    localStorage.setItem('tienda_casa_expenses', serialized);
    localStorage.setItem('tienda_casa_expenses_permanent_backup', serialized);
  } catch (e) {
    console.error('Error guardando gastos locales en este navegador', e);
  }
}

/**
 * Exporta toda la base de datos de este navegador a un archivo JSON para respaldo
 */
export function exportAllLocalData(): string {
  const payload = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    products: loadProducts(),
    sales: loadSales(),
    expenses: loadExpenses(),
    settings: loadSettings(),
  };
  return JSON.stringify(payload, null, 2);
}

/**
 * Importa y restaura una copia de seguridad en el localStorage de este navegador
 */
export function importAllLocalData(jsonString: string): boolean {
  try {
    const parsed = JSON.parse(jsonString);
    if (parsed.products && Array.isArray(parsed.products)) {
      saveProducts(parsed.products);
    }
    if (parsed.sales && Array.isArray(parsed.sales)) {
      saveSales(parsed.sales);
    }
    if (parsed.expenses && Array.isArray(parsed.expenses)) {
      saveExpenses(parsed.expenses);
    }
    if (parsed.settings && typeof parsed.settings === 'object') {
      saveSettings(parsed.settings);
    }
    return true;
  } catch (e) {
    console.error('Error al importar copia de seguridad local', e);
    return false;
  }
}

/**
 * Borra las ventas y gastos locales de este navegador para empezar desde cero
 */
export function clearAllLocalSalesAndExpenses(): void {
  localStorage.removeItem('tienda_casa_sales');
  localStorage.removeItem('tienda_casa_expenses');
}

/* ==========================================================================
   PERFILES DE USUARIO (EMPRENDEDOR O CLIENTE)
   ========================================================================== */

export function loadUserProfile(): UserProfile | null {
  try {
    const data = localStorage.getItem('tienda_casa_user_profile');
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Error cargando perfil de usuario', e);
  }
  return null;
}

export function saveUserProfile(profile: UserProfile): void {
  try {
    localStorage.setItem('tienda_casa_user_profile', JSON.stringify(profile));
  } catch (e) {
    console.error('Error guardando perfil de usuario', e);
  }
}

export function clearUserProfile(): void {
  try {
    localStorage.removeItem('tienda_casa_user_profile');
  } catch (e) {
    console.error('Error borrando perfil de usuario', e);
  }
}

/* ==========================================================================
   DIRECTORIO DE TIENDAS DE EMPRENDEDORES (POR RUBROS)
   ========================================================================== */

export const DEFAULT_COMMUNITY_STORES: StoreListing[] = [
  {
    id: 'store-dona-rosa-postres',
    name: 'Dulces & Empanadas Doña Rosa',
    ownerName: 'Rosa Morales',
    category: 'alimentos_caseros',
    categoryLabel: 'Alimentos & Repostería Casera',
    description: 'Postres artesanales, empanadas recién horneadas y tortas caseras hechas con amor familiar.',
    whatsappPhone: '+59178901234',
    location: 'Barrio Central · Pedidos a domicilio',
    deliveryInfo: 'Envíos en 30-45 min o retiro en puerta',
    rating: 4.9,
    featuredProductsSummary: 'Empanadas de horno, Alfajores caseros y Torta tres leches',
    products: [
      {
        id: 'p-dr-1',
        name: 'Empanadas de Carne al Horno (Docena)',
        price: 8.50,
        unit: 'docena',
        description: 'Masa suave dorada, relleno jugoso de carne picada, cebollita y huevo.',
        available: true,
        category: 'Salados'
      },
      {
        id: 'p-dr-2',
        name: 'Alfajores de Maicena con Dulce de Leche (Pack 6)',
        price: 3.80,
        unit: 'pack',
        description: 'Se deshacen en la boca, cubiertos con coco rallado natural.',
        available: true,
        category: 'Dulces'
      },
      {
        id: 'p-dr-3',
        name: 'Torta Tres Leches Casera (Porción)',
        price: 2.50,
        unit: 'porción',
        description: 'Bañada en crema suave con toque de canela y merengue ligero.',
        available: true,
        category: 'Pastelería'
      },
      {
        id: 'p-dr-4',
        name: 'Queque de Naranja Natural',
        price: 4.50,
        unit: 'molde entero',
        description: 'Bizcocho esponjoso con ralladura y jugo de naranjas frescas.',
        available: true,
        category: 'Pastelería'
      }
    ]
  },
  {
    id: 'store-abarrotes-don-pepe',
    name: 'Abarrotes & Despensa Don Pepe',
    ownerName: 'José Gutiérrez',
    category: 'abarrotes_hogar',
    categoryLabel: 'Abarrotes & Despensa de Casa',
    description: 'Tu despensa de confianza para el hogar: azúcar, arroz, aceite, huevos frescos y artículos de primera necesidad a precios justos.',
    whatsappPhone: '+59176543210',
    location: 'Av. Primavera #42 · Zona Norte',
    deliveryInfo: 'Entrega sin costo por compras mayores a $15',
    rating: 4.8,
    featuredProductsSummary: 'Azúcar blanca, Aceite vegetal 1L, Huevos de granja',
    products: [
      {
        id: 'p-dp-1',
        name: 'Azúcar Blanca Refinada (1 kg)',
        price: 1.25,
        unit: 'kg',
        description: 'Azúcar purificada de primera calidad para endulzar tus mañanas.',
        available: true,
        category: 'Básicos'
      },
      {
        id: 'p-dp-2',
        name: 'Arroz Grano de Oro Superior (1 kg)',
        price: 1.45,
        unit: 'kg',
        description: 'Grano seleccionado, rinde bastante y no se bate.',
        available: true,
        category: 'Básicos'
      },
      {
        id: 'p-dp-3',
        name: 'Aceite Vegetal Puro 1 Litro',
        price: 2.90,
        unit: 'litro',
        description: 'Aceite refinado ideal para frituras y ensaladas.',
        available: true,
        category: 'Aceites'
      },
      {
        id: 'p-dp-4',
        name: 'Huevos Frescos de Granja (Docena)',
        price: 2.80,
        unit: 'docena',
        description: 'Huevos grandes, frescos directos de granja local.',
        available: true,
        category: 'Frescos'
      },
      {
        id: 'p-dp-5',
        name: 'Jabón en Barra para Ropa (Unidad)',
        price: 1.20,
        unit: 'unidad',
        description: 'Remueve manchas difíciles y cuida los tejidos.',
        available: true,
        category: 'Limpieza'
      }
    ]
  },
  {
    id: 'store-esencia-pura-belleza',
    name: 'Esencia Pura · Cosmética & Cuidado Natural',
    ownerName: 'Valeria Sotomayor',
    category: 'belleza_cuidado',
    categoryLabel: 'Belleza & Cuidado Personal',
    description: 'Jabones artesanales saponificados en frío, aceites esenciales puros y bálsamos botánicos para consentirte.',
    whatsappPhone: '+59171239876',
    location: 'Taller Casero · Envíos a todo el país',
    deliveryInfo: 'Envíos en empaque ecológico biodegradable',
    rating: 5.0,
    featuredProductsSummary: 'Jabón de avena y miel, Bálsamos labiales, Gel de aloe vera',
    products: [
      {
        id: 'p-ep-1',
        name: 'Jabón Artesanal de Avena, Miel & Almendras',
        price: 3.50,
        unit: 'barra 120g',
        description: 'Exfoliante suave, hidrata pieles sensibles y deja aroma relajante.',
        available: true,
        category: 'Jabones'
      },
      {
        id: 'p-ep-2',
        name: 'Bálsamo Labial de Cacao & Coco',
        price: 2.00,
        unit: 'tubo 15g',
        description: 'Cera de abejas y manteca de cacao pura para labios agrietados.',
        available: true,
        category: 'Labiales'
      },
      {
        id: 'p-ep-3',
        name: 'Gel Hidratante de Aloe Vera 100% Puro',
        price: 4.80,
        unit: 'frasco 200ml',
        description: 'Calma irritaciones, quemaduras leves y refresca el cutis.',
        available: true,
        category: 'Cuidado Facial'
      }
    ]
  },
  {
    id: 'store-tejidos-mayra',
    name: 'Tejidos & Confecciones Mayra',
    ownerName: 'Mayra Quispe',
    category: 'ropa_moda',
    categoryLabel: 'Ropa & Moda de Hogar',
    description: 'Prendas tejidas a mano con lana suave, delantales de cocina reforzados y bolsos de tela reciclada.',
    whatsappPhone: '+59179988776',
    location: 'Taller Los Álamos · Pedidos personalizados',
    deliveryInfo: 'Envíos los martes y viernes',
    rating: 4.7,
    featuredProductsSummary: 'Chalinas térmicas, Delantales de chef, Bolsos de lona',
    products: [
      {
        id: 'p-tm-1',
        name: 'Chalina Unisex Tejida en Lana Suave',
        price: 7.00,
        unit: 'unidad',
        description: 'Largo 1.60m, abrigadora y liviana en varios tonos clásicos.',
        available: true,
        category: 'Accesorios'
      },
      {
        id: 'p-tm-2',
        name: 'Delantal de Cocina Reforzado con Bolsillos',
        price: 5.50,
        unit: 'unidad',
        description: 'Tela drill resistente, doble costura y tiras ajustables.',
        available: true,
        category: 'Hogar'
      },
      {
        id: 'p-tm-3',
        name: 'Bolso Ecológico de Lona para Compras',
        price: 3.00,
        unit: 'unidad',
        description: 'Reemplaza bolsas plásticas, aguanta hasta 15 kg.',
        available: true,
        category: 'Accesorios'
      }
    ]
  },
  {
    id: 'store-cafe-delicias-valle',
    name: 'Café & Delicias del Valle',
    ownerName: 'Carlos Mendoza',
    category: 'bebidas_postres',
    categoryLabel: 'Bebidas, Café & Granola',
    description: 'Café de altura seleccionado de pequeños productores, tostado fresco semanal, miel pura de abeja y granola crujiente.',
    whatsappPhone: '+59174433221',
    location: 'Distribución local · Café fresco',
    deliveryInfo: 'Tostado los lunes, despacho en 24 horas',
    rating: 4.9,
    featuredProductsSummary: 'Café molido gourmet 250g, Miel pura de monte, Granola',
    products: [
      {
        id: 'p-cd-1',
        name: 'Café de Altura Tostado y Molido (250g)',
        price: 3.90,
        unit: 'bolsa 250g',
        description: 'Notas achocolatadas, cuerpo balanceado, molienda media.',
        available: true,
        category: 'Cafetería'
      },
      {
        id: 'p-cd-2',
        name: 'Miel Pura de Abeja Silvestre (500g)',
        price: 4.50,
        unit: 'frasco 500g',
        description: '100% natural, sin jarabes añadidos, recolectada responsablemente.',
        available: true,
        category: 'Despensa Dulce'
      },
      {
        id: 'p-cd-3',
        name: 'Granola Artesanal con Frutos Secos y Miel (300g)',
        price: 3.20,
        unit: 'bolsa 300g',
        description: 'Avena horneada, nueces, almendras, pasas y semillas de girasol.',
        available: true,
        category: 'Desayunos'
      }
    ]
  },
  {
    id: 'store-taller-rustico-artesanias',
    name: 'Taller Rústico · Hogar & Artesanías',
    ownerName: 'Fernando Beltrán',
    category: 'artesanias_hogar',
    categoryLabel: 'Artesanías & Decoración del Hogar',
    description: 'Detalles únicos hechos a mano en madera recuperada, velas aromáticas de cera de soja y maceteros rústicos para embellecer tu casa.',
    whatsappPhone: '+59171122334',
    location: 'Zona Sur · Entregas a coordinar',
    deliveryInfo: 'Piezas listas para regalar con tarjeta personalizada',
    rating: 4.8,
    featuredProductsSummary: 'Velas de soja con lavanda, Set de posavasos de cedro',
    products: [
      {
        id: 'p-tr-1',
        name: 'Vela Aromática de Soja (Aroma Lavanda & Vainilla)',
        price: 4.20,
        unit: 'frasco 200ml',
        description: 'Combustión limpia, 35 horas de duración, cera 100% vegetal.',
        available: true,
        category: 'Aromaterapia'
      },
      {
        id: 'p-tr-2',
        name: 'Set de 4 Posavasos de Madera Rústica Tallada',
        price: 5.00,
        unit: 'set 4 piezas',
        description: 'Acabado impermeable natural que resalta las vetas de la madera.',
        available: true,
        category: 'Madera'
      },
      {
        id: 'p-tr-3',
        name: 'Macetero Cilíndrico de Cemento Pulido',
        price: 3.50,
        unit: 'unidad con plato',
        description: 'Ideal para suculentas y cactus en escritorios o repisas.',
        available: true,
        category: 'Jardinería'
      }
    ]
  }
];

export function loadDirectoryStores(userStoreSync?: { settings: StoreSettings; products: Product[]; profile?: UserProfile | null }): StoreListing[] {
  let stores: StoreListing[] = [];
  try {
    const raw = localStorage.getItem('tienda_casa_directory_stores');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        stores = parsed;
      }
    }
  } catch (e) {
    console.error('Error cargando directorio de tiendas', e);
  }

  if (stores.length === 0) {
    stores = [...DEFAULT_COMMUNITY_STORES];
  }

  // Si se provee información del emprendedor activo, sincronizamos su tienda para que aparezca en el directorio
  if (userStoreSync && userStoreSync.settings) {
    const { settings, products, profile } = userStoreSync;
    const userStoreId = 'user-active-store';
    
    // Categoría elegida o por defecto
    const userCategory: StoreCategory = profile?.storeCategory || 'abarrotes_hogar';
    const categoryLabels: Record<StoreCategory, string> = {
      alimentos_caseros: 'Alimentos & Repostería Casera',
      abarrotes_hogar: 'Abarrotes & Despensa de Casa',
      belleza_cuidado: 'Belleza & Cuidado Personal',
      ropa_moda: 'Ropa & Moda de Hogar',
      artesanias_hogar: 'Artesanías & Decoración del Hogar',
      bebidas_postres: 'Bebidas, Café & Postres',
      servicios: 'Servicios & Arreglos'
    };

    const userStoreProducts = products.map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      unit: p.unit,
      description: `${p.category ? `Categoría: ${p.category}` : 'Producto disponible'} · Stock actual: ${p.stock}`,
      available: p.stock > 0,
      category: p.category
    }));

    const userStoreListing: StoreListing = {
      id: userStoreId,
      name: settings.storeName || 'Mi Tienda en Casa',
      ownerName: settings.ownerName || 'Emprendedor',
      email: profile?.email,
      category: userCategory,
      categoryLabel: categoryLabels[userCategory] || 'Emprendimiento Local',
      description: settings.welcomeMessage || '¡Bienvenidos a nuestra tienda de productos para el hogar! Consulta precios y haz tu pedido por WhatsApp.',
      whatsappPhone: settings.whatsappPhone || '',
      location: settings.address || 'Atención y entregas locales',
      deliveryInfo: 'Atención directa por WhatsApp',
      rating: 5.0,
      featuredProductsSummary: products.slice(0, 3).map(p => p.name).join(', '),
      isUserStore: true,
      products: userStoreProducts
    };

    // Filtramos la previa si existía y la colocamos en primer lugar para destacar su propia tienda
    const otherStores = stores.filter(s => s.id !== userStoreId);
    stores = [userStoreListing, ...otherStores];
    saveDirectoryStores(stores);
  }

  return stores;
}

export function saveDirectoryStores(stores: StoreListing[]): void {
  try {
    localStorage.setItem('tienda_casa_directory_stores', JSON.stringify(stores));
  } catch (e) {
    console.error('Error guardando directorio de tiendas', e);
  }
}
