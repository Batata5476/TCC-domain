# Status do Projeto - TCC Coopera

> **Última atualização:** 10/05/2026 — Sessão de autenticação completa implementada e validada.

---

## ✅ Mudanças Aplicadas

### 1. Sincronização e Estrutura (Sessão Anterior)
- **Git Sync**: Sincronização completa com o repositório remoto `yuuki-p/tcc.git`.
- **Correção de Pastas**: Resolvido o conflito entre o arquivo `Frontend` e a pasta `frontend` no Windows.

---

### 2. Frontend — Expo Web

#### 2.1 Correção de Build
- Criação do `babel.config.js` que estava ausente, resolvendo a tela branca no navegador.
- Instalação das dependências: `react-native-web`, `react-dom`, `@expo/metro-runtime`.

#### 2.2 Cadastro de Empresa (Funcional ✅)
- Implementado `useState` para todos os campos (Nome, CNPJ, Email, Tipo, Senha).
- Função `handleRegister` envia `POST http://192.168.0.103:3000/company`.
- Senhas com hash `bcrypt` antes de salvar no banco.

**Tela de Cadastro de Empresa:**
![Cadastro Empresa](file:///C:/Users/Amadeu_Turolla/.gemini/antigravity/brain/4fa928ed-130e-4370-a4ae-b707bfe805e2/registration_page_bottom_1778377145954.png)

#### 2.3 Cadastro de Funcionário (Funcional ✅)
- Formulário completo integrado ao endpoint `POST /users`.
- Campos: Nome, CPF, E-mail, ID do Setor, ID do Cargo, Código da Empresa.

**Tela de Login / Cadastro de Funcionário:**
![Login Funcionario](file:///C:/Users/Amadeu_Turolla/.gemini/antigravity/brain/4fa928ed-130e-4370-a4ae-b707bfe805e2/after_registration_click_1778377958446.png)

#### 2.4 Login de Empresa (Funcional ✅)
- Tela com CNPJ e Senha conectados ao `loginCompany()` do `services/auth.ts`.
- Ao logar, recebe o Token JWT e redireciona para o Dashboard.

#### 2.5 Login de Funcionário (Implementado ✅)
- Tela com E-mail e Senha conectados ao `loginEmployee()`.
- Preparado para quando o backend implementar a rota `POST /auth/user/login`.

#### 2.6 Dashboard (Funcional ✅)
- Verifica se há token válido ao carregar.
- Faz chamada autenticada para `/company` e exibe "Sessão Autenticada ✅".
- Botão de Logout remove o token e redireciona para a tela inicial.

**Dashboard Autenticado:**
![Dashboard](file:///C:/Users/Amadeu_Turolla/.gemini/antigravity/brain/4fa928ed-130e-4370-a4ae-b707bfe805e2/dashboard_full_view_1778447537272.png)

#### 2.7 Camada de Serviços — `frontend/services/`
| Arquivo | Função |
|---|---|
| `auth.ts` | `loginCompany`, `loginEmployee`, `logout`, `getToken` |
| `api.ts` | `authenticatedFetch` — injeta `Authorization: Bearer <token>` automaticamente |

#### 2.8 Armazenamento de Token (Híbrido)
| Ambiente | Mecanismo |
|---|---|
| Web (Navegador) | `localStorage` |
| Mobile (Expo) | `expo-secure-store` (criptografado) |

#### 2.9 Configuração de Rede
- Todos os `fetch` foram migrados de `http://localhost:3000` para `http://192.168.0.103:3000`.
- Isso permite que dispositivos móveis na mesma rede Wi-Fi se comuniquem com o backend.

---

### 3. Backend — NestJS

#### 3.1 Configuração de Ambiente
- Criação do arquivo `.env` com credenciais do PostgreSQL.
- `CORS` habilitado no `main.ts`.

#### 3.2 Registro de Empresa Público
- Removida a obrigatoriedade de JWT no endpoint `POST /company`.
- Agora novos usuários podem se cadastrar sem token.

#### 3.3 Módulo de Usuários (Funcionários) — Real
- Entidade `User` mapeada para a tabela `info_funcionario` via TypeORM.
- Serviço substituído de um mock para operações reais com o banco.
- DTO atualizado para campos reais: `nome_func`, `cpf_func`, `email_func`, `fk_id_setor`, `fk_id_cargo`, `fk_cod_empresa`.

#### 3.4 Autenticação (JWT)
- `loginCompany` no `AuthService` busca empresa pelo CNPJ, compara senha com `bcrypt.compare`, e emite o JWT.
- `JwtStrategy` valida o token nas rotas protegidas.

---

### 4. Banco de Dados — PostgreSQL

- **Banco `COOPERA`** criado manualmente.
- **Tabelas criadas**: `INFO_EMPRESA`, `INFO_FUNCIONARIO`, `SETOR`, `CARGO`.
- **Dados de seed** inseridos via scripts auxiliares (`fix_tables.js`, `check_db.js`).
- **Registros confirmados no BD**:
  - Empresa: `Empresa Teste` (CNPJ: 99888777000100)
  - Funcionários: `Funcionario Teste`, `Funcionario Teste 2`

---

## 🚩 O que ainda falta fazer

### 1. Backend — Login de Funcionário
- O `AuthService.loginUser()` retorna apenas uma mensagem mockada.
- Precisa ser implementado com `bcrypt.compare` e emissão de JWT, similar ao `loginCompany`.

### 2. Tratamento de Erros
- O backend retorna **HTTP 500** em caso de CNPJ ou CPF duplicado.
- Deve retornar **HTTP 409 (Conflict)** com mensagem amigável.

### 3. Dashboard Real
- O Dashboard atual é apenas uma tela de validação de sessão.
- Precisa ser expandido com listagem de tarefas, informações do usuário, etc.

### 4. Mapeamento de Entidades Restantes
| Tabela | Status |
|---|---|
| `TAREFAS` / `FUNC_TAREFA` | ❌ Pendente |
| `HUMOR_FUNC` | ❌ Pendente |
| `CHATS` / `MENSAGENS` / `MIDIA` | ❌ Pendente |
| `ENTRADA_SAIDA` / `CARGA_HORARIA` / `BANCO_HORAS` | ❌ Pendente |
| `REUNIAO` / `PARTICIPANTES_REU` | ❌ Pendente |

### 5. Validações de Formulário
- Máscaras para CNPJ e CPF.
- Validação de formato de e-mail em tempo real.
- Feedback visual durante o carregamento (loading spinner).
