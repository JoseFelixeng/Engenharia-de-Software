import { useState, useEffect } from "react";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { Icon } from "../components/Icons.jsx";
import { brl } from "../data/imoveis.js";
import { criarImovel, atualizarImovel, listarContatos } from "../services/mockApi.js";
import "../styles/components.css";
import "../styles/dashboard.css";

export default function DashboardVendedor() {
  const [aba, setAba] = useState("anuncios"); // anuncios | interessados
  const [imoveis, setImoveis] = useState([]);
  const [contatos, setContatos] = useState([]);
  const [carga, setCarga] = useState("idle");
  const [novo, setNovo] = useState({
    titulo: "", tipo: "Casa", finalidade: "venda", preco: "",
    cidade: "", estado: "RN", bairro: "", area_m2: "",
    quartos: 0, banheiros: 0, vagas_garagem: 0, descricao: "",
  });
  const [erros, setErros] = useState({});
  const [status, setStatus] = useState("idle");
  const [abrirModal, setAbrirModal] = useState(false);
  const [editando, setEditando] = useState(null); // { imovel, modo: 'editar' }

  async function carregarMeusImoveis() {
    try {
      const token = localStorage.getItem("morada_token");
      const resp = await fetch(`${import.meta.env.VITE_API_BASE || "http://localhost:8000"}/imoveis`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resp.ok) {
        const dados = await resp.json();
        setImoveis(dados.filter((i) => i.situacao !== "inativo"));
      } else {
        throw new Error("sem backend");
      }
    } catch {
      const { imoveis } = await import("../data/imoveis.js");
      setImoveis(imoveis.filter((i) => i.finalidade === "venda" || i.finalidade === "aluguel"));
    }
  }

  async function carregarContatos() {
    setCarga("loading");
    try {
      const token = localStorage.getItem("morada_token");
      const lista = await listarContatos(token);
      setContatos(lista);
      setCarga("ok");
    } catch {
      setContatos([]);
      setCarga("fail");
    }
  }

  async function carregar() {
    await carregarMeusImoveis();
    await carregarContatos();
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
      const token = localStorage.getItem("morada_token") || undefined;
      const criado = await criarImovel(novo, token);
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

  const abrirEdicao = (imovel) => {
    setEditando({ ...imovel });
    setAbrirModal(true);
  };

  const submitEdicao = async (ev) => {
    ev.preventDefault();
    if (!editando) return;
    setStatus("loading");
    try {
      const token = localStorage.getItem("morada_token") || undefined;
      const atualizado = await atualizarImovel(editando.id, {
        titulo: novo.titulo,
        tipo: novo.tipo,
        finalidade: novo.finalidade,
        preco: +novo.preco,
        cidade: novo.cidade,
        estado: novo.estado,
        bairro: novo.bairro,
        area_m2: +novo.area_m2,
        quartos: +novo.quartos || 0,
        banheiros: +novo.banheiros || 0,
        vagas_garagem: +novo.vagas_garagem || 0,
        descricao: novo.descricao,
        situacao: novo.situacao || "disponivel",
      }, token);
      setImoveis((prev) => prev.map((i) => (i.id === atualizado.id ? atualizado : i)));
      setAbrirModal(false);
      setEditando(null);
      setNovo({
        titulo: "", tipo: "Casa", finalidade: "venda", preco: "",
        cidade: "", estado: "RN", bairro: "", area_m2: "",
        quartos: 0, banheiros: 0, vagas_garagem: 0, descricao: "",
        situacao: "disponivel",
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
            <h1>Meu Painel</h1>
            <p>Gerencie seus anúncios e acompanhe os interessados.</p>
          </div>
          <div className="dashboard-abas">
            <button
              className={`btn btn-ghost ${aba === "anuncios" ? "on" : ""}`}
              onClick={() => setAba("anuncios")}
            >
              <Icon.Scale width={16} height={16} /> Meus Anúncios
            </button>
            <button
              className={`btn btn-ghost ${aba === "interessados" ? "on" : ""}`}
              onClick={() => setAba("interessados")}
            >
              <Icon.User width={16} height={16} /> Interessados
            </button>
          </div>
        </div>

        {/* ===== ABA: ANÚNCIOS ===== */}
        {aba === "anuncios" && (
          <>
            <div className="container dashboard-header" style={{ marginTop: 0 }}>
              <button className="btn btn-accent" onClick={() => {
                setNovo({
                  titulo: "", tipo: "Casa", finalidade: "venda", preco: "",
                  cidade: "", estado: "RN", bairro: "", area_m2: "",
                  quartos: 0, banheiros: 0, vagas_garagem: 0, descricao: "",
                  situacao: "disponivel",
                });
                setEditando(null);
                setAbrirModal(true);
              }}>
                <Icon.Plus /> Adicionar Anúncio
              </button>
            </div>

            {carga === "ok" && imoveis.length > 0 ? (
              <div className="container grid-cards">
                {imoveis.map((im) => (
                  <article key={im.id} className="pcard">
                    <div className="pcard-media">
                      <div className="pcard-art" style={{ background: im.paleta?.[1] || "#17715a" }} />
                      <span className={`badge ${im.finalidade === "venda" ? "badge-dark" : "badge-light"}`}>
                        {im.finalidade === "venda" ? "Venda" : "Aluguel"}
                      </span>
                      <span className={`badge badge-${im.situacao === "disponivel" ? "dark" : "light"}`}>
                        {im.situacao === "disponivel" ? "Disponível" : im.situacao}
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
                      <div className="pcard-foot">
                        <button className="btn btn-ghost btn-sm" onClick={() => abrirEdicao(im)}>
                          <Icon.Arrow width={14} height={14} /> Editar
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="container empty">
                <p>Você ainda não tem imóveis anunciados.</p>
                <button className="btn btn-accent" onClick={() => {
                  setNovo({
                    titulo: "", tipo: "Casa", finalidade: "venda", preco: "",
                    cidade: "", estado: "RN", bairro: "", area_m2: "",
                    quartos: 0, banheiros: 0, vagas_garagem: 0, descricao: "",
                    situacao: "disponivel",
                  });
                  setEditando(null);
                  setAbrirModal(true);
                }}>
                  Cadastrar primeiro imóvel
                </button>
              </div>
            )}
          </>
        )}

        {/* ===== ABA: INTERESSADOS ===== */}
        {aba === "interessados" && (
          <div className="container">
            <div className="dashboard-header" style={{ marginTop: 0 }}>
              <h2>Interessados</h2>
              <p>Pessoas que entraram em contato sobre seus imóveis.</p>
            </div>
            {carga === "ok" && contatos.length > 0 ? (
              <div className="admin-lista">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Interessado</th><th>E-mail</th><th>Imóvel</th><th>Mensagem</th><th>Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contatos.map((c) => (
                      <tr key={c.id}>
                        <td>{c.interessado_nome || "Não informado"}</td>
                        <td>{c.interessado_email || "-"}</td>
                        <td>Imóvel #{c.imovel_id}</td>
                        <td>{c.mensagem || "Sem mensagem"}</td>
                        <td>{c.data ? new Date(c.data).toLocaleDateString("pt-BR") : "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="container empty">
                <p>Nenhum interessado entrou em contato ainda.</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ===== MODAL: CADASTRAR / EDITAR ===== */}
      {abrirModal ? (
        <div className="modal-overlay" onClick={() => setAbrirModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setAbrirModal(false)}>Fechar</button>
            <h2>{editando ? "Editar anúncio" : "Novo anúncio"}</h2>
            <form onSubmit={editando ? submitEdicao : submit} noValidate>
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
              {editando && (
                <div className="field">
                  <label>Situação</label>
                  <select value={novo.situacao || "disponivel"} onChange={handleChange("situacao")}>
                    <option value="disponivel">Disponível</option>
                    <option value="reservado">Reservado</option>
                    <option value="negociado">Negociado</option>
                    <option value="locado">Locado</option>
                    <option value="inativo">Inativo</option>
                  </select>
                </div>
              )}
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
                {status === "loading" ? "Salvando..." : editando ? "Salvar alterações" : "Criar anúncio"}
              </button>
              {status === "fail" && <span className="err">Erro ao salvar. Tente novamente.</span>}
            </form>
          </div>
        </div>
      ) : null}
      <Footer />
    </>
  );
}
