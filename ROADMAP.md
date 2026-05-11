# 🗺️ Roadmap do Projeto TCC - Coopera

> **Última atualização:** 10/05/2026

---

## ✅ Concluído

### Infraestrutura
- [x] Configuração do NestJS (Backend) + TypeORM + PostgreSQL
- [x] Configuração do Expo (Frontend) com suporte ao navegador Web
- [x] Sincronização do repositório Git com `yuuki-p/tcc`
- [x] Configuração do `babel.config.js` (corrigindo a tela branca)
- [x] Banco de dados `COOPERA` criado com tabelas base

### Cadastro
- [x] **Cadastro de Empresa** — formulário funcional, salva no BD com senha hasheada
- [x] **Cadastro de Funcionário** — formulário funcional, salva na tabela `info_funcionario`

**Prova — Cadastro de Empresa em uso:**
![Cadastro Empresa](file:///C:/Users/Amadeu_Turolla/.gemini/antigravity/brain/4fa928ed-130e-4370-a4ae-b707bfe805e2/registration_page_bottom_1778377145954.png)

### Autenticação
- [x] **Backend JWT** — `AuthService.loginCompany` com validação `bcrypt` e emissão de token
- [x] **`services/auth.ts`** — `loginCompany`, `loginEmployee`, `logout`, `getToken`
- [x] **`services/api.ts`** — `authenticatedFetch` com Header `Authorization: Bearer`
- [x] **Armazenamento híbrido** — `localStorage` (Web) + `SecureStore` (Mobile)
- [x] **Login de Empresa** — funcional, recebe token e redireciona
- [x] **Login de Funcionário** — implementado no frontend (aguardando backend)

### Sessão e Navegação
- [x] **Dashboard** — tela pós-login que valida sessão e faz requisição autenticada
- [x] **Auto-redirect** — se não houver token, redireciona para login
- [x] **Logout** — remove token e encerra sessão

**Prova — Dashboard com Sessão Autenticada:**
![Dashboard Autenticado](file:///C:/Users/Amadeu_Turolla/.gemini/antigravity/brain/4fa928ed-130e-4370-a4ae-b707bfe805e2/dashboard_full_view_1778447537272.png)

### Rede
- [x] Migração de `localhost` para IP fixo `192.168.0.103` — suporte a testes em celular

---

## 🚧 Em Desenvolvimento

- [ ] **Login de Funcionário (Backend)** — `AuthService.loginUser` ainda é mockado; precisa de `bcrypt.compare` + JWT
- [ ] **Tratamento de Erros** — Retornar HTTP 409 para CNPJ/CPF duplicado (atualmente HTTP 500)
- [ ] **Validações de Formulário** — Máscaras para CNPJ/CPF, validação de e-mail em tempo real, loading spinner

---

## 📋 Backlog

### Alta Prioridade
- [ ] **Dashboard Real** — expandir com dados do usuário logado, listagem de tarefas e ações rápidas
- [ ] **Módulo de Tarefas** — mapear `TAREFAS` e `FUNC_TAREFA` no NestJS, tela de criação/atualização

### Média Prioridade
- [ ] **Ponto Eletrônico** — marcar entrada/saída (`ENTRADA_SAIDA`), visualizar banco de horas
- [ ] **Bem-Estar** — registro de humor diário (`HUMOR_FUNC`) e visualização em gráfico
- [ ] **Reuniões** — agenda de reuniões (`REUNIAO`, `PARTICIPANTES_REU`)
- [ ] **Histórico Médico** — registro de atestados (`HIS_MEDICO`)

### Baixa Prioridade / Polimento
- [ ] **Chat / Comunicação** — mapear `CHATS`, `MENSAGENS`, `MIDIA` e implementar tempo real
- [ ] **Perfil do Usuário** — edição de dados e upload de foto de perfil
- [ ] **Exportação de Relatórios** — geração de PDFs para histórico de tarefas e horas
- [ ] **Máscaras de Input** — formatação automática para CNPJ e CPF

---

## 🏛️ Argumento para a Banca

> O frontend implementa autenticação persistente utilizando JWT, permitindo manutenção segura da sessão tanto em ambiente **web** (`localStorage`) quanto **mobile** (`Expo SecureStore`). O ciclo completo — cadastro → login → sessão → logout — foi implementado e validado com o backend NestJS e o banco PostgreSQL.
