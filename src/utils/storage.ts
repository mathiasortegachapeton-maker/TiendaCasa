import { Product, Sale, StoreSettings, Expense } from '../types';

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

export function loadSales(): Sale[] {
  try {
    const data = localStorage.getItem('tienda_casa_sales');
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('Error cargando ventas', e);
  }
  return getInitialDemoSales();
}

export function saveSales(sales: Sale[]): void {
  try {
    localStorage.setItem('tienda_casa_sales', JSON.stringify(sales));
  } catch (e) {
    console.error('Error guardando ventas', e);
  }
}

export function loadSettings(): StoreSettings {
  try {
    const data = localStorage.getItem('tienda_casa_settings');
    if (data) return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
  } catch (e) {
    console.error('Error cargando configuración', e);
  }
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: StoreSettings): void {
  try {
    localStorage.setItem('tienda_casa_settings', JSON.stringify(settings));
  } catch (e) {
    console.error('Error guardando configuración', e);
  }
}

export const DEFAULT_DEMO_EXPENSES: Expense[] = [
  {
    id: 'exp-1',
    date: new Date().toISOString().split('T')[0],
    time: '08:30',
    concept: 'Bolsas biodegradables para despacho',
    category: 'empaques',
    amount: 1.80,
    paymentMethod: 'efectivo',
    notes: 'Paquete de 100 unidades',
  },
  {
    id: 'exp-2',
    date: new Date().toISOString().split('T')[0],
    time: '10:15',
    concept: 'Flete transporte de bultos de azúcar y arroz',
    category: 'transporte',
    amount: 3.50,
    paymentMethod: 'transferencia',
    notes: 'Reparto mayorista a domicilio',
  },
];

export function loadExpenses(): Expense[] {
  try {
    const data = localStorage.getItem('tienda_casa_expenses');
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('Error cargando gastos', e);
  }
  return DEFAULT_DEMO_EXPENSES;
}

export function saveExpenses(expenses: Expense[]): void {
  try {
    localStorage.setItem('tienda_casa_expenses', JSON.stringify(expenses));
  } catch (e) {
    console.error('Error guardando gastos', e);
  }
}

