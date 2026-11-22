import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import PropertyCard from "../components/PropertyCard.jsx";
import PropertyArt from "../components/PropertyArt.jsx";
import { Icon } from "../components/Icons.jsx";
import { brl, imoveis as DESTAQUES } from "../data/imoveis.js";
import { listarImoveis } from "../services/mockApi.js";
import { useAuth } from "../services/auth.jsx";
import "../styles/components.css";
import "../styles/home.css";

const CATEGORIAS = ["Todos", "Casa", "Apartamento", "Cobertura", "Studio"];

const BENEFICIOS = [
  { t: "Anuncie com facilidade", d: "Cadastre seu imóvel em poucos passos, sem burocracia.", ico: Icon.House },
  { t: "Encontre interessados", d: "Seu anúncio chega a quem procura moradia na sua região.", ico: Icon.Search },
  { t: "Gerencie seus anúncios", d: "Edite, pause e acompanhe o interesse em um só lugar.", ico: Icon.Scale },
];

const PASSOS = [
  { n: "01", t: "Crie sua conta", d: "Leva menos de um minuto e é gratuito para quem procura imóvel." },
  { n: "02", t: "Publique ou busque", d: "Anuncie seu imóvel ou encontre o ideal com filtros de preço e localização." },
  { n: "03", t: "Conecte-se", d: "Fale direto com anunciantes e interessados pela plataforma." },
];

