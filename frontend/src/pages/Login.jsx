import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout.jsx";
import Field from "../components/Field.jsx";
import { Icon } from "../components/Icons.jsx";
import { login, loginGoogle } from "../services/mockApi.js";

const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export default function Login() {
  const [form, setForm] = useState({ email: "", senha: "" });
  const [lembrar, setLembrar] = useState(true);
  const [erros, setErros] = useState({});
  const [status, setStatus] = useState("idle"); // idle | loading | ok | fail
  const navigate = useNavigate();

  const set = (k) => (e) => {
    setForm({ ...form, [k]: e.target.value });
    if (erros[k]) setErros({ ...erros, [k]: undefined });
  };

  const validar = () => {
    const e = {};
    if (!emailOk(form.email)) e.email = "Digite um e-mail válido.";
    if (!form.senha) e.senha = "Digite sua senha.";
    return e;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    const e = validar();
    setErros(e);
    if (Object.keys(e).length) return;
    setStatus("loading");
    try {
      const resposta = await login(form.email, form.senha);
      localStorage.setItem("morada_token", resposta.access_token || "");
      localStorage.setItem("morada_usuario", JSON.stringify(resposta.usuario || {}));
      const tipo = resposta.usuario?.tipo_usuario;
      if (tipo === "administrador") navigate("/admin");
      else if (tipo === "proprietario" || tipo === "corretor") navigate("/vendedor");
      else navigate("/comprador");
    } catch {
      setStatus("fail");
      setErros({ _api: "E-mail ou senha incorretos." });
    }
  };

  const entrarComGoogle = async () => {
    setStatus("loading");
    try {
      // Em produção, use a biblioteca oficial do Google para obter o credential.
      // Aqui simulamos o fluxo: o frontend envia o credential para /auth/google.
      const credential = prompt("Cole o ID token do Google (credential):");
      if (!credential) {
        setStatus("idle");
        return;
      }
      const resposta = await loginGoogle(credential);
      localStorage.setItem("morada_token", resposta.access_token || "");
      localStorage.setItem("morada_usuario", JSON.stringify(resposta.usuario || {}));
      const tipo = resposta.usuario?.tipo_usuario;
      if (tipo === "administrador") navigate("/admin");
      else if (tipo === "proprietario" || tipo === "corretor") navigate("/vendedor");
      else navigate("/comprador");
    } catch {
      setStatus("fail");
      setErros({ _api: "Erro ao entrar com o Google. Tente novamente." });
    }
  };

  return (
    <AuthLayout
      titulo="Bem-vindo de volta à sua"
      destaque="próxima casa."
      texto="Entre para ver seus favoritos, acompanhar quedas de preço e continuar de onde parou."
      bullets={["Favoritos sincronizados", "Alertas quando o preço cair", "Contato direto com anunciantes"]}
    >
      {status === "ok" ? (
        <div className="success">
          <div className="success-ico"><Icon.Check width={34} height={34} strokeWidth={2.6} /></div>
          <h1>Login realizado!</h1>
          <p>Redirecionando para os seus imóveis…</p>
          <Link to="/" className="btn btn-primary">Ir para o início</Link>
        </div>
      ) : (
        <form onSubmit={submit} noValidate>
          <header className="auth-head">
            <span className="eyebrow">Entrar</span>
            <h1>Acesse sua conta</h1>
            <p>Novo por aqui? <Link to="/cadastro">Crie uma conta grátis</Link></p>
          </header>

          <button type="button" className="btn-social" onClick={entrarComGoogle}><Icon.Google /> Continuar com Google</button>
          <div className="divider"><span>ou entre com e-mail</span></div>

          <Field id="email" label="E-mail" icon={Icon.Mail} type="email" autoComplete="email" value={form.email} onChange={set("email")} error={erros.email} />
          <Field id="senha" label="Senha" icon={Icon.Lock} type="password" autoComplete="current-password" value={form.senha} onChange={set("senha")} error={erros.senha} />

          <div className="row-between">
            <label className="check">
              <input type="checkbox" checked={lembrar} onChange={(e) => setLembrar(e.target.checked)} />
              <span className="check-box"><Icon.Check width={13} height={13} strokeWidth={3} /></span>
              Lembrar de mim
            </label>
            <a href="#recuperar" className="link">Esqueci a senha</a>
          </div>

          <button className="btn btn-primary btn-block" disabled={status === "loading"}>
            {status === "loading" ? <><span className="spinner" /> Entrando…</> : <>Entrar <Icon.Arrow width={18} height={18} /></>}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}
