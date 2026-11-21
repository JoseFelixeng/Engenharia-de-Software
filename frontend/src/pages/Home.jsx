import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import "../styles/components.css";
import "../styles/home.css";

/* Troque por seu AuthContext quando tiver um. Aqui o login é lido do localStorage ("user"). */
function useAuth() {
  try {
    const raw = localStorage.getItem("user");
    return { user: raw ? JSON.parse(raw) : null };
  } catch {
    return { user: null };
  }
}

const CATEGORIES = ["Todos", "Apartamentos", "Casas", "Kitnets", "Comercial"];

const LISTINGS = [
  { id: 1, title: "Apartamento com vista para o mar", city: "Ponta Negra, Natal", price: 2800, beds: 3, baths: 2, area: 92, type: "Apartamentos", tone: "#BFD7F6" },
  { id: 2, title: "Casa com quintal e churrasqueira", city: "Capim Macio, Natal", price: 3500, beds: 4, baths: 3, area: 180, type: "Casas", tone: "#CDEBDD" },
  { id: 3, title: "Kitnet mobiliada perto da UFRN", city: "Lagoa Nova, Natal", price: 950, beds: 1, baths: 1, area: 28, type: "Kitnets", tone: "#F6E3BF" },
  { id: 4, title: "Sala comercial no centro", city: "Petrópolis, Natal", price: 2200, beds: 0, baths: 1, area: 45, type: "Comercial", tone: "#DAD3F2" },
  { id: 5, title: "Apartamento reformado, 2 vagas", city: "Tirol, Natal", price: 2100, beds: 2, baths: 2, area: 70, type: "Apartamentos", tone: "#F4D3D3" },
  { id: 6, title: "Casa térrea em condomínio", city: "Neópolis, Natal", price: 2900, beds: 3, baths: 2, area: 120, type: "Casas", tone: "#C9E7EE" },
];

const brl = (n) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

function HouseArt({ tone }) {
  return (
    <svg viewBox="0 0 200 120" className="hm-art" aria-hidden="true">
      <rect width="200" height="120" fill={tone} />
      <circle cx="160" cy="28" r="14" fill="#FFFFFF" opacity=".7" />
      <rect x="0" y="92" width="200" height="28" fill="#142B4A" opacity=".12" />
      <path d="M52 92V56l48-30 48 30v36z" fill="#FFFFFF" />
      <path d="M44 58l56-36 56 36" fill="none" stroke="#142B4A" strokeWidth="5" strokeLinejoin="round" strokeLinecap="round" />
      <rect x="90" y="66" width="20" height="26" rx="3" fill="#2563EB" />
      <rect x="64" y="64" width="16" height="14" rx="2" fill="#BFD7F6" />
      <rect x="120" y="64" width="16" height="14" rx="2" fill="#BFD7F6" />
    </svg>
  );
}

function LockedCard({ listing }) {
  return (
    <article className="hm-card hm-card--locked">
      <div className="hm-card__media hm-blur">
        <HouseArt tone={listing.tone} />
      </div>
      <div className="hm-card__body">
        <div className="hm-skel hm-skel--lg" />
        <div className="hm-skel" />
        <div className="hm-skel hm-skel--sm" />
      </div>
      <div className="hm-lock">
        <span className="hm-lock__icon" aria-hidden="true">🔒</span>
        <strong>Entre para ver este imóvel</strong>
        <Link to="/login" className="hm-btn hm-btn--primary hm-btn--sm">Entrar</Link>
      </div>
    </article>
  );
}

function ListingCard({ listing }) {
  const [fav, setFav] = useState(false);
  return (
    <article className="hm-card">
      <div className="hm-card__media">
        <HouseArt tone={listing.tone} />
        <span className="hm-tag">{listing.type}</span>
        <button
          type="button"
          className={`hm-fav ${fav ? "is-on" : ""}`}
          aria-pressed={fav}
          aria-label={fav ? "Remover dos favoritos" : "Salvar nos favoritos"}
          onClick={() => setFav(!fav)}
        >
          {fav ? "♥" : "♡"}
        </button>
      </div>
      <div className="hm-card__body">
        <h3 className="hm-card__title">{listing.title}</h3>
        <p className="hm-card__city">{listing.city}</p>
        <ul className="hm-specs">
          {listing.beds > 0 && <li>{listing.beds} quartos</li>}
          <li>{listing.baths} banheiros</li>
          <li>{listing.area} m²</li>
        </ul>
        <div className="hm-card__foot">
          <p className="hm-price">{brl(listing.price)}<span>/mês</span></p>
          <Link to={`/comprador?imovel=${listing.id}`} className="hm-btn hm-btn--soft hm-btn--sm">Ver detalhes</Link>
        </div>
      </div>
    </article>
  );
}

