import { useState, useEffect } from 'react';
import api from '../services/api';

function PlazasPage() {
  const [plazas, setPlazas] = useState([]);
  const [conductores, setConductores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [plantaActiva, setPlantaActiva] = useState(0);

  // Modal asignar
  const [modalAsignar, setModalAsignar] = useState(null);
  const [conductorSeleccionado, setConductorSeleccionado] = useState('');

  // Modal pagos
  const [modalPagos, setModalPagos] = useState(null);
  const [pagos, setPagos] = useState([]);
  const [anioSeleccionado, setAnioSeleccionado] = useState(new Date().getFullYear());

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [plazasRes, conductoresRes] = await Promise.all([
        api.get('/api/plazas'),
        api.get('/api/conductores')
      ]);
      setPlazas(plazasRes.data);
      setConductores(conductoresRes.data);
    } catch (err) {
      setError('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const asignarPlaza = async () => {
    if (!conductorSeleccionado) return;
    try {
      await api.put(`/api/plazas/${modalAsignar.id}/asignar/${conductorSeleccionado}`);
      setModalAsignar(null);
      setConductorSeleccionado('');
      cargarDatos();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al asignar plaza');
    }
  };

  const liberarPlaza = async (plazaId) => {
    try {
      await api.put(`/api/plazas/${plazaId}/liberar`);
      cargarDatos();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al liberar plaza');
    }
  };

  // ---- Pagos ----

  const abrirPagos = async (plaza) => {
    setModalPagos(plaza);
    try {
      const response = await api.get(`/api/plazas/${plaza.id}/pagos`);
      setPagos(response.data);
    } catch (err) {
      console.error('Error al cargar pagos', err);
    }
  };

  const crearPago = async (mes) => {
    try {
      await api.post('/api/pagos', {
        plazaId: modalPagos.id,
        mes: mes,
        anio: anioSeleccionado
      });
      const response = await api.get(`/api/plazas/${modalPagos.id}/pagos`);
      setPagos(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear pago');
    }
  };

  const togglePago = async (pagoId) => {
    try {
      await api.put(`/api/pagos/${pagoId}/toggle`);
      const response = await api.get(`/api/plazas/${modalPagos.id}/pagos`);
      setPagos(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al actualizar pago');
    }
  };

  const eliminarPago = async (pagoId) => {
    try {
      await api.delete(`/api/pagos/${pagoId}`);
      const response = await api.get(`/api/plazas/${modalPagos.id}/pagos`);
      setPagos(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al eliminar pago');
    }
  };

  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

  const plazasPlanta = plazas.filter(p => p.planta === plantaActiva);
  const fila1 = plazasPlanta.filter(p => p.numero <= 11);
  const fila2 = plazasPlanta.filter(p => p.numero > 11);

  if (loading) return <p className="text-center mt-10">Cargando...</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Plazas de parking</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setPlantaActiva(0)}
            className={`px-4 py-2 rounded-lg font-medium ${
              plantaActiva === 0
                ? 'bg-blue-600 text-white'
                : 'bg-white border hover:bg-gray-50'
            }`}
          >
            Planta Baja
          </button>
          <button
            onClick={() => setPlantaActiva(1)}
            className={`px-4 py-2 rounded-lg font-medium ${
              plantaActiva === 1
                ? 'bg-blue-600 text-white'
                : 'bg-white border hover:bg-gray-50'
            }`}
          >
            Planta 1ª
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">
          {error}
          <button onClick={() => setError('')} className="ml-2 font-bold">✕</button>
        </div>
      )}

      {/* Leyenda */}
      <div className="flex gap-4 mb-4 text-sm">
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
          <span>Libre</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
          <span>Ocupada</span>
        </div>
      </div>

      {/* Mapa del parking */}
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-center text-sm text-gray-500 mb-4">— Hilera superior —</p>
        <div className="grid grid-cols-11 gap-2 mb-6">
          {fila1.map((plaza) => (
            <PlazaCard
              key={plaza.id}
              plaza={plaza}
              onAsignar={() => { setModalAsignar(plaza); setConductorSeleccionado(''); }}
              onLiberar={() => liberarPlaza(plaza.id)}
              onVerPagos={() => abrirPagos(plaza)}
            />
          ))}
        </div>

        <div className="border-t border-dashed border-gray-300 my-4"></div>
        <p className="text-center text-sm text-gray-400 mb-4">🚗 — Carril central — 🚗</p>
        <div className="border-t border-dashed border-gray-300 my-4"></div>

        <p className="text-center text-sm text-gray-500 mb-4">— Hilera inferior —</p>
        <div className="grid grid-cols-11 gap-2">
          {fila2.map((plaza) => (
            <PlazaCard
              key={plaza.id}
              plaza={plaza}
              onAsignar={() => { setModalAsignar(plaza); setConductorSeleccionado(''); }}
              onLiberar={() => liberarPlaza(plaza.id)}
              onVerPagos={() => abrirPagos(plaza)}
            />
          ))}
        </div>
      </div>

      {/* Resumen */}
      <div className="mt-4 flex gap-4 text-sm text-gray-600">
        <span>Total: {plazasPlanta.length}</span>
        <span>Libres: {plazasPlanta.filter(p => !p.ocupada).length}</span>
        <span>Ocupadas: {plazasPlanta.filter(p => p.ocupada).length}</span>
      </div>

      {/* Modal Asignar */}
      {modalAsignar && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold mb-4">
              Asignar plaza {modalAsignar.numero} (Planta {modalAsignar.planta === 0 ? 'Baja' : '1ª'})
            </h3>
            <select
              value={conductorSeleccionado}
              onChange={(e) => setConductorSeleccionado(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 mb-4"
            >
              <option value="">Selecciona un conductor</option>
              {conductores.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre} {c.apellidos} — {c.dni}
                </option>
              ))}
            </select>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setModalAsignar(null)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={asignarPlaza}
                disabled={!conductorSeleccionado}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Asignar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Pagos */}
      {modalPagos && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">
                Pagos — Plaza {modalPagos.numero} (Planta {modalPagos.planta === 0 ? 'Baja' : '1ª'})
              </h3>
              <span className="text-sm text-gray-500">Tarifa: {modalPagos.tarifa}€/mes</span>
            </div>

            {modalPagos.conductor && (
              <p className="text-sm text-gray-600 mb-3">
                Conductor: {modalPagos.conductor.nombre} {modalPagos.conductor.apellidos}
              </p>
            )}

            <div className="flex items-center gap-3 mb-4">
              <label className="text-sm font-medium">Año:</label>
              <select
                value={anioSeleccionado}
                onChange={(e) => setAnioSeleccionado(parseInt(e.target.value))}
                className="border rounded px-2 py-1 text-sm"
              >
                {[2025, 2026, 2027, 2028, 2029, 2030].map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-4 gap-2 mb-4">
              {meses.map((mes, index) => {
                const pago = pagos.find(p => p.mes === index + 1 && p.anio === anioSeleccionado);
                return (
                  <div
                    key={index}
                    className={`border rounded-lg p-2 text-center text-sm ${
                      pago
                        ? pago.pagado
                          ? 'bg-green-100 border-green-300'
                          : 'bg-yellow-100 border-yellow-300'
                        : 'bg-gray-50'
                    }`}
                  >
                    <div className="font-medium">{mes}</div>
                    {pago ? (
                      <div className="mt-1">
                        <span className="text-xs">{pago.cantidad}€</span>
                        <div className="flex gap-1 mt-1 justify-center">
                          <button
                            onClick={() => togglePago(pago.id)}
                            className="text-xs px-1 rounded bg-white border hover:bg-gray-100"
                            title={pago.pagado ? 'Marcar como no pagado' : 'Marcar como pagado'}
                          >
                            {pago.pagado ? '✅' : '⏳'}
                          </button>
                          <button
                            onClick={() => eliminarPago(pago.id)}
                            className="text-xs px-1 rounded bg-white border hover:bg-red-50 text-red-500"
                            title="Eliminar pago"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => crearPago(index + 1)}
                        className="text-xs text-blue-600 hover:underline mt-1"
                      >
                        + Crear
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => { setModalPagos(null); setPagos([]); }}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Componente auxiliar para cada plaza
function PlazaCard({ plaza, onAsignar, onLiberar, onVerPagos }) {
  return (
    <div
      className={`border rounded-lg p-2 text-center text-xs cursor-pointer transition ${
        plaza.ocupada
          ? 'bg-red-50 border-red-300 hover:bg-red-100'
          : 'bg-green-50 border-green-300 hover:bg-green-100'
      }`}
    >
      <div className="font-bold text-sm">{plaza.numero}</div>
      {plaza.ocupada && plaza.conductor ? (
        <div>
          <div className="truncate text-[10px] text-gray-600 mt-1">
            {plaza.conductor.nombre}
          </div>
          <div className="flex gap-1 mt-1 justify-center">
            <button
              onClick={onVerPagos}
              className="text-[10px] text-blue-600 hover:underline"
            >
              Pagos
            </button>
            <button
              onClick={onLiberar}
              className="text-[10px] text-red-600 hover:underline"
            >
              Liberar
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={onAsignar}
          className="text-[10px] text-blue-600 hover:underline mt-1"
        >
          Asignar
        </button>
      )}
    </div>
  );
}

export default PlazasPage;