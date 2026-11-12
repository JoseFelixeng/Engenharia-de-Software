import { Link } from "react-router-dom";
import { Icon, Logo } from "./Icons.jsx";
import PropertyArt from "./PropertyArt.jsx";
import { imoveis, brl } from "../data/imoveis.js";
import "../styles/auth.css";

/** Layout dividido: painel visual com imóveis à esquerda, formulário à direita. */
export default function AuthLayout({ titulo, destaque, texto, bullets, children }) {
  const [a, b, c] = [imoveis[0], imoveis[2], imoveis[3]];
  return (
    <main className="auth">
      <aside className="auth-visual" aria-hidden="false">
        <div className="auth-orb o1" aria-hidden="true" />
        <div className="auth-orb o2" aria-hidden="true" />
        <Link to="/" className="auth-logo" aria-label="Voltar para o início"><Logo light /></Link>

        <div className="auth-copy">
          <h2>{titulo} <em>{destaque}</em></h2>
          <p>{texto}</p>
          <ul>
            {bullets.map((t) => <li key={t}><span><Icon.Check width={14} height={14} strokeWidth={3} /></span>{t}</li>)}
          </ul>
        </div>

        <div className="auth-stack" aria-hidden="true">
          <div className="mini m1">
            <div className="mini-img"><PropertyArt tipo={a.tipo} paleta={a.paleta} /></div>
            <div><strong>{brl(a.preco)}</strong><small>{a.bairro} · {a.quartos} quartos</small></div>
          </div>
          <div className="mini m2">
            <div className="mini-img"><PropertyArt tipo={b.tipo} paleta={b.paleta} /></div>
            <div><strong>{brl(b.preco)}</strong><small>{b.bairro} · {b.quartos} quartos</small></div>
          </div>
          <div className="mini m3">
            <div className="mini-img"><PropertyArt tipo={c.tipo} paleta={c.paleta} /></div>
            <div><strong>{brl(c.preco)}<i>/mês</i></strong><small>{c.bairro} · studio</small></div>
          </div>
        </div>
      </aside>

      <section className="auth-form-wrap">
        <Link to="/" className="auth-back"><Icon.Arrow width={16} height={16} style={{ transform: "scaleX(-1)" }} /> Início</Link>
        <div className="auth-card">{children}</div>
      </section>
    </main>
  );
}
