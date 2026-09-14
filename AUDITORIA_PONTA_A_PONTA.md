# Auditoria Ponta a Ponta - TCC Coopera

> Data da auditoria: 06/09/2026
> Escopo: backend, frontend e integracao entre os dois.
> Fora do escopo: testes automatizados e roteiro de QA.
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
- [ ] Substituir e-mail simulado por integracao real ou restringir claramente ao ambiente de desenvolvimento.
- [x] Remover codigos e segredos dos detalhes de auditoria.
- [] Aplicar no cadastro de empresa a mesma politica de senha usada no primeiro acesso.
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

- [ ] Alinhar `CreateCompanyDto` com o payload usado pela tela de cadastro.
- [ ] Normalizar nome e e-mail antes de comparar duplicidade e salvar.
- [ ] Definir exclusao logica ou cascata transacional para empresa.
- [ ] Impedir que `remove()` quebre foreign keys de usuarios, tarefas, humor, reunioes e auditoria.
- [ ] Revisar rotas de empresa existentes mas nao consumidas pelo frontend.
- [ ] Garantir que criacao da empresa e usuario master seja atomica.

### Usuarios

- [ ] Alinhar DTO, entity e formulario com uma unica nomenclatura de campos.
- [ ] Definir se cargo sera texto ou relacao por ID.
- [ ] Trocar `setorId` digitado manualmente por selecao de setores validos da empresa.
- [ ] Validar que setor e cargo pertencem a empresa atual.
- [ ] Normalizar CPF e e-mail antes de checar duplicidade.
- [ ] Impedir retorno de senha, token ou outros dados sensiveis nas listagens.
- [ ] Confirmar os campos aceitos no PATCH de usuario (`foto`, `foto_func`, telefone e demais dados).

### Dashboard

- [ ] Filtrar total de tarefas por funcionarios da empresa do token.
- [ ] Filtrar tarefas pendentes e concluidas por empresa.
- [ ] Filtrar media, ultimo registro e total de humor por empresa.
- [ ] Retornar no `/dashboard/user` CPF, telefone, cargo e setor, pois as telas de perfil esperam esses campos.
- [ ] Padronizar resposta do dashboard da empresa para o mesmo formato usado pelos demais endpoints.
- [ ] Definir resposta correta para administrador master no dashboard de usuario.
- [ ] Diferenciar estado vazio de sessao invalida no frontend.

---

## 4. Backend - tarefas

- [ ] Restringir DTO de status aos estados validos do sistema.
- [ ] Validar estados `1`, `2`, `3` e qualquer outro estado realmente suportado pelo banco.
- [ ] Centralizar validacao das transicoes de status.
- [ ] Confirmar se funcionario pode criar tarefa para si mesmo e documentar essa regra.
- [ ] Garantir que empresa atribua tarefa somente a funcionario da propria empresa.
- [ ] Garantir que funcionario liste e altere somente tarefas associadas a ele.
- [ ] Definir cascata ou remocao da associacao em `FUNC_TAREFA` ao apagar tarefa.
- [ ] Definir se validade e `DATE` ou `TIMESTAMP` e remover conversoes duplicadas de fuso horario.
- [ ] Remover pontos fixos se a pontuacao depender de regra real de negocio.
- [ ] Salvar tarefa e associacao em transacao unica.

---

## 5. Backend - chat

- [ ] Corrigir validacao de participante conforme o JWT oficial.
- [ ] Criar endpoint para listar contatos da empresa.
- [ ] Criar endpoint para criar conversa.
- [ ] Criar endpoint para adicionar e remover participantes.
- [ ] Definir se administrador pode participar de conversas.
- [ ] Validar que todos os participantes pertencem a mesma empresa.
- [ ] Ordenar mensagens por data crescente dentro da conversa.
- [ ] Implementar leitura e nao lidas se isso permanecer no escopo.
- [ ] Implementar midias ou retirar `fk_id_midia` da interface.
- [ ] Nao deixar API depender de chats criados manualmente fora da aplicacao.

---

## 6. Backend - reunioes

