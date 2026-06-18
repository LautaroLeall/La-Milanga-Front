import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import POS from '../pages/POS';
import api from '../services/api';
import * as AuthContext from '../context/AuthContext';

// Mock API
vi.mock('../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  }
}));

// Mock showAlert
vi.mock('../utils/alert', () => ({
  showAlert: {
    fire: vi.fn().mockResolvedValue({ isConfirmed: true }),
  }
}));

describe('POS Component', () => {
  const mockProducts = [
    { _id: '1', name: 'Gaseosa', price: 1500, stock: 10, category: 'Bebidas' },
    { _id: '2', name: 'Milanesa', price: 5000, stock: 5, category: 'Platos Principales' }
  ];

  let mockContext;

  beforeEach(() => {
    vi.clearAllMocks();

    // Simulate Cajero User
    mockContext = {
      user: { role: 'Cajero', username: 'caja1' },
      logout: vi.fn(),
    };

    // Mock API response for inventory
    api.get.mockResolvedValue({ data: mockProducts });
  });

  it('renderiza productos y permite agregarlos al carrito', async () => {
    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <AuthContext.AuthContext.Provider value={mockContext}>
          <POS />
        </AuthContext.AuthContext.Provider>
      </BrowserRouter>
    );

    // Esperamos a que carguen los productos simulados
    await waitFor(() => {
      expect(screen.getByText('Gaseosa')).toBeInTheDocument();
      expect(screen.getByText('Milanesa')).toBeInTheDocument();
    });

    // Clic en el producto "Gaseosa"
    const gaseosaCard = screen.getByText('Gaseosa');
    await user.click(gaseosaCard);

    // Ahora en el carrito debería estar la gaseosa y el total en $1500
    expect(screen.getAllByText(/\$1[.,]500/).length).toBeGreaterThan(0);
  });

  it('permite completar una venta si el carrito tiene ítems', async () => {
    const user = userEvent.setup();
    api.post.mockResolvedValue({ data: { message: 'Venta registrada' } });

    render(
      <BrowserRouter>
        <AuthContext.AuthContext.Provider value={mockContext}>
          <POS />
        </AuthContext.AuthContext.Provider>
      </BrowserRouter>
    );

    // Esperamos carga
    await waitFor(() => {
      expect(screen.getByText('Milanesa')).toBeInTheDocument();
    });

    // Agregamos Milanesa (5000)
    await user.click(screen.getByText('Milanesa'));

    // Clic en Completar Venta
    const btnCompletar = screen.getByRole('button', { name: /cobrar venta/i });
    await user.click(btnCompletar);

    // Verificamos que se llamó a la API (POST /ventas)
    expect(api.post).toHaveBeenCalledTimes(1);
    expect(api.post).toHaveBeenCalledWith('/ventas', {
      items: [{ productId: '2', quantity: 1 }]
    });
  });
});
