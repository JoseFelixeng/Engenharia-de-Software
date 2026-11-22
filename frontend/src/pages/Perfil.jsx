import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { Icon } from "../components/Icons.jsx";
import { useAuth } from "../services/auth.jsx";
import "../styles/components.css";
import "../styles/dashboard.css";

function iniciaisDoNome(nome) {
  const partes = (nome || "").trim().split(/\s+/).filter(Boolean);
  if (!partes.length) return "•";
  const primeira = partes[0][0] || "";
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] || "" : "";
  return (primeira + ultima).toUpperCase();
}

function formatarData(valor) {
  if (!valor) return "—";
  const d = new Date(valor);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("pt-BR");
}

export default function Perfil() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  if (!usuario) return null;

  const ehAdministrador = usuario.tipo_usuario === "administrador";
  const ehAnunciante = ["proprietario", "corretor", "administrador"].includes(usuario.tipo_usuario);

  const sair = () => {
    logout();
    navigate("/");
  };

  return (
    <>
      <Navbar />
      <main className="dashboard">
        <div className="container dashboard-header">
          <div>
            <h1>Meu perfil</h1>
            <p>Sua conta na Morada · {usuario.tipo_usuario}</p>
          </div>
          <button className="btn btn-ghost" onClick={sair}>
            <Icon.Arrow width={16} height={16} style={{ transform: "rotate(180deg)" }} /> Sair
          </button>
        </div>

        <div className="container perfil-card">
          <div className="perfil-avatar">
            <span>{iniciaisDoNome(usuario.nome)}</span>
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
            <small>Cadastrado em {formatarData(usuario.data_cadastro)}</small>
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