import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import Reveal from "../components/Reveal.jsx";
import PropertyCard from "../components/PropertyCard.jsx";
import PropertyArt from "../components/PropertyArt.jsx";
import { Icon } from "../components/Icons.jsx";
import { useCountUp } from "../components/hooks.js";
import { imoveis, brl } from "../data/imoveis.js";
import "../styles/components.css";
import "../styles/home.css";

const PALAVRAS = ["morar", "investir", "recomeçar", "crescer"];

function PalavraRotativa() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % PALAVRAS.length), 2400);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="rot" aria-live="polite">
      <span key={i} className="rot-word">{PALAVRAS[i]}</span>
    </span>
  );
}

function Stat({ to, suffix = "", label }) {
  const [ref, v] = useCountUp(to);
  return (
    <div ref={ref} className="stat">
      <strong>{v.toLocaleString("pt-BR")}{suffix}</strong>
      <span>{label}</span>
    </div>
  );
}

/* ---------- Demo: compatibilidade com preferências ---------- */
const CRITERIOS = [
  { k: "orcamento", label: "Orçamento", match: 88 },
  { k: "local", label: "Localização", match: 100 },
  { k: "quartos", label: "Quartos", match: 75 },
  { k: "vaga", label: "Vaga de garagem", match: 100 },
];

function Compatibilidade() {
  const [pesos, setPesos] = useState({ orcamento: 3, local: 4, quartos: 2, vaga: 1 });
  const total = Object.values(pesos).reduce((a, b) => a + b, 0);
  const score = total === 0 ? 0 : Math.round(CRITERIOS.reduce((s, c) => s + c.match * pesos[c.k], 0) / total);
  const R = 52, C = 2 * Math.PI * R;
  return (
    <div className="demo">
      <div className="ring" role="img" aria-label={`${score}% de compatibilidade`}>
        <svg viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={R} className="ring-bg" />
          <circle cx="60" cy="60" r={R} className="ring-fg" strokeDasharray={C} strokeDashoffset={C * (1 - score / 100)} />
        </svg>
        <div><strong>{score}%</strong><span>match</span></div>
      </div>
      <div className="sliders">
        {CRITERIOS.map((c) => (
          <label key={c.k}>
            <span>{c.label}<em>peso {pesos[c.k]}</em></span>
            <input type="range" min="0" max="5" value={pesos[c.k]} onChange={(e) => setPesos({ ...pesos, [c.k]: +e.target.value })} />
          </label>
        ))}
      </div>
    </div>
  );
}

/* ---------- Demo: histórico de preços ---------- */
function HistoricoPrecos() {
  const dados = imoveis[0].historico; // em mil R$
  const w = 300, h = 110, pad = 8;
  const min = Math.min(...dados), max = Math.max(...dados);
  const pts = dados.map((v, i) => [pad + (i * (w - pad * 2)) / (dados.length - 1), pad + (1 - (v - min) / (max - min)) * (h - pad * 2)]);
  const d = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const area = `${d} L${pts.at(-1)[0]},${h} L${pts[0][0]},${h}Z`;
  const queda = Math.round((1 - dados.at(-1) / dados[0]) * 100);
  return (
    <div className="demo">
      <div className="spark-head">
        <div><small>Casa moderna com piscina</small><strong>{brl(dados.at(-1) * 1000)}</strong></div>
        <span className="chip-down">▼ {queda}% em 6 meses</span>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="spark">
        <defs>
          <linearGradient id="sparkfill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--brand-2)" stopOpacity=".28" />
            <stop offset="1" stopColor="var(--brand-2)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#sparkfill)" className="spark-area" />
        <path d={d} className="spark-line" pathLength="1" />
        {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r={i === pts.length - 1 ? 5 : 3} className={i === pts.length - 1 ? "dot last" : "dot"} style={{ animationDelay: `${0.9 + i * 0.1}s` }} />)}
      </svg>
      <div className="spark-axis"><span>6 meses atrás</span><span>hoje</span></div>
    </div>
  );
}

