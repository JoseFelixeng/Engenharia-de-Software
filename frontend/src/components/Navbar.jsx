import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Icon, Logo } from "./Icons.jsx";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const close = () => setOpen(false);

  return (
    <header className={`nav ${scrolled ? "scrolled" : ""} ${open ? "open" : ""}`}>
      <div className="container nav-inner">
        <Link to="/" aria-label="Morada — início" onClick={close}><Logo /></Link>

        <nav className="nav-links" aria-label="Principal">
          <a href="/#imoveis" onClick={close}>Imóveis</a>
          <a href="/#diferenciais" onClick={close}>Diferenciais</a>
          <a href="/#como-funciona" onClick={close}>Como funciona</a>
          <NavLink to="/cadastro" onClick={close}>Anunciar</NavLink>
        </nav>

        <div className="nav-actions">
          <Link to="/login" className="btn btn-ghost" onClick={close}>Entrar</Link>
          <Link to="/cadastro" className="btn btn-primary" onClick={close}>Criar conta</Link>
        </div>

        <button className="nav-burger" onClick={() => setOpen((o) => !o)} aria-label="Abrir menu" aria-expanded={open}>
          {open ? <Icon.Close /> : <Icon.Menu />}
        </button>
      </div>
    </header>
  );
}