export default function Home() {
  const { user } = useAuth();
  const [category, setCategory] = useState("Todos");
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return LISTINGS.filter(
      (l) =>
        (category === "Todos" || l.type === category) &&
        (!q || l.title.toLowerCase().includes(q) || l.city.toLowerCase().includes(q))
    );
  }, [category, query]);

  const list = user ? visible : LISTINGS.slice(0, 3);

  return (
    <>
      <Navbar />
      <main className="hm">
        {/* HERO */}
        <section className="hm-hero">
          <div className="hm-hero__text">
            <h1>Encontre o lugar certo para morar. Anuncie o seu com segurança.</h1>
            <p>Uma vitrine de imóveis para alugar, com anúncios verificados. Crie sua conta gratuita para ver preços, fotos e falar com os anunciantes.</p>
            <div className="hm-actions">
              {user ? (
                <a href="#imoveis" className="hm-btn hm-btn--primary">Ver imóveis</a>
              ) : (
                <>
                  <Link to="/cadastro" className="hm-btn hm-btn--primary">Criar conta grátis</Link>
                  <Link to="/login" className="hm-btn hm-btn--ghost">Já tenho conta</Link>
                </>
              )}
              <Link to="/vendedor" className="hm-link">Quero anunciar meu imóvel</Link>
            </div>
          </div>

          <div className="hm-hero__visual" aria-hidden="true">
            <div className="hm-stack hm-stack--a"><HouseArt tone="#BFD7F6" /></div>
            <div className="hm-stack hm-stack--b"><HouseArt tone="#CDEBDD" /></div>
            <div className="hm-stack hm-stack--c"><HouseArt tone="#F6E3BF" /></div>
          </div>
        </section>

        {/* LOJA */}
        <section id="imoveis" className="hm-shop">
          <header className="hm-shop__head">
            <div>
              <h2>{user ? `Olá, ${user.nome || user.name || "bem-vindo"}! Veja os imóveis disponíveis` : "Imóveis em destaque"}</h2>
              <p>{user ? `${visible.length} imóveis encontrados` : "Entre na sua conta para ver os anúncios completos."}</p>
            </div>
            {user && (
              <input
                className="hm-search"
                type="search"
                placeholder="Buscar por bairro ou título"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Buscar imóveis"
              />
            )}
          </header>

          {user && (
            <div className="hm-chips" role="tablist" aria-label="Categorias">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  role="tab"
                  aria-selected={category === c}
                  className={`hm-chip ${category === c ? "is-active" : ""}`}
                  onClick={() => setCategory(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          )}

          <div className="hm-grid">
            {list.map((l) => (user ? <ListingCard key={l.id} listing={l} /> : <LockedCard key={l.id} listing={l} />))}
          </div>

          {user && visible.length === 0 && (
            <p className="hm-empty">Nenhum imóvel encontrado. Tente outra categoria ou outro bairro.</p>
          )}

          {!user && (
            <div className="hm-gate">
              <div>
                <h3>Cadastre-se para liberar todos os anúncios</h3>
                <p>É gratuito e leva menos de um minuto.</p>
              </div>
              <Link to="/cadastro" className="hm-btn hm-btn--green">Criar conta grátis</Link>
            </div>
          )}
        </section>

        {/* BENEFÍCIOS */}
        <section className="hm-benefits">
          {[
            { t: "Anuncie com facilidade", d: "Cadastre seu imóvel em poucos passos, sem burocracia.", i: "🏠" },
            { t: "Encontre interessados", d: "Seu anúncio chega a quem procura moradia na sua região.", i: "🔎" },
            { t: "Gerencie seus anúncios", d: "Edite, pause e acompanhe o interesse em um só lugar.", i: "📋" },
          ].map((b) => (
            <div key={b.t} className="hm-benefit">
              <span className="hm-benefit__icon" aria-hidden="true">{b.i}</span>
              <h3>{b.t}</h3>
              <p>{b.d}</p>
            </div>
          ))}
        </section>

        {/* CTA */}
        <section className="hm-cta">
          <h2>Pronto para anunciar seu imóvel?</h2>
          <p>Comece agora e dê mais visibilidade ao seu anúncio.</p>
          <Link to="/vendedor" className="hm-btn hm-btn--green">Começar meu anúncio</Link>
        </section>
      </main>
      <Footer />
    </>
  );
}