/* ---------- Demo: comparador ---------- */
function ComparadorDemo() {
  const [a, b] = [imoveis[0], imoveis[4]];
  const linhas = [
    ["Preço", brl(a.preco), brl(b.preco), a.preco < b.preco ? 0 : 1],
    ["Área", `${a.area_m2} m²`, `${b.area_m2} m²`, a.area_m2 > b.area_m2 ? 0 : 1],
    ["Preço / m²", brl(a.preco / a.area_m2), brl(b.preco / b.area_m2), a.preco / a.area_m2 < b.preco / b.area_m2 ? 0 : 1],
    ["Quartos", a.quartos, b.quartos, a.quartos > b.quartos ? 0 : 1],
    ["Vagas", a.vagas_garagem, b.vagas_garagem, a.vagas_garagem > b.vagas_garagem ? 0 : 1],
  ];
  return (
    <div className="demo">
      <table className="cmp">
        <thead><tr><th></th><th>{a.bairro}</th><th>{b.bairro}</th></tr></thead>
        <tbody>
          {linhas.map(([l, x, y, win]) => (
            <tr key={l}>
              <th>{l}</th>
              <td className={win === 0 ? "win" : ""}>{x}</td>
              <td className={win === 1 ? "win" : ""}>{y}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="demo-note">O melhor valor de cada critério é destacado automaticamente.</p>
    </div>
  );
}

export default function Home() {
  const [modo, setModo] = useState("venda");
  const [cidade, setCidade] = useState("");
  const [tipo, setTipo] = useState("");
  const [quartos, setQuartos] = useState("");
  const [filtro, setFiltro] = useState("todos");
  const [comparar, setComparar] = useState([]);
  const heroRef = useRef(null);

  // Parallax dos cards flutuantes
  useEffect(() => {
    const el = heroRef.current;
    if (!el || window.matchMedia("(pointer: coarse)").matches) return;
    const move = (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
      el.style.setProperty("--my", ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
    };
    el.addEventListener("mousemove", move);
    return () => el.removeEventListener("mousemove", move);
  }, []);

  const lista = useMemo(() => {
    const q = cidade.trim().toLowerCase();
    return imoveis.filter((i) =>
      (filtro === "todos" || i.finalidade === filtro) &&
      (!tipo || i.tipo === tipo) &&
      (!quartos || i.quartos >= +quartos) &&
      (!q || `${i.cidade} ${i.bairro}`.toLowerCase().includes(q)),
    );
  }, [filtro, tipo, quartos, cidade]);

  const buscar = (e) => {
    e.preventDefault();
    setFiltro(modo);
    document.getElementById("imoveis")?.scrollIntoView({ behavior: "smooth" });
  };

  const toggleCompare = (id) =>
    setComparar((c) => (c.includes(id) ? c.filter((x) => x !== id) : c.length < 3 ? [...c, id] : c));

  return (
    <>
      <Navbar />

      {/* ===== HERO ===== */}
      <section className="hero" ref={heroRef}>
        <div className="hero-bg" aria-hidden="true">
          <span className="blob b1" /><span className="blob b2" /><span className="grid" />
        </div>
        <div className="container hero-inner">
          <div className="hero-copy">
            <span className="hero-pill"><i /> Novo · comparador e histórico de preços</span>
            <h1>
              O lugar certo para <PalavraRotativa /> está aqui.
            </h1>
            <p>
              Busque, compare e entenda o preço de cada imóvel antes de decidir.
              Compra, venda e aluguel em uma plataforma feita para quem quer clareza.
            </p>

            <form className="search" onSubmit={buscar}>
              <div className="search-tabs" role="tablist">
                {[["venda", "Comprar"], ["aluguel", "Alugar"]].map(([k, l]) => (
                  <button type="button" role="tab" aria-selected={modo === k} key={k} className={modo === k ? "on" : ""} onClick={() => setModo(k)}>{l}</button>
                ))}
                <span className="tab-ind" style={{ transform: `translateX(${modo === "venda" ? 0 : 100}%)` }} />
              </div>
              <div className="search-fields">
                <label className="field-loc">
                  <Icon.Pin />
                  <span><small>Onde</small><input value={cidade} onChange={(e) => setCidade(e.target.value)} placeholder="Cidade ou bairro" /></span>
                </label>
                <label>
                  <Icon.Search />
                  <span><small>Tipo</small>
                    <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
                      <option value="">Todos</option><option>Casa</option><option>Apartamento</option><option>Cobertura</option>
                    </select></span>
                </label>
                <label>
                  <Icon.Bed />
                  <span><small>Quartos</small>
                    <select value={quartos} onChange={(e) => setQuartos(e.target.value)}>
                      <option value="">Qualquer</option><option value="1">1+</option><option value="2">2+</option><option value="3">3+</option><option value="4">4+</option>
                    </select></span>
                </label>
                <button className="btn btn-accent search-go" type="submit"><Icon.Search /> Buscar</button>
              </div>
            </form>
          </div>

          <div className="hero-visual" aria-hidden="true">
            <div className="fl fl-1"><div className="fl-card big">
              <div className="fl-img"><PropertyArt tipo={imoveis[0].tipo} paleta={imoveis[0].paleta} /></div>
              <div className="fl-info"><strong>{brl(imoveis[0].preco)}</strong><span>Ponta Negra · 4 quartos</span></div>
            </div></div>
            <div className="fl fl-2"><div className="fl-card">
              <div className="fl-img"><PropertyArt tipo={imoveis[1].tipo} paleta={imoveis[1].paleta} /></div>
              <div className="fl-info"><strong>{brl(imoveis[1].preco)}<small>/mês</small></strong><span>Via Costeira</span></div>
            </div></div>
            <div className="fl fl-3"><div className="fl-toast"><span className="dot-ok"><Icon.Trend width={16} height={16} /></span><div><strong>Preço caiu 9%</strong><small>Casa em Ponta Negra</small></div></div></div>
            <div className="fl fl-4"><div className="fl-toast match"><b>92%</b><div><strong>Compatível</strong><small>com suas preferências</small></div></div></div>
          </div>
        </div>

        <div className="container stats">
          <Stat to={1280} suffix="+" label="imóveis anunciados" />
          <Stat to={340} label="anunciantes verificados" />
          <Stat to={96} suffix="%" label="buscas com resultado" />
          <Stat to={18} label="cidades atendidas" />
        </div>
      </section>

      {/* ===== IMÓVEIS ===== */}
      <section className="section" id="imoveis">
        <div className="container">
          <Reveal className="section-head">
            <div>
              <span className="eyebrow">Imóveis em destaque</span>
              <h2>Encontre o que combina com você</h2>
            </div>
            <div className="chips" role="group" aria-label="Filtrar por finalidade">
              {[["todos", "Todos"], ["venda", "Venda"], ["aluguel", "Aluguel"]].map(([k, l]) => (
                <button key={k} className={filtro === k ? "on" : ""} onClick={() => setFiltro(k)} aria-pressed={filtro === k}>{l}</button>
              ))}
            </div>
          </Reveal>

          {lista.length ? (
            <div className="grid-cards" key={`${filtro}${tipo}${quartos}${cidade}`}>
              {lista.map((im, i) => (
                <PropertyCard key={im.id} imovel={im} delay={i * 70} comparando={comparar.includes(im.id)} onToggleCompare={toggleCompare} />
              ))}
            </div>
          ) : (
            <div className="empty"><Icon.Search width={32} height={32} /><h3>Nenhum imóvel encontrado</h3><p>Tente remover algum filtro ou buscar por outro bairro.</p>
              <button className="btn btn-ghost" onClick={() => { setCidade(""); setTipo(""); setQuartos(""); setFiltro("todos"); }}>Limpar filtros</button></div>
          )}
        </div>
      </section>

      {/* ===== DIFERENCIAIS ===== */}
      <section className="section section-alt" id="diferenciais">
        <div className="container">
          <Reveal className="center">
            <span className="eyebrow">Diferenciais</span>
            <h2>Decida com dados, não com palpite</h2>
            <p className="lead">Três ferramentas que transformam uma lista de anúncios em uma decisão confiante.</p>
          </Reveal>

          <div className="features">
            <Reveal className="feature">
              <div className="feature-ico"><Icon.Target /></div>
              <h3>Compatibilidade com suas preferências</h3>
              <p>Defina o peso de cada critério e veja o percentual de match de cada imóvel. Tudo por regras, sem caixa-preta.</p>
              <Compatibilidade />
            </Reveal>
            <Reveal className="feature" delay={120}>
              <div className="feature-ico"><Icon.Trend /></div>
              <h3>Histórico de preços</h3>
              <p>Cada alteração de valor é registrada com data. Descubra se o imóvel está em queda antes de negociar.</p>
              <HistoricoPrecos />
            </Reveal>
            <Reveal className="feature" delay={240}>
              <div className="feature-ico"><Icon.Scale /></div>
              <h3>Comparador lado a lado</h3>
              <p>Selecione até três imóveis e compare preço, área, preço por m², quartos e vagas num só lugar.</p>
              <ComparadorDemo />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ===== COMO FUNCIONA ===== */}
      <section className="section" id="como-funciona">
        <div className="container">
          <Reveal className="center">
            <span className="eyebrow">Como funciona</span>
            <h2>Do primeiro clique à chave na mão</h2>
          </Reveal>
          <ol className="steps">
            {[
              [Icon.User, "Crie sua conta", "Escolha o perfil de interessado ou anunciante em menos de um minuto."],
              [Icon.Search, "Busque e filtre", "Cidade, bairro, faixa de preço, tipo e número de quartos."],
              [Icon.Heart, "Salve e compare", "Favorite seus preferidos e coloque-os lado a lado."],
              [Icon.Key, "Entre em contato", "Fale direto com o anunciante e feche negócio com segurança."],
            ].map(([I, t, d], i) => (
              <Reveal as="li" key={t} delay={i * 110} className="step">
                <span className="step-n">{i + 1}</span>
                <div className="step-ico"><I /></div>
                <h3>{t}</h3>
                <p>{d}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="container cta-wrap">
        <Reveal className="cta">
          <div className="cta-glow" aria-hidden="true" />
          <div>
            <h2>Tem um imóvel para vender ou alugar?</h2>
            <p>Anuncie com fotos, histórico de preços e contato direto com interessados.</p>
          </div>
          <div className="cta-actions">
            <Link to="/cadastro" className="btn btn-accent">Anunciar agora <Icon.Arrow width={18} height={18} /></Link>
            <Link to="/login" className="btn btn-light">Já tenho conta</Link>
          </div>
        </Reveal>
      </section>

      <Footer />

      {/* ===== Barra de comparação ===== */}
      <div className={`cmp-tray ${comparar.length ? "show" : ""}`} role="status">
        <Icon.Scale />
        <span><b>{comparar.length}</b> {comparar.length === 1 ? "imóvel selecionado" : "imóveis selecionados"}{comparar.length === 3 && " (máx.)"}</span>
        <button className="btn btn-accent" disabled={comparar.length < 2}>Comparar</button>
        <button className="cmp-clear" onClick={() => setComparar([])} aria-label="Limpar seleção"><Icon.Close width={18} height={18} /></button>
      </div>
    </>
  );
}
