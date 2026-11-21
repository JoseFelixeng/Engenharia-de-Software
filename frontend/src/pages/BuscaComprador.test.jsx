import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import BuscaComprador from "./BuscaComprador.jsx";
import * as mockApi from "../services/mockApi.js";

vi.mock("../components/Navbar.jsx", () => ({
  default: () => <nav data-testid="navbar" />,
}));

vi.mock("../components/Footer.jsx", () => ({
  default: () => <footer data-testid="footer" />,
}));

vi.mock("../components/PropertyCard.jsx", () => ({
  default: ({ imovel }) => (
    <div data-testid="property-card">
      <h3>{imovel.titulo}</h3>
      <span>{imovel.cidade}</span>
    </div>
  ),
}));

const IMOVEIS_MOCK = [
  {
    id: 1,
    titulo: "Apartamento Beira-Mar",
    cidade: "Natal",
    bairro: "Ponta Negra",
    finalidade: "venda",
    tipo: "Apartamento",
    quartos: 3,
    preco: 450000,
  },
  {
    id: 2,
    titulo: "Casa em Condomínio",
    cidade: "Parnamirim",
    bairro: "Nova Parnamirim",
    finalidade: "aluguel",
    tipo: "Casa",
    quartos: 2,
    preco: 2500,
  },
];

describe("Tela de Busca de Imóveis (BuscaComprador.jsx)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("deve carregar e exibir a lista inicial de imóveis", async () => {
    vi.spyOn(mockApi, "listarImoveis").mockResolvedValueOnce(IMOVEIS_MOCK);

    render(
      <MemoryRouter>
        <BuscaComprador />
      </MemoryRouter>
    );

    expect(await screen.findByText("Apartamento Beira-Mar")).toBeInTheDocument();
    expect(screen.getByText("Casa em Condomínio")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(/2 .* encontrados/i);
  });

  it("deve filtrar imóveis por cidade/bairro e finalidade", async () => {
    vi.spyOn(mockApi, "listarImoveis").mockResolvedValueOnce(IMOVEIS_MOCK);

    render(
      <MemoryRouter>
        <BuscaComprador />
      </MemoryRouter>
    );

    await screen.findByText("Apartamento Beira-Mar");

    fireEvent.change(screen.getByPlaceholderText("Cidade ou bairro"), {
      target: { value: "Ponta Negra" },
    });

    expect(screen.getByText("Apartamento Beira-Mar")).toBeInTheDocument();
    expect(screen.queryByText("Casa em Condomínio")).not.toBeInTheDocument();
    expect(screen.getByText("1 imóvel encontrado")).toBeInTheDocument();
  });

  it("deve exibir mensagem de estado vazio quando nenhum imóvel corresponder ao filtro", async () => {
    vi.spyOn(mockApi, "listarImoveis").mockResolvedValueOnce(IMOVEIS_MOCK);

    render(
      <MemoryRouter>
        <BuscaComprador />
      </MemoryRouter>
    );

    await screen.findByText("Apartamento Beira-Mar");

    fireEvent.change(screen.getByPlaceholderText("Cidade ou bairro"), {
      target: { value: "Cidade Inexistente" },
    });

    await waitFor(() => {
      expect(screen.getByText("Nenhum imóvel encontrado")).toBeInTheDocument();
    });
  });
});