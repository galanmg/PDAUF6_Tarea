import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

function HomePage() {
  const { isAuthenticated } = useAuth();
  const [stats, setStats] = useState({ conductores: 0, vehiculos: 0, ocupadas: 0, total: 0 });

  useEffect(() => {
    if (isAuthenticated()) {
      cargarEstadisticas();
    }
  }, []);

  const cargarEstadisticas = async () => {
    try {
      const [conductoresRes, plazasRes] = await Promise.all([
        api.get('/api/conductores'),
        api.get('/api/plazas')
      ]);

      let totalVehiculos = 0;
      for (const conductor of conductoresRes.data) {
        const vehiculosRes = await api.get(`/api/conductores/${conductor.id}/vehiculos`);
        totalVehiculos += vehiculosRes.data.length;
      }

      setStats({
        conductores: conductoresRes.data.length,
        vehiculos: totalVehiculos,
        ocupadas: plazasRes.data.filter(p => p.ocupada).length,
        total: plazasRes.data.length
      });
    } catch (err) {
      console.error('Error al cargar estadísticas', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          🅿️ Parking Manager
        </h1>
        <p className="text-lg text-gray-600 mb-2">
          Sistema de gestión para tu parking privado
        </p>
        <Badge variant="secondary" className="mb-6">v1.0 — 44 plazas · 2 plantas</Badge>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Link to={isAuthenticated() ? '/conductores' : '/login'} className="block">
            <div className="bg-blue-50 rounded-lg p-6 hover:bg-blue-100 transition h-full">
              <div className="text-3xl mb-3">👤</div>
              <h3 className="font-semibold text-lg mb-2">Conductores</h3>
              <p className="text-gray-600 text-sm">
                Gestiona los perfiles de los conductores y sus vehículos
              </p>
              {isAuthenticated() && (
                <Badge className="mt-3">{stats.conductores} registrados</Badge>
              )}
            </div>
          </Link>

          <Link to={isAuthenticated() ? '/coches' : '/login'} className="block">
            <div className="bg-yellow-50 rounded-lg p-6 hover:bg-yellow-100 transition h-full">
              <div className="text-3xl mb-3">🚗</div>
              <h3 className="font-semibold text-lg mb-2">Vehículos</h3>
              <p className="text-gray-600 text-sm">
                Consulta y gestiona todos los vehículos del parking
              </p>
              {isAuthenticated() && (
                <Badge className="mt-3">{stats.vehiculos} registrados</Badge>
              )}
            </div>
          </Link>

          <Link to={isAuthenticated() ? '/plazas' : '/login'} className="block">
            <div className="bg-green-50 rounded-lg p-6 hover:bg-green-100 transition h-full">
              <div className="text-3xl mb-3">📍</div>
              <h3 className="font-semibold text-lg mb-2">Plazas</h3>
              <p className="text-gray-600 text-sm">
                2 plantas con 22 plazas cada una. Visualiza y asigna plazas
              </p>
              {isAuthenticated() && (
                <Badge className="mt-3" variant={stats.ocupadas === stats.total ? 'destructive' : 'secondary'}>
                  {stats.ocupadas} ocupadas de {stats.total}
                </Badge>
              )}
            </div>
          </Link>
        </div>

        {!isAuthenticated() && (
          <div className="mt-8 flex justify-center gap-4">
            <Link to="/login">
              <Button variant="outline">Iniciar sesión</Button>
            </Link>
            <Link to="/registro">
              <Button>Registrarse</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default HomePage;