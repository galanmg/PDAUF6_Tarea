import { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    const guardado = localStorage.getItem('usuario');
    return guardado ? JSON.parse(guardado) : null;
  });

  const navigate = useNavigate();

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const data = response.data;

    localStorage.setItem('token', data.token);
    localStorage.setItem('usuario', JSON.stringify({
      email: data.email,
      nombre: data.nombre,
      roles: data.roles
    }));

    setUsuario({
      email: data.email,
      nombre: data.nombre,
      roles: data.roles
    });

    navigate('/conductores');
  };

  const register = async (email, password, nombre, apellidos) => {
    const response = await api.post('/auth/register', {
      email, password, nombre, apellidos
    });
    const data = response.data;

    localStorage.setItem('token', data.token);
    localStorage.setItem('usuario', JSON.stringify({
      email: data.email,
      nombre: data.nombre,
      roles: data.roles
    }));

    setUsuario({
      email: data.email,
      nombre: data.nombre,
      roles: data.roles
    });

    navigate('/conductores');
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setUsuario(null);
    navigate('/login');
  };

  const isAuthenticated = () => {
    return !!localStorage.getItem('token');
  };

  return (
    <AuthContext.Provider value={{ usuario, login, register, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}