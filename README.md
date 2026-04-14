# 🏢 ATCC — Backend API

> API RESTful desenvolvida com **NestJS** para o sistema de gestão corporativa ATCC.
> Projeto de TCC — Arquitetura modular, escalável e orientada a boas práticas.

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