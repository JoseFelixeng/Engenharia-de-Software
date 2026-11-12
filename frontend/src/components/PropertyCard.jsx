import { useState } from "react";
import { Icon } from "./Icons.jsx";
import PropertyArt from "./PropertyArt.jsx";
import { brl } from "../data/imoveis.js";

export default function PropertyCard({ imovel, comparando, onToggleCompare, delay = 0 }) {
  const [fav, setFav] = useState(false);
  const [pop, setPop] = useState(false);
  const caiu = imovel.preco_anterior && imovel.preco < imovel.preco_anterior;
  const queda = caiu ? Math.round((1 - imovel.preco / imovel.preco_anterior) * 100) : 0;

  const toggleFav = () => {
    setFav((f) => !f);
    setPop(true);
    setTimeout(() => setPop(false), 400);
  };

  return (
    <article className="pcard" style={{ animationDelay: `${delay}ms` }}>
      <div className="pcard-media">
        <PropertyArt tipo={imovel.tipo} paleta={imovel.paleta} />
        <div className="pcard-badges">
          <span className={`badge ${imovel.finalidade === "venda" ? "badge-dark" : "badge-light"}`}>
            {imovel.finalidade === "venda" ? "Venda" : "Aluguel"}
          </span>
          {caiu && <span className="badge badge-accent">▼ {queda}% de queda</span>}
        </div>
        <button
          className={`pcard-fav ${fav ? "on" : ""} ${pop ? "pop" : ""}`}
          onClick={toggleFav}
          aria-pressed={fav}
          aria-label={fav ? "Remover dos favoritos" : "Salvar nos favoritos"}
        >
          <Icon.Heart filled={fav} />
        </button>
        <div className="pcard-price">
          {brl(imovel.preco)}
          {imovel.finalidade === "aluguel" && <small>/mês</small>}
          {caiu && <s>{brl(imovel.preco_anterior)}</s>}
        </div>
      </div>

      <div className="pcard-body">
        <p className="pcard-loc"><Icon.Pin width={15} height={15} /> {imovel.bairro}, {imovel.cidade} - {imovel.estado}</p>
        <h3>{imovel.titulo}</h3>
        <ul className="pcard-specs">
          <li title="Quartos"><Icon.Bed width={17} height={17} />{imovel.quartos}</li>
          <li title="Banheiros"><Icon.Bath width={17} height={17} />{imovel.banheiros}</li>
          <li title="Vagas"><Icon.Car width={17} height={17} />{imovel.vagas_garagem}</li>
          <li title="Área"><Icon.Area width={17} height={17} />{imovel.area_m2} m²</li>
        </ul>
        <div className="pcard-foot">
          <label className={`compare ${comparando ? "on" : ""}`}>
            <input type="checkbox" checked={comparando} onChange={() => onToggleCompare(imovel.id)} />
            <span className="compare-box"><Icon.Check width={13} height={13} strokeWidth={3} /></span>
            Comparar
          </label>
          <a href="#detalhes" className="pcard-link">Ver detalhes <Icon.Arrow width={16} height={16} /></a>
        </div>
      </div>
    </article>
  );
}
