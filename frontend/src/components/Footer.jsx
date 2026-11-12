import { Link } from "react-router-dom";
import { Logo } from "./Icons.jsx";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div>
          <Logo light />
          <p>Plataforma acadêmica de aluguel e venda de imóveis. Projeto de Engenharia de Software — UFRN.</p>
        </div>
        <div>
          <h4>Explorar</h4>
          <a href="/#imoveis">Imóveis</a>
          <a href="/#diferenciais">Diferenciais</a>
          <a href="/#como-funciona">Como funciona</a>
        </div>
        <div>
          <h4>Conta</h4>
          <Link to="/login">Entrar</Link>
          <Link to="/cadastro">Criar conta</Link>
          <Link to="/cadastro">Anunciar imóvel</Link>
        </div>
      </div>
      <div className="container footer-bottom">© 2026 Morada. Todos os direitos reservados.</div>
    </footer>
  );
}
