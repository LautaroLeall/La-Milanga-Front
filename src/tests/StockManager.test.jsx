import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import StockManager from '../pages/StockManager';
import api from '../services/api';
import * as AuthContext from '../context/AuthContext';

// Mock API
vi.mock('../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  }
}));

// Mock showAlert
vi.mock('../utils/alert', () => ({
  showAlert: {
    fire: vi.fn().mockResolvedValue({ isConfirmed: true }),
  }
}));

describe('StockManager Component', () => {
  const mockProducts = [
    { _id: '1', name: 'Agua', price: 100, cost: 50, stock: 10, category: 'Bebidas' },
    { _id: '2', name: 'Pizza', price: 1000, cost: 400, stock: 5, category: 'Pizzas' }
  ];

  let mockContext;

  beforeEach(() => {
    vi.clearAllMocks();

    // Simulate Admin User
    mockContext = {
      user: { role: 'Admin', username: 'admin' },
      logout: vi.fn(),
    };

    // Mock API response for inventory
    api.get.mockResolvedValue({ data: mockProducts });
  });

  it('renderiza la tabla de inventario correctamente', async () => {
    render(
      <BrowserRouter>
        <AuthContext.AuthContext.Provider value={mockContext}>
          <StockManager />
        </AuthContext.AuthContext.Provider>
      </BrowserRouter>
    );

    // Esperar a que carguen los productos (el mock resuelve la promise)
    await waitFor(() => {
      expect(screen.getByText('Agua')).toBeInTheDocument();
      expect(screen.getByText('Pizza')).toBeInTheDocument();
    });

    // Validar tabla (precio, etc)
    expect(screen.getByText(/\$1[.,]000/)).toBeInTheDocument(); // Precio de la Pizza
  });

  it('abre el modal de crear producto y permite simular el envío', async () => {
    const user = userEvent.setup();
    api.post.mockResolvedValue({ data: { message: 'Ok' } });

    render(
      <BrowserRouter>
        <AuthContext.AuthContext.Provider value={mockContext}>
          <StockManager />
        </AuthContext.AuthContext.Provider>
      </BrowserRouter>
    );

    // Clic en Nuevo Producto
    const btnAdd = await screen.findByRole('button', { name: /nuevo producto/i });
    await user.click(btnAdd);

    // El modal debería estar visible
    const inputName = await screen.findByPlaceholderText(/ej: milanesa/i);
    expect(inputName).toBeInTheDocument();

    await user.type(inputName, 'Empanada');

    // Rellenamos precio
    const inputsNumber = screen.getAllByRole('spinbutton'); // price, cost, stock
    await user.type(inputsNumber[0], '500'); // price
    await user.type(inputsNumber[1], '200'); // cost
    await user.type(inputsNumber[2], '20'); // stock

    const saveBtn = screen.getByRole('button', { name: /guardar cambios/i });
    await user.click(saveBtn);

    // Verificamos que se llamó a la API (POST)
    expect(api.post).toHaveBeenCalledTimes(1);
    expect(api.post).toHaveBeenCalledWith('/stock', expect.objectContaining({
      name: 'Empanada',
      price: 500,
      cost: 200,
      stock: 20
    }));
  });
});