- [ ] Separar solicitacao de reuniao feita por funcionario da criacao administrativa.
- [ ] Permitir solicitacao sem participantes obrigatorios, caso essa seja a regra do produto.
- [ ] Criar fluxo de aceitar, recusar e agendar solicitacoes.
- [ ] Implementar selecao de participantes para criacao administrativa.
- [ ] Validar que participantes pertencem a mesma empresa.
- [ ] Validar data e horario no DTO e no service.
- [ ] Definir estados, cancelamento e alteracao de reuniao.
- [ ] Criar listagem para as telas que exibem ou solicitam reunioes.

---

## 7. Backend - bem-estar e ocorrencias

### Bem-estar

- [ ] Conectar endpoint de humor ao fluxo real.
- [ ] Aplicar regra de um registro por dia, se essa for a regra do produto.
- [ ] Garantir que funcionario registre somente o proprio humor.
- [ ] Garantir que administrador consulte somente dados da propria empresa.
- [ ] Definir como a pontuacao e calculada; nao depender de trigger SQL nao documentado.
- [ ] Criar historico se a interface exibir historico.

### Ocorrencias e registros medicos

- [ ] Alinhar `pk_id_his_medico` do backend com o campo `id` usado no frontend.
- [ ] Corrigir edicao e remocao usando o identificador real.
- [ ] Revisar protecao de dados medicos sensiveis.
- [ ] Garantir que funcionario veja somente seus registros.
- [ ] Garantir que administrador veja somente registros de sua empresa.
- [ ] Validar campos obrigatorios, datas e anexos.
- [ ] Conectar a tela de ocorrencias aos endpoints reais.

---

## 8. Backend - ponto, jornada e dados trabalhistas

- [ ] Definir se `work` cobre ponto, salario, carga horaria, folgas e banco de horas.
- [ ] Criar entidades e endpoints para salario se ele permanecer na interface.
- [ ] Criar entidades e endpoints para carga horaria se ela permanecer na interface.
- [ ] Criar entidades e endpoints para folgas e banco de horas se forem exibidos.
- [ ] Calcular `total_dia` a partir de entrada e saida; hoje o service inicia com `00:00:00`.
- [ ] Validar horarios, saida ausente e virada de dia.
- [ ] Garantir que funcionario altere somente seus registros.
- [ ] Garantir que administrador consulte somente registros da propria empresa.
- [ ] Remover do frontend qualquer informacao que o backend ainda nao forneca.

---

## 9. Backend - banco e estrutura

- [ ] Escolher schema oficial: entities atuais (`empresa`, `usuario`) ou SQL legado (`INFO_EMPRESA`, `INFO_FUNCIONARIO`).
- [ ] Atualizar todas as entities para o schema escolhido.
- [ ] Atualizar `BD/coopera.sql`, `BD/coopera2.sql` e seeds para o mesmo contrato.
- [ ] Revisar colunas `cnpj`, `nome`, `empresa_id`, `fk_cod_empresa` e equivalentes antigos.
- [ ] Revisar foreign keys, tabelas de associacao e cascatas.
- [ ] Substituir `synchronize: true` por migrations antes da entrega.
- [ ] Garantir que um banco novo seja criado sem depender de passos manuais ocultos.
- [ ] Documentar ou retirar scripts de `scratch` e diagnostico.
- [ ] Garantir que entidades e SQL usem exatamente os mesmos nomes de tabelas.

---

## 10. Frontend - ambiente e navegacao

- [ ] Trocar `API_URL` fixa por configuracao para web, emulador e celular fisico.
- [ ] Remover dependencias de IP local fixo do codigo e da documentacao.
- [ ] Definir uma unica tela oficial de login; as telas `loginEmpresa.tsx` e `loginFuncionario.tsx` sao legadas.
- [ ] Remover ou corrigir `inserirTokenEmpresa.tsx`, que aceita texto sem validar JWT.
- [ ] Salvar `user_type` em qualquer fluxo que autentique automaticamente.
- [ ] Organizar no `_layout.tsx` somente as telas realmente usadas.
- [ ] Adicionar navegacao real para `bemEstar.tsx` ou retirar a tela do produto.
- [ ] Corrigir voltar, logout e sessao expirada para sempre retornar ao login.
- [ ] Remover telas sem uso ou identifica-las como fluxo legado.

