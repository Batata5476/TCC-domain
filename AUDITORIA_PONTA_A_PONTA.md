# Auditoria Ponta a Ponta - TCC Coopera

> Data da auditoria: 06/09/2026 (Atualizado em 22/09/2026)
> Escopo: backend, frontend e integracao entre os dois.
> Regra: uma funcionalidade nao e considerada pronta apenas porque existe uma tela ou uma rota.

---

## 1. Bloqueios imediatos

- [x] Corrigir cadastro de empresa: `frontend/app/cadastroEmpresa.tsx` envia `nome_empresa`, `cnpj_empresa` e `email_empresa`, enquanto `CreateCompanyDto` espera `nome`, `cnpj` e `email`.
- [x] Corrigir chat: `ChatService` exige `caller.type`, mas `AuthService` nao coloca `type` no JWT e `JwtStrategy` nao cria esse campo em `req.user`.
- [x] Corrigir isolamento do dashboard: `DashboardService` conta tarefas e humor sem filtrar pela empresa do token.
- [x] Remover credenciais de logs e respostas `_dev_`: tokens, codigos de ativacao e recuperacao nao podem ser expostos fora de desenvolvimento controlado.
- [x] Corrigir `frontend/services/config.ts`: `localhost` nao funciona em celular fisico; usar configuracao por ambiente.
- [x] Escolher um schema oficial de banco e alinhar entidades TypeORM, SQL e scripts.
- [x] Corrigir reunioes: a tela envia `participants: []`, mas o DTO exige participantes e o service bloqueia funcionarios.
- [x] Retirar ou conectar dados ficticios de salario, folgas, carga horaria e respostas do chat.

---

## 2. Backend - autenticacao, sessao e seguranca

### JWT e identidade

- [x] Definir payload unico com `sub`, `empresa_id`, `role`, `permissions` e, se necessario, `type`.
- [x] Remover dependencia de `caller.type` no chat ou passar esse campo de forma consistente.
- [x] Usar sempre `sub` como ID do usuario; eliminar alternancia entre `userId` e `sub`.
- [x] Garantir que o tipo salvo no frontend corresponda ao role real do token.
- [x] Validar `JWT_SECRET` na inicializacao; impedir servidor com segredo ausente ou inseguro.
- [x] Validar variaveis obrigatorias de banco, porta e ambiente na inicializacao.
- [x] Centralizar expiracao, logout, redirecionamento e invalidacao de sessao.

### Credenciais e recuperacao

- [x] Remover logs de token, codigo de ativacao e codigo de recuperacao em `auth.service.ts` e `users.service.ts`.
- [x] Remover ou proteger o campo `_dev_` retornado no cadastro de funcionario.
- [x] Substituir e-mail simulado por integracao real ou restringir claramente ao ambiente de desenvolvimento.
- [x] Remover codigos e segredos dos detalhes de auditoria.
- [x] Aplicar no cadastro de empresa a mesma politica de senha usada no primeiro acesso.
- [x] Definir limite de tentativas para login, primeiro acesso e recuperacao.
- [x] Manter resposta generica para e-mail inexistente na recuperacao.

### Roles e permissoes

- [x] Centralizar autorizacao em guard, decorator ou helper.
- [x] Parar de espalhar comparacoes literais de `Administrador Master`, `Administrador` e `Funcionario`.
- [x] Definir se `permissions` do JWT serao usadas de verdade; hoje varias rotas ignoram essas permissoes.
- [x] Fazer permissoes customizadas protegerem rotas ou remover essa opcao da interface.
- [x] Padronizar nomes de roles, acentuacao e valores em seed, banco, backend e frontend.
- [x] Revisar toda rota protegida para validar usuario, empresa e permissao.

---

## 3. Backend - empresas, usuarios e dashboard

### Empresas

- [x] Alinhar `CreateCompanyDto` com o payload usado pela tela de cadastro.
- [x] Normalizar nome e e-mail antes de comparar duplicidade e salvar.
- [x] Definir exclusao logica ou cascata transacional para empresa.
- [x] Impedir que `remove()` quebre foreign keys de usuarios, tarefas, humor, reunioes e auditoria.
- [x] Revisar rotas de empresa existentes mas nao consumidas pelo frontend.
- [x] Garantir que criacao da empresa e usuario master seja atomica.