export default function Home() {
  const { usuario } = useAuth();
  const [categoria, setCategoria] = useState("Todos");
  const [busca, setBusca] = useState("");
  const [imoveis, setImoveis] = useState([]);
  const [carga, setCarga] = useState("idle");

  useEffect(() => {
    let ativo = true;
    if (!usuario) {
      setImoveis([]);
      setCarga("idle");
      return () => { ativo = false; };
    }
    setCarga("loading");
    listarImoveis()
      .then((lista) => {
        if (ativo) {
          setImoveis(lista || []);
          setCarga("ok");
        }
      })
      .catch(() => {
        if (ativo) setCarga("fail");
      });
    return () => { ativo = false; };
  }, [usuario]);

  const visiveis = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return imoveis.filter((i) =>
      (categoria === "Todos" || i.tipo === categoria) &&
      (!q || `${i.titulo} ${i.cidade} ${i.bairro}`.toLowerCase().includes(q))
    );
  }, [imoveis, categoria, busca]);

  return (
    <>
      <Navbar />
      <main>
        {/* HERO */}
        <section className="hero">
          <div className="hero-bg" aria-hidden="true">
            <span className="blob b1" />
            <span className="blob b2" />
            <span className="grid" />
          </div>
          <div className="container hero-inner">
            <div className="hero-copy">
              <span className="hero-pill"><i /> {usuario ? `Bem-vindo, ${usuario.nome?.split(" ")[0] || "de volta"}` : "Anúncios verificados"}</span>
              <h1>Encontre o lugar certo para morar. Anuncie o seu com segurança.</h1>
              <p>Uma vitrine de imóveis para alugar e comprar. Crie sua conta gratuita para ver preços, fotos e falar com os anunciantes.</p>
              <div className="hm-actions" style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                {usuario ? (
                  <a href="#imoveis" className="btn btn-primary">Ver imóveis</a>
                ) : (
                  <>
                    <Link to="/cadastro" className="btn btn-primary">Criar conta grátis</Link>
                    <Link to="/login" className="btn btn-ghost">Já tenho conta</Link>
                  </>
                )}
                <Link to="/vendedor" className="btn btn-ghost">Quero anunciar</Link>
              </div>
            </div>

            <div className="hero-visual" aria-hidden="true">
              <div className="fl fl-1">
                <div className="fl-card big">
                  <div className="fl-img"><PropertyArt tipo="Casa" paleta={DESTAQUES[0].paleta} /></div>
                  <div className="fl-info"><strong>{brl(DESTAQUES[0].preco)}</strong><span>{DESTAQUES[0].bairro}</span></div>
                </div>
              </div>
              <div className="fl fl-2">
                <div className="fl-card">
                  <div className="fl-img"><PropertyArt tipo="Apartamento" paleta={DESTAQUES[1].paleta} /></div>
                  <div className="fl-info"><strong>{brl(DESTAQUES[1].preco)}<small>/mês</small></strong><span>{DESTAQUES[1].bairro}</span></div>
                </div>
              </div>
              <div className="fl fl-3">
                <div className="fl-toast"><span className="dot-ok"><Icon.Check width={18} height={18} /></span><span><strong>Perfil verificado</strong><small>Documentos conferidos</small></span></div>
              </div>
            </div>
          </div>
        </section>

        {/* CATÁLOGO / GATE */}
        <section id="imoveis" className="section">
          <div className="container">
            <div className="section-head">
              <div>
                <span className="eyebrow">Imóveis</span>
                <h2>{usuario ? "Veja os imóveis disponíveis" : "Imóveis em destaque"}</h2>
              </div>
              {usuario && (
                <input
                  className="hm-search"
                  type="search"
                  placeholder="Buscar por título, bairro ou cidade"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  aria-label="Buscar imóveis"
                />
              )}
            </div>

            {usuario ? (
              <>
                <div className="chips" style={{ marginBottom: 28 }}>
                  {CATEGORIAS.map((c) => (
                    <button key={c} className={categoria === c ? "on" : ""} onClick={() => setCategoria(c)}>
                      {c}
                    </button>
                  ))}
                </div>

                {carga === "loading" && <div className="empty"><p>Carregando imóveis…</p></div>}

                {carga === "fail" && (
                  <div className="empty"><p>Não foi possível carregar os imóveis agora.</p></div>
                )}

                {carga === "ok" && visiveis.length > 0 && (
                  <div className="grid-cards">
                    {visiveis.map((im, idx) => (
                      <PropertyCard key={im.id} imovel={im} delay={idx * 50} mostrarComparar={false} />
                    ))}
                  </div>
                )}

                {carga === "ok" && visiveis.length === 0 && (
                  <div className="empty"><p>Nenhum imóvel encontrado. Tente outra categoria ou termo.</p></div>
                )}
              </>
            ) : (
              <>
                <div className="grid-cards">
                  {DESTAQUES.slice(0, 3).map((im) => (
                    <article key={im.id} className="pcard">
                      <div className="pcard-media">
                        <PropertyArt tipo={im.tipo} paleta={im.paleta} />
                        <div className="pcard-badges">
                          <span className={`badge ${im.finalidade === "venda" ? "badge-dark" : "badge-light"}`}>
                            {im.finalidade === "venda" ? "Venda" : "Aluguel"}
                          </span>
                        </div>
                        <div className="pcard-price">{brl(im.preco)}</div>
                        <div className="pcard-lock">
                          <span className="pcard-lock__icon"><Icon.Lock width={20} height={20} /></span>
                          <strong>Entre para ver este imóvel</strong>
                          <Link to="/login" className="btn btn-primary btn-sm">Entrar</Link>
                        </div>
                      </div>
                      <div className="pcard-body">
                        <h3>{im.titulo}</h3>
                        <p className="pcard-loc"><Icon.Pin width={15} height={15} /> {im.bairro}, {im.cidade} - {im.estado}</p>
                      </div>
                    </article>
                  ))}
                </div>

                <div className="hm-gate" style={{ marginTop: 32 }}>
                  <div>
                    <h3>Cadastre-se para liberar todos os anúncios</h3>
                    <p>É gratuito e leva menos de um minuto.</p>
                  </div>
                  <Link to="/cadastro" className="btn btn-primary">Criar conta grátis</Link>
                </div>
              </>
            )}
          </div>
        </section>

        {/* BENEFÍCIOS */}
        <section className="section section-alt">
          <div className="container">
            <div className="center">
              <span className="eyebrow">Diferenciais</span>
              <h2>Uma plataforma pensada para conectar pessoas e imóveis</h2>
              <p className="lead">Simples para anunciar, fácil para encontrar e segura para negociar.</p>
            </div>
            <div className="features">
              {BENEFICIOS.map(({ t, d, ico: Ico }) => (
                <div key={t} className="feature">
                  <span className="feature-ico"><Ico width={22} height={22} /></span>
                  <h3>{t}</h3>
                  <p>{d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* COMO FUNCIONA */}
        <section id="como-funciona" className="section">
          <div className="container">
            <div className="center">
              <span className="eyebrow">Como funciona</span>
              <h2>Em três passos você já está dentro</h2>
            </div>
            <ol className="steps">
              {PASSOS.map((p) => (
                <li key={p.n} className="step">
                  <span className="step-n">{p.n}</span>
                  <h3>{p.t}</h3>
                  <p>{p.d}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* CTA */}
        <section className="cta-wrap">
          <div className="container">
            <div className="cta">
              <span className="cta-glow" aria-hidden="true" />
              <div>
                <h2>Pronto para anunciar seu imóvel?</h2>
                <p>Comece agora e dê mais visibilidade ao seu anúncio.</p>
              </div>
              <div className="cta-actions">
                <Link to="/cadastro" className="btn btn-light">Começar meu anúncio</Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}