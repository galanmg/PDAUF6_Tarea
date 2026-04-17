function HomePage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          🅿️ Parking Manager
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          Sistema de gestión para tu parking privado
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-blue-50 rounded-lg p-6">
            <div className="text-3xl mb-3">🚗</div>
            <h3 className="font-semibold text-lg mb-2">Conductores</h3>
            <p className="text-gray-600 text-sm">
              Gestiona los perfiles de los conductores y sus vehículos
            </p>
          </div>

          <div className="bg-green-50 rounded-lg p-6">
            <div className="text-3xl mb-3">📍</div>
            <h3 className="font-semibold text-lg mb-2">44 Plazas</h3>
            <p className="text-gray-600 text-sm">
              2 plantas con 22 plazas cada una. Visualiza y asigna plazas
            </p>
          </div>

          <div className="bg-yellow-50 rounded-lg p-6">
            <div className="text-3xl mb-3">💰</div>
            <h3 className="font-semibold text-lg mb-2">Pagos</h3>
            <p className="text-gray-600 text-sm">
              Controla los pagos mensuales de cada plaza
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;