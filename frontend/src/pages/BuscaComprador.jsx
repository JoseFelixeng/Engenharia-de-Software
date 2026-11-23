import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import PropertyCard from "../components/PropertyCard.jsx";
import { Icon } from "../components/Icons.jsx";
import { brl } from "../data/imoveis.js";
import { demonstrarInteresse, listarImoveis, listarMeusInteresses } from "../services/mockApi.js";
import { lerToken } from "../services/tokenStorage.js";
import "../styles/components.css";
import "../styles/dashboard.css";

const FILTROS_INICIAIS = { finalidade: "todos", cidade: "", tipo: "", quartos: "", preco_max: "" };

export default function BuscaComprador() {
  const [aba, setAba] = useState("buscar"); // buscar | todos | interesses
  const [imoveis, setImoveis] = useState([]);
  const [carga, setCarga] = useState("idle"); // idle | loading | ok | fail
  const [filtros, setFiltros] = useState(FILTROS_INICIAIS);
  const [imoveisInteresse, setImoveisInteresse] = useState([]);
  const [cargaInteresse, setCargaInteresse] = useState("idle");
  const [comparacao, setComparacao] = useState([]);
  const [modalComparar, setModalComparar] = useState(false);
  const [interesse, setInteresse] = useState(null);
  const [mensagem, setMensagem] = useState("");
  const [statusInteresse, setStatusInteresse] = useState("idle");
  const [erroInteresse, setErroInteresse] = useState("");

  const tokenAtual = () => lerToken() || undefined;

  const carregar = async (filtrosAtuais = filtros) => {
    setCarga("loading");
    try {
      const lista = await listarImoveis(filtrosAtuais);
      setImoveis(lista || []);
      setCarga("ok");
    } catch {
      setCarga("fail");
    }
  };

  const carregarTodos = async () => {
    setCarga("loading");
    try {
      const lista = await listarImoveis({});
      setImoveis(lista || []);
      setCarga("ok");
    } catch {
      setCarga("fail");
    }
  };

  const carregarInteresses = async () => {
    setCargaInteresse("loading");
    try {
      const lista = await listarMeusInteresses(tokenAtual());
      setImoveisInteresse(lista || []);
      setCargaInteresse("ok");
    } catch {
      setCargaInteresse("fail");
    }
  };

  useEffect(() => {
    if (aba === "todos") {
      carregarTodos();
    }
  }, [aba]);

  useEffect(() => {
    if (aba === "interesses") {
      carregarInteresses();
    }
  }, [aba]);

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

  const listaTodos = useMemo(() => {
    const q = filtros.cidade.trim().toLowerCase();
    return imoveis.filter((i) =>
      (!filtros.tipo || i.tipo === filtros.tipo) &&
      (!filtros.quartos || i.quartos >= +filtros.quartos) &&
      (!filtros.preco_max || i.preco <= +filtros.preco_max) &&
      (!q || `${i.cidade} ${i.bairro}`.toLowerCase().includes(q))
    );
  }, [imoveis, filtros]);

  const listaInteresse = useMemo(() => imoveisInteresse, [imoveisInteresse]);

  const selecionados = useMemo(
    () => comparacao.map((id) => imoveis.find((i) => i.id === id)).filter(Boolean),
    [comparacao, imoveis],
  );

  const toggleComparar = (id) => {
    setComparacao((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const limparComparar = () => setComparacao([]);

  const abrirInteresse = (im) => {
    setInteresse(im);
    setMensagem("");
    setStatusInteresse("idle");
    setErroInteresse("");
  };

  const fecharInteresse = () => {
    if (statusInteresse === "loading") return;
    setInteresse(null);
    setStatusInteresse("idle");
    setErroInteresse("");
  };

  const confirmarInteresse = async (ev) => {
    ev.preventDefault();
    if (!interesse || statusInteresse === "loading") return;
    setStatusInteresse("loading");
    setErroInteresse("");
    try {
      await demonstrarInteresse(interesse.id, mensagem.trim() || null, tokenAtual());
      setStatusInteresse("ok");
    } catch (erro) {
      setStatusInteresse("fail");
      setErroInteresse(
        erro?.detail || erro?.message || "Não foi possível registrar seu interesse. Tente novamente.",
      );
    }
  };

  const renderCabecalhoAba = () => {
    if (aba === "buscar") {
      return (
        <>
          <div>
            <h1>Buscar imóveis</h1>
            <p>Encontre o imóvel ideal para comprar ou alugar.</p>
          </div>
        </>
      );
    }
    if (aba === "todos") {
      return (
        <>
          <div>
            <h1>Todos os imóveis</h1>
            <p>Catálogo completo de imóveis disponíveis.</p>
          </div>
        </>
      );
    }
    return (
      <>
        <div>
          <h1>Meus interesses</h1>
          <p>Imóveis nos quais você demonstrou interesse.</p>
        </div>
      </>
    );
  };

  const renderConteudoAba = () => {
    if (aba === "buscar") {
      return (
        <>
          <div className="container busca-filtros">
            <form onSubmit={(ev) => { ev.preventDefault(); carregar(filtros); }} noValidate className="filtros-form">
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

          {carga === "fail" && (
            <div className="container empty">
              <h3>Não foi possível carregar os imóveis</h3>
              <button className="btn btn-ghost" onClick={() => carregar(filtros)}>Tentar novamente</button>
            </div>
          )}

          {carga === "loading" && imoveis.length === 0 && (
            <div className="container empty"><p>Buscando imóveis…</p></div>
          )}

          {carga !== "fail" && lista.length === 0 && carga !== "loading" && (
            <div className="container empty">
              <Icon.Search width={48} height={48} />
              <h3>Nenhum imóvel encontrado</h3>
              <p>Tente ajustar os filtros de busca.</p>
            </div>
          )}

          {lista.length > 0 && (
            <div className="container grid-cards">
              {lista.map((im, idx) => (
                <PropertyCard
                  key={im.id}
                  imovel={im}
                  delay={idx * 60}
                  comparando={comparacao.includes(im.id)}
                  onToggleCompare={toggleComparar}
                  onInteresse={abrirInteresse}
                  mostrarComparar={true}
                />
              ))}
            </div>
          )}
        </>
      );
    }

    if (aba === "todos") {
      return (
        <>
          {carga === "fail" && (
            <div className="container empty">
              <h3>Não foi possível carregar os imóveis</h3>
              <button className="btn btn-ghost" onClick={carregarTodos}>Tentar novamente</button>
            </div>
          )}

          {carga === "loading" && imoveis.length === 0 && (
            <div className="container empty"><p>Carregando todos os imóveis…</p></div>
          )}

          {carga !== "fail" && listaTodos.length === 0 && carga !== "loading" && (
            <div className="container empty">
              <Icon.Search width={48} height={48} />
              <h3>Nenhum imóvel encontrado</h3>
              <p>Não há imóveis cadastrados no momento.</p>
            </div>
          )}

          {listaTodos.length > 0 && (
            <div className="container grid-cards">
              {listaTodos.map((im, idx) => (
                <PropertyCard
                  key={im.id}
                  imovel={im}
                  delay={idx * 60}
                  comparando={comparacao.includes(im.id)}
                  onToggleCompare={toggleComparar}
                  onInteresse={abrirInteresse}
                  mostrarComparar={true}
                />
              ))}
            </div>
          )}
        </>
      );
    }

    // aba === "interesses"
    return (
      <>
        {cargaInteresse === "fail" && (
          <div className="container empty">
            <h3>Não foi possível carregar seus interesses</h3>
            <button className="btn btn-ghost" onClick={carregarInteresses}>Tentar novamente</button>
          </div>
        )}

        {cargaInteresse === "loading" && imoveisInteresse.length === 0 && (
          <div className="container empty"><p>Carregando seus interesses…</p></div>
        )}

        {cargaInteresse !== "fail" && listaInteresse.length === 0 && cargaInteresse !== "loading" && (
          <div className="container empty">
            <Icon.Heart width={48} height={48} />
            <h3>Você ainda não demonstrou interesse em nenhum imóvel.</h3>
            <p>Busque imóveis e clique em "Tenho interesse" para salvar aqui.</p>
          </div>
        )}

        {listaInteresse.length > 0 && (
          <div className="container grid-cards">
            {listaInteresse.map((im, idx) => (
              <PropertyCard
                key={im.imovel_id}
                imovel={{
                  id: im.imovel_id,
                  titulo: im.imovel_titulo,
                  tipo: im.imovel_tipo,
                  finalidade: im.imovel_finalidade,
                  preco: im.imovel_preco,
                  cidade: im.imovel_cidade,
                  estado: im.imovel_estado,
                  bairro: im.imovel_bairro,
                  situacao: im.imovel_situacao,
                  quartos: 0,
                  banheiros: 0,
                  vagas_garagem: 0,
                  area_m2: 0,
                }}
                delay={idx * 60}
                mostrarComparar={false}
              />
            ))}
          </div>
        )}
      </>
    );
  };

  return (
    <>
      <Navbar />
      <main className="dashboard">
        <div className="container dashboard-header">
          {renderCabecalhoAba()}
          <div className="dashboard-abas">
            <button
              className={`btn btn-ghost ${aba === "buscar" ? "on" : ""}`}
              onClick={() => setAba("buscar")}
            >
              <Icon.Search width={16} height={16} /> Buscar
            </button>
            <button
              className={`btn btn-ghost ${aba === "todos" ? "on" : ""}`}
              onClick={() => setAba("todos")}
            >
              <Icon.House width={16} height={16} /> Mostrar Todos
            </button>
            <button
              className={`btn btn-ghost ${aba === "interesses" ? "on" : ""}`}
              onClick={() => setAba("interesses")}
            >
              <Icon.Heart width={16} height={16} /> Meus Interesses
            </button>
          </div>
        </div>

        {renderConteudoAba()}
      </main>

      {comparacao.length > 0 && (
        <div className="cmp-tray show">
          <span><b>{comparacao.length}</b> selecionado{comparacao.length !== 1 ? "s" : ""}</span>
          <button className="cmp-clear" onClick={limparComparar} aria-label="Limpar seleção">
            <Icon.Close width={16} height={16} />
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setModalComparar(true)}>Comparar</button>
        </div>
      )}

      {modalComparar && (
        <div className="modal-overlay" onClick={() => setModalComparar(false)}>
          <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setModalComparar(false)}>Fechar</button>
            <h2>Comparar imóveis</h2>
            <div className="cmp-wrap">
              <table className="cmp">
                <thead>
                  <tr>
                    <th>Critério</th>
                    {selecionados.map((im) => <th key={im.id}>{im.titulo}</th>)}
                  </tr>
                </thead>
                <tbody>
                  <tr><td>Preço</td>{selecionados.map((im) => <td key={im.id}>{brl(im.preco)}{im.finalidade === "aluguel" ? "/mês" : ""}</td>)}</tr>
                  <tr><td>Quartos</td>{selecionados.map((im) => <td key={im.id}>{im.quartos}</td>)}</tr>
                  <tr><td>Banheiros</td>{selecionados.map((im) => <td key={im.id}>{im.banheiros}</td>)}</tr>
                  <tr><td>Vagas</td>{selecionados.map((im) => <td key={im.id}>{im.vagas_garagem}</td>)}</tr>
                  <tr><td>Área</td>{selecionados.map((im) => <td key={im.id}>{im.area_m2} m²</td>)}</tr>
                  <tr><td>Localização</td>{selecionados.map((im) => <td key={im.id}>{im.bairro}, {im.cidade}</td>)}</tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {interesse && (
        <div className="modal-overlay" onClick={fecharInteresse}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={fecharInteresse} aria-label="Fechar">
              Fechar
            </button>

            {statusInteresse === "ok" ? (
              <div className="interesse-ok">
                <div className="interesse-ok-ico"><Icon.Check width={30} height={30} /></div>
                <h2>Interesse registrado!</h2>
                <p>
                  O anunciante de <b>{interesse.titulo}</b> verá seu interesse no painel dele.
                </p>
                <button className="btn btn-primary btn-block" onClick={fecharInteresse}>Concluir</button>
              </div>
            ) : (
              <>
                <h2>Tenho interesse</h2>
                <p className="interesse-sub">
                  {interesse.titulo} · {interesse.bairro}, {interesse.cidade}
                </p>
                <form onSubmit={confirmarInteresse} noValidate>
                  <div className="field">
                    <label>Mensagem (opcional)</label>
                    <textarea
                      value={mensagem}
                      onChange={(e) => setMensagem(e.target.value)}
                      rows={3}
                      maxLength={500}
                      placeholder="Ex: Gostaria de agendar uma visita ao imóvel."
                    />
                    <span className="interesse-contador">{mensagem.length}/500</span>
                  </div>
                  {erroInteresse && <span className="err">{erroInteresse}</span>}
                  <div className="interesse-acoes">
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={fecharInteresse}
                      disabled={statusInteresse === "loading"}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={statusInteresse === "loading"}
                    >
                      {statusInteresse === "loading" ? "Enviando…" : "Confirmar interesse"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}