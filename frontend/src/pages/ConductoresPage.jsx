import { useState, useEffect } from 'react';
import api from '../services/api';

function ConductoresPage() {
  const [conductores, setConductores] = useState([]);
  const [vehiculos, setVehiculos] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal conductor
  const [modalAbierto, setModalAbierto] = useState(false);
  const [conductorEditando, setConductorEditando] = useState(null);
  const [formConductor, setFormConductor] = useState({
    nombre: '', apellidos: '', dni: '', telefono: '', email: ''
  });

  // Modal vehículo
  const [modalVehiculo, setModalVehiculo] = useState(false);
  const [vehiculoEditando, setVehiculoEditando] = useState(null);
  const [conductorIdVehiculo, setConductorIdVehiculo] = useState(null);
  const [formVehiculo, setFormVehiculo] = useState({
    matricula: '', marca: '', modelo: '', color: ''
  });

  // Confirmación de eliminación
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmDeleteVehiculo, setConfirmDeleteVehiculo] = useState(null);

  // Conductor expandido para ver vehículos
  const [expandido, setExpandido] = useState(null);

  useEffect(() => {
    cargarConductores();
  }, []);

  const cargarConductores = async () => {
    try {
      const response = await api.get('/api/conductores');
      setConductores(response.data);
    } catch (err) {
      setError('Error al cargar conductores');
    } finally {
      setLoading(false);
    }
  };

  const cargarVehiculos = async (conductorId) => {
    try {
      const response = await api.get(`/api/conductores/${conductorId}/vehiculos`);
      setVehiculos(prev => ({ ...prev, [conductorId]: response.data }));
    } catch (err) {
      console.error('Error al cargar vehículos', err);
    }
  };

  const toggleExpandir = (conductorId) => {
    if (expandido === conductorId) {
      setExpandido(null);
    } else {
      setExpandido(conductorId);
      if (!vehiculos[conductorId]) {
        cargarVehiculos(conductorId);
      }
    }
  };

  // ---- CRUD Conductor ----

  const abrirModalCrear = () => {
    setConductorEditando(null);
    setFormConductor({ nombre: '', apellidos: '', dni: '', telefono: '', email: '' });
    setModalAbierto(true);
  };

  const abrirModalEditar = (conductor) => {
    setConductorEditando(conductor);
    setFormConductor({
      nombre: conductor.nombre,
      apellidos: conductor.apellidos,
      dni: conductor.dni || '',
      telefono: conductor.telefono || '',
      email: conductor.email || ''
    });
    setModalAbierto(true);
  };

  const guardarConductor = async (e) => {
    e.preventDefault();
    try {
      if (conductorEditando) {
        await api.put(`/api/conductores/${conductorEditando.id}`, formConductor);
      } else {
        await api.post('/api/conductores', formConductor);
      }
      setModalAbierto(false);
      cargarConductores();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar conductor');
    }
  };

  const eliminarConductor = async (id) => {
    try {
      await api.delete(`/api/conductores/${id}`);
      setConfirmDelete(null);
      cargarConductores();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al eliminar conductor');
    }
  };

  // ---- CRUD Vehículo ----

  const abrirModalCrearVehiculo = (conductorId) => {
    setVehiculoEditando(null);
    setConductorIdVehiculo(conductorId);
    setFormVehiculo({ matricula: '', marca: '', modelo: '', color: '' });
    setModalVehiculo(true);
  };

  const abrirModalEditarVehiculo = (vehiculo) => {
    setVehiculoEditando(vehiculo);
    setFormVehiculo({
      matricula: vehiculo.matricula || '',
      marca: vehiculo.marca || '',
      modelo: vehiculo.modelo || '',
      color: vehiculo.color || ''
    });
    setModalVehiculo(true);
  };

  const guardarVehiculo = async (e) => {
    e.preventDefault();
    try {
      if (vehiculoEditando) {
        await api.put(`/api/vehiculos/${vehiculoEditando.id}`, formVehiculo);
      } else {
        await api.post('/api/vehiculos', {
          ...formVehiculo,
          conductorId: conductorIdVehiculo
        });
      }
      setModalVehiculo(false);
      cargarVehiculos(conductorIdVehiculo || vehiculoEditando.conductor.id);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar vehículo');
    }
  };

  const eliminarVehiculo = async (vehiculo) => {
    try {
      await api.delete(`/api/vehiculos/${vehiculo.id}`);
      setConfirmDeleteVehiculo(null);
      cargarVehiculos(vehiculo.conductor.id);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al eliminar vehículo');
    }
  };

  if (loading) return <p className="text-center mt-10">Cargando...</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Conductores</h1>
        <button
          onClick={abrirModalCrear}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          + Nuevo conductor
        </button>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">
          {error}
          <button onClick={() => setError('')} className="ml-2 font-bold">✕</button>
        </div>
      )}

      {conductores.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          No hay conductores registrados
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Nombre</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">DNI</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Teléfono</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Email</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {conductores.map((conductor) => (
                <tr key={conductor.id} className="border-t">
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleExpandir(conductor.id)}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      {expandido === conductor.id ? '▼' : '▶'} {conductor.nombre} {conductor.apellidos}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-sm">{conductor.dni}</td>
                  <td className="px-4 py-3 text-sm">{conductor.telefono}</td>
                  <td className="px-4 py-3 text-sm">{conductor.email}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => abrirModalEditar(conductor)}
                      className="text-blue-600 hover:underline text-sm mr-3"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => setConfirmDelete(conductor)}
                      className="text-red-600 hover:underline text-sm"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Panel de vehículos expandido */}
          {expandido && (
            <div className="bg-gray-50 border-t px-6 py-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-gray-700">
                  Vehículos de {conductores.find(c => c.id === expandido)?.nombre}
                </h3>
                <button
                  onClick={() => abrirModalCrearVehiculo(expandido)}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                >
                  + Añadir vehículo
                </button>
              </div>

              {!vehiculos[expandido] ? (
                <p className="text-gray-500 text-sm">Cargando...</p>
              ) : vehiculos[expandido].length === 0 ? (
                <p className="text-gray-500 text-sm">Sin vehículos registrados</p>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Matrícula</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Marca</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Modelo</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Color</th>
                      <th className="px-3 py-2 text-right text-xs font-semibold text-gray-500">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vehiculos[expandido].map((vehiculo) => (
                      <tr key={vehiculo.id} className="border-t border-gray-200">
                        <td className="px-3 py-2 text-sm font-mono">{vehiculo.matricula}</td>
                        <td className="px-3 py-2 text-sm">{vehiculo.marca}</td>
                        <td className="px-3 py-2 text-sm">{vehiculo.modelo}</td>
                        <td className="px-3 py-2 text-sm">{vehiculo.color}</td>
                        <td className="px-3 py-2 text-right">
                          <button
                            onClick={() => abrirModalEditarVehiculo(vehiculo)}
                            className="text-blue-600 hover:underline text-xs mr-2"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => setConfirmDeleteVehiculo(vehiculo)}
                            className="text-red-600 hover:underline text-xs"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      )}

      {/* Modal Conductor */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {conductorEditando ? 'Editar conductor' : 'Nuevo conductor'}
            </h2>
            <form onSubmit={guardarConductor}>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Nombre</label>
                <input
                  type="text"
                  value={formConductor.nombre}
                  onChange={(e) => setFormConductor({ ...formConductor, nombre: e.target.value })}
                  required
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Apellidos</label>
                <input
                  type="text"
                  value={formConductor.apellidos}
                  onChange={(e) => setFormConductor({ ...formConductor, apellidos: e.target.value })}
                  required
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">DNI</label>
                <input
                  type="text"
                  value={formConductor.dni}
                  onChange={(e) => setFormConductor({ ...formConductor, dni: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Teléfono</label>
                <input
                  type="text"
                  value={formConductor.telefono}
                  onChange={(e) => setFormConductor({ ...formConductor, telefono: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={formConductor.email}
                  onChange={(e) => setFormConductor({ ...formConductor, email: e.target.value })}
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

      {/* Modal Vehículo */}
      {modalVehiculo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {vehiculoEditando ? 'Editar vehículo' : 'Nuevo vehículo'}
            </h2>
            <form onSubmit={guardarVehiculo}>
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
                  onClick={() => setModalVehiculo(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmación eliminar conductor */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold mb-2">¿Eliminar conductor?</h3>
            <p className="text-gray-600 text-sm mb-4">
              Se eliminará a {confirmDelete.nombre} {confirmDelete.apellidos} y todos sus vehículos.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => eliminarConductor(confirmDelete.id)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmación eliminar vehículo */}
      {confirmDeleteVehiculo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold mb-2">¿Eliminar vehículo?</h3>
            <p className="text-gray-600 text-sm mb-4">
              Se eliminará el vehículo {confirmDeleteVehiculo.matricula}.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDeleteVehiculo(null)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => eliminarVehiculo(confirmDeleteVehiculo)}
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

export default ConductoresPage;