import { AuthProvider } from './context/AuthProvider';
import AppRoutes from './routes/AppRoutes';

// Punto de entrada: provee el contexto de autenticación y monta el router
const App = () => (
  <AuthProvider>
    <AppRoutes />
  </AuthProvider>
);

export default App;
