import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
                <button
                  onClick={logout}
                  className="bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded text-sm"
                >
                  Cerrar sesión
                </button>
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
                <NavLink
                  to="/registro"
                  className="bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded text-sm"
                >
                  Registrarse
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