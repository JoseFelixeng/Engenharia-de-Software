/** Armazenamento de sessão por aba (sessionStorage).
 *
 * Cada aba do navegador possui seu próprio sessionStorage. Com isso:
 *  - vários usuários podem ficar logados ao mesmo tempo em abas diferentes;
 *  - ao fechar a aba, o token é descartado e é necessário logar novamente.
 *
 * O token NÃO é persistido em localStorage, portanto não sobrevive ao
 * fechamento da aba nem é compartilhado entre abas.
 */

const TOKEN_KEY = "morada_token";
const USER_KEY = "morada_usuario";

export function lerToken() {
  return sessionStorage.getItem(TOKEN_KEY) || "";
}

export function gravarToken(token) {
  // Remove resíduos de versões anteriores que usavam localStorage.
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  if (token) sessionStorage.setItem(TOKEN_KEY, token);
}

export function limparToken() {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
}

export function gravarUsuario(usuario) {
  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(USER_KEY);
  if (usuario) sessionStorage.setItem(USER_KEY, JSON.stringify(usuario));
}

export function lerUsuario() {
  const bruto = sessionStorage.getItem(USER_KEY);
  if (!bruto) return null;
  try {
    return JSON.parse(bruto);
  } catch {
    return null;
  }
}

export function limparSessao() {
  limparToken();
  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(USER_KEY);
}