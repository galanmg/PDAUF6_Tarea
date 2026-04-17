import { useState, useEffect } from 'react';
import api from '../services/api';

function CochesPage() {
  const [vehiculos, setVehiculos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ordenColumna, setOrdenColumna] = useState('matricula');
  const [ordenAsc, setOrdenAsc] = useState(true);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    cargarVehiculos();
  }, []);

  const cargarVehiculos = async () => {
    try {
      const [conductoresRes, plazasRes] = await Promise.all([
        api.get('/api/conductores'),
        api.get('/api/plazas')
      ]);

      const todosVehiculos = [];

      for (const conductor of conductoresRes.data) {
        const vehiculosRes = await api.get(`/api/conductores/${conductor.id}/vehiculos`);
        const plazasConductor = plazasRes.data.filter(
          p => p.conductor && p.conductor.id === conductor.id
        );

        vehiculosRes.data.forEach(vehiculo => {
          todosVehiculos.push({
            ...vehiculo,
            conductorNombre: `${conductor.nombre} ${conductor.apellidos}`,
            conductorDni: conductor.dni,
            conductorTelefono: conductor.telefono,
            plazas: plazasConductor.map(p => `P${p.planta}-${p.numero}`).join(', ') || '—'
          });
        });
      }

      setVehiculos(todosVehiculos);
    } catch (err) {
      setError('Error al cargar vehículos');
    } finally {
      setLoading(false);
    }
  };

  const cambiarOrden = (columna) => {
    if (ordenColumna === columna) {
      setOrdenAsc(!ordenAsc);
    } else {
      setOrdenColumna(columna);
      setOrdenAsc(true);
    }
  };

  const iconoOrden = (columna) => {
    if (ordenColumna !== columna) return ' ↕';
    return ordenAsc ? ' ▲' : ' ▼';
  };

  const vehiculosFiltrados = vehiculos
    .filter(v => {
      if (!busqueda) return true;
      const texto = busqueda.toLowerCase();
      return (
        v.matricula?.toLowerCase().includes(texto) ||
        v.marca?.toLowerCase().includes(texto) ||
        v.modelo?.toLowerCase().includes(texto) ||
        v.color?.toLowerCase().includes(texto) ||
        v.conductorNombre?.toLowerCase().includes(texto) ||
        v.conductorDni?.toLowerCase().includes(texto) ||
        v.plazas?.toLowerCase().includes(texto)
      );
    })
    .sort((a, b) => {
      let valA = '';
      let valB = '';

      switch (ordenColumna) {
        case 'matricula': valA = a.matricula || ''; valB = b.matricula || ''; break;
        case 'marca': valA = a.marca || ''; valB = b.marca || ''; break;
        case 'modelo': valA = a.modelo || ''; valB = b.modelo || ''; break;
        case 'color': valA = a.color || ''; valB = b.color || ''; break;
        case 'conductor': valA = a.conductorNombre || ''; valB = b.conductorNombre || ''; break;
        case 'dni': valA = a.conductorDni || ''; valB = b.conductorDni || ''; break;
        case 'plaza': valA = a.plazas || ''; valB = b.plazas || ''; break;
        default: valA = a.matricula || ''; valB = b.matricula || '';
      }

      const resultado = valA.localeCompare(valB, 'es');
      return ordenAsc ? resultado : -resultado;
    });

  if (loading) return <p className="text-center mt-10">Cargando...</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Vehículos</h1>
        <span className="text-sm text-gray-500">{vehiculos.length} vehículos registrados</span>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">
          {error}
          <button onClick={() => setError('')} className="ml-2 font-bold">✕</button>
        </div>
      )}

      {/* Buscador */}
      <div className="mb-4">
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por matrícula, marca, modelo, color, conductor, DNI o plaza..."
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {vehiculosFiltrados.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          {busqueda ? 'No se encontraron vehículos con esa búsqueda' : 'No hay vehículos registrados'}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    onClick={() => cambiarOrden('matricula')}
                    className="px-4 py-3 text-left text-sm font-semibold text-gray-600 cursor-pointer hover:bg-gray-100 select-none"
                  >
                    Matrícula{iconoOrden('matricula')}
                  </th>
                  <th
                    onClick={() => cambiarOrden('marca')}
                    className="px-4 py-3 text-left text-sm font-semibold text-gray-600 cursor-pointer hover:bg-gray-100 select-none"
                  >
                    Marca{iconoOrden('marca')}
                  </th>
                  <th
                    onClick={() => cambiarOrden('modelo')}
                    className="px-4 py-3 text-left text-sm font-semibold text-gray-600 cursor-pointer hover:bg-gray-100 select-none"
                  >
                    Modelo{iconoOrden('modelo')}
                  </th>
                  <th
                    onClick={() => cambiarOrden('color')}
                    className="px-4 py-3 text-left text-sm font-semibold text-gray-600 cursor-pointer hover:bg-gray-100 select-none"
                  >
                    Color{iconoOrden('color')}
                  </th>
                  <th
                    onClick={() => cambiarOrden('conductor')}
                    className="px-4 py-3 text-left text-sm font-semibold text-gray-600 cursor-pointer hover:bg-gray-100 select-none"
                  >
                    Conductor{iconoOrden('conductor')}
                  </th>
                  <th
                    onClick={() => cambiarOrden('dni')}
                    className="px-4 py-3 text-left text-sm font-semibold text-gray-600 cursor-pointer hover:bg-gray-100 select-none"
                  >
                    DNI{iconoOrden('dni')}
                  </th>
                  <th
                    onClick={() => cambiarOrden('plaza')}
                    className="px-4 py-3 text-left text-sm font-semibold text-gray-600 cursor-pointer hover:bg-gray-100 select-none"
                  >
                    Plaza{iconoOrden('plaza')}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                    Teléfono
                  </th>
                </tr>
              </thead>
              <tbody>
                {vehiculosFiltrados.map((v) => (
                  <tr key={v.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-mono font-medium">{v.matricula}</td>
                    <td className="px-4 py-3 text-sm">{v.marca}</td>
                    <td className="px-4 py-3 text-sm">{v.modelo}</td>
                    <td className="px-4 py-3 text-sm">{v.color}</td>
                    <td className="px-4 py-3 text-sm font-medium">{v.conductorNombre}</td>
                    <td className="px-4 py-3 text-sm">{v.conductorDni}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={v.plazas === '—' ? 'text-gray-400' : 'text-blue-600 font-medium'}>
                        {v.plazas}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">{v.conductorTelefono}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-400 mt-3">
        Haz clic en las cabeceras de la tabla para ordenar por esa columna
      </p>
    </div>
  );
}

export default CochesPage;