import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { listarTodosUsuario, alternarSituacaoUsuario, resetarSenhaUsuario } from "../services/mockApi.js";
import { lerToken } from "../services/tokenStorage.js";

const TIPOS = ["todos", "administrador", "proprietario", "corretor", "interessado"];
const SITUACOES = ["todos", "ativa", "inativa"];

export default function Admin() {
  const [usuarios, setUsuarios] = useState([]);
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [filtroSituacao, setFiltroSituacao] = useState("todos");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [acaoId, setAcaoId] = useState(null);

  const token = () => lerToken();

  async function carregar() {
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
    carregar();
  }, []);

  const lista = usuarios.filter((u) =>
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

        <div className="container admin-filtros">
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

        <div className="container admin-lista">
          {carregando && <div className="empty"><p>Carregando usuários…</p></div>}

          {!carregando && erro && (
            <div className="empty">
              <p>{erro}</p>
              <button className="btn btn-ghost" onClick={carregar}>Tentar novamente</button>
            </div>
          )}

          {!carregando && !erro && (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Usuário</th><th>E-mail</th><th>Tipo</th><th>Situação</th><th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {lista.map((u) => (
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
          )}

          {!carregando && !erro && lista.length === 0 && (
            <div className="empty">
              <p>Nenhum usuário encontrado com esses filtros.</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}