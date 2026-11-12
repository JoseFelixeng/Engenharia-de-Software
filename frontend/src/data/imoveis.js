// Dados de exemplo alinhados ao modelo ER (IMOVEL, TIPO_IMOVEL, HISTORICO_PRECO).
// Quando o backend existir, troque este arquivo por uma chamada à API.
export const imoveis = [
  {
    id: 1, titulo: "Casa moderna com piscina", tipo: "Casa", finalidade: "venda",
    cidade: "Natal", estado: "RN", bairro: "Ponta Negra",
    preco: 1250000, preco_anterior: 1380000,
    quartos: 4, banheiros: 3, vagas_garagem: 3, area_m2: 280,
    paleta: ["#ffd9b8", "#f6a97a", "#0f4c3a"], historico: [1450, 1420, 1380, 1380, 1310, 1250],
  },
  {
    id: 2, titulo: "Apartamento vista mar", tipo: "Apartamento", finalidade: "aluguel",
    cidade: "Natal", estado: "RN", bairro: "Via Costeira",
    preco: 4200, preco_anterior: null,
    quartos: 2, banheiros: 2, vagas_garagem: 1, area_m2: 82,
    paleta: ["#cfe8f7", "#8cc3e6", "#17715a"], historico: [4200, 4200, 4200, 4200, 4200, 4200],
  },
  {
    id: 3, titulo: "Cobertura duplex com terraço", tipo: "Cobertura", finalidade: "venda",
    cidade: "Natal", estado: "RN", bairro: "Capim Macio",
    preco: 1890000, preco_anterior: 1990000,
    quartos: 3, banheiros: 4, vagas_garagem: 3, area_m2: 210,
    paleta: ["#e9dcff", "#b69df0", "#14231f"], historico: [2050, 2050, 1990, 1990, 1940, 1890],
  },
  {
    id: 4, titulo: "Studio perto da universidade", tipo: "Apartamento", finalidade: "aluguel",
    cidade: "Natal", estado: "RN", bairro: "Lagoa Nova",
    preco: 1650, preco_anterior: 1800,
    quartos: 1, banheiros: 1, vagas_garagem: 0, area_m2: 34,
    paleta: ["#fff0c2", "#f7cf6a", "#0f4c3a"], historico: [1900, 1850, 1800, 1800, 1700, 1650],
  },
  {
    id: 5, titulo: "Casa em condomínio fechado", tipo: "Casa", finalidade: "venda",
    cidade: "Parnamirim", estado: "RN", bairro: "Cotovelo",
    preco: 780000, preco_anterior: null,
    quartos: 3, banheiros: 2, vagas_garagem: 2, area_m2: 160,
    paleta: ["#d8f0d4", "#8fcf8a", "#14231f"], historico: [780, 780, 780, 780, 780, 780],
  },
  {
    id: 6, titulo: "Apartamento reformado", tipo: "Apartamento", finalidade: "aluguel",
    cidade: "Natal", estado: "RN", bairro: "Tirol",
    preco: 2900, preco_anterior: 3100,
    quartos: 3, banheiros: 2, vagas_garagem: 1, area_m2: 98,
    paleta: ["#ffd4d4", "#f29a9a", "#0f4c3a"], historico: [3200, 3200, 3100, 3100, 2950, 2900],
  },
];

export const brl = (v) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v);
