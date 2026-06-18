import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { PackageSearch, Plus, PackagePlus } from 'lucide-react';

const StockManager = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', stock: '', category: 'Comida' });

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await api.get('/stock/inventory');
      setProducts(res.data);
      setError(null);
    } catch (err) {
      setError('Error al cargar el inventario. Verifica tus permisos.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStock = async (id, quantity) => {
    try {
      await api.patch(`/stock/${id}/add`, { quantity });
      fetchInventory();
    } catch (err) {
      alert('Error al actualizar el stock');
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      await api.post('/stock', {
        name: newProduct.name,
        price: Number(newProduct.price),
        stock: Number(newProduct.stock),
        category: newProduct.category
      });
      setShowAddForm(false);
      setNewProduct({ name: '', price: '', stock: '', category: 'Comida' });
      fetchInventory();
    } catch (err) {
      alert('Error al crear producto');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <PackageSearch className="text-orange-500" />
              Gestión de Catálogo e Inventario
            </h1>
            <p className="text-gray-400 mt-2">Control total del stock de La Milanga</p>
          </div>
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            {showAddForm ? 'Cancelar' : <><Plus size={20} /> Nuevo Producto</>}
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {showAddForm && (
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 mb-8 shadow-lg">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <PackagePlus className="text-orange-400" size={24} /> Registrar Nuevo Producto
            </h2>
            <form onSubmit={handleCreateProduct} className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-400 mb-1">Nombre</label>
                <input required type="text" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-orange-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Precio ($)</label>
                <input required type="number" min="0" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-orange-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Stock Inicial</label>
                <input required type="number" min="0" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-orange-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Categoría</label>
                <select value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-orange-500 focus:outline-none">
                  <option>Comida</option>
                  <option>Bebida</option>
                  <option>Postre</option>
                  <option>Otro</option>
                </select>
              </div>
              <div className="md:col-span-5 flex justify-end mt-2">
                <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">Guardar Producto</button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden shadow-lg">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-900/50 text-gray-400 border-b border-gray-700">
                <th className="p-4 font-medium">Producto</th>
                <th className="p-4 font-medium">Categoría</th>
                <th className="p-4 font-medium">Precio</th>
                <th className="p-4 font-medium text-center">Stock Disponible</th>
                <th className="p-4 font-medium text-right">Acciones (Reponer)</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="p-8 text-center text-gray-500">Cargando inventario...</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-gray-500">No hay productos en el catálogo.</td></tr>
              ) : (
                products.map(product => (
                  <tr key={product._id} className="border-b border-gray-700/50 hover:bg-gray-700/20 transition-colors">
                    <td className="p-4 font-medium text-white">{product.name}</td>
                    <td className="p-4"><span className="px-2 py-1 bg-gray-900 rounded-md text-xs border border-gray-600 text-gray-300">{product.category}</span></td>
                    <td className="p-4 text-green-400">${product.price}</td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center justify-center min-w-[3rem] px-2 py-1 rounded-full text-sm font-bold ${product.stock > 10 ? 'bg-green-500/20 text-green-400' : product.stock > 0 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleAddStock(product._id, 1)} className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors">+1</button>
                        <button onClick={() => handleAddStock(product._id, 10)} className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors">+10</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StockManager;
