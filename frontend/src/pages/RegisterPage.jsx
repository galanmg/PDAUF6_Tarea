import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function RegisterPage() {
  const { register } = useAuth();
  const [form, setForm] = useState({
    email: '',
    password: '',
    nombre: '',
    apellidos: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(form.email, form.password, form.nombre, form.apellidos);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-center mb-6">Crear cuenta</h2>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <Label htmlFor="nombre">Nombre</Label>
            <Input
              id="nombre"
              type="text"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              required
              className="mt-1"
            />
          </div>

          <div className="mb-4">
            <Label htmlFor="apellidos">Apellidos</Label>
            <Input
              id="apellidos"
              type="text"
              name="apellidos"
              value={form.apellidos}
              onChange={handleChange}
              required
              className="mt-1"
            />
          </div>

          <div className="mb-4">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="mt-1"
            />
          </div>

          <div className="mb-6">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Registrando...' : 'Registrarse'}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-4">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;