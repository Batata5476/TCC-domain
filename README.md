# 🏢 ATCC — Backend API

> API RESTful desenvolvida com **NestJS** para o sistema de gestão corporativa ATCC.
> Projeto de TCC — Arquitetura modular, escalável e orientada a boas práticas.

## Início Rápido (Windows)

Abra um terminal na pasta `tcc` e rode:

```powershell
npm run setup
npm run db:setup
npm run check
```

`setup` instala as versões registradas nos lockfiles. `db:setup` aplica as migrações locais de permissões, GPS e reuniões, sem apagar registros. `check` compila o backend, executa os testes e verifica os tipos do frontend. O banco deve existir antes de rodar `db:setup`.

Para testar a aplicação, use dois terminais na pasta `tcc`:

```powershell
npm run backend
```

```powershell
npm run frontend
```

O backend precisa de PostgreSQL ativo e `Backend/.env` configurado; use `Backend/.env.example` como referência em uma máquina nova. Para abrir a versão web, use `npm run web`. O app aponta por padrão para `http://localhost:3000`; em um celular físico, configure `EXPO_PUBLIC_API_URL` com o IP local deste computador.

---

## 🚀 Tecnologias

| Tecnologia | Versão | Descrição |
|---|---|---|
| [NestJS](https://nestjs.com/) | ^10 | Framework Node.js progressivo |
| [TypeScript](https://www.typescriptlang.org/) | ^5 | Tipagem estática |
| [Node.js](https://nodejs.org/) | ^20 | Runtime JavaScript |

---

## 📁 Estrutura do Projeto

```
src/
├── main.ts                  # Entry point da aplicação
├── app.module.ts            # Módulo raiz
│
├── common/                  # Utilitários globais
│   ├── decorators/
│   ├── guards/
│   ├── filters/
│   └── interceptors/
│
├── auth/                    # Autenticação (empresa e funcionário)
├── users/                   # Gestão de usuários
├── company/                 # Gestão de empresas
├── wellbeing/               # Bem-estar dos funcionários
├── tasks/                   # Gestão de tarefas
├── chat/                    # Mensagens internas
├── meetings/                # Reuniões
├── occurrences/             # Ocorrências e incidentes
├── work/                    # Registros de jornada de trabalho
└── health/                  # Health check da API
```

---

## 📡 Rotas Disponíveis

### 🔐 Auth
| Método | Rota | Descrição |
|---|---|---|
| POST | `/auth/user/login` | Login de funcionário |
| POST | `/auth/user/register` | Registro de funcionário |
| POST | `/auth/company/login` | Login de empresa |
| POST | `/auth/company/register` | Registro de empresa |

### 👥 Users
| Método | Rota | Descrição |
|---|---|---|
| GET | `/users` | Lista todos os usuários |
| GET | `/users/:id` | Busca usuário por ID |
| POST | `/users` | Cria novo usuário |
| PATCH | `/users/:id` | Atualiza usuário |
| DELETE | `/users/:id` | Remove usuário |

> Os demais módulos (`/company`, `/wellbeing`, `/tasks`, `/chat`, `/meetings`, `/occurrences`, `/work`) seguem o mesmo padrão REST.

### ❤️ Health
| Método | Rota | Descrição |
|---|---|---|
| GET | `/health` | Status da API |

---

## ⚙️ Como Rodar

### Pré-requisitos
- Node.js >= 20
- npm >= 9

### Instalação

```bash
# Instalar dependências
npm install

# Rodar em modo desenvolvimento
npm run start:dev

# Build de produção
npm run build
npm run start:prod
```

A aplicação estará disponível em: **http://localhost:3000**

---

## 🧱 Padrão Arquitetural

O backend foi estruturado seguindo a **arquitetura modular do NestJS**, com separação clara de responsabilidades:

- **Controllers** → recebem e respondem às requisições HTTP
- **Services** → contêm a lógica de negócio
- **DTOs** → validam e tipam os dados de entrada
- **Entities** → representam os modelos de dados
- **Modules** → agrupam e encapsulam cada domínio

Essa separação facilita **escalabilidade**, **manutenção** e **testes**.

---

## 👨‍💻 Autor

Desenvolvido como parte do **Trabalho de Conclusão de Curso (TCC)**.

---

> *"Código limpo não é escrito seguindo um conjunto de regras. Você não se torna um artesão de software aprendendo uma lista de heurísticas. Profissionalismo e artesanato vêm de valores que impulsionam disciplinas."* — Robert C. Martin