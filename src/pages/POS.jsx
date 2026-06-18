import { useState, useContext, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Spinner from '../components/Spinner';
import { ShoppingCart, Plus, Minus, Trash2, CheckCircle, Search } from 'lucide-react';
import '../styles/pages/POS.css';
import { AuthContext } from '../context/AuthContext';
import { showAlert } from '../utils/alert';

const CATEGORIES = ['Todos', 'Bebidas', 'Entradas / Minutas', 'Platos Principales', 'Pizzas', 'Sándwiches', 'Helados', 'Otro'];

const POS = () => {
  const { user } = useContext(AuthContext);
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Todos');

  const fetchMenu = () => {
    setLoading(true);
    api.get('/stock/menu')
      .then(res => setMenu(res.data))
      .catch(() => { })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    Promise.resolve().then(() => fetchMenu());
  }, []);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(i => i.productId === product._id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map(i => i.productId === product._id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { productId: product._id, name: product.name, price: product.price, quantity: 1, maxStock: product.stock }];
    });
  };

  const updateQty = (productId, delta) => {
    setCart(prev =>
      prev.map(i => {
        if (i.productId !== productId) return i;
        const q = i.quantity + delta;
        if (q <= 0) return null;
        if (q > i.maxStock) return i;
        return { ...i, quantity: q };
      }).filter(Boolean)
    );
  };

  const removeFromCart = (productId) => setCart(prev => prev.filter(i => i.productId !== productId));

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    const result = await showAlert.fire({
      title: '¿Confirmar venta?',
      text: `Se procesará un ticket por $${total.toLocaleString()}`,
      icon: 'info',
      iconColor: '#22c55e',
      showCancelButton: true,
      confirmButtonText: 'Sí, cobrar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#f97316',
    });

    if (result.isConfirmed) {
      try {
        await api.post('/ventas', { items: cart.map(c => ({ productId: c.productId, quantity: c.quantity })) });
        setCart([]);
        setSuccess(true);
        fetchMenu();
        setTimeout(() => setSuccess(false), 3500);
      } catch (err) {
        showAlert.fire('Error', err.response?.data?.message || 'Error al procesar la venta', 'error');
      }
    }
  };

  const total = cart.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const totalItems = cart.reduce((acc, i) => acc + i.quantity, 0);

  const filteredMenu = menu.filter(p => {
    const matchCat = category === 'Todos' || p.category === category;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="pos-layout">
      <Navbar />

      {/* Panel Catálogo */}
      <div className="pos-catalog">
        {/* Barra superior */}
        <div className="pos-topbar">
          <div className="pos-topbar-row">
            <div>
              <h2 className="font-display pos-title">
                Punto de Venta
              </h2>
              <p className="pos-subtitle">
                Hola, <span className="pos-user-name">{user?.username}</span>
              </p>
            </div>

            {/* Buscador */}
            <div className="pos-search-wrap">
              <Search size={15} className="pos-search-icon" />
              <input
                type="text"
                placeholder="Buscar producto..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="field-input pos-search-input"
              />
            </div>
          </div>

          {/* Tabs de categoría */}
          <div className="pos-cats">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`cat-btn${category === cat ? ' active' : ''}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid de productos */}
        <div className="product-grid">
          {loading ? (
            <div className="product-grid-full"><Spinner /></div>
          ) : filteredMenu.length === 0 ? (
            <div className="product-grid-full">
              <div className="empty-state anim-fade">
                <p className="empty-state-text">No hay productos disponibles</p>
              </div>
            </div>
          ) : filteredMenu.map((product) => (
            <button
              key={product._id}
              onClick={() => addToCart(product)}
              className="product-card anim-page"
            >
              <span className="product-cat-label">{product.category}</span>
              <h3 className="product-name">{product.name}</h3>
              <div className="product-footer">
                <span className="product-price">${product.price.toLocaleString()}</span>
                <span className={`stock-badge ${product.stock > 10 ? 'ok' : 'low'}`}>
                  {product.stock} disp.
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Panel Carrito */}
      <div className="cart-panel">
        <div className="cart-header">
          <h2 className="font-display cart-title">
            <ShoppingCart size={19} className="cart-title-icon" />
            Carrito
          </h2>
          {totalItems > 0 && (
            <span className="cart-badge">
              {totalItems}
            </span>
          )}
        </div>

        {/* Items */}
        <div className="cart-items">
          {success && (
            <div className="anim-toast pos-toast-success">
              <CheckCircle size={18} />
              <div>
                <p className="toast-title">¡Venta registrada!</p>
                <p className="toast-subtitle">El ticket fue procesado.</p>
              </div>
            </div>
          )}

          {cart.length === 0 && !success ? (
            <div className="empty-state anim-fade cart-empty-state">
              <div className="empty-icon-wrap">
                <ShoppingCart size={32} className="cart-empty-icon" />
              </div>
              <p className="empty-title cart-empty-title">El carrito está vacío</p>
              <p className="empty-sub cart-empty-sub">Hacé clic en un producto para agregarlo</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.productId} className="cart-item anim-scale">
                <div className="cart-item-top">
                  <p className="cart-item-name">{item.name}</p>
                  <button
                    onClick={() => removeFromCart(item.productId)}
                    className="cart-item-remove"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
                <div className="cart-item-bottom">
                  <span className="cart-item-price">
                    ${(item.price * item.quantity).toLocaleString()}
                  </span>
                  <div className="qty-ctrl">
                    <button onClick={() => updateQty(item.productId, -1)} className="qty-btn"><Minus size={13} /></button>
                    <span className="qty-val">{item.quantity}</span>
                    <button onClick={() => updateQty(item.productId, 1)} className="qty-btn"><Plus size={13} /></button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="cart-footer">
          <div className="cart-total-row">
            <span className="cart-total-label">Total a cobrar</span>
            <span className="font-display cart-total-value">
              ${total.toLocaleString()}
            </span>
          </div>
          <button onClick={handleCheckout} disabled={cart.length === 0} className="btn-checkout">
            Cobrar Venta
          </button>
        </div>
      </div>
    </div>
  );
};

export default POS;
