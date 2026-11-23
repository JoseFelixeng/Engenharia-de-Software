import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import Login from "./Login.jsx";
import * as mockApi from "../services/mockApi.js";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const atual = await vi.importActual("react-router-dom");
  return {
    ...atual,
    useNavigate: () => mockNavigate,
  };
});

describe("Tela de Login (Login.jsx)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("deve renderizar os campos de e-mail, senha e o botão Entrar", () => {
    const { container } = render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: /acesse sua conta/i })).toBeInTheDocument();
    expect(container.querySelector("#email")).toBeInTheDocument();
    expect(container.querySelector("#senha")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^entrar$/i })).toBeInTheDocument();
  });

  it("deve exibir mensagens de erro ao tentar enviar e-mail inválido e senha vazia", async () => {
    const { container } = render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(container.querySelector("#email"), {
      target: { value: "email-invalido" },
    });
    fireEvent.click(screen.getByRole("button", { name: /^entrar$/i }));

    expect(await screen.findByText("Digite um e-mail válido.")).toBeInTheDocument();
    expect(await screen.findByText("Digite sua senha.")).toBeInTheDocument();
  });

  it("deve redirecionar proprietário para /vendedor após login com sucesso", async () => {
    vi.spyOn(mockApi, "login").mockResolvedValueOnce({
      access_token: "token-teste-123",
      usuario: { nome: "Maria", tipo_usuario: "proprietario" },
    });

    const { container } = render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(container.querySelector("#email"), {
      target: { value: "maria@morada.com" },
    });
    fireEvent.change(container.querySelector("#senha"), {
      target: { value: "senha1234" },
    });
    fireEvent.click(screen.getByRole("button", { name: /^entrar$/i }));

    await waitFor(() => {
      expect(mockApi.login).toHaveBeenCalledWith("maria@morada.com", "senha1234");
      expect(sessionStorage.getItem("morada_token")).toBe("token-teste-123");
      expect(mockNavigate).toHaveBeenCalledWith("/vendedor");
    });
  });

  it("deve redirecionar administrador para /admin após login com sucesso", async () => {
    vi.spyOn(mockApi, "login").mockResolvedValueOnce({
      access_token: "token-admin-999",
      usuario: { nome: "Admin", tipo_usuario: "administrador" },
    });

    const { container } = render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(container.querySelector("#email"), {
      target: { value: "admin@morada.com" },
    });
    fireEvent.change(container.querySelector("#senha"), {
      target: { value: "admin1234" },
    });
    fireEvent.click(screen.getByRole("button", { name: /^entrar$/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/admin");
    });
  });
});