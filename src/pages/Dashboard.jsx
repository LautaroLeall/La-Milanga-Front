import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell
} from 'recharts';
import { DollarSign, ShoppingCart, TrendingUp, Package, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        // Ejecutamos ambas peticiones en paralelo
        const [statsRes, historialRes] = await Promise.all([
          axios.get('http://localhost:5000/api/ventas/stats', config),
          axios.get('http://localhost:5000/api/ventas/historial', config)
        ]);

        setStats(statsRes.data);
        setHistorial(historialRes.data);
      } catch (error) {
        console.error('Error cargando el dashboard', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // Colores para el gráfico de barras
  const COLORS = ['#f97316', '#fb923c', '#fdba74', '#fed7aa', '#ffedd5'];

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* HEADER */}
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard de Administración</h1>
          <p className="text-gray-400">Resumen de métricas y auditoría de ventas</p>
        </div>
        <div className="flex gap-4">
          <Link to="/pos" className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors">
            <ShoppingCart size={18} /> Ir a Caja
          </Link>
          <Link to="/stock" className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors">
            <Package size={18} /> Gestor de Stock
          </Link>
          <button 
            onClick={() => { localStorage.removeItem('token'); window.location.href='/login'; }}
            className="flex items-center gap-2 px-4 py-2 bg-red-600/20 text-red-500 hover:bg-red-600/30 rounded-xl transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>
      </header>

      {/* MÉTRICAS CLAVE (KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 flex items-center gap-4 shadow-lg">
          <div className="p-4 bg-orange-500/20 text-orange-500 rounded-xl">
            <DollarSign size={32} />
          </div>
          <div>
            <p className="text-gray-400 text-sm font-medium">Ingresos Totales</p>
            <p className="text-3xl font-bold">${stats?.resumen.totalIngresos.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 flex items-center gap-4 shadow-lg">
          <div className="p-4 bg-blue-500/20 text-blue-500 rounded-xl">
            <ShoppingCart size={32} />
          </div>
          <div>
            <p className="text-gray-400 text-sm font-medium">Ventas Realizadas</p>
            <p className="text-3xl font-bold">{stats?.resumen.cantidadVentas}</p>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 flex items-center gap-4 shadow-lg">
          <div className="p-4 bg-green-500/20 text-green-500 rounded-xl">
            <TrendingUp size={32} />
          </div>
          <div>
            <p className="text-gray-400 text-sm font-medium">Ticket Promedio</p>
            <p className="text-3xl font-bold">
              ${stats?.resumen.cantidadVentas > 0 
                ? Math.round(stats.resumen.totalIngresos / stats.resumen.cantidadVentas).toLocaleString() 
                : 0}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* GRÁFICO: PRODUCTOS MÁS VENDIDOS */}
        <div className="lg:col-span-2 bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg">
          <h2 className="text-xl font-bold mb-6">Top 5 Productos Más Vendidos</h2>
          {stats?.topProducts?.length > 0 ? (
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.topProducts} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
                  <XAxis type="number" stroke="#9ca3af" />
                  <YAxis dataKey="_id" type="category" stroke="#9ca3af" width={100} />
                  <Tooltip 
                    cursor={{fill: '#374151'}} 
                    contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                  />
                  <Bar dataKey="cantidadVendida" radius={[0, 4, 4, 0]}>
                    {stats.topProducts.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-500">
              No hay suficientes datos de ventas aún.
            </div>
          )}
        </div>

        {/* AUDITORÍA: HISTORIAL RECIENTE */}
        <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg flex flex-col">
          <h2 className="text-xl font-bold mb-4">Auditoría Reciente</h2>
          <div className="overflow-y-auto flex-1 pr-2 space-y-4 max-h-[320px] custom-scrollbar">
            {historial.length > 0 ? historial.slice(0, 10).map((venta) => (
              <div key={venta._id} className="p-4 bg-gray-900 rounded-xl border border-gray-700">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm text-gray-400">
                    {new Date(venta.createdAt).toLocaleDateString()} {new Date(venta.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                  <span className="font-bold text-green-400">${venta.total.toLocaleString()}</span>
                </div>
                <div className="text-sm text-gray-300">
                  <p className="mb-1"><span className="text-gray-500">Cajero:</span> {venta.cajeroId?.username || 'Desconocido'}</p>
                  <p className="text-gray-500 mb-1">Ítems:</p>
                  <ul className="pl-4 list-disc marker:text-gray-600">
                    {venta.items.map(item => (
                      <li key={item._id} className="text-xs">{item.quantity}x {item.name}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )) : (
              <div className="text-center text-gray-500 py-8">No hay ventas registradas</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
