import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { listarTodosUsuario, alternarSituacaoUsuario } from "../services/mockApi.js";
import "../styles/components.css";
import "../styles/dashboard.css";

export default function Admin() {
  const [usuarios, setUsuarios] = useState([]);
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [filtroSituacao, setFiltroSituacao] = useState("todos");

  async function carregar() {
    const token = localStorage.getItem("morada_token");
    const data = await listarTodosUsuario(token);
    setUsuarios(data);
  }

  useEffect(() => {
    carregar();
  }, []);

  const lista = usuarios.filter((u) =>
    (filtroTipo === "todos" || u.tipo_usuario === filtroTipo) &&
    (filtroSituacao === "todos" || u.situacao === filtroSituacao)
  );

  const alternarSituacao = async (id) => {
    const token = localStorage.getItem("morada_token");
    const atualizado = await alternarSituacaoUsuario(id, token);
    setUsuarios((prev) => prev.map((u) => (u.id === id ? atualizado : u)));
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
            {["todos", "administrador", "proprietario", "corretor", "interessado"].map((t) => (
              <button key={t} className={filtroTipo === t ? "on" : ""} onClick={() => setFiltroTipo(t)}>
                {t === "todos" ? "Todos" : t}
              </button>
            ))}
          </div>
          <div className="filtros-chip">
            <span className="eyebrow">Situação</span>
            {["todos", "ativa", "inativa"].map((s) => (
              <button key={s} className={filtroSituacao === s ? "on" : ""} onClick={() => setFiltroSituacao(s)}>
                {s === "todos" ? "Todos" : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="container admin-lista">
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
                    <button className="btn btn-ghost btn-sm" onClick={() => alternarSituacao(u.id)}>
                      {u.situacao === "ativa" ? "Desativar" : "Ativar"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {lista.length === 0 && (
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
