import { Routes, Route, useLocation, useNavigate, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "./services/auth.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Cadastro from "./pages/Cadastro.jsx";
import DashboardVendedor from "./pages/DashboardVendedor.jsx";
import BuscaComprador from "./pages/BuscaComprador.jsx";
import Admin from "./pages/Admin.jsx";
import Perfil from "./pages/Perfil.jsx";

const ROTAS_PROTEGIDAS = ["/comprador", "/vendedor", "/admin", "/perfil"];

function ScrollTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function AppRoutes() {
  const { usuario, carregando } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const autenticado = !!usuario;
  const ehAdmin = usuario?.tipo_usuario === "administrador";
  const ehAnunciante =
    !!usuario && ["proprietario", "corretor", "administrador"].includes(usuario.tipo_usuario);

  useEffect(() => {
    if (!carregando && !autenticado && ROTAS_PROTEGIDAS.includes(pathname)) {
      navigate("/login", { replace: true });
    }
  }, [carregando, autenticado, pathname, navigate]);

  if (carregando) return null;

  const exigirPerfil = (cond, elemento) => {
    if (cond) return elemento;
    if (!autenticado) return null; // o guard acima redireciona para /login
    return <Navigate to="/" replace />;
  };

  return (
    <>
      <ScrollTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/comprador" element={exigirPerfil(autenticado, <BuscaComprador />)} />
        <Route path="/vendedor" element={exigirPerfil(ehAnunciante, <DashboardVendedor />)} />
        <Route path="/admin" element={exigirPerfil(ehAdmin, <Admin />)} />
        <Route path="/perfil" element={exigirPerfil(autenticado, <Perfil />)} />
        <Route path="*" element={<Home />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}