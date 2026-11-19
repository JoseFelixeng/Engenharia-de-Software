import { useMemo, useState } from "react";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import PropertyCard from "../components/PropertyCard.jsx";
import { Icon } from "../components/Icons.jsx";
import { listarImoveis } from "../services/mockApi.js";
import "../styles/components.css";
import "../styles/dashboard.css";

export default function BuscaComprador() {
  const [imoveis, setImoveis] = useState([]);
  const [carga, setCarga] = useState("idle");
  const [filtros, setFiltros] = useState({
    finalidade: "todos", cidade: "", tipo: "", quartos: "", preco_max: "",
  });

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    setCarga("loading");
    try {
      const lista = await listarImoveis(filtros);
      setImoveis(lista);
      setCarga("ok");
    } catch {
      setCarga("fail");
    }
  }

  const lista = useMemo(() => {
    const q = filtros.cidade.trim().toLowerCase();
    return imoveis.filter((i) =>
      (filtros.finalidade === "todos" || i.finalidade === filtros.finalidade) &&
      (!filtros.tipo || i.tipo === filtros.tipo) &&
      (!filtros.quartos || i.quartos >= +filtros.quartos) &&
      (!filtros.preco_max || i.preco <= +filtros.preco_max) &&
      (!q || `${i.cidade} ${i.bairro}`.toLowerCase().includes(q))
    );
  }, [imoveis, filtros]);

  return (
    <>
      <Navbar />
      <main className="dashboard">
        <div className="container dashboard-header">
          <div>
            <h1>Buscar imóveis</h1>
            <p>Encontre o imóvel ideal para comprar ou alugar.</p>
          </div>
        </div>

        <div className="container busca-filtros">
          <form onSubmit={(ev) => { ev.preventDefault(); carregar(); }} noValidate className="filtros-form">
            <div className="field">
              <label>Onde</label>
              <input value={filtros.cidade} onChange={(e) => setFiltros({ ...filtros, cidade: e.target.value })} placeholder="Cidade ou bairro" />
            </div>
            <div className="field">
              <label>Finalidade</label>
              <select value={filtros.finalidade} onChange={(e) => setFiltros({ ...filtros, finalidade: e.target.value })}>
                <option value="todos">Todos</option><option value="venda">Venda</option><option value="aluguel">Aluguel</option>
              </select>
            </div>
            <div className="field">
              <label>Tipo</label>
              <select value={filtros.tipo} onChange={(e) => setFiltros({ ...filtros, tipo: e.target.value })}>
                <option value="">Qualquer</option><option>Casa</option><option>Apartamento</option><option>Cobertura</option><option>Studio</option>
              </select>
            </div>
            <div className="field">
              <label>Quartos mín.</label>
              <select value={filtros.quartos} onChange={(e) => setFiltros({ ...filtros, quartos: e.target.value })}>
                <option value="">Qualquer</option><option value="1">1+</option><option value="2">2+</option><option value="3">3+</option><option value="4">4+</option>
              </select>
            </div>
            <div className="field">
              <label>Preço máx. (R$)</label>
              <input type="number" value={filtros.preco_max} onChange={(e) => setFiltros({ ...filtros, preco_max: e.target.value })} placeholder="Ex: 500000" />
            </div>
            <button className="btn btn-primary btn-block" disabled={carga === "loading"}>
              {carga === "loading" ? "Buscando…" : "Buscar"}
            </button>
          </form>
        </div>

        <div className="container resultado">
          <span className="eyebrow">Resultados</span>
          <h2>{lista.length} imóvel{lista.length !== 1 ? "s" : ""} encontrado{lista.length !== 1 ? "s" : ""}</h2>
        </div>

        {carga === "ok" && lista.length === 0 ? (
          <div className="container empty">
            <Icon.Search width={48} height={48} />
            <h3>Nenhum imóvel encontrado</h3>
            <p>Tente ajustar os filtros de busca.</p>
          </div>
        ) : (
          <div className="container grid-cards">
            {lista.map((im) => (
              <PropertyCard key={im.id} imovel={im} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}