---

## 11. Frontend - autenticacao e API

- [ ] Usar somente o endpoint oficial de login (`/auth/login`).
- [ ] Salvar token e tipo de usuario depois do primeiro acesso.
- [ ] Fazer `authenticatedFetch` tratar `401`, apagar sessao e redirecionar.
- [ ] Padronizar respostas `{ status, data }` e respostas diretas.
- [ ] Exibir mensagens do backend de forma consistente.
- [ ] Bloquear botoes enquanto a requisicao estiver em andamento.
- [ ] Definir timeout e mensagem para API indisponivel.
- [ ] Remover chamadas antigas para endpoints descontinuados.
- [ ] Centralizar `Content-Type`, JSON e headers.

---

## 12. Frontend - cadastro, login e formularios

### Cadastro de empresa

- [ ] Enviar exatamente `nome`, `cnpj`, `email`, `tipo_empresa` e `senha_empresa`.
- [ ] Aplicar mascara de CNPJ e remover pontuacao antes do envio.
- [ ] Validar formato e quantidade de digitos do CNPJ.
- [ ] Validar nome, tipo, e-mail e senha antes do envio.
- [ ] Aplicar a politica completa de senha do backend.
- [ ] Mostrar conflitos de CNPJ e e-mail com mensagens especificas.
- [ ] Desabilitar o botao durante o envio.

### Cadastro de funcionario

- [ ] Validar CPF com digitos verificadores.
- [ ] Aplicar mascara de CPF.
- [ ] Validar e-mail antes do envio.
- [ ] Trocar `setorId` digitado por selecao de setores reais.
- [ ] Definir cargo como texto ou selecao de cargo real.
- [ ] Nao exibir credenciais em tela fora de desenvolvimento.
- [ ] Definir canal seguro para codigo e token de ativacao.
- [ ] Nao prometer e-mail quando o backend apenas grava log.
- [ ] Padronizar role e permissoes com o backend.

### Login e senha

- [ ] Validar formato do identificador usado.
- [ ] Bloquear campos vazios ou com espacos.
- [ ] Padronizar regras e exibicao de senha.
- [ ] Diferenciar credencial invalida, conta bloqueada e primeiro acesso.
- [ ] Fazer recuperacao de senha usar fluxo seguro e consistente.

---

## 13. Frontend - dashboard e tarefas

- [ ] Consumir dashboard da empresa ja filtrado pelo backend.
- [ ] Ajustar tratamento ao formato definitivo de `/dashboard/company`.
- [ ] Exibir cargo e setor somente quando vierem de dados reais.
- [ ] Tratar estado vazio sem redirecionar como se fosse `401`.
- [ ] Atualizar dashboard apos criar ou alterar tarefa sem requisicoes duplicadas.
- [ ] Carregar funcionarios por endpoint real.
- [ ] Trocar IDs digitados por selecao de funcionario com nome.
- [ ] Garantir data e fuso corretos na criacao de tarefa.
- [ ] Exibir todos os status suportados pelo backend.
- [ ] Bloquear no frontend transicoes invalidas.
- [ ] Mostrar detalhes do erro retornado pela API.
- [ ] Garantir que funcionario veja somente tarefas proprias.

---

## 14. Frontend - perfil, foto e pontuacao

- [ ] Alinhar tipos das telas de perfil com a resposta real do dashboard.
- [ ] Incluir CPF, telefone, cargo e setor na API ou remover a expectativa da tela.
- [ ] Padronizar `foto` e `foto_func` em um unico contrato.
- [ ] Validar tamanho e tipo da imagem antes do base64.
- [ ] Evitar payloads de imagem grandes; avaliar upload adequado.
- [ ] Confirmar persistencia recarregando a foto pelo backend.
- [ ] Reverter preview local se upload falhar.
- [ ] Garantir isolamento da foto por usuario.
- [ ] Conectar pontuacao a regra e endpoint reais ou identificar como demonstracao.
- [ ] Remover switches que mudam somente estado local.

---

