import React, { useEffect, useState } from 'react';
import { 
  X, 
  PlusCircle, 
  Trash2, 
  Edit3, 
  LayoutDashboard, 
  Package, 
  Sparkles, 
  Check, 
  AlertCircle, 
  RotateCcw,
  Zap,
  TrendingUp,
  Image as ImageIcon,
  Layers,
  Laptop,
  Shirt,
  UtensilsCrossed,
  Activity,
  Glasses,
  BarChart3
} from 'lucide-react';
import { Product, User, Order, OrderStatus, PaymentStatus } from '../types';
import { AdminAnalytics } from './AdminAnalytics';
import {
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  updateOrder,
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  fetchSubscribers,
  Subscriber,
} from '../lib/api';
import { formatMoney } from '../config';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  products: Product[];
  orders: Order[];
  onProductsUpdated: (updatedProducts: Product[]) => void;
  onOrderUpdated: (order: Order) => void;
  onRefresh: () => void;
  onOpenAuthForAdmin: () => void;
}

// Subir foto desde la computadora o el celular
const ImageUploader: React.FC<{ onUploaded: (url: string) => void; onError: (msg: string) => void }> = ({ onUploaded, onError }) => {
  const [uploading, setUploading] = useState(false);
  return (
    <label className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold cursor-pointer border border-blue-900 text-blue-900 hover:bg-blue-50 ${uploading ? 'opacity-60 pointer-events-none' : ''}`}>
      <ImageIcon className="w-3.5 h-3.5" />
      {uploading ? 'Subiendo foto...' : 'Subir foto'}
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          e.target.value = '';
          if (!file) return;
          setUploading(true);
          try {
            onUploaded(await uploadProductImage(file));
          } catch (err: any) {
            onError(err?.message || 'No se pudo subir la foto.');
          } finally {
            setUploading(false);
          }
        }}
      />
    </label>
  );
};

const CATEGORY_OPTIONS = [
  'Tecnología',
  'Hogar y Cocina',
  'Moda y Calzado',
  'Belleza y Cuidado',
  'Deportes y Aire Libre',
  'Accesorios'
];


export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  currentUser,
  products,
  orders,
  onProductsUpdated,
  onOrderUpdated,
  onRefresh,
  onOpenAuthForAdmin,
}) => {
  const [mainTab, setMainTab] = useState<'inventory' | 'create' | 'orders' | 'analytics' | 'subscribers'>('inventory');
  const [subscribers, setSubscribers] = useState<Subscriber[] | null>(null);
  const [subsError, setSubsError] = useState('');
  const [subsCopied, setSubsCopied] = useState(false);
  useEffect(() => {
    if (mainTab !== 'subscribers' || subscribers) return;
    fetchSubscribers().then(setSubscribers).catch((e) => setSubsError(e?.message || 'No se pudo cargar la lista.'));
  }, [mainTab, subscribers]);
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>('Todas');
  const [inventorySearch, setInventorySearch] = useState('');

  // Form states for creating product
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [category, setCategory] = useState('Tecnología');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [stock, setStock] = useState('20');
  const [imageUrl, setImageUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [orderFilter, setOrderFilter] = useState<'activos' | 'todos'>('activos');
  const [isFlashDeal, setIsFlashDeal] = useState(false);
  const [badge, setBadge] = useState('');

  // Edit Modal State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Notification Banner
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  if (!isOpen) return null;

  const isAdmin = currentUser?.role === 'admin';

  // Calculate live discount percentage for new product form
  const numPrice = parseFloat(price) || 0;
  const numOrigPrice = parseFloat(originalPrice) || 0;
  const calculatedDiscount = (numOrigPrice > numPrice && numPrice > 0)
    ? Math.round(((numOrigPrice - numPrice) / numOrigPrice) * 100)
    : 0;

  const notify = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    if (type === 'success') setTimeout(() => setNotification(null), 3500);
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotification(null);

    const salePrice = parseFloat(price);
    const prevPrice = parseFloat(originalPrice) || salePrice;
    const stockQty = parseInt(stock, 10);

    if (!title.trim() || isNaN(salePrice) || salePrice <= 0) {
      notify('Escribe un nombre y un precio de venta mayor a cero.', 'error');
      return;
    }
    if (!imageUrl.trim()) {
      notify('Sube una foto del producto.', 'error');
      return;
    }

    setSaving(true);
    try {
      const newProduct = await createProduct({
        title: title.trim(),
        description: description.trim(),
        titleEn: titleEn.trim(),
        descriptionEn: descriptionEn.trim(),
        category,
        price: salePrice,
        originalPrice: Math.max(salePrice, prevPrice),
        stock: isNaN(stockQty) ? 0 : stockQty,
        imageUrl: imageUrl.trim(),
        isFlashDeal,
        badge: badge.trim() || undefined,
      });
      onProductsUpdated([newProduct, ...products]);
      setTitle('');
      setDescription('');
      setTitleEn('');
      setDescriptionEn('');
      setPrice('');
      setOriginalPrice('');
      setStock('20');
      setImageUrl('');
      setBadge('');
      notify(`Producto "${newProduct.title}" publicado en la tienda.`);
      setMainTab('inventory');
      setSelectedCategoryTab(newProduct.category);
    } catch (err: any) {
      notify(err?.message || 'No se pudo guardar el producto.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    if (!editingProduct.title.trim() || editingProduct.price <= 0) {
      notify('Escribe un nombre y un precio válido.', 'error');
      return;
    }
    setSaving(true);
    try {
      const saved = await updateProduct(editingProduct);
      onProductsUpdated(products.map((p) => (p.id === saved.id ? saved : p)));
      setEditingProduct(null);
      notify(`Producto "${saved.title}" actualizado.`);
    } catch (err: any) {
      notify(err?.message || 'No se pudo actualizar el producto.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (productId: string, productTitle: string) => {
    if (!window.confirm(`¿Quitar "${productTitle}" de la tienda?`)) return;
    try {
      await deleteProduct(productId);
      onProductsUpdated(products.filter((p) => p.id !== productId));
      notify(`Producto "${productTitle}" retirado de la tienda.`);
    } catch (err: any) {
      notify(err?.message || 'No se pudo quitar el producto.', 'error');
    }
  };

  const handleOrderChange = async (
    order: Order,
    changes: { status?: OrderStatus; paymentStatus?: PaymentStatus }
  ) => {
    if (changes.status === 'cancelado' && !window.confirm(`¿Cancelar el pedido ${order.orderNumber}? El stock se devolverá al inventario.`)) {
      return;
    }
    try {
      const updated = await updateOrder(order.id, changes);
      onOrderUpdated(updated);
      if (changes.status === 'cancelado') onRefresh();
      notify(`Pedido ${updated.orderNumber} actualizado.`);
    } catch (err: any) {
      notify(err?.message || 'No se pudo actualizar el pedido.', 'error');
    }
  };

  const visibleOrders = orders.filter((o) =>
    orderFilter === 'todos' ? true : o.status !== 'entregado' && o.status !== 'cancelado'
  );

  // Filter products by selected category tab and search query
  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      selectedCategoryTab === 'Todas' ||
      p.category.toLowerCase() === selectedCategoryTab.toLowerCase();
    const matchesSearch =
      p.title.toLowerCase().includes(inventorySearch.toLowerCase()) ||
      p.category.toLowerCase().includes(inventorySearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Calculate category counts
  const categoryCounts = CATEGORY_OPTIONS.reduce((acc, cat) => {
    acc[cat] = products.filter((p) => p.category.toLowerCase() === cat.toLowerCase()).length;
    return acc;
  }, {} as Record<string, number>);

  const totalInventoryValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
  const totalUnitsInStock = products.reduce((sum, p) => sum + p.stock, 0);

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'Tecnología':
        return <Laptop className="w-3.5 h-3.5" />;
      case 'Moda y Calzado':
        return <Shirt className="w-3.5 h-3.5" />;
      case 'Hogar y Cocina':
        return <UtensilsCrossed className="w-3.5 h-3.5" />;
      case 'Belleza y Cuidado':
        return <Sparkles className="w-3.5 h-3.5" />;
      case 'Deportes y Aire Libre':
        return <Activity className="w-3.5 h-3.5" />;
      case 'Accesorios':
        return <Glasses className="w-3.5 h-3.5" />;
      default:
        return <Layers className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-blue-950/70 backdrop-blur-xs flex p-2 sm:p-4 lg:p-6">
      <div 
        id="admin-panel-container"
        className="m-auto relative bg-white rounded-3xl max-w-5xl w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[94vh]"
      >
        {/* Top Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-950 via-blue-900 to-slate-900 text-white flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 border border-white/20 rounded-2xl backdrop-blur-xs">
              <LayoutDashboard className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-xl font-black tracking-tight">
                  Panel de Administración & Mercancía
                </h2>
                <span className="bg-amber-400 text-blue-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                  ADMIN OFICIAL
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium">
                Sesión de Administrador
              </p>
            </div>
          </div>

          <button
            id="close-admin-panel-btn"
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security Guard */}
        {!isAdmin ? (
          <div className="p-8 sm:p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-900 flex items-center justify-center mx-auto border border-blue-200">
              <AlertCircle className="w-8 h-8 text-amber-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Acceso Exclusivo de Administrador</h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              Debes iniciar sesión con tu cuenta de administrador para acceder a este panel.
            </p>
            <button
              id="admin-login-redirect-btn"
              onClick={() => {
                onClose();
                onOpenAuthForAdmin();
              }}
              className="bg-amber-500 hover:bg-amber-400 text-blue-950 font-bold text-xs py-3 px-6 rounded-xl shadow-md transition-all active:scale-95"
            >
              Iniciar Sesión con Cuenta Administrador
            </button>
          </div>
        ) : (
          <>
            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 bg-slate-50 border-b border-slate-200 text-xs">
              <div 
                onClick={() => setMainTab('inventory')}
                className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs hover:border-blue-300 transition-colors cursor-pointer"
              >
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Total Productos Activos</span>
                <span className="text-lg font-black text-slate-900">{products.length} artículos</span>
              </div>
              <div 
                onClick={() => setMainTab('inventory')}
                className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs hover:border-blue-300 transition-colors cursor-pointer"
              >
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Stock Total en Almacén</span>
                <span className="text-lg font-black text-blue-900">{totalUnitsInStock} unidades</span>
              </div>
              <div 
                onClick={() => setMainTab('analytics')}
                className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs hover:border-amber-400 transition-colors cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Valor del Inventario</span>
                  <BarChart3 className="w-3.5 h-3.5 text-amber-500 opacity-60 group-hover:opacity-100 transition-opacity" />
                </div>
                <span className="text-lg font-black text-emerald-700">${totalInventoryValue.toFixed(2)}</span>
              </div>
              <div 
                onClick={() => setMainTab('analytics')}
                className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs hover:border-blue-300 transition-colors cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Órdenes Generadas</span>
                  <TrendingUp className="w-3.5 h-3.5 text-blue-900 opacity-60 group-hover:opacity-100 transition-opacity" />
                </div>
                <span className="text-lg font-black text-amber-600">{orders.length} pedidos</span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-200 px-4 sm:px-6 gap-3 sm:gap-6 text-xs font-bold overflow-x-auto">
              <button
                id="tab-btn-inventory"
                onClick={() => setMainTab('inventory')}
                className={`py-3.5 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                  mainTab === 'inventory'
                    ? 'border-blue-900 text-blue-900'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>Mercancía por Categorías ({products.length})</span>
              </button>

              <button
                id="tab-btn-analytics"
                onClick={() => setMainTab('analytics')}
                className={`py-3.5 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                  mainTab === 'analytics'
                    ? 'border-blue-900 text-blue-900'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <BarChart3 className="w-4 h-4 text-amber-500" />
                <span>Rendimiento y Gráficos</span>
              </button>

              <button
                id="tab-btn-create"
                onClick={() => setMainTab('create')}
                className={`py-3.5 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                  mainTab === 'create'
                    ? 'border-blue-900 text-blue-900'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                <span>Agregar Nuevo Producto</span>
              </button>

              <button
                id="tab-btn-orders"
                onClick={() => setMainTab('orders')}
                className={`py-3.5 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                  mainTab === 'orders'
                    ? 'border-blue-900 text-blue-900'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>Pedidos ({orders.filter((o) => o.status !== 'entregado' && o.status !== 'cancelado').length})</span>
              </button>

              <button
                id="tab-btn-subscribers"
                onClick={() => setMainTab('subscribers')}
                className={`py-3.5 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                  mainTab === 'subscribers'
                    ? 'border-blue-900 text-blue-900'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>Suscriptores{subscribers ? ` (${subscribers.length})` : ''}</span>
              </button>
            </div>

            {/* Notification Banner */}
            {notification && (
              <div
                className={`mx-4 sm:mx-6 mt-3 p-3 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
                  notification.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                {notification.type === 'success' ? (
                  <Check className="w-4 h-4 text-emerald-600 stroke-[3] flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                )}
                <span>{notification.message}</span>
              </div>
            )}

            {/* TAB CONTENTS */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              
              {/* TAB 1: MERCANCÍA POR CATEGORÍAS (INVENTARIO) */}
              {mainTab === 'inventory' && (
                <div className="space-y-4">
                  {/* Category Filter Pills in Admin */}
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                      Filtrar inventario por categoría de mercancía:
                    </span>
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 no-scrollbar">
                      <button
                        onClick={() => setSelectedCategoryTab('Todas')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                          selectedCategoryTab === 'Todas'
                            ? 'bg-blue-900 text-amber-300 shadow-sm'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>Todas ({products.length})</span>
                      </button>

                      {CATEGORY_OPTIONS.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategoryTab(cat)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                            selectedCategoryTab === cat
                              ? 'bg-blue-900 text-amber-300 shadow-sm'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                        >
                          {getCategoryIcon(cat)}
                          <span>{cat}</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                            selectedCategoryTab === cat ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                          }`}>
                            {categoryCounts[cat] || 0}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Actions & Search */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                    <input
                      type="text"
                      placeholder="Buscar producto por título o categoría..."
                      value={inventorySearch}
                      onChange={(e) => setInventorySearch(e.target.value)}
                      className="w-full sm:w-72 px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-900"
                    />

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      <button
                        onClick={() => setMainTab('create')}
                        className="bg-amber-500 hover:bg-amber-400 text-blue-950 font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Nuevo Producto</span>
                      </button>

                      <button
                        onClick={onRefresh}
                        className="text-slate-500 hover:text-blue-900 border border-slate-200 px-3 py-2 rounded-xl text-xs font-medium hover:bg-slate-50 transition-colors flex items-center gap-1"
                        title="Actualizar datos"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Actualizar</span>
                      </button>
                    </div>
                  </div>

                  {/* Inventory Table / Responsive Cards */}
                  <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
                    {filteredProducts.length === 0 ? (
                      <div className="p-8 text-center text-xs text-slate-500 space-y-2">
                        <Package className="w-8 h-8 text-slate-300 mx-auto" />
                        <p className="font-semibold text-slate-700">No hay productos en esta categoría o búsqueda.</p>
                        <button
                          onClick={() => {
                            setSelectedCategoryTab('Todas');
                            setInventorySearch('');
                          }}
                          className="text-blue-900 hover:underline font-bold"
                        >
                          Ver todos los productos
                        </button>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100">
                        {filteredProducts.map((product) => {
                          const disc = Math.round(
                            ((product.originalPrice - product.price) / product.originalPrice) * 100
                          );
                          return (
                            <div
                              key={product.id}
                              id={`admin-item-${product.id}`}
                              className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors"
                            >
                              {/* Product Info */}
                              <div className="flex items-center gap-3 min-w-0">
                                <img
                                  src={product.imageUrl}
                                  alt={product.title}
                                  className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-xl border border-slate-200 flex-shrink-0"
                                />
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-amber-700 uppercase bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                      {product.category}
                                    </span>
                                    {product.isFlashDeal && (
                                      <span className="bg-blue-950 text-amber-400 border border-amber-500/40 font-black text-[9px] px-1.5 py-0.2 rounded-full uppercase flex items-center gap-0.5">
                                        <Zap className="w-2.5 h-2.5 fill-current text-amber-400" />
                                        VIP
                                      </span>
                                    )}
                                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                                      Activo
                                    </span>
                                  </div>

                                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate max-w-sm sm:max-w-md mt-1">
                                    {product.title}
                                  </h4>

                                  <div className="flex items-center gap-3 mt-1 text-xs">
                                    <span className="font-black text-blue-950">${product.price.toFixed(2)}</span>
                                    {product.originalPrice > product.price && (
                                      <span className="text-slate-400 line-through text-[11px]">
                                        ${product.originalPrice.toFixed(2)}
                                      </span>
                                    )}
                                    {disc > 0 && (
                                      <span className="text-amber-600 font-bold text-[11px]">
                                        -{disc}%
                                      </span>
                                    )}
                                    <span className="text-slate-300">•</span>
                                    <span className="text-slate-600 font-medium text-[11px]">
                                      Stock: <strong className="text-slate-900">{product.stock} u.</strong>
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Action Buttons */}
                              <div className="flex items-center gap-2 sm:gap-3 justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 flex-shrink-0">
                                <button
                                  id={`edit-product-${product.id}`}
                                  onClick={() => setEditingProduct(product)}
                                  className="px-3 py-1.5 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-900 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-200 hover:border-blue-200"
                                  title="Editar datos del producto"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                  <span>Modificar</span>
                                </button>

                                <button
                                  id={`delete-product-${product.id}`}
                                  onClick={() => handleDeleteProduct(product.id, product.title)}
                                  className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border border-red-200"
                                  title="Eliminar producto permanentemente"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Eliminar</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: AGREGAR NUEVO PRODUCTO (FORMULARIO POTENTE) */}
              {mainTab === 'create' && (
                <form onSubmit={handleCreateProduct} className="max-w-2xl mx-auto space-y-4">
                  <div className="p-3.5 bg-blue-50/80 border border-blue-200/80 rounded-2xl flex items-center gap-2.5 text-xs text-blue-950">
                    <Sparkles className="w-5 h-5 text-amber-500 flex-shrink-0" />
                    <span>
                      Completa los datos para registrar mercancía. El porcentaje de beneficio se calcula de forma automática y el producto aparecerá al instante en la tienda.
                    </span>
                  </div>

                  {/* Category Selector Visual Buttons */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Categoría de Mercancía *
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {CATEGORY_OPTIONS.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setCategory(cat)}
                          className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                            category === cat
                              ? 'bg-blue-900 text-amber-300 border-blue-900 shadow-sm'
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {getCategoryIcon(cat)}
                          <span className="truncate">{cat}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Título o Nombre Comercial del Producto *
                    </label>
                    <input
                      id="new-product-title"
                      type="text"
                      required
                      placeholder="Ej. Smart TV 55 Pulgadas 4K Ultra HD con Asistente de Voz"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-900 focus:outline-none"
                    />
                  </div>

                  {/* Nombre en inglés */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nombre en inglés <span className="font-normal text-slate-400">(lo ven los clientes con la tienda en inglés)</span>
                    </label>
                    <input
                      id="new-product-title-en"
                      type="text"
                      placeholder="Ex. 55-inch 4K Ultra HD Smart TV with Voice Assistant"
                      value={titleEn}
                      onChange={(e) => setTitleEn(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-900 focus:outline-none"
                    />
                  </div>

                  {/* Pricing with Automatic Discount Calculator */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Precio de Venta Actual ($) *
                      </label>
                      <input
                        id="new-product-price"
                        type="number"
                        step="0.01"
                        min="0.1"
                        required
                        placeholder="29.99"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl font-bold text-blue-950 focus:ring-2 focus:ring-blue-900 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Precio Anterior / Original ($)
                      </label>
                      <input
                        id="new-product-orig-price"
                        type="number"
                        step="0.01"
                        placeholder="89.99"
                        value={originalPrice}
                        onChange={(e) => setOriginalPrice(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-500 focus:ring-2 focus:ring-blue-900 focus:outline-none"
                      />
                    </div>

                    {/* Live Automatic Calculation Badge */}
                    <div className="sm:col-span-2 pt-1">
                      {calculatedDiscount > 0 ? (
                        <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <Zap className="w-4 h-4 text-emerald-600 fill-current" />
                            ¡Descuento calculado automáticamente!
                          </span>
                          <span className="bg-emerald-700 text-white px-2 py-0.5 rounded-md text-[11px]">
                            -{calculatedDiscount}% (Ahorro de ${(numOrigPrice - numPrice).toFixed(2)})
                          </span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 block italic">
                          Ingresa un precio anterior mayor al precio de venta para calcular el porcentaje de descuento automáticamente.
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stock and Badge */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Stock Disponible (Unidades) *
                      </label>
                      <input
                        id="new-product-stock"
                        type="number"
                        min="1"
                        required
                        value={stock}
                        onChange={(e) => setStock(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-900 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Insignia o Etiqueta Comercial
                      </label>
                      <input
                        id="new-product-badge"
                        type="text"
                        placeholder="NUEVO, MÁS VENDIDO, PREMIUM..."
                        value={badge}
                        onChange={(e) => setBadge(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl uppercase focus:bg-white focus:ring-2 focus:ring-blue-900 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Foto del producto */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Foto del producto *
                    </label>
                    <div className="flex flex-wrap items-center gap-2">
                      <ImageUploader onUploaded={setImageUrl} onError={(m) => notify(m, 'error')} />
                      <span className="text-[11px] text-slate-400">o pega un enlace:</span>
                      <input
                        id="new-product-image"
                        type="url"
                        placeholder="https://..."
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        className="flex-1 min-w-[180px] px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono focus:bg-white focus:ring-2 focus:ring-blue-900 focus:outline-none"
                      />
                    </div>

                    {/* Image Preview Box */}
                    {imageUrl && (
                      <div className="mt-3 p-2.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3">
                        <img
                          src={imageUrl}
                          alt="Vista previa"
                          className="w-14 h-14 object-cover rounded-xl border border-slate-200"
                        />
                        <div className="text-[11px] text-slate-500">
                          <strong className="text-slate-900 block flex items-center gap-1">
                            <ImageIcon className="w-3.5 h-3.5 text-blue-900" />
                            Vista previa
                          </strong>
                          <span>Así se verá en la tienda</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Descripción Detallada
                    </label>
                    <textarea
                      id="new-product-desc"
                      rows={3}
                      placeholder="Describe los beneficios, especificaciones técnicas, materiales y contenido de la caja..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-900 focus:outline-none"
                    />
                  </div>

                  {/* Descripción en inglés */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Descripción en inglés
                    </label>
                    <textarea
                      id="new-product-desc-en"
                      rows={3}
                      placeholder="Describe the benefits, specs, materials and what's in the box..."
                      value={descriptionEn}
                      onChange={(e) => setDescriptionEn(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-900 focus:outline-none"
                    />
                  </div>

                  {/* Flash Deal Checkbox */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      id="new-product-flash-check"
                      type="checkbox"
                      checked={isFlashDeal}
                      onChange={(e) => setIsFlashDeal(e.target.checked)}
                      className="w-4 h-4 text-blue-900 rounded border-slate-300 focus:ring-blue-900 cursor-pointer"
                    />
                    <label htmlFor="new-product-flash-check" className="text-xs font-bold text-slate-800 flex items-center gap-1 cursor-pointer">
                      <Zap className="w-3.5 h-3.5 text-amber-500 fill-current" />
                      Incluir en la sección de "Venta Preferencial / Flash"
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    id="submit-create-product-btn"
                    type="submit"
                    disabled={saving}
                    className="w-full bg-blue-900 hover:bg-blue-800 text-amber-400 font-black text-sm py-3.5 px-4 rounded-xl shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 border border-amber-500/20"
                  >
                    <PlusCircle className="w-5 h-5" />
                    <span>{saving ? 'Guardando...' : 'Guardar y publicar'}</span>
                  </button>
                </form>
              )}

              {/* TAB 3: PEDIDOS */}
              {mainTab === 'orders' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Pedidos</h3>
                    <div className="flex gap-1 text-[11px] font-bold">
                      {(['activos', 'todos'] as const).map((f) => (
                        <button key={f} onClick={() => setOrderFilter(f)}
                          className={`px-2.5 py-1 rounded-lg ${orderFilter === f ? 'bg-blue-900 text-amber-300' : 'bg-slate-100 text-slate-600'}`}>
                          {f === 'activos' ? 'Por atender' : 'Todos'}
                        </button>
                      ))}
                    </div>
                  </div>
                  {visibleOrders.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl border border-slate-200">
                      {orders.length === 0 ? 'Todavía no hay pedidos. Aparecerán aquí en cuanto un cliente compre.' : 'No hay pedidos por atender.'}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {visibleOrders.map((ord) => (
                        <div key={ord.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-3">
                          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200">
                            <div>
                              <strong className="text-blue-950 font-black text-sm">{ord.orderNumber}</strong>
                              <span className="text-slate-400 ml-2">
                                {new Date(ord.createdAt).toLocaleString('es-DO', { dateStyle: 'medium', timeStyle: 'short' })}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              <select
                                value={ord.status}
                                onChange={(e) => handleOrderChange(ord, { status: e.target.value as OrderStatus })}
                                disabled={ord.status === 'cancelado'}
                                className="px-2 py-1 rounded-lg border border-slate-300 bg-white font-bold text-[11px]"
                              >
                                {(Object.keys(ORDER_STATUS_LABELS) as OrderStatus[]).map((st) => (
                                  <option key={st} value={st}>{ORDER_STATUS_LABELS[st]}</option>
                                ))}
                              </select>
                              <select
                                value={ord.paymentStatus}
                                onChange={(e) => handleOrderChange(ord, { paymentStatus: e.target.value as PaymentStatus })}
                                className={`px-2 py-1 rounded-lg border font-bold text-[11px] ${ord.paymentStatus === 'pagado' ? 'border-emerald-400 bg-emerald-50 text-emerald-800' : 'border-slate-300 bg-white'}`}
                              >
                                {(Object.keys(PAYMENT_STATUS_LABELS) as PaymentStatus[]).map((st) => (
                                  <option key={st} value={st}>{PAYMENT_STATUS_LABELS[st]}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-600">
                            <div>
                              <span className="text-slate-400 block text-[10px]">Cliente</span>
                              <strong className="text-slate-900">{ord.customerName}</strong>
                              <div>{ord.customerEmail}</div>
                              <a href={`tel:${ord.customerPhone}`} className="text-blue-900 font-semibold">{ord.customerPhone}</a>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px]">Entrega</span>
                              <span>{ord.address.street}, {ord.address.city}{ord.address.state ? `, ${ord.address.state}` : ''}</span>
                              {ord.address.notes && <div className="italic text-slate-500">"{ord.address.notes}"</div>}
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px]">Pago</span>
                              <div>{PAYMENT_METHOD_LABELS[ord.paymentMethod] || ord.paymentMethod}</div>
                              <strong className="text-blue-950 text-sm">{formatMoney(ord.total)}</strong>
                              {ord.discount > 0 && <div className="text-emerald-700">Cupón {ord.couponCode}: -{formatMoney(ord.discount)}</div>}
                            </div>
                          </div>

                          <div className="bg-white rounded-xl border border-slate-200 p-2 space-y-1">
                            {ord.items.map((it, i) => (
                              <div key={i} className="flex justify-between gap-2">
                                <span className="truncate">{it.quantity} × {it.title}</span>
                                <span className="font-semibold flex-shrink-0">{formatMoney(it.price * it.quantity)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: RENDIMIENTO Y GRÁFICOS (RECHARTS) */}
              {mainTab === 'analytics' && (
                <AdminAnalytics products={products} orders={orders} />
              )}

              {/* TAB 5: LISTA DE CORREOS */}
              {mainTab === 'subscribers' && (
                <div className="space-y-3 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-slate-600">Clientes que pidieron recibir ofertas por correo.</p>
                    {subscribers && subscribers.length > 0 && (
                      <button
                        onClick={() => {
                          navigator.clipboard?.writeText(subscribers.map((s) => s.email).join(', ')).then(() => {
                            setSubsCopied(true);
                            setTimeout(() => setSubsCopied(false), 1800);
                          });
                        }}
                        className="bg-blue-900 hover:bg-blue-800 text-white font-bold px-3 py-2 rounded-lg"
                      >
                        {subsCopied ? 'Copiados' : 'Copiar todos los correos'}
                      </button>
                    )}
                  </div>
                  {subsError && <p className="text-red-700 font-semibold">{subsError}</p>}
                  {!subscribers && !subsError && <p className="text-slate-500">Cargando...</p>}
                  {subscribers && subscribers.length === 0 && <p className="text-slate-500">Todavía no hay suscriptores.</p>}
                  {subscribers && subscribers.length > 0 && (
                    <div className="border border-slate-200 rounded-2xl divide-y divide-slate-100 bg-white">
                      {subscribers.map((s) => (
                        <div key={s.email} className="flex items-center justify-between px-4 py-2.5">
                          <span className="font-semibold text-slate-800 break-all">{s.email}</span>
                          <span className="text-slate-400 flex-shrink-0 ml-3">
                            {s.lang.toUpperCase()} · {new Date(s.createdAt).toLocaleDateString('es-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          </>
        )}

        {/* MODAL PARA MODIFICAR DATOS DEL PRODUCTO */}
        {editingProduct && (
          <div className="fixed inset-0 z-60 bg-blue-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
            <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-blue-900" />
                  <h3 className="text-base font-bold text-slate-900">Modificar Datos del Producto</h3>
                </div>
                <button
                  onClick={() => setEditingProduct(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEditProduct} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Título</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.title}
                    onChange={(e) => setEditingProduct({ ...editingProduct, title: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-blue-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nombre en inglés</label>
                  <input
                    type="text"
                    value={editingProduct.titleEn || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, titleEn: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-blue-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Categoría</label>
                    <select
                      value={editingProduct.category}
                      onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    >
                      {CATEGORY_OPTIONS.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Stock</label>
                    <input
                      type="number"
                      min="0"
                      value={editingProduct.stock}
                      onChange={(e) => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value, 10) || 0 })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Precio Venta ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.1"
                      value={editingProduct.price}
                      onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-blue-950"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Precio Anterior ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editingProduct.originalPrice}
                      onChange={(e) => setEditingProduct({ ...editingProduct, originalPrice: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Foto</label>
                  <div className="flex items-center gap-2">
                    {editingProduct.imageUrl && (
                      <img src={editingProduct.imageUrl} alt="" className="w-12 h-12 object-cover rounded-lg border border-slate-200" />
                    )}
                    <ImageUploader
                      onUploaded={(url) => setEditingProduct({ ...editingProduct, imageUrl: url })}
                      onError={(m) => notify(m, 'error')}
                    />
                  </div>
                  <input
                    type="url"
                    value={editingProduct.imageUrl}
                    onChange={(e) => setEditingProduct({ ...editingProduct, imageUrl: e.target.value })}
                    className="mt-2 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Descripción</label>
                  <textarea
                    rows={2}
                    value={editingProduct.description}
                    onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Descripción en inglés</label>
                  <textarea
                    rows={2}
                    value={editingProduct.descriptionEn || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, descriptionEn: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    id="edit-flash-check"
                    type="checkbox"
                    checked={editingProduct.isFlashDeal || false}
                    onChange={(e) => setEditingProduct({ ...editingProduct, isFlashDeal: e.target.checked })}
                    className="w-4 h-4 text-blue-900 rounded"
                  />
                  <label htmlFor="edit-flash-check" className="font-bold text-slate-800">
                    Oferta Flash activa
                  </label>
                </div>

                <div className="flex gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-blue-900 hover:bg-blue-800 text-amber-400 rounded-xl font-bold shadow-md border border-amber-500/20"
                  >
                    Guardar Cambios
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
