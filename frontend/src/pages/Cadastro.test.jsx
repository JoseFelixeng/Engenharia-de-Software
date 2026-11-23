import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import Cadastro from "./Cadastro.jsx";
import * as mockApi from "../services/mockApi.js";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const atual = await vi.importActual("react-router-dom");
  return {
    ...atual,
    useNavigate: () => mockNavigate,
  };
});

describe("Tela de Cadastro (Cadastro.jsx)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("deve renderizar o formulário completo e os perfis de uso", () => {
    const { container } = render(
      <MemoryRouter>
        <Cadastro />
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: /crie sua conta/i })).toBeInTheDocument();
    expect(screen.getByText("Quero encontrar")).toBeInTheDocument();
    expect(screen.getByText("Quero anunciar")).toBeInTheDocument();
    expect(container.querySelector("#nome")).toBeInTheDocument();
    expect(container.querySelector("#email")).toBeInTheDocument();
    expect(container.querySelector("#telefone")).toBeInTheDocument();
    expect(container.querySelector("#senha")).toBeInTheDocument();
  });

  it("deve exibir erros de validação ao enviar formulário vazio sem aceitar os termos", async () => {
    render(
      <MemoryRouter>
        <Cadastro />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /criar conta/i }));

    expect(await screen.findByText("Informe nome e sobrenome.")).toBeInTheDocument();
    expect(await screen.findByText("Digite um e-mail válido.")).toBeInTheDocument();
    expect(await screen.findByText("Use pelo menos 8 caracteres.")).toBeInTheDocument();
    expect(await screen.findByText("Você precisa aceitar os termos para continuar.")).toBeInTheDocument();
  });

  it("deve aplicar máscara no telefone e atualizar o medidor de força da senha", () => {
    const { container } = render(
      <MemoryRouter>
        <Cadastro />
      </MemoryRouter>
    );

    const inputTel = container.querySelector("#telefone");
    fireEvent.change(inputTel, { target: { value: "84999998888" } });
    expect(inputTel.value).toBe("(84) 99999-8888");

    const inputSenha = container.querySelector("#senha");
    fireEvent.change(inputSenha, { target: { value: "abc" } });
    expect(screen.getByText("Muito fraca")).toBeInTheDocument();

    fireEvent.change(inputSenha, { target: { value: "SenhaForte@2026" } });
    expect(screen.getByText("Forte")).toBeInTheDocument();
  });

  it("deve cadastrar anunciante como proprietário e redirecionar para /vendedor", async () => {
    vi.spyOn(mockApi, "cadastro").mockResolvedValueOnce({
      access_token: "token-novo-usuario",
      usuario: { nome: "João Silva", tipo_usuario: "proprietario" },
    });

    const { container } = render(
      <MemoryRouter>
        <Cadastro />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText("Quero anunciar"));
    fireEvent.change(container.querySelector("#nome"), { target: { value: "João Silva" } });
    fireEvent.change(container.querySelector("#email"), { target: { value: "joao@morada.com" } });
    fireEvent.change(container.querySelector("#telefone"), { target: { value: "84988887777" } });
    fireEvent.change(container.querySelector("#senha"), { target: { value: "SenhaForte@2026" } });
    fireEvent.click(container.querySelector('input[type="checkbox"]'));

    fireEvent.click(screen.getByRole("button", { name: /criar conta/i }));

    await waitFor(() => {
      expect(mockApi.cadastro).toHaveBeenCalledWith({
        nome: "João Silva",
        email: "joao@morada.com",
        telefone: "(84) 98888-7777",
        tipo_usuario: "proprietario",
        senha: "SenhaForte@2026",
      });
      expect(sessionStorage.getItem("morada_token")).toBe("token-novo-usuario");
      expect(mockNavigate).toHaveBeenCalledWith("/vendedor");
    });
  });
});