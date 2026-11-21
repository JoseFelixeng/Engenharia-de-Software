import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { Icon } from "../components/Icons.jsx";
import { me } from "../services/mockApi.js";
import "../styles/components.css";
import "../styles/dashboard.css";

export default function Perfil() {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("morada_token");
    if (!token) {
      navigate("/login");
      return;
    }
    me(token)
      .then((u) => setUsuario(u))
      .catch(() => {
        localStorage.removeItem("morada_token");
        localStorage.removeItem("morada_usuario");
        navigate("/login");
      })
      .finally(() => setCarregando(false));
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem("morada_token");
    localStorage.removeItem("morada_usuario");
    navigate("/");
  };

  if (carregando) return null;
  if (!usuario) return null;

  const ehAdministrador = usuario.tipo_usuario === "administrador";
  const ehAnunciante = ["proprietario", "corretor", "administrador"].includes(usuario.tipo_usuario);

  return (
    <>
      <Navbar />
      <main className="dashboard">
        <div className="container dashboard-header">
          <div>
            <h1>Meu perfil</h1>
            <p>Sua conta na Morada · {usuario.tipo_usuario}</p>
          </div>
          <button className="btn btn-ghost" onClick={logout}>
            <Icon.Arrow width={16} height={16} style={{ transform: "rotate(180deg)" }} /> Sair
          </button>
        </div>

        <div className="container perfil-card">
          <div className="perfil-avatar">
            <span>{usuario.nome.split(" ")[0][0]}{usuario.nome.split(" ")[1]?.[0]}</span>
          </div>
          <div className="perfil-info">
            <h2>{usuario.nome}</h2>
            <p><Icon.Mail width={16} height={16} /> {usuario.email}</p>
            {usuario.telefone && <p><Icon.Phone width={16} height={16} /> {usuario.telefone}</p>}
            <div className="perfil-badges">
              <span className={`tipo-badge ${usuario.tipo_usuario}`}>
                {usuario.tipo_usuario}
              </span>
              <span className={`sit-badge ${usuario.situacao}`}>
                {usuario.situacao === "ativa" ? "Ativa" : "Inativa"}
              </span>
            </div>
            <small>Cadastrado em {new Date(usuario.data_cadastro).toLocaleDateString("pt-BR")}</small>
          </div>
        </div>

        <div className="container perfil-acoes">
          {ehAdministrador && (
            <Link to="/admin" className="btn btn-primary">
              <Icon.Scale width={18} height={18} /> Painel administrativo
            </Link>
          )}
          {ehAnunciante && (
            <Link to="/vendedor" className="btn btn-primary">
              <Icon.House width={18} height={18} /> Meus anúncios
            </Link>
          )}
          {usuario.tipo_usuario === "interessado" && (
            <Link to="/comprador" className="btn btn-primary">
              <Icon.Search width={18} height={18} /> Buscar imóveis
            </Link>
          )}
          <Link to="/" className="btn btn-ghost">
            <Icon.Home width={18} height={18} /> Voltar ao início
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}