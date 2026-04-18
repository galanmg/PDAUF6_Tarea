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

function ConductoresPage() {
  const [conductores, setConductores] = useState([]);
  const [vehiculos, setVehiculos] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [modalAbierto, setModalAbierto] = useState(false);
  const [conductorEditando, setConductorEditando] = useState(null);
  const [formConductor, setFormConductor] = useState({
    nombre: '', apellidos: '', dni: '', telefono: '', email: ''
  });

  const [modalVehiculo, setModalVehiculo] = useState(false);
  const [vehiculoEditando, setVehiculoEditando] = useState(null);
  const [conductorIdVehiculo, setConductorIdVehiculo] = useState(null);
  const [formVehiculo, setFormVehiculo] = useState({
    matricula: '', marca: '', modelo: '', color: ''
  });

  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmDeleteVehiculo, setConfirmDeleteVehiculo] = useState(null);
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
        <Button onClick={abrirModalCrear}>+ Nuevo conductor</Button>
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>DNI</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conductores.map((conductor) => (
                <TableRow key={conductor.id}>
                  <TableCell>
                    <button
                      onClick={() => toggleExpandir(conductor.id)}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      {expandido === conductor.id ? '▼' : '▶'} {conductor.nombre} {conductor.apellidos}
                    </button>
                  </TableCell>
                  <TableCell><Badge variant="outline">{conductor.dni}</Badge></TableCell>
                  <TableCell>{conductor.telefono}</TableCell>
                  <TableCell>{conductor.email}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => abrirModalEditar(conductor)}>
                      Editar
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-600" onClick={() => setConfirmDelete(conductor)}>
                      Eliminar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {expandido && (
            <div className="bg-gray-50 border-t px-6 py-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-gray-700">
                  Vehículos de {conductores.find(c => c.id === expandido)?.nombre}
                </h3>
                <Button size="sm" variant="secondary" onClick={() => abrirModalCrearVehiculo(expandido)}>
                  + Añadir vehículo
                </Button>
              </div>

              {!vehiculos[expandido] ? (
                <p className="text-gray-500 text-sm">Cargando...</p>
              ) : vehiculos[expandido].length === 0 ? (
                <p className="text-gray-500 text-sm">Sin vehículos registrados</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Matrícula</TableHead>
                      <TableHead>Marca</TableHead>
                      <TableHead>Modelo</TableHead>
                      <TableHead>Color</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vehiculos[expandido].map((vehiculo) => (
                      <TableRow key={vehiculo.id}>
                        <TableCell className="font-mono">{vehiculo.matricula}</TableCell>
                        <TableCell>{vehiculo.marca}</TableCell>
                        <TableCell>{vehiculo.modelo}</TableCell>
                        <TableCell>{vehiculo.color}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => abrirModalEditarVehiculo(vehiculo)}>
                            Editar
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600" onClick={() => setConfirmDeleteVehiculo(vehiculo)}>
                            Eliminar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          )}
        </div>
      )}

      {/* Dialog Conductor */}
      <Dialog open={modalAbierto} onOpenChange={setModalAbierto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{conductorEditando ? 'Editar conductor' : 'Nuevo conductor'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={guardarConductor} className="space-y-3">
            <div>
              <Label htmlFor="c-nombre">Nombre</Label>
              <Input id="c-nombre" value={formConductor.nombre} onChange={(e) => setFormConductor({ ...formConductor, nombre: e.target.value })} required className="mt-1" />
            </div>
            <div>
              <Label htmlFor="c-apellidos">Apellidos</Label>
              <Input id="c-apellidos" value={formConductor.apellidos} onChange={(e) => setFormConductor({ ...formConductor, apellidos: e.target.value })} required className="mt-1" />
            </div>
            <div>
              <Label htmlFor="c-dni">DNI</Label>
              <Input id="c-dni" value={formConductor.dni} onChange={(e) => setFormConductor({ ...formConductor, dni: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="c-telefono">Teléfono</Label>
              <Input id="c-telefono" value={formConductor.telefono} onChange={(e) => setFormConductor({ ...formConductor, telefono: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="c-email">Email</Label>
              <Input id="c-email" type="email" value={formConductor.email} onChange={(e) => setFormConductor({ ...formConductor, email: e.target.value })} className="mt-1" />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setModalAbierto(false)}>Cancelar</Button>
              <Button type="submit">Guardar</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Vehículo */}
      <Dialog open={modalVehiculo} onOpenChange={setModalVehiculo}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{vehiculoEditando ? 'Editar vehículo' : 'Nuevo vehículo'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={guardarVehiculo} className="space-y-3">
            <div>
              <Label htmlFor="v-matricula">Matrícula</Label>
              <Input id="v-matricula" value={formVehiculo.matricula} onChange={(e) => setFormVehiculo({ ...formVehiculo, matricula: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="v-marca">Marca</Label>
              <Input id="v-marca" value={formVehiculo.marca} onChange={(e) => setFormVehiculo({ ...formVehiculo, marca: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="v-modelo">Modelo</Label>
              <Input id="v-modelo" value={formVehiculo.modelo} onChange={(e) => setFormVehiculo({ ...formVehiculo, modelo: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="v-color">Color</Label>
              <Input id="v-color" value={formVehiculo.color} onChange={(e) => setFormVehiculo({ ...formVehiculo, color: e.target.value })} className="mt-1" />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setModalVehiculo(false)}>Cancelar</Button>
              <Button type="submit">Guardar</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* AlertDialog eliminar conductor */}
      <AlertDialog open={!!confirmDelete} onOpenChange={(open) => !open && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar conductor?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará a {confirmDelete?.nombre} {confirmDelete?.apellidos} y todos sus vehículos. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => eliminarConductor(confirmDelete?.id)} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* AlertDialog eliminar vehículo */}
      <AlertDialog open={!!confirmDeleteVehiculo} onOpenChange={(open) => !open && setConfirmDeleteVehiculo(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar vehículo?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará el vehículo {confirmDeleteVehiculo?.matricula}. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => eliminarVehiculo(confirmDeleteVehiculo)} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default ConductoresPage;