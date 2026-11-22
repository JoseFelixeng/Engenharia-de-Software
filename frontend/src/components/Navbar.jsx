import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Icon, Logo } from "./Icons.jsx";
import { useAuth } from "../services/auth.jsx";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const close = () => setOpen(false);
  const ehAnunciante =
    !!usuario && ["proprietario", "corretor", "administrador"].includes(usuario.tipo_usuario);
  const ehAdmin = usuario?.tipo_usuario === "administrador";

  const sair = () => {
    close();
    logout();
    navigate("/");
  };

  return (
    <header className={`nav ${scrolled ? "scrolled" : ""} ${open ? "open" : ""}`}>
      <div className="container nav-inner">
        <Link to="/" aria-label="Morada — início" onClick={close}><Logo /></Link>

        <nav className="nav-links" aria-label="Principal">
          <a href="/#imoveis" onClick={close}>Imóveis</a>
          <a href="/#como-funciona" onClick={close}>Como funciona</a>
          {ehAnunciante && (
            <NavLink to="/vendedor" onClick={close}>Anunciar</NavLink>
          )}
          {ehAdmin && (
            <NavLink to="/admin" onClick={close}>Administração</NavLink>
          )}
        </nav>

        <div className="nav-actions">
          {usuario ? (
            <>
              <Link to="/perfil" className="btn btn-ghost nav-user" onClick={close}>
                <span className="nav-avatar">{usuario.nome?.[0] || "•"}</span>
                <span className="nav-user-name">{usuario.nome?.split(" ")[0] || "Conta"}</span>
              </Link>
              <button type="button" className="btn btn-primary" onClick={sair}>Sair</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost" onClick={close}>Entrar</Link>
              <Link to="/cadastro" className="btn btn-primary" onClick={close}>Criar conta</Link>
            </>
          )}
        </div>

        <button className="nav-burger" onClick={() => setOpen((o) => !o)} aria-label="Abrir menu" aria-expanded={open}>
          {open ? <Icon.Close /> : <Icon.Menu />}
        </button>
      </div>
    </header>
  );
}