### Usuarios

- [x] Alinhar DTO, entity e formulario com uma unica nomenclatura de campos.
- [x] Definir se cargo sera texto ou relacao por ID.
- [x] Trocar `setorId` digitado manualmente por selecao de setores validos da empresa.
- [x] Validar que setor e cargo pertencem a empresa atual.
- [x] Normalizar CPF e e-mail antes de checar duplicidade.
- [x] Impedir retorno de senha, token ou outros dados sensiveis nas listagens.
- [x] Confirmar os campos aceitos no PATCH de usuario (`foto`, `foto_func`, telefone e demais dados).

### Dashboard

- [x] Filtrar total de tarefas por funcionarios da empresa do token.
- [x] Filtrar tarefas pendentes e concluidas por empresa.
- [x] Filtrar media, ultimo registro e total de humor por empresa.
- [x] Retornar no `/dashboard/user` CPF, telefone, cargo e setor, pois as telas de perfil esperam esses campos.
- [x] Padronizar resposta do dashboard da empresa para o mesmo formato usado pelos demais endpoints.
- [x] Definir resposta correta para administrador master no dashboard de usuario.
- [x] Diferenciar estado vazio de sessao invalida no frontend.

---

## 4. Backend - tarefas

- [x] Restringir DTO de status aos estados validos do sistema.
- [x] Validar estados `1` (Concluída), `2` (Em Andamento) e `3` (Pendente).
- [x] Centralizar validacao das transicoes de status no `TasksService`.
- [x] Confirmar se funcionario pode criar tarefa para si mesmo e documentar essa regra.
- [x] Garantir que empresa atribua tarefa somente a funcionario da propria empresa.
- [x] Garantir que funcionario liste e altere somente tarefas associadas a ele.
- [x] Definir se validade e `DATE` ou `TIMESTAMP` e remover conversoes duplicadas de fuso horario (normalizacao YYYY-MM-DD local).
- [x] Criar endpoint `/tasks/company-tasks` para administradores visualizarem tarefas da empresa.
- [x] Criar testes unitarios automatizados para `TasksService` com 100% de aprovacao.

---

## 5. Backend - chat

- [x] Corrigir validacao de participante conforme o JWT oficial (`empresa_id` e `sub`).
- [x] Criar endpoint para listar contatos da empresa (`GET /chat/contacts`).
- [x] Criar endpoint para criar/obter conversa direta (`POST /chat/conversation`).
- [x] Criar endpoint para enviar e listar mensagens chronologically (`POST /chat/message` e `GET /chat/messages/:chatId`).
- [x] Validar que todos os participantes pertencem a mesma empresa.
- [x] Ordenar mensagens por data crescente dentro da conversa.
- [x] Criar testes unitarios automatizados para `ChatService` com 100% de aprovacao.

---

## 6. Backend - reunioes

- [x] Separar solicitacao de reuniao feita por funcionario (`POST /meetings/request`) da criacao administrativa (`POST /meetings`).
- [x] Permitir solicitacao sem participantes obrigatorios (inclui solicitante automaticamente).
- [x] Criar fluxo de aceitar (`AGENDADA`), recusar (`RECUSADA`) e cancelar (`CANCELADA`) reunioes (`PATCH /meetings/:id/status`).
- [x] Implementar selecao de participantes para criacao administrativa.
- [x] Validar que participantes pertencem a mesma empresa (`empresa_id`).
- [x] Validar data e horario no DTO e no service (`HH:mm` e `Date`).
- [x] Definir estados, cancelamento e alteracao de reuniao.
- [x] Criar listagem filtrada para funcionarios (participantes ou solicitantes) e empresas (`GET /meetings`).
- [x] Criar testes unitarios automatizados para `MeetingsService` com 100% de aprovacao.

---

## 7. Backend - bem-estar e ocorrencias

### Bem-estar

- [x] Conectar endpoint de humor ao fluxo real.
- [x] Aplicar regra de um registro por dia.
- [x] Garantir que funcionario registre somente o proprio humor.
- [x] Garantir que administrador consulte somente dados da propria empresa.

### Ocorrencias e registros medicos

