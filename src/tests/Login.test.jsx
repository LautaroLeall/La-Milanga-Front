import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Login from '../pages/Login';
import * as AuthContext from '../context/AuthContext';

// Mock showAlert
vi.mock('../utils/alert', () => ({
  showAlert: {
    fire: vi.fn(),
  }
}));

describe('Login Component', () => {
  it('renderiza correctamente el formulario de login', () => {
    const mockContext = { user: null, login: vi.fn() };

    render(
      <BrowserRouter>
        <AuthContext.AuthContext.Provider value={mockContext}>
          <Login />
        </AuthContext.AuthContext.Provider>
      </BrowserRouter>
    );

    expect(screen.getByPlaceholderText(/tu@email.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ingresar/i })).toBeInTheDocument();
  });

  it('permite tipear credenciales y llama al login', async () => {
    const mockLogin = vi.fn().mockResolvedValue({ success: true });
    const mockContext = { user: null, login: mockLogin };

    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <AuthContext.AuthContext.Provider value={mockContext}>
          <Login />
        </AuthContext.AuthContext.Provider>
      </BrowserRouter>
    );

    const usernameInput = screen.getByPlaceholderText(/tu@email.com/i);
    const passwordInput = screen.getByPlaceholderText(/••••••••/i);
    const submitButton = screen.getByRole('button', { name: /ingresar/i });

    await user.type(usernameInput, 'admin');
    await user.type(passwordInput, 'admin123');
    await user.click(submitButton);

    expect(mockLogin).toHaveBeenCalledTimes(1);
    expect(mockLogin).toHaveBeenCalledWith('admin', 'admin123');
  });
});
