import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { Icon } from "../components/Icons.jsx";
import {
  listarTodosUsuario,
  alternarSituacaoUsuario,
  resetarSenhaUsuario,
  editarUsuario,
  excluirUsuario,
} from "../services/mockApi.js";
import { listarImoveis, removerImovel, atualizarImovel } from "../services/mockApi.js";
import { lerToken } from "../services/tokenStorage.js";
import { brl } from "../data/imoveis.js";

const TIPOS = ["todos", "administrador", "proprietario", "corretor", "interessado"];
const SITUACOES = ["todos", "ativa", "inativa"];

const NOVO_USUARIO = { nome: "", email: "", telefone: "", tipo_usuario: "interessado", situacao: "ativa", senha: "" };
const NOVO_IMOVEL = {
  titulo: "", tipo: "Casa", finalidade: "venda", preco: "",
  cidade: "", estado: "RN", bairro: "", area_m2: "",
  quartos: 0, banheiros: 0, vagas_garagem: 0, descricao: "", situacao: "disponivel",
};

export default function Admin() {
  const [aba, setAba] = useState("usuarios"); // usuarios | editar-usuarios | editar-imoveis

  /* -------- Aba: Usuários (listagem existente) -------- */
  const [usuarios, setUsuarios] = useState([]);
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [filtroSituacao, setFiltroSituacao] = useState("todos");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [acaoId, setAcaoId] = useState(null);

  /* -------- Aba: Editar Usuários -------- */
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [usuarioForm, setUsuarioForm] = useState(NOVO_USUARIO);
  const [usuarioEditErros, setUsuarioEditErros] = useState({});
  const [usuarioEditStatus, setUsuarioEditStatus] = useState("idle");
  const [usuarioDelId, setUsuarioDelId] = useState(null);

  /* -------- Aba: Editar Imóveis -------- */
  const [imoveisLista, setImoveisLista] = useState([]);
  const [imoveisCarga, setImoveisCarga] = useState("idle");
  const [imovelEditando, setImovelEditando] = useState(null);
  const [imovelForm, setImovelForm] = useState(NOVO_IMOVEL);
  const [imovelEditErros, setImovelEditErros] = useState({});
  const [imovelEditStatus, setImovelEditStatus] = useState("idle");
  const [imovelDelId, setImovelDelId] = useState(null);

  const token = () => lerToken();

  /* -------- Usuários -------- */
  async function carregarUsuarios() {
    setCarregando(true);
    setErro("");
    try {
      const data = await listarTodosUsuario(token());
      setUsuarios(data || []);
    } catch (err) {
      setErro(err?.detail || "Não foi possível carregar os usuários.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const listaUsuarios = usuarios.filter((u) =>
    (filtroTipo === "todos" || u.tipo_usuario === filtroTipo) &&
    (filtroSituacao === "todos" || u.situacao === filtroSituacao)
  );

  const resetarSenha = async (id) => {
    setAcaoId(id);
    try {
      await resetarSenhaUsuario(id, token());
      alert("Senha resetada para 00000000");
    } catch (err) {
      alert(err?.detail || "Erro ao resetar a senha.");
    } finally {
      setAcaoId(null);
    }
  };

  const alternarSituacao = async (u) => {
    setAcaoId(u.id);
    const nova = u.situacao === "ativa" ? "inativa" : "ativa";
    try {
      const atualizado = await alternarSituacaoUsuario(u.id, nova, token());
      setUsuarios((prev) => prev.map((item) => (item.id === atualizado.id ? atualizado : item)));
    } catch (err) {
      alert(err?.detail || "Erro ao alterar a situação.");
    } finally {
      setAcaoId(null);
    }
  };

  /* -------- Editar Usuários -------- */
  const abrirEdicaoUsuario = (u) => {
    setUsuarioEditando(u);
    setUsuarioForm({
      nome: u.nome || "",
      email: u.email || "",
      telefone: u.telefone || "",
      tipo_usuario: u.tipo_usuario || "interessado",
      situacao: u.situacao || "ativa",
      senha: "",
    });
    setUsuarioEditErros({});
    setUsuarioEditStatus("idle");
  };

  const validarUsuario = () => {
    const e = {};
    if (!usuarioForm.nome.trim()) e.nome = "Informe o nome.";
    if (usuarioForm.nome.trim().split(/\s+/).length < 2) e.nome = "Informe nome e sobrenome.";
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(usuarioForm.email);
    if (!emailOk) e.email = "Digite um e-mail válido.";
    if (usuarioForm.senha && usuarioForm.senha.length < 8) e.senha = "Senha deve ter pelo menos 8 caracteres.";
    return e;
  };

  const handleUsuarioChange = (k) => (ev) => {
    setUsuarioForm({ ...usuarioForm, [k]: ev.target.value });
    if (usuarioEditErros[k]) setUsuarioEditErros({ ...usuarioEditErros, [k]: undefined });
  };

  const submitEdicaoUsuario = async (ev) => {
    ev.preventDefault();
    if (!usuarioEditando) return;
    const e = validarUsuario();
    setUsuarioEditErros(e);
    if (Object.keys(e).length) return;
    setUsuarioEditStatus("loading");
    try {
      const dados = { ...usuarioForm };
      if (!dados.senha) delete dados.senha;
      const atualizado = await editarUsuario(usuarioEditando.id, dados, token());
      setUsuarios((prev) => prev.map((u) => (u.id === atualizado.id ? atualizado : u)));
      fecharEdicaoUsuario();
      carregarUsuarios();
    } catch (err) {
      setUsuarioEditStatus("fail");
      setUsuarioEditErros({ _api: err?.detail || "Erro ao editar usuário." });
    }
  };

  const fecharEdicaoUsuario = () => {
    setUsuarioEditando(null);
    setUsuarioForm(NOVO_USUARIO);
    setUsuarioEditErros({});
    setUsuarioEditStatus("idle");
  };

  const confirmarExcluirUsuario = async (id) => {
    setUsuarioDelId(id);
    try {
      await excluirUsuario(id, token());
      setUsuarios((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      alert(err?.detail || "Erro ao excluir usuário.");
    } finally {
      setUsuarioDelId(null);
    }
  };

  /* -------- Editar Imóveis -------- */
  async function carregarImoveis() {
    setImoveisCarga("loading");
    try {
      const dados = await listarImoveis({});
      setImoveisLista(dados || []);
      setImoveisCarga("ok");
    } catch {
      setImoveisLista([]);
      setImoveisCarga("fail");
    }
  }

  useEffect(() => {
    if (aba === "editar-imoveis") {
      carregarImoveis();
    }
  }, [aba]);

  const abrirEdicaoImovel = (im) => {
    setImovelEditando(im);
    setImovelForm({
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
    setImovelEditErros({});
    setImovelEditStatus("idle");
  };

  const validarImovel = () => {
    const e = {};
    if (!imovelForm.titulo.trim()) e.titulo = "Informe o título.";
    if (!imovelForm.preco || +imovelForm.preco <= 0) e.preco = "Informe um preço válido.";
    if (!imovelForm.cidade.trim()) e.cidade = "Informe a cidade.";
    if (!imovelForm.bairro.trim()) e.bairro = "Informe o bairro.";
    if (!imovelForm.area_m2 || +imovelForm.area_m2 <= 0) e.area_m2 = "Informe a área.";
    return e;
  };

  const handleImovelChange = (k) => (ev) => {
    setImovelForm({ ...imovelForm, [k]: ev.target.value });
    if (imovelEditErros[k]) setImovelEditErros({ ...imovelEditErros, [k]: undefined });
  };

  const submitEdicaoImovel = async (ev) => {
    ev.preventDefault();
    if (!imovelEditando) return;
    const e = validarImovel();
    setImovelEditErros(e);
    if (Object.keys(e).length) return;
    setImovelEditStatus("loading");
    try {
      const atualizado = await atualizarImovel(
        imovelEditando.id,
        {
          titulo: imovelForm.titulo,
          tipo: imovelForm.tipo,
          finalidade: imovelForm.finalidade,
          preco: +imovelForm.preco,
          cidade: imovelForm.cidade,
          estado: imovelForm.estado,
          bairro: imovelForm.bairro,
          area_m2: +imovelForm.area_m2,
          quartos: +imovelForm.quartos || 0,
          banheiros: +imovelForm.banheiros || 0,
          vagas_garagem: +imovelForm.vagas_garagem || 0,
          descricao: imovelForm.descricao,
          situacao: imovelForm.situacao || "disponivel",
        },
        token(),
      );
      setImoveisLista((prev) => prev.map((i) => (i.id === atualizado.id ? atualizado : i)));
      fecharEdicaoImovel();
    } catch (err) {
      setImovelEditStatus("fail");
      setImovelEditErros({ _api: err?.detail || "Erro ao editar imóvel." });
    }
  };

  const fecharEdicaoImovel = () => {
    setImovelEditando(null);
    setImovelForm(NOVO_IMOVEL);
    setImovelEditErros({});
    setImovelEditStatus("idle");
  };

  const confirmarExcluirImovel = async (id) => {
    setImovelDelId(id);
    try {
      await removerImovel(id, token());
      setImoveisLista((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      alert(err?.detail || "Erro ao excluir imóvel.");
    } finally {
      setImovelDelId(null);
    }
  };

  return (
    <>
      <Navbar />
      <main className="dashboard">
        <div className="container dashboard-header">
          <div>
            <h1>Painel Administrativo</h1>
            <p>Gerencie usuários e a plataforma Morada.</p>
          </div>
          <Link to="/" className="btn btn-ghost">Voltar ao início</Link>
        </div>

        <div className="container admin-filtros" style={{ marginBottom: 24 }}>
          <div className="filtros-chip">
            <span className="eyebrow">Módulo</span>
            {[
              { v: "usuarios", t: "Usuários" },
              { v: "editar-usuarios", t: "Editar Usuários" },
              { v: "editar-imoveis", t: "Editar Imóveis" },
            ].map((m) => (
              <button key={m.v} className={aba === m.v ? "on" : ""} onClick={() => setAba(m.v)}>
                {m.t}
              </button>
            ))}
          </div>
        </div>

        {/* ===== ABA: USUÁRIOS ===== */}
        {aba === "usuarios" && (
          <>
            <div className="container admin-lista">
              {carregando && <div className="empty"><p>Carregando usuários…</p></div>}

              {!carregando && erro && (
                <div className="empty">
                  <p>{erro}</p>
                  <button className="btn btn-ghost" onClick={carregarUsuarios}>Tentar novamente</button>
                </div>
              )}

              {!carregando && !erro && (
                <>
                  <div className="admin-filtros" style={{ marginBottom: 24 }}>
                    <div className="filtros-chip">
                      <span className="eyebrow">Filtrar por tipo</span>
                      {TIPOS.map((t) => (
                        <button key={t} className={filtroTipo === t ? "on" : ""} onClick={() => setFiltroTipo(t)}>
                          {t === "todos" ? "Todos" : t}
                        </button>
                      ))}
                    </div>
                    <div className="filtros-chip">
                      <span className="eyebrow">Situação</span>
                      {SITUACOES.map((s) => (
                        <button key={s} className={filtroSituacao === s ? "on" : ""} onClick={() => setFiltroSituacao(s)}>
                          {s === "todos" ? "Todos" : s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Usuário</th><th>E-mail</th><th>Tipo</th><th>Situação</th><th>Ação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {listaUsuarios.map((u) => (
                        <tr key={u.id}>
                          <td>{u.nome}</td>
                          <td>{u.email}</td>
                          <td><span className={`tipo-badge ${u.tipo_usuario}`}>{u.tipo_usuario}</span></td>
                          <td>
                            <span className={`sit-badge ${u.situacao}`}>{u.situacao === "ativa" ? "Ativa" : "Inativa"}</span>
                          </td>
                          <td>
                            <button
                              className="btn btn-ghost btn-sm"
                              disabled={acaoId === u.id}
                              onClick={() => alternarSituacao(u)}
                            >
                              {u.situacao === "ativa" ? "Desativar" : "Ativar"}
                            </button>
                            <button
                              className="btn btn-ghost btn-sm"
                              disabled={acaoId === u.id}
                              onClick={() => resetarSenha(u.id)}
                            >
                              Resetar senha
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {!carregando && !erro && listaUsuarios.length === 0 && (
                    <div className="empty">
                      <p>Nenhum usuário encontrado com esses filtros.</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}

        {/* ===== ABA: EDITAR USUÁRIOS ===== */}
        {aba === "editar-usuarios" && (
          <>
            <div className="container dashboard-header" style={{ marginTop: 0 }}>
              <div>
                <h2>Editar Usuários</h2>
                <p>Edite dados ou exclua qualquer usuário da plataforma.</p>
              </div>
            </div>

            <div className="container admin-lista">
              {carregando && <div className="empty"><p>Carregando usuários…</p></div>}
              {!carregando && erro && (
                <div className="empty">
                  <p>{erro}</p>
                  <button className="btn btn-ghost" onClick={carregarUsuarios}>Tentar novamente</button>
                </div>
              )}
              {!carregando && !erro && listaUsuarios.length > 0 && (
                <div className="admin-usuarios-grid">
                  {listaUsuarios.map((u) => (
                    <article key={u.id} className="admin-usuario-card">
                      <div className="admin-usuario-info">
                        <div className="admin-usuario-avatar">{u.nome.split(" ").map((p) => p[0]).join("").toUpperCase()}</div>
                        <div>
                          <h3>{u.nome}</h3>
                          <p>{u.email}</p>
                          <span className={`tipo-badge ${u.tipo_usuario}`}>{u.tipo_usuario}</span>
                          <span className={`sit-badge ${u.situacao}`}>{u.situacao === "ativa" ? "Ativa" : "Inativa"}</span>
                        </div>
                      </div>
                      <div className="admin-usuario-actions">
                        <button
                          className="btn btn-ghost btn-sm"
                          disabled={usuarioDelId === u.id || usuarioEditStatus === "loading"}
                          onClick={() => abrirEdicaoUsuario(u)}
                        >
                          <Icon.Scale width={14} height={14} /> Editar
                        </button>
                        {u.tipo_usuario !== "administrador" && (
                          <button
                            className="btn btn-ghost btn-sm"
                            disabled={usuarioDelId === u.id}
                            className="btn btn-ghost btn-sm btn-danger"
                            onClick={() => confirmarExcluirUsuario(u.id)}
                          >
                            <Icon.Close width={14} height={14} /> Excluir
                          </button>
                        )}
                        <button
                          className="btn btn-ghost btn-sm"
                          disabled={usuarioDelId === u.id}
                          onClick={() => resetarSenha(u.id)}
                        >
                          Resetar senha
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
              {!carregando && !erro && listaUsuarios.length === 0 && (
                <div className="empty">
                  <p>Nenhum usuário encontrado.</p>
                </div>
              )}
            </div>

            {usuarioEditando && (
              <div className="modal-overlay" onClick={fecharEdicaoUsuario}>
                <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
                  <button className="modal-close" onClick={fecharEdicaoUsuario}>Fechar</button>
                  <h2>Editar: {usuarioEditando.nome}</h2>
                  <form onSubmit={submitEdicaoUsuario} noValidate>
                    <div className="field">
                      <label>Nome completo</label>
                      <input value={usuarioForm.nome} onChange={handleUsuarioChange("nome")} />
                      {usuarioEditErros.nome && <span className="err">{usuarioEditErros.nome}</span>}
                    </div>
                    <div className="field">
                      <label>E-mail</label>
                      <input value={usuarioForm.email} onChange={handleUsuarioChange("email")} />
                      {usuarioEditErros.email && <span className="err">{usuarioEditErros.email}</span>}
                    </div>
                    <div className="modal .two">
                      <div className="field">
                        <label>Telefone</label>
                        <input value={usuarioForm.telefone} onChange={handleUsuarioChange("telefone")} />
                      </div>
                      <div className="field">
                        <label>Tipo</label>
                        <select value={usuarioForm.tipo_usuario} onChange={handleUsuarioChange("tipo_usuario")}>
                          <option value="administrador">Administrador</option>
                          <option value="proprietario">Proprietário</option>
                          <option value="corretor">Corretor</option>
                          <option value="interessado">Interessado</option>
                        </select>
                      </div>
                    </div>
                    <div className="modal .two">
                      <div className="field">
                        <label>Situação</label>
                        <select value={usuarioForm.situacao} onChange={handleUsuarioChange("situacao")}>
                          <option value="ativa">Ativa</option>
                          <option value="inativa">Inativa</option>
                        </select>
                      </div>
                      <div className="field">
                        <label>Nova senha (opcional)</label>
                        <input type="password" value={usuarioForm.senha} onChange={handleUsuarioChange("senha")} />
                        {usuarioEditErros.senha && <span className="err">{usuarioEditErros.senha}</span>}
                      </div>
                    </div>
                    {usuarioEditErros._api && <span className="err" style={{ display: "block", marginBottom: 10 }}>{usuarioEditErros._api}</span>}
                    <div className="interesse-acoes" style={{ justifyContent: "flex-end" }}>
                      <button type="button" className="btn btn-ghost" onClick={fecharEdicaoUsuario} disabled={usuarioEditStatus === "loading"}>
                        Cancelar
                      </button>
                      <button type="submit" className="btn btn-primary" disabled={usuarioEditStatus === "loading"}>
                        {usuarioEditStatus === "loading" ? "Salvando…" : "Salvar alterações"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </>
        )}

        {/* ===== ABA: EDITAR IMÓVEIS ===== */}
        {aba === "editar-imoveis" && (
          <>
            <div className="container dashboard-header" style={{ marginTop: 0 }}>
              <div>
                <h2>Editar Imóveis</h2>
                <p>Edite ou exclua qualquer imóvel anunciado na plataforma.</p>
              </div>
            </div>

            {imoveisCarga === "loading" && <div className="container empty"><p>Carregando imóveis…</p></div>}
            {imoveisCarga === "fail" && (
              <div className="container empty">
                <p>Não foi possível carregar os imóveis.</p>
                <button className="btn btn-ghost" onClick={carregarImoveis}>Tentar novamente</button>
              </div>
            )}

            {imoveisCarga === "ok" && imoveisLista.length > 0 && (
              <div className="container grid-cards">
                {imoveisLista.map((im) => (
                  <article key={im.id} className="pcard">
                    <div className="pcard-media">
                      {im.fotos?.[0]?.url ? (
                        <img className="pcard-img" src={`http://localhost:8000${im.fotos[0].url}`} alt={im.titulo} loading="lazy" />
                      ) : (
                        <div className="pcard-art" style={{ background: "#17715a" }} />
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
                        <button
                          className="btn btn-ghost btn-sm"
                          disabled={imovelDelId === im.id || imovelEditStatus === "loading"}
                          onClick={() => abrirEdicaoImovel(im)}
                        >
                          <Icon.Arrow width={14} height={14} /> Editar
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          disabled={imovelDelId === im.id}
                          className="btn btn-ghost btn-sm btn-danger"
                          onClick={() => confirmarExcluirImovel(im.id)}
                        >
                          <Icon.Close width={14} height={14} /> Excluir
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {imoveisCarga === "ok" && imoveisLista.length === 0 && (
              <div className="container empty">
                <p>Nenhum imóvel cadastrado.</p>
              </div>
            )}

            {imovelEditando && (
              <div className="modal-overlay" onClick={fecharEdicaoImovel}>
                <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
                  <button className="modal-close" onClick={fecharEdicaoImovel}>Fechar</button>
                  <h2>Editar: {imovelEditando.titulo}</h2>
                  <form onSubmit={submitEdicaoImovel} noValidate>
                    <div className="field">
                      <label>Título</label>
                      <input value={imovelForm.titulo} onChange={handleImovelChange("titulo")} />
                      {imovelEditErros.titulo && <span className="err">{imovelEditErros.titulo}</span>}
                    </div>
                    <div className="modal .two">
                      <div className="field">
                        <label>Tipo</label>
                        <select value={imovelForm.tipo} onChange={handleImovelChange("tipo")}>
                          <option>Casa</option><option>Apartamento</option><option>Cobertura</option><option>Studio</option>
                        </select>
                      </div>
                      <div className="field">
                        <label>Finalidade</label>
                        <select value={imovelForm.finalidade} onChange={handleImovelChange("finalidade")}>
                          <option value="venda">Venda</option><option value="aluguel">Aluguel</option>
                        </select>
                      </div>
                    </div>
                    <div className="field">
                      <label>Situação</label>
                      <select value={imovelForm.situacao} onChange={handleImovelChange("situacao")}>
                        <option value="disponivel">Disponível</option>
                        <option value="reservado">Reservado</option>
                        <option value="negociado">Negociado</option>
                        <option value="locado">Locado</option>
                        <option value="inativo">Inativo</option>
                      </select>
                    </div>
                    <div className="field">
                      <label>Preço (R$)</label>
                      <input type="number" value={imovelForm.preco} onChange={handleImovelChange("preco")} />
                      {imovelEditErros.preco && <span className="err">{imovelEditErros.preco}</span>}
                    </div>
                    <div className="modal .two">
                      <div className="field">
                        <label>Cidade</label>
                        <input value={imovelForm.cidade} onChange={handleImovelChange("cidade")} />
                        {imovelEditErros.cidade && <span className="err">{imovelEditErros.cidade}</span>}
                      </div>
                      <div className="field">
                        <label>Estado (UF)</label>
                        <input value={imovelForm.estado} onChange={handleImovelChange("estado")} maxLength="2" />
                      </div>
                    </div>
                    <div className="field">
                      <label>Bairro</label>
                      <input value={imovelForm.bairro} onChange={handleImovelChange("bairro")} />
                      {imovelEditErros.bairro && <span className="err">{imovelEditErros.bairro}</span>}
                    </div>
                    <div className="modal .two">
                      <div className="field">
                        <label>Área (m²)</label>
                        <input type="number" value={imovelForm.area_m2} onChange={handleImovelChange("area_m2")} />
                        {imovelEditErros.area_m2 && <span className="err">{imovelEditErros.area_m2}</span>}
                      </div>
                      <div className="field">
                        <label>Quartos</label>
                        <input type="number" value={imovelForm.quartos} onChange={handleImovelChange("quartos")} />
                      </div>
                    </div>
                    <div className="modal .two">
                      <div className="field">
                        <label>Banheiros</label>
                        <input type="number" value={imovelForm.banheiros} onChange={handleImovelChange("banheiros")} />
                      </div>
                      <div className="field">
                        <label>Vagas garagem</label>
                        <input type="number" value={imovelForm.vagas_garagem} onChange={handleImovelChange("vagas_garagem")} />
                      </div>
                    </div>
                    <div className="field">
                      <label>Descrição</label>
                      <textarea value={imovelForm.descricao} onChange={handleImovelChange("descricao")} rows={3} />
                    </div>
                    {imovelEditErros._api && <span className="err" style={{ display: "block", marginBottom: 10 }}>{imovelEditErros._api}</span>}
                    <div className="interesse-acoes" style={{ justifyContent: "flex-end" }}>
                      <button type="button" className="btn btn-ghost" onClick={fecharEdicaoImovel} disabled={imovelEditStatus === "loading"}>
                        Cancelar
                      </button>
                      <button type="submit" className="btn btn-primary" disabled={imovelEditStatus === "loading"}>
                        {imovelEditStatus === "loading" ? "Salvando…" : "Salvar alterações"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </>
  );
}