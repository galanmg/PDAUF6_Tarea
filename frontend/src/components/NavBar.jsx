import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';

function Navbar() {
  const { usuario, logout, isAuthenticated } = useAuth();

  return (
    <nav className="bg-gray-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <NavLink to="/" className="text-xl font-bold tracking-wide">
            🅿️ Parking Manager
          </NavLink>

          <div className="flex items-center gap-6">
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive ? 'text-blue-400 font-semibold' : 'hover:text-blue-300'
              }
            >
              Inicio
            </NavLink>

            {isAuthenticated() ? (
              <>
                <NavLink
                  to="/conductores"
                  className={({ isActive }) =>
                    isActive ? 'text-blue-400 font-semibold' : 'hover:text-blue-300'
                  }
                >
                  Conductores
                </NavLink>
                <NavLink
                  to="/coches"
                  className={({ isActive }) =>
                    isActive ? 'text-blue-400 font-semibold' : 'hover:text-blue-300'
                  }
                >
                  Vehículos
                </NavLink>
                <NavLink
                  to="/plazas"
                  className={({ isActive }) =>
                    isActive ? 'text-blue-400 font-semibold' : 'hover:text-blue-300'
                  }
                >
                  Plazas
                </NavLink>
                <span className="text-gray-400 text-sm">
                  Hola, {usuario?.nombre}
                </span>
                <Button variant="destructive" size="sm" onClick={logout}>
                  Cerrar sesión
                </Button>
              </>
            ) : (
              <>
                <NavLink
                  to="/login"
                  className={({ isActive }) =>
                    isActive ? 'text-blue-400 font-semibold' : 'hover:text-blue-300'
                  }
                >
                  Iniciar sesión
                </NavLink>
                <NavLink to="/registro">
                  <Button size="sm">Registrarse</Button>
                </NavLink>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;