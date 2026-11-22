import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout.jsx";
import Field from "../components/Field.jsx";
import { Icon } from "../components/Icons.jsx";
import { login } from "../services/mockApi.js";
import { gravarToken, useAuth } from "../services/auth.jsx";

const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

const destinoPorTipo = (tipo) => {
  if (tipo === "administrador") return "/admin";
  if (tipo === "proprietario" || tipo === "corretor") return "/vendedor";
  return "/comprador";
};

export default function Login() {
  const [form, setForm] = useState({ email: "", senha: "" });
  const [lembrar, setLembrar] = useState(true);
  const [erros, setErros] = useState({});
  const [status, setStatus] = useState("idle"); // idle | loading
  const [info, setInfo] = useState("");
  const navigate = useNavigate();
  const { setUser } = useAuth();

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

  const finalizarLogin = (resposta) => {
    gravarToken(resposta.access_token, lembrar);
    setUser(resposta.usuario);
    navigate(destinoPorTipo(resposta.usuario?.tipo_usuario));
  };

  const submit = async (ev) => {
    ev.preventDefault();
    setInfo("");
    const e = validar();
    setErros(e);
    if (Object.keys(e).length) return;
    setStatus("loading");
    try {
      const resposta = await login(form.email, form.senha);
      finalizarLogin(resposta);
    } catch (err) {
      setStatus("idle");
      const detalhe = err?.detail || err?.message;
      setErros({ _api: detalhe || "E-mail ou senha incorretos." });
    }
  };

  const entrarComGoogle = () => {
    setInfo("O login com Google ainda não está disponível neste ambiente.");
  };

  return (
    <AuthLayout
      titulo="Bem-vindo de volta à sua"
      destaque="próxima casa."
      texto="Entre para ver seus favoritos, acompanhar quedas de preço e continuar de onde parou."
      bullets={["Favoritos sincronizados", "Alertas quando o preço cair", "Contato direto com anunciantes"]}
    >
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

        {erros._api && <span className="err" role="alert">{erros._api}</span>}

        <div className="row-between">
          <label className="check">
            <input type="checkbox" checked={lembrar} onChange={(e) => setLembrar(e.target.checked)} />
            <span className="check-box"><Icon.Check width={13} height={13} strokeWidth={3} /></span>
            Lembrar de mim
          </label>
          <button type="button" className="link" onClick={() => setInfo("A recuperação de senha está em manutenção. Fale com o administrador.")}>
            Esqueci a senha
          </button>
        </div>

        {info && <span className="info-note" role="status">{info}</span>}

        <button className="btn btn-primary btn-block" disabled={status === "loading"}>
          {status === "loading" ? <><span className="spinner" /> Entrando…</> : <>Entrar <Icon.Arrow width={18} height={18} /></>}
        </button>
      </form>
    </AuthLayout>
  );
}