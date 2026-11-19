# Frontend — Morada

Interface em React 19 + Vite + React Router (JavaScript) para a plataforma de aluguel e venda de imóveis.

## O que foi feito

### Páginas públicas
- **`/` (Home)** — busca de imóveis com filtros (finalidade, cidade, tipo, quartos), cards de imóveis, diferencials (compatibilidade com preferências, histórico de preços, comparador lado a lado) e CTA para cadastro/login.
- **`/login`** — login com e-mail e senha, opção "Continuar com Google", link para cadastro.
- **`/cadastro`** — cadastro com escolha de tipo de usuário (interessado ou anunciante), validação de nome/sobrenome, e-mail, telefone, senha (medidor de força) e aceite de termos.

### Páginas após cadastro (redirecionamento automático)
- **`/comprador`** — para usuários do tipo `interessado`. Busca e listagem de imóveis com filtros (finalidade, cidade, tipo, quartos, preço máximo). Consome `listarImoveis` da camada de API.
- **`/vendedor`** — para usuários do tipo `anunciante` (`proprietario` ou `corretor`). Lista os próprios anúncios e permite cadastrar novos imóveis via modal (título, tipo, finalidade, preço, cidade, estado, bairro, área, quartos, banheiros, vagas, descrição). Consome `criarImovel` da camada de API.
- **`/admin`** — para usuários do tipo `administrador`. Listagem de usuários com filtros por tipo e situação, e botão para ativar/desativar contas. **Requer autenticação** (protegido no servidor; o frontend oculta a rota mas o controle de acesso real é no backend).

### Camada de API
- **`src/services/mockApi.js`** — camada de chamada à API Morada usando `fetch` real contra o backend FastAPI. Funções: `cadastro`, `login`, `me`, `listarImoveis`, `criarImovel`.
- A URL base é definida pela variável de ambiente `VITE_API_BASE` (padrão: `http://localhost:8000`). Exemplo: `VITE_API_BASE=http://localhost:8000 npm run dev`.
- O token JWT é armazenado em `localStorage` (`morada_token`) e enviado automaticamente nas rotas protegidas (`criarImovel`).

### Integração com o backend
O frontend já está conectado ao backend via `src/services/mockApi.js`. Os endpoints consumidos são:

| Função frontend | Endpoint backend | Método | Protegido? |
|-----------------|------------------|--------|------------|
| `cadastro(dados)` | `/auth/cadastro` | POST | Não |
| `login(email, senha)` | `/auth/login` | POST | Não |
| `me(token)` | `/usuario/me` | GET | Sim (Bearer) |
| `listarImoveis(filtros)` | `/imoveis?...` | GET | Não |
| `criarImovel(dados, token)` | `/imoveis` | POST | Sim (Bearer) |

O mapeamento de tipos de usuário segue o banco: `anunciante` no frontend → `proprietario` no backend.

### Componentes
- `Navbar` — navegação fixa com links para Imóveis, Diferenciais, Como funciona, Anunciar, Entrar, Criar conta.
- `AuthLayout` — layout dividido (painel visual + formulário) usado em Login e Cadastro.
- `Field` — campo com ícone, label flutuante, erro animado e mostrar/ocultar senha.
- `PropertyCard` — card de imóvel com foto (SVG), badges, preço, specs, favorito e checkbox de comparação.
- `PropertyArt` — ilustração SVG do imóvel conforme o tipo (Casa, Apartamento, Cobertura).
- `Icons` — conjunto de ícones SVG + componente `Logo`.
- `Footer` — rodapé com links e copyright.
- `Reveal` / `hooks.js` — animações de revelação ao scroll e contagem animada.

### Estilos
- `src/styles/index.css` — design tokens (cores, tipografia, sombras, breakpoints) e componentes base.
- `src/styles/home.css` — estilos da página Home.
- `src/styles/components.css` — estilos de Navbar, PropertyCard e Footer.
- `src/styles/auth.css` — estilos de Login/Cadastro.
- `src/styles/dashboard.css` — estilos das páginas de dashboard (vendedor, comprador, admin).

### Dados mockados
- `src/data/imoveis.js` — lista de imóveis de exemplo com preço, histórico, paleta, etc. Usada pelo Home e pelo mockApi até o backend estar pronto.

## Como rodar

### Pré-requisitos
- Node.js 18+
- npm

### Instalação

```bash
cd frontend
npm install
```

### Execução (desenvolvimento)

```bash
npm run dev
```

A aplicação fica disponível em `http://localhost:5173` (ou a porta indicada pelo Vite).

### Build de produção

```bash
npm run build
```

Gera a pasta `dist/` pronta para deploy.

### Preview do build

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

## Integração com o backend

O frontend já está conectado ao backend via `src/services/mockApi.js`. Configure a variável `VITE_API_BASE` para apontar para a URL do backend (padrão: `http://localhost:8000`).

Para rodar a aplicação completa:

1. **Backend**: siga as instruções em `backend/README.md` (instale dependências, configure `.env` com `DATABASE_URL` e `SECRET_KEY`, rode `uvicorn`).
2. **Frontend**: `npm install` e `npm run dev` (defina `VITE_API_BASE` se o backend não estiver em `localhost:8000`).
3. Acesse `http://localhost:5173`, cadastre-se ou faça login, e será redirecionado automaticamente para o painel correspondente ao seu tipo de usuário.

## Rotas

| Caminho | Página | Público? |
|---------|--------|----------|
| `/` | Home | Sim |
| `/login` | Login | Sim |
| `/cadastro` | Cadastro | Sim |
| `/comprador` | Busca de imóveis (interessado) | Após cadastro |
| `/vendedor` | Meus anúncios (anunciante) | Após cadastro |
| `/admin` | Gestão de usuários (administrador) | Apenas admin autenticado |

## Scripts

- `npm run dev` — servidor de desenvolvimento com hot reload
- `npm run build` — build de produção
- `npm run preview` — prévia do build de produção
- `npm run lint` — executa o oxlint
