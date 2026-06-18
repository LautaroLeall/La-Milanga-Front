import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { ShoppingCart, CheckCircle, Trash2, Plus, Minus, Search } from 'lucide-react';

const POS = () => {
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      const res = await api.get('/stock/menu');
      setMenu(res.data);
    } catch (error) {
      console.error('Error fetching menu', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === product._id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev; // Cannot exceed stock
        return prev.map(item => 
          item.productId === product._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { productId: product._id, name: product.name, price: product.price, quantity: 1, maxStock: product.stock }];
    });
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const updateQuantity = (productId, delta) => {
    setCart(prev => prev.map(item => {
      if (item.productId === productId) {
        const newQ = item.quantity + delta;
        if (newQ > 0 && newQ <= item.maxStock) return { ...item, quantity: newQ };
        if (newQ <= 0) return null;
      }
      return item;
    }).filter(Boolean));
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    try {
      await api.post('/ventas', {
        items: cart.map(c => ({ productId: c.productId, quantity: c.quantity }))
      });
      setCart([]);
      setCheckoutSuccess(true);
      fetchMenu(); // Refresh stock
      setTimeout(() => setCheckoutSuccess(false), 3000);
    } catch (error) {
      alert(error.response?.data?.message || 'Error al procesar la venta');
    }
  };

  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const filteredMenu = menu.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      {/* Menú Section */}
      <div className="flex-1 p-6 flex flex-col h-screen overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Punto de Venta</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Buscar producto..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-6">
          {loading ? (
             <p className="col-span-full text-center text-gray-500 mt-10">Cargando menú...</p>
          ) : filteredMenu.length === 0 ? (
             <p className="col-span-full text-center text-gray-500 mt-10">No hay productos disponibles.</p>
          ) : (
            filteredMenu.map(product => (
              <button 
                key={product._id} 
                onClick={() => addToCart(product)}
                className="bg-gray-800 border border-gray-700 hover:border-orange-500 rounded-xl p-4 flex flex-col items-start justify-between h-32 transition-all active:scale-95 text-left"
              >
                <div className="w-full">
                  <span className="text-xs font-semibold bg-gray-900 px-2 py-1 rounded text-gray-400 mb-2 inline-block">{product.category}</span>
                  <h3 className="font-bold text-lg leading-tight line-clamp-2">{product.name}</h3>
                </div>
                <div className="flex justify-between w-full items-end mt-2">
                  <span className="text-green-400 font-bold">${product.price}</span>
                  <span className="text-xs text-gray-500">Stock: {product.stock}</span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Cart Section */}
      <div className="w-96 bg-gray-800 border-l border-gray-700 flex flex-col h-screen">
        <div className="p-6 border-b border-gray-700 flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ShoppingCart className="text-orange-500" /> Carrito
          </h2>
          {cart.length > 0 && (
            <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              {cart.reduce((a,c) => a + c.quantity, 0)} items
            </span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {checkoutSuccess && (
            <div className="bg-green-500/20 border border-green-500 text-green-400 p-4 rounded-xl flex items-center gap-3 animate-pulse">
              <CheckCircle size={24} />
              <div className="flex-1">
                <p className="font-bold">¡Venta Exitosa!</p>
                <p className="text-sm">El ticket ha sido registrado.</p>
              </div>
            </div>
          )}

          {cart.length === 0 && !checkoutSuccess ? (
             <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
               <ShoppingCart size={48} className="opacity-20" />
               <p>El carrito está vacío</p>
             </div>
          ) : (
            cart.map(item => (
              <div key={item.productId} className="bg-gray-900 border border-gray-700 rounded-xl p-3 flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold pr-2">{item.name}</h4>
                  <button onClick={() => removeFromCart(item.productId)} className="text-gray-500 hover:text-red-500 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-green-400 font-bold">${item.price * item.quantity}</span>
                  <div className="flex items-center gap-3 bg-gray-800 rounded-lg border border-gray-700">
                    <button onClick={() => updateQuantity(item.productId, -1)} className="p-1 hover:text-orange-500"><Minus size={16} /></button>
                    <span className="w-4 text-center font-bold text-sm">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.productId, 1)} className="p-1 hover:text-orange-500"><Plus size={16} /></button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-6 border-t border-gray-700 bg-gray-900">
          <div className="flex justify-between items-end mb-6">
            <span className="text-gray-400 font-medium">Total a cobrar</span>
            <span className="text-4xl font-bold text-white">${total}</span>
          </div>
          <button 
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="w-full py-4 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-2"
          >
            Cobrar Venta
          </button>
        </div>
      </div>
    </div>
  );
};

export default POS;
