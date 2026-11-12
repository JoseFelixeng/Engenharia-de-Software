import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout.jsx";
import Field from "../components/Field.jsx";
import { Icon } from "../components/Icons.jsx";

const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

// (84) 99999-9999
const maskTel = (v) => {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
};

function forca(senha) {
  let s = 0;
  if (senha.length >= 8) s++;
  if (/[A-Z]/.test(senha) && /[a-z]/.test(senha)) s++;
  if (/\d/.test(senha)) s++;
  if (/[^A-Za-z0-9]/.test(senha) || senha.length >= 12) s++;
  return s; // 0..4
}
const NIVEIS = ["Muito fraca", "Fraca", "Razoável", "Boa", "Forte"];

const TIPOS = [
  { v: "interessado", titulo: "Quero encontrar", desc: "Buscar, favoritar e comparar imóveis", Ico: Icon.Search },
  { v: "anunciante", titulo: "Quero anunciar", desc: "Publicar imóveis para venda ou aluguel", Ico: Icon.Key },
];

export default function Cadastro() {
  const [tipo, setTipo] = useState("interessado");
  const [form, setForm] = useState({ nome: "", email: "", telefone: "", senha: "" });
  const [aceite, setAceite] = useState(false);
  const [erros, setErros] = useState({});
  const [status, setStatus] = useState("idle");
  const nivel = useMemo(() => forca(form.senha), [form.senha]);

  const set = (k, fn = (v) => v) => (e) => {
    setForm({ ...form, [k]: fn(e.target.value) });
    if (erros[k]) setErros({ ...erros, [k]: undefined });
  };

  const validar = () => {
    const e = {};
    if (form.nome.trim().split(/\s+/).length < 2) e.nome = "Informe nome e sobrenome.";
    if (!emailOk(form.email)) e.email = "Digite um e-mail válido.";
    if (form.telefone && form.telefone.replace(/\D/g, "").length < 10) e.telefone = "Telefone incompleto.";
    if (form.senha.length < 8) e.senha = "Use pelo menos 8 caracteres.";
    if (!aceite) e.aceite = "Você precisa aceitar os termos para continuar.";
    return e;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    const e = validar();
    setErros(e);
    if (Object.keys(e).length) return;
    setStatus("loading");
    // TODO: integrar com a API. Campos alinhados à tabela USUARIO do modelo ER:
    // { nome, email, telefone, tipo_usuario: tipo, senha } — o backend gera Senha_hash, Data_cadastro e Situacao.
    await new Promise((r) => setTimeout(r, 1400));
    setStatus("ok");
  };

  return (
    <AuthLayout
      titulo="Comece a encontrar o lugar"
      destaque="que combina com você."
      texto="Crie sua conta em menos de um minuto e desbloqueie favoritos, comparador e alertas de preço."
      bullets={["Gratuito para interessados", "Anúncios com fotos e histórico de preços", "Compatibilidade com suas preferências"]}
    >
      {status === "ok" ? (
        <div className="success">
          <div className="success-ico"><Icon.Check width={34} height={34} strokeWidth={2.6} /></div>
          <h1>Conta criada, {form.nome.split(" ")[0]}!</h1>
          <p>{tipo === "anunciante" ? "Você já pode cadastrar o seu primeiro imóvel." : "Agora é só explorar e salvar os seus favoritos."}</p>
          <Link to="/login" className="btn btn-primary">Entrar na minha conta</Link>
        </div>
      ) : (
        <form onSubmit={submit} noValidate>
          <header className="auth-head">
            <span className="eyebrow">Cadastro</span>
            <h1>Crie sua conta</h1>
            <p>Já tem conta? <Link to="/login">Entrar</Link></p>
          </header>

          <div className="tipo" role="radiogroup" aria-label="Como você vai usar a Morada?">
            <p className="tipo-title">Como você vai usar a Morada?</p>
            {TIPOS.map(({ v, titulo, desc, Ico }) => (
              <label key={v} className={tipo === v ? "on" : ""}>
                <input type="radio" name="tipo" value={v} checked={tipo === v} onChange={() => setTipo(v)} />
                <span className="tipo-ico"><Ico width={20} height={20} /></span>
                <span><strong>{titulo}</strong><small>{desc}</small></span>
                <i className="tipo-check"><Icon.Check width={12} height={12} strokeWidth={3.5} /></i>
              </label>
            ))}
          </div>

          <Field id="nome" label="Nome completo" icon={Icon.User} autoComplete="name" value={form.nome} onChange={set("nome")} error={erros.nome} />
          <div className="two">
            <Field id="email" label="E-mail" icon={Icon.Mail} type="email" autoComplete="email" value={form.email} onChange={set("email")} error={erros.email} />
            <Field id="telefone" label="Telefone (opcional)" icon={Icon.Phone} type="tel" inputMode="tel" autoComplete="tel" value={form.telefone} onChange={set("telefone", maskTel)} error={erros.telefone} />
          </div>
          <Field id="senha" label="Senha" icon={Icon.Lock} type="password" autoComplete="new-password" value={form.senha} onChange={set("senha")} error={erros.senha} />

          <div className={`meter ${form.senha ? "show" : ""}`} data-n={nivel} aria-live="polite">
            <div className="meter-bars">{[0, 1, 2, 3].map((i) => <span key={i} className={i < nivel ? "on" : ""} />)}</div>
            <small>Força da senha: <b>{NIVEIS[nivel]}</b></small>
          </div>

          <label className={`check terms ${erros.aceite ? "has-error" : ""}`}>
            <input type="checkbox" checked={aceite} onChange={(e) => { setAceite(e.target.checked); setErros({ ...erros, aceite: undefined }); }} />
            <span className="check-box"><Icon.Check width={13} height={13} strokeWidth={3} /></span>
            <span>Li e aceito os <a href="#termos" className="link">Termos de uso</a> e a <a href="#privacidade" className="link">Política de privacidade</a>.</span>
          </label>
          {erros.aceite && <p className="field-err show" role="alert">{erros.aceite}</p>}

          <button className="btn btn-primary btn-block" disabled={status === "loading"}>
            {status === "loading" ? <><span className="spinner" /> Criando conta…</> : <>Criar conta <Icon.Arrow width={18} height={18} /></>}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}
