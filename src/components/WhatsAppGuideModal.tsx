import React from 'react';
import { 
  X, 
  Smartphone, 
  MessageSquare, 
  CheckCircle2, 
  ExternalLink, 
  Zap, 
  Bot, 
  Sparkles,
  ShieldCheck,
  Send
} from 'lucide-react';
import { StoreSettings } from '../types';

interface WhatsAppGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: StoreSettings;
}

export const WhatsAppGuideModal: React.FC<WhatsAppGuideModalProps> = ({
  isOpen,
  onClose,
  settings,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto space-y-6">
        
        {/* Cabecera */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">¿Cómo Conectar esta App con WhatsApp?</h3>
              <p className="text-xs text-slate-400">Explicación completa de las 3 formas de conexión paso a paso</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* NIVEL 1: YA FUNCIONA EN LA APP */}
        <div className="p-5 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Nivel 1: Conexión Directa (¡Ya Activa y 100% Gratis!)
            </span>
            <span className="text-xs font-bold text-emerald-300">Sin costos ni registros</span>
          </div>

          <h4 className="text-base font-bold text-white">
            ¿Cómo está funcionando ahora mismo en tu tienda?
          </h4>

          <p className="text-xs text-slate-300 leading-relaxed">
            La aplicación utiliza el protocolo universal de enlaces <strong>wa.me</strong> de WhatsApp. Cada vez que pulsas un botón verde en la app (como <em>"Enviar por WhatsApp"</em>, <em>"Enviar Comprobante"</em> o <em>"Compartir Catálogo"</em>):
          </p>

          <ol className="text-xs text-slate-300 space-y-1.5 pl-4 list-decimal">
            <li>La app toma los productos de casa (ej. azúcar, aceite), calcula el total y formatea el texto con negritas `*...*` y emojis.</li>
            <li>Abre automáticamente WhatsApp en tu celular o <strong>WhatsApp Web</strong> en tu computadora.</li>
            <li>Si indicaste el teléfono del cliente, abre directamente el chat con esa persona. Si lo dejas vacío, te permite seleccionar a cualquier contacto o grupo vecinal.</li>
            <li>¡Solo presionas enviar y listo! Cero configuraciones difíciles.</li>
          </ol>
        </div>

        {/* NIVEL 2: WHATSAPP BUSINESS */}
        <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/70 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-300 bg-teal-500/10 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Smartphone className="w-3.5 h-3.5" />
              Nivel 2: Vincular con WhatsApp Business (Recomendado)
            </span>
            <span className="text-xs text-slate-400">Gratis en Play Store / App Store</span>
          </div>

          <h4 className="text-sm font-bold text-white">
            Cómo aprovechar al máximo tu número de tienda:
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <strong className="text-white block">🏷️ Etiquetas de Clientes:</strong>
              Crea etiquetas en WhatsApp Business como: <em>"Fiado Pendiente"</em>, <em>"Pedido en Camino"</em> y <em>"Cliente Frecuente"</em>.
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <strong className="text-white block">⚡ Respuestas Rápidas:</strong>
              Configura atajos en WhatsApp como `/catalogo` o `/pago` para pegar los mensajes generados por esta app al instante.
            </div>
          </div>
        </div>

        {/* NIVEL 3: AUTOMATIZACIÓN AVANZADA / BOT CLOUD API */}
        <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/50 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 bg-indigo-500/10 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Bot className="w-3.5 h-3.5" />
              Nivel 3: Bot 100% Automático 24/7 (WhatsApp Cloud API)
            </span>
            <span className="text-xs text-slate-400">Para cuando el negocio crezca</span>
          </div>

          <h4 className="text-sm font-bold text-white">
            ¿Cómo funcionaría si quieres que un robot conteste solo de madrugada?
          </h4>

          <p className="text-xs text-slate-400 leading-relaxed">
            Si no deseas abrir el chat tú mismo y quieres que el servidor responda automáticamente los mensajes entrantes sin tocar el teléfono, los pasos son:
          </p>

          <div className="space-y-2 text-xs text-slate-300">
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 font-bold text-[10px]">
                1
              </div>
              <p>Crear una cuenta en <strong>developers.facebook.com</strong> (Meta for Developers) y dar de alta una aplicación tipo Negocio.</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 font-bold text-[10px]">
                2
              </div>
              <p>Activar el producto <strong>WhatsApp Cloud API</strong> y registrar el número de teléfono comercial de la tienda.</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 font-bold text-[10px]">
                3
              </div>
              <p>Configurar una URL de Webhook en tu servidor (ej: `/api/whatsapp-webhook`) que reciba los mensajes entrantes de los clientes y responda utilizando la IA de Gemini con la cotización del azúcar y abarrotes.</p>
            </div>
          </div>
        </div>

        {/* Botón de cierre */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-md shadow-emerald-600/30"
          >
            Entendido, ¡Comenzar a Usar WhatsApp!
          </button>
        </div>

      </div>
    </div>
  );
};
