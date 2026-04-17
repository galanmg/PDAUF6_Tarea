import { useState, useEffect } from 'react';
import api from '../services/api';

function CochesPage() {
  const [vehiculos, setVehiculos] = useState([]);
  const [conductores, setConductores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ordenColumna, setOrdenColumna] = useState('matricula');
  const [ordenAsc, setOrdenAsc] = useState(true);
  const [busqueda, setBusqueda] = useState('');

  // Modal vehículo
  const [modalAbierto, setModalAbierto] = useState(false);
  const [vehiculoEditando, setVehiculoEditando] = useState(null);
  const [formVehiculo, setFormVehiculo] = useState({
    matricula: '', marca: '', modelo: '', color: '', conductorId: ''
  });

  // Confirmación eliminar
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    cargarVehiculos();
  }, []);

  const cargarVehiculos = async () => {
    try {
      const [conductoresRes, plazasRes] = await Promise.all([
        api.get('/api/conductores'),
        api.get('/api/plazas')
      ]);

      setConductores(conductoresRes.data);
      const todosVehiculos = [];

      for (const conductor of conductoresRes.data) {
        const vehiculosRes = await api.get(`/api/conductores/${conductor.id}/vehiculos`);
        const plazasConductor = plazasRes.data.filter(
          p => p.conductor && p.conductor.id === conductor.id
        );

        vehiculosRes.data.forEach(vehiculo => {
          todosVehiculos.push({
            ...vehiculo,
            conductorId: conductor.id,
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

  // ---- CRUD ----

  const abrirModalCrear = () => {
    if (conductores.length === 0) {
      setError('Primero debes crear al menos un conductor');
      return;
    }
    setVehiculoEditando(null);
    setFormVehiculo({ matricula: '', marca: '', modelo: '', color: '', conductorId: '' });
    setModalAbierto(true);
  };

  const abrirModalEditar = (vehiculo) => {
    setVehiculoEditando(vehiculo);
    setFormVehiculo({
      matricula: vehiculo.matricula || '',
      marca: vehiculo.marca || '',
      modelo: vehiculo.modelo || '',
      color: vehiculo.color || '',
      conductorId: vehiculo.conductorId || ''
    });
    setModalAbierto(true);
  };

  const guardarVehiculo = async (e) => {
    e.preventDefault();
    try {
      if (vehiculoEditando) {
        await api.put(`/api/vehiculos/${vehiculoEditando.id}`, {
          matricula: formVehiculo.matricula,
          marca: formVehiculo.marca,
          modelo: formVehiculo.modelo,
          color: formVehiculo.color
        });
      } else {
        await api.post('/api/vehiculos', {
          matricula: formVehiculo.matricula,
          marca: formVehiculo.marca,
          modelo: formVehiculo.modelo,
          color: formVehiculo.color,
          conductorId: formVehiculo.conductorId
        });
      }
      setModalAbierto(false);
      setLoading(true);
      cargarVehiculos();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar vehículo');
    }
  };

  const eliminarVehiculo = async (vehiculo) => {
    try {
      await api.delete(`/api/vehiculos/${vehiculo.id}`);
      setConfirmDelete(null);
      setLoading(true);
      cargarVehiculos();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al eliminar vehículo');
    }
  };

  if (loading) return <p className="text-center mt-10">Cargando...</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Vehículos</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">{vehiculos.length} vehículos registrados</span>
          <button
            onClick={abrirModalCrear}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            + Nuevo vehículo
          </button>
        </div>
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
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">
                    Acciones
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
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => abrirModalEditar(v)}
                        className="text-blue-600 hover:underline text-sm mr-3"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => setConfirmDelete(v)}
                        className="text-red-600 hover:underline text-sm"
                      >
                        Eliminar
                      </button>
                    </td>
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

      {/* Modal Vehículo */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {vehiculoEditando ? 'Editar vehículo' : 'Nuevo vehículo'}
            </h2>
            <form onSubmit={guardarVehiculo}>
              {!vehiculoEditando && (
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">
                    Conductor <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formVehiculo.conductorId}
                    onChange={(e) => setFormVehiculo({ ...formVehiculo, conductorId: e.target.value })}
                    required
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="">Selecciona un conductor</option>
                    {conductores.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre} {c.apellidos} — {c.dni}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {vehiculoEditando && (
                <div className="mb-3 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-600">
                  Conductor: <span className="font-medium">{vehiculoEditando.conductorNombre}</span>
                </div>
              )}
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Matrícula</label>
                <input
                  type="text"
                  value={formVehiculo.matricula}
                  onChange={(e) => setFormVehiculo({ ...formVehiculo, matricula: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Marca</label>
                <input
                  type="text"
                  value={formVehiculo.marca}
                  onChange={(e) => setFormVehiculo({ ...formVehiculo, marca: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Modelo</label>
                <input
                  type="text"
                  value={formVehiculo.modelo}
                  onChange={(e) => setFormVehiculo({ ...formVehiculo, modelo: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Color</label>
                <input
                  type="text"
                  value={formVehiculo.color}
                  onChange={(e) => setFormVehiculo({ ...formVehiculo, color: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmación eliminar */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold mb-2">¿Eliminar vehículo?</h3>
            <p className="text-gray-600 text-sm mb-4">
              Se eliminará el vehículo {confirmDelete.matricula} de {confirmDelete.conductorNombre}.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => eliminarVehiculo(confirmDelete)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CochesPage;