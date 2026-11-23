import { useState, useEffect } from "react";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { Icon } from "../components/Icons.jsx";
import { brl } from "../data/imoveis.js";
import { criarImovel, atualizarImovel, listarContatos, listarImoveis, enviarFoto, removerFoto } from "../services/mockApi.js";
import { lerToken, lerUsuario } from "../services/tokenStorage.js";
import { midiaUrl } from "../utils/midia.js";
import { useAuth } from "../services/auth.jsx";
import "../styles/components.css";
import "../styles/dashboard.css";

const NOVO_VAZIO = {
  titulo: "", tipo: "Casa", finalidade: "venda", preco: "",
  cidade: "", estado: "RN", bairro: "", area_m2: "",
  quartos: 0, banheiros: 0, vagas_garagem: 0, descricao: "", situacao: "disponivel",
};

const paraForm = (im) => ({
  titulo: im.titulo || "",
  tipo: im.tipo || "Casa",
  finalidade: im.finalidade || "venda",
  preco: im.preco ?? "",
  cidade: im.cidade || "",
  estado: im.estado || "RN",
  bairro: im.bairro || "",
  area_m2: im.area_m2 ?? "",
  quartos: im.quartos ?? 0,
  banheiros: im.banheiros ?? 0,
  vagas_garagem: im.vagas_garagem ?? 0,
  descricao: im.descricao || "",
  situacao: im.situacao || "disponivel",
});