## 15. Frontend - reunioes, bem-estar e dados trabalhistas

### Reunioes

- [ ] Corrigir payload do `PerfilMeetingModal` conforme regra definitiva.
- [ ] Implementar selecao de participantes ou alterar backend para solicitacao.
- [ ] Nao mostrar sucesso de solicitacao se a API cria somente reuniao administrativa.
- [ ] Validar data e horario com controles apropriados.
- [ ] Exibir reunioes salvas e seus estados se fizer parte do escopo.

### Bem-estar

- [ ] Enviar humor selecionado para o endpoint real.
- [ ] Exibir loading e erro ao salvar.
- [ ] Tratar segundo registro no mesmo dia.
- [ ] Carregar historico se a tela o exibir.
- [ ] Conectar `bemEstar.tsx` ao fluxo principal.
- [ ] Substituir `Card Content` por dados reais ou remover os cards.

### Dados trabalhistas

- [ ] Remover salario fixo `R$ 2.500,00` ou buscar dado real.
- [ ] Remover data/hora local apresentada como carga horaria trabalhada.
- [ ] Remover folga fixa ou buscar dado real.
- [ ] Conectar a tela ao modulo `work` quando o contrato existir.
- [ ] Informar claramente quando um dado ainda nao estiver disponivel.

---

## 16. Frontend - chat

- [ ] Decidir se o chat sera funcional ou demonstrativo.
- [ ] Se funcional, remover `INITIAL_CHATS` e carregar conversas reais.
- [ ] Se funcional, remover `AUTO_RESPONSES` e enviar mensagens ao backend.
- [ ] Se funcional, criar conversa e participantes pela interface.
- [ ] Se funcional, atualizar mensagens sem depender apenas de estado local.
- [ ] Se funcional, implementar mensagens, midias e nao lidas conforme escopo.
- [ ] Se demonstrativo, identificar a tela claramente como demonstracao.
- [ ] Alinhar permissao de administrador e funcionario com o backend.

---

## 17. Integracao por fluxo

### Fluxo da empresa

- [ ] Cadastro envia payload aceito pelo DTO.
- [ ] Backend cria empresa e usuario master de forma atomica.
- [ ] Login retorna token e tipo de sessao consistentes.
- [ ] Dashboard mostra somente dados da empresa atual.
- [ ] Cadastro de funcionario usa setor e cargo validos.

### Fluxo do funcionario

- [ ] Empresa cria funcionario e entrega credenciais por canal definido.
- [ ] Primeiro acesso valida codigo e token corretos.
- [ ] Ativacao salva token e tipo no frontend.
- [ ] Login abre dashboard correto.
- [ ] Perfil retorna dados completos.
- [ ] Tarefas pertencem ao usuario autenticado.

### Isolamento de dados

- [ ] Nenhum dashboard retorna dados de outra empresa.
- [ ] Funcionario nao acessa tarefa, humor, ponto ou registro medico de outro funcionario.
- [ ] Administrador nao acessa dados de outra empresa.
- [ ] Chat e reunioes respeitam empresa e participantes autorizados.

---

## 18. Ordem recomendada das alteracoes

1. [ ] Definir schema oficial do banco e contrato oficial do JWT.
2. [ ] Corrigir cadastro de empresa e configuracao da API.
3. [ ] Corrigir isolamento do dashboard e autorizacao.
4. [ ] Corrigir cadastro de funcionario, primeiro acesso e credenciais.
5. [ ] Corrigir dashboard, tarefas e perfil com campos reais.
6. [ ] Corrigir o modelo de reunioes.
7. [ ] Conectar bem-estar, ocorrencias e dados trabalhistas ou retirar dados ficticios.
8. [ ] Decidir escopo do chat e alinhar os dois lados.
9. [ ] Padronizar erros, loading, sessao e navegacao.
10. [ ] Atualizar documentacao somente depois das alteracoes reais.

---

## Criterio de conclusao

Marcar um item somente quando o codigo correspondente tiver sido alterado e o contrato entre frontend, backend e banco estiver alinhado. Tela criada, endpoint existente ou texto na documentacao nao significam funcionalidade concluida.
