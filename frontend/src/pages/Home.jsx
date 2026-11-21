import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import "../styles/components.css";
import "../styles/home.css";

export default function Home() {
  return (
    <>
      <Navbar />
      <main style={{ background: "#F5F7FA" }}>
        <section style={{ background: "#EAF0F8", borderRadius: 24, margin: 24, padding: 48, display: "flex", alignItems: "center", gap: 32, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 280 }}>
            <h1 style={{ color: "#142B4A", fontSize: 40, margin: 0 }}>Seu imóvel merece ser encontrado pelas pessoas certas.</h1>
            <p style={{ color: "#718096", marginTop: 12 }}>Anuncie gratuitamente, alcance interessados e encontre pessoas para alugar seu imóvel com praticidade e segurança.</p>
            <div style={{ display: "flex", gap: 12, marginTop: 24, flexWrap: "wrap" }}>
              <Link to="/vendedor" className="btn btn-primary" style={{ background: "#2563EB" }}>Anunciar meu imóvel</Link>
              <Link to="/comprador" className="btn btn-ghost">Conhecer a plataforma</Link>
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 280, height: 260, background: "#FFFFFF", borderRadius: 16, border: "1px solid #E2E8F0" }} />
        </section>

        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, margin: 24 }}>
          {[
            { t: "Anuncie com facilidade", d: "Cadastre seu imóvel de maneira simples e intuitiva, sem burocracia." },
            { t: "Encontre interessados", d: "Conecte seu imóvel a pessoas que procuram uma nova moradia." },
            { t: "Gerencie seus anúncios", d: "Tenha controle sobre seus imóveis e acompanhe o interesse dos usuários." },
          ].map((c) => (
            <div key={c.t} style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 16, padding: 24 }}>
              <h3 style={{ color: "#142B4A", margin: 0 }}>{c.t}</h3>
              <p style={{ color: "#718096", marginTop: 8 }}>{c.d}</p>
            </div>
          ))}
        </section>

        <section style={{ background: "#2563EB", color: "#FFFFFF", borderRadius: 24, margin: 24, padding: 48, textAlign: "center" }}>
          <h2 style={{ margin: 0 }}>Está pronto para anunciar seu imóvel?</h2>
          <p style={{ marginTop: 8 }}>Comece agora e dê mais visibilidade ao seu imóvel.</p>
          <Link to="/vendedor" className="btn btn-primary" style={{ background: "#0F9F75", marginTop: 16, display: "inline-block" }}>Começar meu anúncio</Link>
        </section>
      </main>
      <Footer />
    </>
  );
}