/**
 * Ilustração SVG do imóvel (placeholder até existirem fotos reais em FOTO_IMOVEL.URL_foto).
 * Gera cenas diferentes conforme o tipo e usa a paleta do imóvel.
 */
export default function PropertyArt({ tipo, paleta }) {
  const [sky1, sky2, wall] = paleta;
  const id = `g-${tipo}-${sky1.slice(1)}`;
  return (
    <svg viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice" className="art" role="img" aria-label={`Ilustração de ${tipo}`}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={sky1} />
          <stop offset="1" stopColor={sky2} />
        </linearGradient>
      </defs>
      <rect width="400" height="260" fill={`url(#${id})`} />
      <circle cx="320" cy="62" r="26" fill="#fff" opacity=".75" />
      <ellipse cx="90" cy="60" rx="38" ry="11" fill="#fff" opacity=".55" />
      <ellipse cx="125" cy="52" rx="26" ry="9" fill="#fff" opacity=".55" />
      {/* chão */}
      <rect y="206" width="400" height="54" fill="#14231f" opacity=".16" />
      <rect y="214" width="400" height="46" fill="#14231f" opacity=".12" />

      {tipo === "Casa" && (
        <g>
          <rect x="95" y="116" width="210" height="96" rx="4" fill={wall} />
          <path d="M80 120 200 56l120 64z" fill="#14231f" opacity=".9" />
          <rect x="122" y="140" width="40" height="34" rx="3" fill="#fff" opacity=".9" />
          <rect x="238" y="140" width="40" height="34" rx="3" fill="#fff" opacity=".9" />
          <rect x="182" y="156" width="36" height="56" rx="3" fill="#e2603a" />
          <circle cx="212" cy="186" r="2.5" fill="#fff" />
          <rect x="40" y="196" width="40" height="16" rx="8" fill="#6fcf97" opacity=".9" />
          <rect x="330" y="190" width="34" height="22" rx="8" fill="#6fcf97" opacity=".9" />
        </g>
      )}
      {(tipo === "Apartamento" || tipo === "Cobertura") && (
        <g>
          <rect x="120" y="44" width="160" height="168" rx="6" fill={wall} />
          {Array.from({ length: 4 }).map((_, r) =>
            Array.from({ length: 3 }).map((__, c) => (
              <rect key={`${r}-${c}`} x={140 + c * 44} y={62 + r * 36} width="28" height="22" rx="3" fill="#fff" opacity={(r + c) % 3 === 0 ? 0.95 : 0.6} />
            )),
          )}
          <rect x="186" y="176" width="28" height="36" rx="3" fill="#e2603a" />
          {tipo === "Cobertura" && <rect x="132" y="30" width="136" height="18" rx="4" fill="#14231f" opacity=".85" />}
          <rect x="60" y="150" width="46" height="62" rx="5" fill={wall} opacity=".55" />
          <rect x="296" y="130" width="50" height="82" rx="5" fill={wall} opacity=".45" />
        </g>
      )}
    </svg>
  );
}
