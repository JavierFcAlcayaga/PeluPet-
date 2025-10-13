import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Servicios from './pages/Servicios';
import ServicioDetalle from './pages/ServicioDetalle';
import Reservas from './pages/Reservas';
import MisReservas from './pages/MisReservas';
import Perfil from './pages/Perfil';
import LoginRegister from './pages/LoginRegister';
import Blog from './pages/Blog';
import Nosotros from './pages/Nosotros';
import Carrito from './pages/Carrito';
import AdminServicios from './pages/AdminServicios';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App d-flex flex-column min-vh-100">
        <Navbar />
        <main className="flex-grow-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/servicios" element={<Servicios />} />
            <Route path="/servicios/:id" element={<ServicioDetalle />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/nosotros" element={<Nosotros />} />
            <Route path="/reservas" element={<Reservas />} />
            <Route path="/mis-reservas" element={<MisReservas />} />
            <Route path="/perfil" element={<Perfil />} />
            <Route path="/login" element={<LoginRegister />} />
            <Route path="/register" element={<LoginRegister />} />
            <Route path="/carrito" element={<Carrito />} />
            <Route path="/admin/servicios" element={<AdminServicios />} />
            {/* Ruta catch-all para páginas no encontradas */}
            <Route path="*" element={<Home />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;