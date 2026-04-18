import { useState, useEffect } from 'react';
import api from '../services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog';

function CochesPage() {
  const [vehiculos, setVehiculos] = useState([]);
  const [conductores, setConductores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ordenColumna, setOrdenColumna] = useState('matricula');
  const [ordenAsc, setOrdenAsc] = useState(true);
  const [busqueda, setBusqueda] = useState('');

  const [modalAbierto, setModalAbierto] = useState(false);
  const [vehiculoEditando, setVehiculoEditando] = useState(null);
  const [formVehiculo, setFormVehiculo] = useState({
    matricula: '', marca: '', modelo: '', color: '', conductorId: ''
  });

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
          <Badge variant="secondary">{vehiculos.length} registrados</Badge>
          <Button onClick={abrirModalCrear}>+ Nuevo vehículo</Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">
          {error}
          <button onClick={() => setError('')} className="ml-2 font-bold">✕</button>
        </div>
      )}

      <div className="mb-4">
        <Input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por matrícula, marca, modelo, color, conductor, DNI o plaza..."
        />
      </div>

      {vehiculosFiltrados.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          {busqueda ? 'No se encontraron vehículos con esa búsqueda' : 'No hay vehículos registrados'}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="cursor-pointer hover:bg-gray-100 select-none" onClick={() => cambiarOrden('matricula')}>Matrícula{iconoOrden('matricula')}</TableHead>
                <TableHead className="cursor-pointer hover:bg-gray-100 select-none" onClick={() => cambiarOrden('marca')}>Marca{iconoOrden('marca')}</TableHead>
                <TableHead className="cursor-pointer hover:bg-gray-100 select-none" onClick={() => cambiarOrden('modelo')}>Modelo{iconoOrden('modelo')}</TableHead>
                <TableHead className="cursor-pointer hover:bg-gray-100 select-none" onClick={() => cambiarOrden('color')}>Color{iconoOrden('color')}</TableHead>
                <TableHead className="cursor-pointer hover:bg-gray-100 select-none" onClick={() => cambiarOrden('conductor')}>Conductor{iconoOrden('conductor')}</TableHead>
                <TableHead className="cursor-pointer hover:bg-gray-100 select-none" onClick={() => cambiarOrden('dni')}>DNI{iconoOrden('dni')}</TableHead>
                <TableHead className="cursor-pointer hover:bg-gray-100 select-none" onClick={() => cambiarOrden('plaza')}>Plaza{iconoOrden('plaza')}</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehiculosFiltrados.map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="font-mono font-medium">{v.matricula}</TableCell>
                  <TableCell>{v.marca}</TableCell>
                  <TableCell>{v.modelo}</TableCell>
                  <TableCell>{v.color}</TableCell>
                  <TableCell className="font-medium">{v.conductorNombre}</TableCell>
                  <TableCell><Badge variant="outline">{v.conductorDni}</Badge></TableCell>
                  <TableCell>
                    <span className={v.plazas === '—' ? 'text-gray-400' : ''}>
                      {v.plazas !== '—' ? <Badge>{v.plazas}</Badge> : '—'}
                    </span>
                  </TableCell>
                  <TableCell>{v.conductorTelefono}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => abrirModalEditar(v)}>Editar</Button>
                    <Button variant="ghost" size="sm" className="text-red-600" onClick={() => setConfirmDelete(v)}>Eliminar</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <p className="text-xs text-gray-400 mt-3">Haz clic en las cabeceras de la tabla para ordenar</p>

      {/* Dialog Vehículo */}
      <Dialog open={modalAbierto} onOpenChange={setModalAbierto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{vehiculoEditando ? 'Editar vehículo' : 'Nuevo vehículo'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={guardarVehiculo} className="space-y-3">
            {!vehiculoEditando && (
              <div>
                <Label>Conductor <span className="text-red-500">*</span></Label>
                <select
                  value={formVehiculo.conductorId}
                  onChange={(e) => setFormVehiculo({ ...formVehiculo, conductorId: e.target.value })}
                  required
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs mt-1"
                >
                  <option value="">Selecciona un conductor</option>
                  {conductores.map((c) => (
                    <option key={c.id} value={c.id}>{c.nombre} {c.apellidos} — {c.dni}</option>
                  ))}
                </select>
              </div>
            )}
            {vehiculoEditando && (
              <div className="bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-600">
                Conductor: <span className="font-medium">{vehiculoEditando.conductorNombre}</span>
              </div>
            )}
            <div>
              <Label htmlFor="vc-matricula">Matrícula</Label>
              <Input id="vc-matricula" value={formVehiculo.matricula} onChange={(e) => setFormVehiculo({ ...formVehiculo, matricula: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="vc-marca">Marca</Label>
              <Input id="vc-marca" value={formVehiculo.marca} onChange={(e) => setFormVehiculo({ ...formVehiculo, marca: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="vc-modelo">Modelo</Label>
              <Input id="vc-modelo" value={formVehiculo.modelo} onChange={(e) => setFormVehiculo({ ...formVehiculo, modelo: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="vc-color">Color</Label>
              <Input id="vc-color" value={formVehiculo.color} onChange={(e) => setFormVehiculo({ ...formVehiculo, color: e.target.value })} className="mt-1" />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setModalAbierto(false)}>Cancelar</Button>
              <Button type="submit">Guardar</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* AlertDialog eliminar */}
      <AlertDialog open={!!confirmDelete} onOpenChange={(open) => !open && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar vehículo?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará el vehículo {confirmDelete?.matricula} de {confirmDelete?.conductorNombre}. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => eliminarVehiculo(confirmDelete)} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default CochesPage;