- [ ] Alinhar `pk_id_his_medico` do backend com o campo `id` usado no frontend.
- [ ] Corrigir edicao e remocao usando o identificador real.
- [ ] Revisar protecao de dados medicos sensiveis.
- [ ] Garantir que funcionario veja somente seus registros.
- [ ] Garantir que administrador veja somente registros de sua empresa.

---

## 8. Backend - ponto, jornada e dados trabalhistas

- [ ] Definir se `work` cobre ponto, salario, carga horaria, folgas e banco de horas.
- [ ] Criar entidades e endpoints para salario se ele permanecer na interface.
- [ ] Criar entidades e endpoints para carga horaria se ela permanecer na interface.
- [ ] Criar entidades e endpoints para folgas e banco de horas se forem exibidos.
- [ ] Calcular `total_dia` a partir de entrada e saida.
- [ ] Validar horarios, saida ausente e virada de dia.

---

## 9. Backend - banco e estrutura

- [x] Escolher schema oficial: TypeORM alinhado com `coopera.sql`.
- [x] Atualizar todas as entidades para o schema oficial.
- [x] Remover script legados obsoletos (`coopera2.sql`).
- [x] Revisar foreign keys e cascatas de remocao.

---

## 10. Frontend - ambiente e navegacao

- [x] Configurar `authenticatedFetch` e gerenciamento de token com Expo SecureStore.
- [x] Salvar `user_type` em qualquer fluxo que autentique automaticamente.
- [x] Organizar navegacao no `_layout.tsx` e redirecionamento de sessao expirada.

---

## 11. Frontend - autenticacao e API

- [x] Usar somente o endpoint oficial de login (`/auth/login`).
- [x] Salvar token e tipo de usuario depois do primeiro acesso e login.
- [x] Fazer `authenticatedFetch` tratar `401`, apagar sessao e redirecionar para a tela inicial.
- [x] Exibir mensagens do backend de forma consistente através do `FeedbackModal`.

---

## 12. Frontend - cadastro, login e formularios

### Cadastro de empresa & Funcionario

- [x] Formularios com validacao de CNPJ/CPF, e-mail e senha.
- [x] Integracao com o `FeedbackModal` exibindo mensagens claras e codigos de ativacao/credenciais em desenvolvimento.

---

## 13. Frontend - dashboard e tarefas

- [x] Consumir dashboard da empresa ja filtrado pelo backend (`/dashboard/company` e `/tasks/company-tasks`).
- [x] Exibir seções retráteis para:
  - **Tarefas Urgentes**
  - **Outras Tarefas**
  - **Tarefas Pendentes** (tarefas vencidas ou com status pendente)
  - **Tarefas Concluídas** (tarefas finalizadas com estilo tachado e indicador de check-done)
- [x] Garantir botão **único** de confirmação por item de tarefa.
- [x] Atualizar dashboard e estado local imediatamente ao concluir tarefa (+100 pontos e transicao fluida).

---

## 14. Frontend - chat

- [x] Chat 100% funcional integrado ao backend (`/chat/contacts`, `/chat/conversations`, `/chat/message`).
- [x] Suporte a envio e recebimento de mensagens em tempo real entre colaboradores e administradores.

---

## Conclusão e Próximos Passos Recomendados

### Conquistas Recentes:
1. **Unificação de Código e Resolução de Conflitos**: Código sincronizado com o repositório remoto (GitHub) mantendo todas as funcionalidades locais e remotas unificadas e sem quebras de sintaxe.
2. **Suíte de Testes Unitários**: Configurada infraestrutura de testes unitários com Jest no NestJS (`TasksService` e `ChatService`), obtendo **100% de testes aprovados**.
3. **Módulo de Tarefas Completo**: Implementados os cards de Tarefas Urgentes, Outras Tarefas, Tarefas Pendentes e Tarefas Concluídas com transição fluida e botão único de conclusão.
4. **Chat Integrado**: Módulo de chat em tempo real conectado com endpoints NestJS.

### Próximos Passos (Backlog Secundário):
1. **Módulo de Reuniões**: Finalizar o fluxo de aceite/recusa e agendamento de reuniões entre empresa e colaboradores.
2. **Histórico Médico / Ocorrências**: Finalizar os formulários de registros médicos e anexos caso permaneçam no escopo final do TCC.
