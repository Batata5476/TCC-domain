# 🚀 ATCC Backend — Documentação Técnica

Esta documentação detalha o estado atual do backend, a evolução do projeto, a metodologia aplicada e o roadmap para as próximas etapas.

## 🛠️ Tecnologias e Linguagem
O projeto é desenvolvido utilizando **TypeScript**, garantindo tipagem estrita, maior segurança no desenvolvimento e manutenibilidade a longo prazo.

**Principais Frameworks e Bibliotecas:**
- **NestJS**: Framework Node.js progressivo para construção de aplicativos do lado do servidor eficientes e escaláveis.
- **TypeORM**: ORM (Object-Relational Mapper) para integração com o banco de dados.
- **PostgreSQL**: Banco de dados relacional robusto.
- **Passport & JWT**: Sistema de autenticação e proteção de rotas.
- **Bcrypt**: Criptografia de senhas.

---

## 📈 Evolução do Projeto
O sistema passou por uma evolução significativa, saindo de um estado de protótipo (Mock) para uma arquitetura profissional e segura.

### Fase 1: Prototipagem (Mocks)
- Implementação inicial das rotas de autenticação e empresas.
- Dados simulados em memória para validação de fluxo.

### Fase 2: Persistência Real
- **Integração TypeORM**: Conexão com banco de dados PostgreSQL.
- **Entidades Reais**: Mapeamento da tabela `info_empresa`.
- **Registro & Login**: Persistência de dados reais com criptografia de senha.

### Fase 3: Segurança e Autenticação (JWT)
- **Implementação de JWT**: Geração de tokens de acesso seguros.
- **Proteção de Rotas**: Implementação de `JwtAuthGuard` para restringir acesso a usuários não autenticados.

### Fase 4: Otimização Profissional (Senior Level)
- **Variáveis de Ambiente**: Configuração do `ConfigModule` para gerenciar segredos via `.env`.
- **Multi-Tenancy (Isolamento)**: Implementação de filtros por `userId`, garantindo que uma empresa acesse exclusivamente seus próprios dados.
- **Tipagem Estrita**: Criação de interfaces para payloads JWT.
- **Padronização de Resposta**: Unificação do formato de retorno das APIs (`status`, `message`, `data`).

---

## 🧠 Metodologia Aplicada
O desenvolvimento segue os princípios de **Clean Code** e **Arquitetura Modular**:
1.  **Modularidade**: Cada funcionalidade (Auth, Company, Users) reside em seu próprio módulo NestJS.
2.  **Segurança por Design**: Senhas nunca são armazenadas em texto simples e todas as rotas sensíveis são protegidas por padrão.
3.  **Isolamento de Responsabilidades**: Controllers gerenciam requisições, Services tratam a regra de negócio e Repositories lidam com a persistência.
4.  **Desenvolvimento Incremental**: Evolução constante de mocks para funcionalidades reais, garantindo que cada etapa seja testada e validada.

---

## 🔍 Funcionalidades Atuais (Backend Ready)
1.  **Autenticação de Empresas**:
    - `POST /auth/company/register`: Registro seguro com hash de senha.
    - `POST /auth/company/login`: Validação de credenciais e geração de token JWT.
2.  **Gestão de Empresas (CRUD Protegido)**:
    - `GET /company`: Lista dados da empresa autenticada.
    - `GET /company/:id`: Busca detalhes (com validação de permissão).
    - `PATCH /company/:id`: Atualização de dados.
    - `DELETE /company/:id`: Remoção de conta.

---

## 🚀 Próximos Passos
O roadmap para a continuidade do projeto foca na expansão das funcionalidades de negócio e na experiência do usuário final.

1.  **Módulo de Usuários (Funcionários)**: Implementar a mesma lógica de autenticação e CRUD para os funcionários da empresa.
2.  **Módulos de Negócio**:
    - **Meetings**: Gestão de reuniões.
    - **Tasks**: Controle de tarefas e produtividade.
    - **Wellbeing**: Monitoramento de bem-estar.
3.  **Chat em Tempo Real**: Integração de WebSockets para comunicação interna.
4.  **Integração de Saúde (Health)**: Conexão com APIs ou dispositivos de monitoramento de saúde.
5.  **Refinamento de Permissões (RBAC)**: Diferenciação entre o que um Administrador (Empresa) e um Usuário (Funcionário) podem fazer.

---
*Documentação atualizada em: 05 de Maio de 2026*
