import { useState, useCallback, useEffect, useContext } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Spinner from '../components/Spinner';
import Modal from '../components/Modal';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import '../styles/pages/StockManager.css';
import { AuthContext } from '../context/AuthContext';
import { showAlert } from '../utils/alert';

const CATEGORIES = ['Bebidas', 'Entradas / Minutas', 'Platos Principales', 'Pizzas', 'Sándwiches', 'Helados', 'Otro'];
const emptyForm = { name: '', description: '', price: '', cost: '', stock: '', category: 'Bebidas' };

const StockBadge = ({ stock }) => {
  const cls = stock > 10 ? 'badge-ok' : stock > 0 ? 'badge-low' : 'badge-zero';
  return <span className={`badge ${cls}`}>{stock}</span>;
};

// Formulario declarado FUERA del componente para no re-montar en cada render
const ProductForm = ({ form, setForm, onSubmit, submitting, isAdmin }) => (
  <form onSubmit={onSubmit} className="form-group">
    <div>
      <label className="field-label">Nombre del producto</label>
      <input required type="text" value={form.name}
        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
        className="field-input" placeholder="Ej: Milanesa Especial" />
    </div>
    <div>
      <label className="field-label">Descripción (opcional)</label>
      <input type="text" value={form.description}
        onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
        className="field-input" placeholder="Descripción breve..." />
    </div>
    <div className="form-row">
      <div>
        <label className="field-label">Precio ($)</label>
        <input required type="number" min="0" value={form.price}
          onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
          className="field-input" placeholder="0" />
      </div>
      {isAdmin && (
        <div>
          <label className="field-label">Costo ($)</label>
          <input required type="number" min="0" value={form.cost}
            onChange={e => setForm(f => ({ ...f, cost: e.target.value }))}
            className="field-input" placeholder="0" />
        </div>
      )}
    </div>
    <div className="form-row">
      <div>
        <label className="field-label">Stock</label>
        <input required type="number" min="0" value={form.stock}
          onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
          className="field-input" placeholder="0" />
      </div>
      <div>
        <label className="field-label">Categoría</label>
        <select value={form.category}
          onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
          className="field-input">
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>
    </div>
    <button type="submit" disabled={submitting} className="btn-primary" style={{ marginTop: 8 }}>
      {submitting ? 'Guardando...' : 'Guardar cambios'}
    </button>
  </form>
);

const StockManager = () => {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'Admin';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const fetchInventory = useCallback(() => {
    setLoading(true);
    api.get('/stock/inventory')
      .then(res => setProducts(res.data))
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => fetchInventory());
  }, [fetchInventory]);

  const openEdit = (product) => {
    setEditProduct(product);
    setForm({
      name: product.name,
      description: product.description || '',
      price: product.price,
      cost: product.cost || 0,
      stock: product.stock,
      category: product.category
    });
  };

  const closeModals = () => {
    setShowAddModal(false);
    setEditProduct(null);
    setForm(emptyForm);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/stock', { ...form, price: Number(form.price), cost: Number(form.cost), stock: Number(form.stock) });
      closeModals();
      fetchInventory();
      showAlert.fire({ icon: 'success', iconColor: '#22c55e', title: 'Producto creado', showConfirmButton: false, timer: 1500 });
    } catch { showAlert.fire('Error', 'Error al crear el producto', 'error'); }
    finally { setSubmitting(false); }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    const result = await showAlert.fire({
      title: '¿Guardar cambios?',
      text: 'Se actualizará la información del producto.',
      icon: 'question',
      iconColor: '#f97316',
      showCancelButton: true,
      confirmButtonText: 'Sí, guardar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#f97316',
    });

    if (result.isConfirmed) {
      setSubmitting(true);
      try {
        await api.put(`/stock/${editProduct._id}`, { ...form, price: Number(form.price), cost: Number(form.cost), stock: Number(form.stock) });
        closeModals();
        fetchInventory();
        showAlert.fire({ icon: 'success', iconColor: '#22c55e', title: 'Cambios guardados', showConfirmButton: false, timer: 1500 });
      } catch { showAlert.fire('Error', 'Error al actualizar el producto', 'error'); }
      finally { setSubmitting(false); }
    }
  };

  const deleteWithAlert = async (product) => {
    const result = await showAlert.fire({
      title: '¿Eliminar producto?',
      text: `Se eliminará "${product.name}". Esta acción no se puede deshacer.`,
      icon: 'warning',
      iconColor: '#ef4444',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ef4444',
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/stock/${product._id}`);
        fetchInventory();
        showAlert.fire({
          title: 'Eliminado',
          icon: 'success',
          iconColor: '#22c55e',
          showConfirmButton: false,
          timer: 1500
        });
      } catch { showAlert.fire('Error', 'Error al eliminar el producto', 'error'); }
    }
  };

  return (
    <div className="app-layout">
      <Navbar />

      <main className="main-content stock-main">
        {/* Header */}
        <div className="page-header stock-header-flex" style={{ flexShrink: 0 }}>
          <div>
            <h2 className="page-title">Inventario</h2>
            <p className="page-subtitle">Gestión del catálogo y stock de productos</p>
          </div>
          <button onClick={() => { setShowAddModal(true); setForm(emptyForm); }} className="btn-add">
            <Plus size={17} /> Nuevo Producto
          </button>
        </div>

        {/* Tabla */}
        {loading ? <Spinner /> : (
          <div className="table-card anim-page">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="th-left">Producto</th>
                  <th className="th-left">Categoría</th>
                  {isAdmin && <th className="th-left">Costo</th>}
                  <th className="th-left">Precio</th>
                  <th className="th-center">Stock</th>
                  <th className="th-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin ? 6 : 5}>
                      <div className="empty-state anim-fade">
                        <p className="empty-state-text">No hay productos en el catálogo</p>
                      </div>
                    </td>
                  </tr>
                ) : products.map((product) => (
                  <tr key={product._id} className="anim-page">
                    <td>
                      <p className={`product-list-name ${product.description ? 'product-list-name-mb' : ''}`}>
                        {product.name}
                      </p>
                      {product.description && <p className="product-list-desc">{product.description}</p>}
                    </td>
                    <td>
                      <span className="badge badge-cat">{product.category}</span>
                    </td>
                    {isAdmin && (
                      <td>
                        <span className="product-list-price" style={{ color: '#a3a3a3' }}>
                          ${(product.cost || 0).toLocaleString()}
                        </span>
                      </td>
                    )}
                    <td>
                      <span className="product-list-price">
                        ${product.price.toLocaleString()}
                      </span>
                    </td>
                    <td className="td-center">
                      <StockBadge stock={product.stock} />
                    </td>
                    <td>
                      <div className="action-btns">
                        <button onClick={() => openEdit(product)} className="action-btn edit"><Pencil size={15} /></button>
                        <button onClick={() => deleteWithAlert(product)} className="action-btn delete"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Modal: Nuevo Producto */}
      {showAddModal && (
        <Modal title="Nuevo Producto" onClose={closeModals}>
          <ProductForm form={form} setForm={setForm} onSubmit={handleCreate} submitting={submitting} isAdmin={isAdmin} />
        </Modal>
      )}

      {/* Modal: Editar Producto */}
      {editProduct && (
        <Modal title={`Editar: ${editProduct.name}`} onClose={closeModals}>
          <ProductForm form={form} setForm={setForm} onSubmit={handleUpdate} submitting={submitting} isAdmin={isAdmin} />
        </Modal>
      )}
    </div>
  );
};

export default StockManager;
