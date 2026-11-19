import { useState, useEffect } from "react";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { Icon } from "../components/Icons.jsx";
import { brl } from "../data/imoveis.js";
import { criarImovel } from "../services/mockApi.js";
import "../styles/components.css";
import "../styles/dashboard.css";
export default function DashboardVendedor() {
  const [imoveis, setImoveis] = useState([]);
  const [novo, setNovo] = useState({
    titulo: "", tipo: "Casa", finalidade: "venda", preco: "",
    cidade: "", estado: "RN", bairro: "", area_m2: "",
    quartos: 0, banheiros: 0, vagas_garagem: 0, descricao: "",
  });
  const [erros, setErros] = useState({});
  const [status, setStatus] = useState("idle");
  const [abrirModal, setAbrirModal] = useState(false);

  async function listarMeusImoveis() {
    // Mock: retorna imóveis de exemplo do anunciante logado
    await new Promise((r) => setTimeout(r, 400));
    const { imoveis } = await import("../data/imoveis.js");
    return imoveis.filter((i) => i.finalidade === "venda" || i.finalidade === "aluguel");
  }

  async function carregar() {
    setStatus("loading");
    try {
      const lista = await listarMeusImoveis();
      setImoveis(lista);
      setStatus("ok");
    } catch {
      setStatus("fail");
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  const validar = () => {
    const e = {};
    if (!novo.titulo.trim()) e.titulo = "Informe o título.";
    if (!novo.preco || +novo.preco <= 0) e.preco = "Informe um preço válido.";
    if (!novo.cidade.trim()) e.cidade = "Informe a cidade.";
    if (!novo.bairro.trim()) e.bairro = "Informe o bairro.";
    if (!novo.area_m2 || +novo.area_m2 <= 0) e.area_m2 = "Informe a área.";
    return e;
  };

  const handleChange = (k) => (ev) => {
    setNovo({ ...novo, [k]: ev.target.value });
    if (erros[k]) setErros({ ...erros, [k]: undefined });
  };

  const submit = async (ev) => {
    ev.preventDefault();
    const e = validar();
    setErros(e);
    if (Object.keys(e).length) return;
    setStatus("loading");
    try {
      const criado = await criarImovel(novo, localStorage.getItem("morada_token") || undefined);
      setImoveis((prev) => [criado, ...prev]);
      setAbrirModal(false);
      setNovo({
        titulo: "", tipo: "Casa", finalidade: "venda", preco: "",
        cidade: "", estado: "RN", bairro: "", area_m2: "",
        quartos: 0, banheiros: 0, vagas_garagem: 0, descricao: "",
      });
      setStatus("ok");
    } catch {
      setStatus("fail");
    }
  };

  return (
    <>
      <Navbar />
      <main className="dashboard">
        <div className="container dashboard-header">
          <div>
            <h1>Meus anúncios</h1>
            <p>Gerencie seus imóveis para venda e aluguel.</p>
          </div>
          <button className="btn btn-accent" onClick={() => setAbrirModal(true)}>
            <Icon.Plus /> Novo anúncio
          </button>
        </div>

        {status === "ok" && imoveis.length > 0 ? (
          <div className="grid-cards">
            {imoveis.map((im) => (
              <article key={im.id} className="pcard">
                <div className="pcard-media">
                  <div className="pcard-art" style={{ background: im.paleta?.[1] || "#17715a" }} />
                  <span className={`badge ${im.finalidade === "venda" ? "badge-dark" : "badge-light"}`}>
                    {im.finalidade === "venda" ? "Venda" : "Aluguel"}
                  </span>
                </div>
                <div className="pcard-body">
                  <h3>{im.titulo}</h3>
                  <p className="pcard-loc"><Icon.Pin width={15} height={15} /> {im.bairro}, {im.cidade} - {im.estado}</p>
                  <div className="pcard-price">{brl(im.preco)}</div>
                  <ul className="pcard-specs">
                    <li><Icon.Bed width={17} height={17} /> {im.quartos}</li>
                    <li><Icon.Bath width={17} height={17} /> {im.banheiros}</li>
                    <li><Icon.Car width={17} height={17} /> {im.vagas_garagem}</li>
                    <li><Icon.Area width={17} height={17} /> {im.area_m2} m²</li>
                  </ul>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty">
            <p>Você ainda não tem imóveis anunciados.</p>
            <button className="btn btn-accent" onClick={() => setAbrirModal(true)}>
              Cadastrar primeiro imóvel
            </button>
          </div>
        )}
      </main>

      {abrirModal ? (
        <div className="modal-overlay" onClick={() => setAbrirModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setAbrirModal(false)}>Fechar</button>
            <h2>Novo anúncio</h2>
            <form onSubmit={submit} noValidate>
              <div className="field">
                <label>Título</label>
                <input value={novo.titulo} onChange={handleChange("titulo")} placeholder="Ex: Casa moderna com piscina" />
                {erros.titulo && <span className="err">{erros.titulo}</span>}
              </div>
              <div className="two">
                <div className="field">
                  <label>Tipo</label>
                  <select value={novo.tipo} onChange={handleChange("tipo")}>
                    <option>Casa</option><option>Apartamento</option><option>Cobertura</option><option>Studio</option>
                  </select>
                </div>
                <div className="field">
                  <label>Finalidade</label>
                  <select value={novo.finalidade} onChange={handleChange("finalidade")}>
                    <option value="venda">Venda</option><option value="aluguel">Aluguel</option>
                  </select>
                </div>
              </div>
              <div className="field">
                <label>Preço (R$)</label>
                <input type="number" value={novo.preco} onChange={handleChange("preco")} placeholder="Ex: 500000" />
                {erros.preco && <span className="err">{erros.preco}</span>}
              </div>
              <div className="two">
                <div className="field">
                  <label>Cidade</label>
                  <input value={novo.cidade} onChange={handleChange("cidade")} placeholder="Ex: Natal" />
                  {erros.cidade && <span className="err">{erros.cidade}</span>}
                </div>
                <div className="field">
                  <label>Estado (UF)</label>
                  <input value={novo.estado} onChange={handleChange("estado")} maxLength="2" placeholder="RN" />
                </div>
              </div>
              <div className="field">
                <label>Bairro</label>
                <input value={novo.bairro} onChange={handleChange("bairro")} placeholder="Ex: Ponta Negra" />
                {erros.bairro && <span className="err">{erros.bairro}</span>}
              </div>
              <div className="two">
                <div className="field">
                  <label>Área (m²)</label>
                  <input type="number" value={novo.area_m2} onChange={handleChange("area_m2")} />
                  {erros.area_m2 && <span className="err">{erros.area_m2}</span>}
                </div>
                <div className="field">
                  <label>Quartos</label>
                  <input type="number" value={novo.quartos} onChange={handleChange("quartos")} />
                </div>
              </div>
              <div className="two">
                <div className="field">
                  <label>Banheiros</label>
                  <input type="number" value={novo.banheiros} onChange={handleChange("banheiros")} />
                </div>
                <div className="field">
                  <label>Vagas garagem</label>
                  <input type="number" value={novo.vagas_garagem} onChange={handleChange("vagas_garagem")} />
                </div>
              </div>
              <div className="field">
                <label>Descrição</label>
                <textarea value={novo.descricao} onChange={handleChange("descricao")} rows={3} />
              </div>
              <button className="btn btn-primary btn-block" disabled={status === "loading"}>
                {status === "loading" ? "Criando..." : "Criar anúncio"}
              </button>
              {status === "fail" && <span className="err">Erro ao criar anúncio. Tente novamente.</span>}
            </form>
          </div>
        </div>
      ) : null}
      <Footer />
    </>
  );
}
