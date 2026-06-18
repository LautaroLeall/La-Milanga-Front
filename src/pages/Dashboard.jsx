import { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Spinner from '../components/Spinner';
import { AuthContext } from '../context/AuthContext';
import { DollarSign, ShoppingCart, TrendingUp, Receipt, Inbox } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import '../styles/pages/Dashboard.css';

const COLORS = ['#f97316', '#fb923c', '#fdba74', '#fcd34d', '#86efac'];

const EmptyState = ({ message, submessage }) => (
  <div className="empty-state anim-fade">
    <div className="empty-icon-wrap">
      <Inbox size={28} className="empty-icon-svg" />
    </div>
    <h3 className="empty-title">{message}</h3>
    <p className="empty-sub">{submessage}</p>
  </div>
);

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'Admin';

  const [stats, setStats] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      try {
        const reqs = [api.get('/ventas/historial')];
        if (isAdmin) reqs.push(api.get('/ventas/stats'));
        const [histRes, statsRes] = await Promise.all(reqs);
        if (!cancelled) {
          setHistorial(histRes.data);
          if (isAdmin) setStats(statsRes.data);
        }
      } catch {
        // silenciado
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchData();
    return () => { cancelled = true; };
  }, [isAdmin]);

  const ganancia = stats?.resumen?.totalGanancia || 0;

  /* ── Vista Cajero / Stock ── */
  if (!isAdmin) {
    return (
      <div className="app-layout">
        <Navbar />
        <main className="main-content dashboard-main">
          <div className="page-header" style={{ flexShrink: 0 }}>
            <h2 className="page-title">Registro de Ventas</h2>
            <p className="page-subtitle">Historial reciente de operaciones en la sucursal</p>
          </div>

          {loading ? <Spinner /> : historial.length === 0 ? (
            <EmptyState
              message="¡Todavía no hay ventas hoy!"
              submessage="Aún no se registró ninguna operación. Las ventas aparecerán aquí automáticamente."
            />
          ) : (
            <div className="dashboard-scroll-area">
              <div className="sales-grid">
                {historial.map((v) => (
                  <div key={v._id} className="sale-card anim-page">
                    <div className="sale-card-header">
                      <div className="sale-cashier-info">
                        <div className="sale-icon"><Receipt size={18} /></div>
                        <div>
                          <p className="sale-cashier-name">Cajero: {v.cajeroId?.username ?? 'Desconocido'}</p>
                          <p className="sale-time">
                            {new Date(v.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                          </p>
                        </div>
                      </div>
                      <span className="sale-total">${v.total?.toLocaleString()}</span>
                    </div>
                    <div>
                      <p className="sale-items-label">Productos vendidos</p>
                      <ul className="sale-items-list">
                        {v.items?.map(item => (
                          <li key={item._id} className="sale-item-row">
                            <span className="sale-qty">{item.quantity}x</span>
                            {item.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    );
  }

  /* ── Vista Admin ── */
  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content dashboard-main">
        <div className="page-header" style={{ flexShrink: 0 }}>
          <h2 className="page-title">Panel de Control</h2>
          <p className="page-subtitle">Métricas clave y auditoría general</p>
        </div>

        {loading ? <Spinner /> : (
          <div className="dashboard-scroll-area">
            {/* KPIs */}
            <div className="kpi-grid">
              {[
                { icon: DollarSign, label: 'Ingresos Totales', value: `$${(stats?.resumen?.totalIngresos ?? 0).toLocaleString()}`, className: 'color-orange' },
                { icon: ShoppingCart, label: 'Ventas Realizadas', value: stats?.resumen?.cantidadVentas ?? 0, className: 'color-blue' },
                { icon: TrendingUp, label: 'Ganancia Neta', value: `$${ganancia.toLocaleString()}`, className: 'color-green' },
              ].map(({ icon: Icon, label, value, className }) => (
                <div key={label} className="kpi-card anim-page">
                  <div className={`kpi-icon ${className}`}>
                    <Icon size={26} />
                  </div>
                  <div>
                    <p className="kpi-label">{label}</p>
                    <p className="kpi-value">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom grid */}
            <div className="dashboard-bottom">
              {/* Gráfico */}
              <div className="card anim-page chart-delay">
                <h3 className="chart-title">
                  Top 10 Productos Más Vendidos
                </h3>
                {stats?.topProducts?.length > 0 ? (
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.topProducts} layout="vertical" margin={{ left: 0, right: 20, top: 10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" horizontal={false} />
                        <XAxis type="number" stroke="#444" tick={{ fill: '#a3a3a3', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis dataKey="_id" type="category" stroke="#444" width={220} tick={{ fill: '#a3a3a3', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <Tooltip
                          cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                          contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 12, color: '#fff', boxShadow: '0 12px 24px rgba(0,0,0,0.5)' }}
                          formatter={v => [`${v} unidades`, 'Vendidos']}
                        />
                        <Bar dataKey="cantidadVendida" radius={[0, 6, 6, 0]} maxBarSize={30} barSize={22}>
                          {stats.topProducts.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <EmptyState message="Sin datos suficientes" submessage="El gráfico aparecerá cuando haya ventas registradas." />
                )}
              </div>

              {/* Auditoría */}
              <div className="card audit-card anim-page audit-delay">
                <h3 className="audit-title">
                  Auditoría Reciente
                </h3>
                <div className="audit-list">
                  {historial.length === 0 ? (
                    <EmptyState message="Sin auditoría" submessage="No se registran ventas." />
                  ) : historial.slice(0, 10).map(v => (
                    <div key={v._id} className="audit-item">
                      <div className="audit-item-top">
                        <span className="audit-time">
                          {new Date(v.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="audit-total">${v.total?.toLocaleString()}</span>
                      </div>
                      <p className="audit-cashier">
                        Cajero: <span className="audit-cashier-name">{v.cajeroId?.username ?? 'N/A'}</span>
                      </p>
                      <p className="audit-items">
                        {v.items?.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