export default function DashboardVendedor() {
  const { usuario } = useAuth();
  const [aba, setAba] = useState("anuncios"); // anuncios | interessados
  const [imoveis, setImoveis] = useState([]);
  const [contatos, setContatos] = useState([]);
  const [cargaImoveis, setCargaImoveis] = useState("idle");
  const [cargaContatos, setCargaContatos] = useState("idle");
  const [novo, setNovo] = useState(NOVO_VAZIO);
  const [erros, setErros] = useState({});
  const [status, setStatus] = useState("idle"); // idle | loading | fail
  const [abrirModal, setAbrirModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [foto, setFoto] = useState(null);
  const [fotoPreview, setFotoPreview] = useState("");

  const token = () => lerToken() || undefined;
  const meuId = () => usuario?.id ?? lerUsuario()?.id;

  async function carregarMeusImoveis() {
    setCargaImoveis("loading");
    try {
      const dados = await listarImoveis({ anunciante_id: meuId() });
      setImoveis((dados || []).filter((i) => i.situacao !== "inativo"));
      setCargaImoveis("ok");
    } catch {
      setImoveis([]);
      setCargaImoveis("fail");
    }
  }

  async function carregarContatos() {
    setCargaContatos("loading");
    try {
      const lista = await listarContatos(token());
      setContatos(lista || []);
      setCargaContatos("ok");
    } catch {
      setContatos([]);
      setCargaContatos("fail");
    }
  }

  useEffect(() => {
    carregarMeusImoveis();
    carregarContatos();
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

  const selecionarFoto = (ev) => {
    const arquivo = ev.target.files?.[0] || null;
    setFoto(arquivo);
    setFotoPreview((anterior) => {
      if (anterior) URL.revokeObjectURL(anterior);
      return arquivo ? URL.createObjectURL(arquivo) : "";
    });
  };

  const limparFoto = () => {
    setFoto(null);
    setFotoPreview((anterior) => {
      if (anterior) URL.revokeObjectURL(anterior);
      return "";
    });
  };

  const removerFotoAtual = async (fotoId) => {
    if (!editando) return;
    try {
      const atualizado = await removerFoto(editando.id, fotoId, token());
      setEditando(atualizado);
      setImoveis((prev) => prev.map((i) => (i.id === atualizado.id ? atualizado : i)));
    } catch {
      /* silencioso: mantém o estado atual */
    }
  };

  const payload = () => ({
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
  });

  const submit = async (ev) => {
    ev.preventDefault();
    const e = validar();
    setErros(e);
    if (Object.keys(e).length) return;
    setStatus("loading");
    try {
      let salvo = await criarImovel(payload(), token());
      if (foto) salvo = await enviarFoto(salvo.id, foto, token());
      setImoveis((prev) => [salvo, ...prev]);
      setAbrirModal(false);
      setNovo(NOVO_VAZIO);
      setEditando(null);
      limparFoto();
      setStatus("idle");
    } catch {
      setStatus("fail");
    }
  };

  const abrirNovo = () => {
    setNovo(NOVO_VAZIO);
    setEditando(null);
    setErros({});
    setStatus("idle");
    limparFoto();
    setAbrirModal(true);
  };

  const abrirEdicao = (imovel) => {
    setEditando({ ...imovel });
    setNovo(paraForm(imovel));
    setErros({});
    setStatus("idle");
    limparFoto();
    setAbrirModal(true);
  };

  const submitEdicao = async (ev) => {
    ev.preventDefault();
    if (!editando) return;
    const e = validar();
    setErros(e);
    if (Object.keys(e).length) return;
    setStatus("loading");
    try {
      let atualizado = await atualizarImovel(
        editando.id,
        { ...payload(), situacao: novo.situacao || "disponivel" },
        token(),
      );
      if (foto) atualizado = await enviarFoto(editando.id, foto, token());
      setImoveis((prev) => prev.map((i) => (i.id === atualizado.id ? atualizado : i)));
      setAbrirModal(false);
      setEditando(null);
      setNovo(NOVO_VAZIO);
      limparFoto();
      setStatus("idle");
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
              <button className="btn btn-accent" onClick={abrirNovo}>
                <Icon.Plus /> Adicionar Anúncio
              </button>
            </div>

            {cargaImoveis === "loading" && (
              <div className="container empty"><p>Carregando seus anúncios…</p></div>
            )}

            {cargaImoveis === "fail" && (
              <div className="container empty">
                <p>Não foi possível carregar seus anúncios.</p>
                <button className="btn btn-ghost" onClick={carregarMeusImoveis}>Tentar novamente</button>
              </div>
            )}

            {cargaImoveis === "ok" && imoveis.length > 0 && (
              <div className="container grid-cards">
                {imoveis.map((im) => (
                  <article key={im.id} className="pcard">
                    <div className="pcard-media">
                      {im.fotos?.[0]?.url ? (
                        <img className="pcard-img" src={midiaUrl(im.fotos[0].url)} alt={im.titulo} loading="lazy" />
                      ) : (
                        <div className="pcard-art" style={{ background: im.paleta?.[1] || "#17715a" }} />
                      )}
                      <span className={`badge ${im.finalidade === "venda" ? "badge-dark" : "badge-light"}`}>
                        {im.finalidade === "venda" ? "Venda" : "Aluguel"}
                      </span>
                      <span className={`badge badge-${im.situacao === "disponivel" ? "dark" : "light"}`}>
                        {im.situacao === "disponivel" ? "Disponível" : im.situacao}
                      </span>
                      <div className="pcard-price">{brl(im.preco)}</div>
                    </div>
                    <div className="pcard-body">
                      <h3>{im.titulo}</h3>
                      <p className="pcard-loc"><Icon.Pin width={15} height={15} /> {im.bairro}, {im.cidade} - {im.estado}</p>
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
            )}

            {cargaImoveis === "ok" && imoveis.length === 0 && (
              <div className="container empty">
                <p>Você ainda não tem imóveis anunciados.</p>
                <button className="btn btn-accent" onClick={abrirNovo}>
                  Cadastrar primeiro imóvel
                </button>
              </div>
            )}
          </>
        )}

        {/* ===== ABA: INTERESSADOS ===== ===== */}
        {aba === "interessados" && (
          <div className="container">
            <div className="dashboard-header" style={{ marginTop: 0 }}>
              <h2>Interessados</h2>
              <p>Pessoas que entraram em contato sobre seus imóveis.</p>
            </div>
            {cargaContatos === "loading" && (
              <div className="container empty"><p>Carregando interessados…</p></div>
            )}
            {cargaContatos === "fail" && (
              <div className="container empty">
                <p>Não foi possível carregar os interessados.</p>
                <button className="btn btn-ghost" onClick={carregarContatos}>Tentar novamente</button>
              </div>
            )}
            {cargaContatos === "ok" && contatos.length > 0 && (
              <div className="grid-cards interessados-grid">
                {contatos.map((c) => {
                  const nome = c.interessado_nome || "Interessado";
                  const iniciais = nome
                    .split(" ")
                    .filter(Boolean)
                    .map((p) => p[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase();
                  return (
                    <article key={c.id} className="icard">
                      <div className="icard-head">
                        <div className="icard-avatar">{iniciais}</div>
                        <div className="icard-info">
                          <h3>{nome}</h3>
                          <p>{c.interessado_email || "Sem e-mail informado"}</p>
                        </div>
                      </div>
                      <div className="icard-imovel">
                        <Icon.Home width={16} height={16} />
                        <span>{c.imovel_titulo || `Imóvel #${c.imovel_id}`}</span>
                      </div>
                      {c.mensagem && <p className="icard-msg">“{c.mensagem}”</p>}
                      <div className="icard-foot">
                        <span className="icard-data">
                          {c.data ? new Date(c.data).toLocaleDateString("pt-BR") : ""}
                        </span>
                        {c.interessado_email && (
                          <a
                            href={`mailto:${c.interessado_email}`}
                            className="btn btn-ghost btn-sm"
                          >
                            <Icon.Mail width={14} height={14} /> Contatar
                          </a>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
            {cargaContatos === "ok" && contatos.length === 0 && (
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

              {editando && editando.fotos?.length > 0 && (
                <div className="field">
                  <label>Fotos atuais</label>
                  <div className="fotos-atuais">
                    {editando.fotos.map((f) => (
                      <div key={f.id} className="foto-item">
                        <img src={midiaUrl(f.url)} alt="Foto do imóvel" loading="lazy" />
                        <button type="button" className="foto-remover" onClick={() => removerFotoAtual(f.id)}>
                          Remover
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="field">
                <label>Foto do imóvel (opcional)</label>
                <input type="file" accept="image/*" onChange={selecionarFoto} />
                {fotoPreview ? (
                  <img className="foto-preview" src={fotoPreview} alt="Prévia da foto" />
                ) : (
                  <span className="hint">
                    Sem foto, o imóvel será exibido com a imagem padrão.
                  </span>
                )}
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