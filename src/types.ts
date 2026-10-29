export type PaymentMethod = 'efectivo' | 'transferencia' | 'fiado' | 'tarjeta';

export interface Product {
  id: string;
  name: string;              // Nombre personalizado por el vendedor (ej: Azúcar Blanca Doña María)
  brand?: string;            // Marca o proveedor opcional
  category: 'abarrotes' | 'lacteos' | 'limpieza' | 'bebidas' | 'otros';
  price: number;             // Precio de venta al público
  cost: number;              // Costo unitario real (base para ganancias)
  wholesalePrice?: number;   // Costo de compra mayorista (ej. saco o caja)
  wholesaleUnits?: number;   // Unidades que rinde el saco o caja (ej. 50 kg, 24 unid)
  packagingOrFreightCost?: number; // Costo extra por unidad (bolsa, flete proporcional)
  unit: string;              // 'kg', 'bolsa', 'litro', 'docena', 'unidad', etc.
  stock: number;
  featured?: boolean;
}

export interface SaleItem {
  productId?: string;
  name: string;
  quantity: number;
  price: number;
  cost?: number;
  subtotal: number;
}

export interface Sale {
  id: string;
  timestamp: string;      // ISO string
  date: string;           // YYYY-MM-DD
  time: string;           // HH:mm
  items: SaleItem[];
  total: number;
  totalCost: number;
  profit: number;
  paymentMethod: PaymentMethod;
  customerName?: string;
  customerPhone?: string;
  notes?: string;
  source: 'pos' | 'express' | 'demanda_whatsapp';
}

export interface StoreSettings {
  storeName: string;
  ownerName: string;
  whatsappPhone: string;  // Con código de país, ej: +521... o +51...
  currencySymbol: string;
  address?: string;
  welcomeMessage?: string;
}

export interface Expense {
  id: string;
  date: string;           // YYYY-MM-DD
  time: string;           // HH:mm
  concept: string;
  category: 'mercaderia' | 'servicios' | 'transporte' | 'empaques' | 'otros';
  amount: number;
  paymentMethod: PaymentMethod;
  notes?: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  time: string;
  concept: string;
  type: 'ingreso_venta' | 'costo_mercaderia' | 'gasto_operativo';
  accounts: Array<{
    name: string;
    debit: number;
    credit: number;
  }>;
  total: number;
  reference: string;
}

export interface DemandAnalysisResult {
  whatsappResponse: string;
  detectedProducts: Array<{
    name: string;
    quantity: number;
    price: number;
    subtotal: number;
    productId?: string;
  }>;
  estimatedTotal: number;
  customerPhone?: string;
}

export interface BusinessTip {
  id: string;
  title: string;
  category: 'margen' | 'combos' | 'whatsapp' | 'inventario' | 'fidelizacion';
  impact: 'alto' | 'medio' | 'inmediato';
  description: string;
  actionableStep: string;
  suggestedCombo?: string[];
}



