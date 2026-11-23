/** Resolve URLs de mídia (fotos enviadas) para a origem da API.
 *
 * O backend devolve caminhos relativos (ex.: "/media/abc.png"). Para exibir no
 * navegador, prefixamos com a URL base da API (VITE_API_BASE). URLs absolutas
 * (http/https) e data URLs são retornadas sem alteração.
 */

const BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

export function midiaUrl(url) {
  if (!url) return "";
  if (/^(https?:)?\/\//.test(url) || url.startsWith("data:")) return url;
  return `${BASE}${url.startsWith("/") ? "" : "/"}${url}`;
}