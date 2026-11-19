import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { me } from "./services/mockApi.js";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Cadastro from "./pages/Cadastro.jsx";
import DashboardVendedor from "./pages/DashboardVendedor.jsx";
import BuscaComprador from "./pages/BuscaComprador.jsx";
import Admin from "./pages/Admin.jsx";

function ScrollTop() {
  const { pathname } = useLocation();
  useEffect(() => window.scrollTo(0, 0), [pathname]);
  return null;
}

export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const ehAutenticado = !!usuario;
  const ehAdmin = usuario && usuario.tipo_usuario === "administrador";
  const ehAnunciante = usuario && ["proprietario", "corretor", "administrador"].includes(usuario.tipo_usuario);

  useEffect(() => {
    const token = localStorage.getItem("morada_token");
    if (token) {
      me(token)
        .then((u) => setUsuario(u))
        .catch(() => {
          localStorage.removeItem("morada_token");
          localStorage.removeItem("morada_usuario");
        })
        .finally(() => setCarregando(false));
    } else {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    if (!carregando && !ehAutenticado && (pathname === "/comprador" || pathname === "/vendedor" || pathname === "/admin")) {
      navigate("/login");
    }
  }, [carregando, ehAutenticado, pathname, navigate]);

  if (carregando) return null;

  return (
    <>
      <ScrollTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/comprador" element={ehAutenticado ? <BuscaComprador /> : null} />
        <Route path="/vendedor" element={ehAnunciante ? <DashboardVendedor /> : null} />
        <Route path="/admin" element={ehAdmin ? <Admin /> : null} />
        <Route path="*" element={<Home />} />
      </Routes>
    </>
  );
}
