import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <div className="text-center mt-20">
      <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
      <p className="text-xl text-gray-600 mb-6">Página no encontrada</p>
      <Link
        to="/"
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
      >
        Volver al inicio
      </Link>
    </div>
  );
}

export default NotFoundPage;