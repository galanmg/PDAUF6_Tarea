import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

function NotFoundPage() {
  return (
    <div className="text-center mt-20">
      <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
      <p className="text-xl text-gray-600 mb-6">Página no encontrada</p>
      <Link to="/">
        <Button>Volver al inicio</Button>
      </Link>
    </div>
  );
}

export default NotFoundPage;