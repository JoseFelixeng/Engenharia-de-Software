/** Camada de chamada à API Morada.
 * Conecta ao backend FastAPI. Para apontar para outra URL, defina a variável
 * de ambiente VITE_API_BASE antes de rodar o build/dev (ex.: VITE_API_BASE=http://localhost:8000).
 */

const BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

async function _request(method, path, body, token) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE}${path}`, opts);
  if (!res.ok) {
    const erro = await res.json().catch(() => ({ detail: "Erro na requisição" }));
    throw erro;
  }
  if (res.status === 204) return null;
  return res.json();
}

// ---------------- Autenticação ----------------
export async function cadastro(dados) {
  return _request("POST", "/auth/cadastro", dados);
}

export async function login(email, senha) {
  return _request("POST", "/auth/login", { email, senha });
}

export async function me(token) {
  return _request("GET", "/usuario/me", null, token);
}

// ---------------- Imóveis ----------------
export async function listarImoveis(filtros = {}) {
  const params = new URLSearchParams();
  if (filtros.finalidade && filtros.finalidade !== "todos") params.set("finalidade", filtros.finalidade);
  if (filtros.cidade) params.set("cidade", filtros.cidade);
  if (filtros.tipo) params.set("tipo", filtros.tipo);
  if (filtros.quartos) params.set("quartos_min", filtros.quartos);
  if (filtros.preco_max) params.set("preco_max", filtros.preco_max);
  const qs = params.toString() ? `?${params.toString()}` : "";
  return _request("GET", `/imoveis${qs}`);
}

export async function criarImovel(dados, token) {
  return _request("POST", "/imoveis", dados, token);
}

export async function atualizarImovel(imovelId, dados, token) {
  return _request("PATCH", `/imoveis/${imovelId}`, dados, token);
}

export async function listarContatos(token) {
  return _request("GET", "/imoveis/contatos", null, token);
}

export async function loginGoogle(credential) {
  return _request("POST", "/auth/google", { credential });
}

// ---------------- Usuários (Admin) ----------------
export async function listarTodosUsuario(token) {
  return _request("GET", "/usuario", null, token);
}

export async function resetarSenhaUsuario(userId, token) {
  return _request("PATCH", `/usuario/${userId}/reset-senha`, null, token);
}

export async function alternarSituacaoUsuario(userId, situacao, token) {
  return _request(
    "PATCH",
    `/usuario/${userId}/situacao`,
    { situacao },
    token
  );
}