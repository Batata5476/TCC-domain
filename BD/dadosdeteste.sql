--inserindo dados de teste
--Empresas
INSERT INTO INFO_EMPRESA(cnpj_empresa, nome_empresa, email_empresa, tipo_empresa, senha_empresa)
VALUES
	('99888777000100','Empresa Teste','admin@teste.com','Serviços', '$2b$10$pmlLu/WwkrAYupISxCI/0ucWdK.7OSvKHTKLEU/B8b9dz5c6y.6k.'),
	('12345678000190','TechNova Soluções','contato@technova.com','Tecnologia', '$2b$10$pmlLu/WwkrAYupISxCI/0ucWdK.7OSvKHTKLEU/B8b9dz5c6y.6k.');

SELECT * FROM INFO_EMPRESA;

--setor
INSERT INTO SETOR(nome_setor)
VALUES
	('Desenvolvimento'),
	('Recursos humanos'),
	('Vendas'),
	('Marketing');
SELECT * FROM SETOR;

--Cargo

INSERT INTO CARGO(nome_cargo)
VALUES
	('Desenvolvedor Junior'),
	('Gerente de projetos'),
	('Analista de recrutamento'),
	('Consultor de vendas');
SELECT * FROM CARGO;

--funcionarios
INSERT INTO INFO_FUNCIONARIO
(nome_func, email_func, cpf_func, senha_func, pontos_acumulados, fk_cod_empresa, fk_id_setor, fk_id_cargo)
VALUES
('Funcionario Teste', 'func@teste.com', '12345678900', '$2b$10$pmlLu/WwkrAYupISxCI/0ucWdK.7OSvKHTKLEU/B8b9dz5c6y.6k.', 0, 1, 1, 1),
('Ana Silva', 'ana@technova.com', '3763483472423', '$2b$10$pmlLu/WwkrAYupISxCI/0ucWdK.7OSvKHTKLEU/B8b9dz5c6y.6k.', 0, 1, 1, 1);

SELECT * FROM vw_funcionario_completo;--view

--tarefas
INSERT INTO TAREFAS
(validade_tarefa, tipo_tarefa, prioridade_tarefa, status_tarefa)
VALUES
('2026-05-10', 'Desenvolvimento API', 1, 2),
('2026-05-12', 'Revisão de código', 2, 3);

INSERT INTO FUNC_TAREFA (fk_id_func, fk_id_tarefa, fk_cod_empresa)
VALUES
(10,1,1),
(11,2,1);

UPDATE TAREFAS
SET status_tarefa = 1
WHERE pk_id_tarefas = 1;

SELECT nome_func, pontos_acumulados
FROM INFO_FUNCIONARIO;

SELECT * FROM vw_tarefas;--view
--Recompensas
INSERT INTO RECOMPENSAS(nome_recompensa, desc_recompensa, valor_recomp, fk_id_tarefa)
VALUES
	('Vale Café', 'Um cupom para café grátis na copa', '100', '1'),
	('Folga Meio Período', 'Saída antecipada na sexta-feira', '200', '2');
SELECT * FROM RECOMPENSAS;

--humor_func
INSERT INTO HUMOR_FUNC(humor_func, dth_humor, fk_id_func)
VALUES
	('5', '2026-05-03 09:00:00-03', '10'),
	('2', '2026-05-03 08:30:00-03', '11');
SELECT * FROM vw_humor_func;--view

--reunião
INSERT INTO REUNIAO(data_reuniao, horario_reuniao, assunto_reuniao, tipo_reuniao)
VALUES
	('2026-05-04', '14:00:00', 'Sprint Review', 'empresarial'),
	('2026-05-06', '10:00:00', 'Feedback Coletivo', 'bem-estar');
SELECT * FROM REUNIAO;

--inserir dados para testar as funções/triggers
--função/trigger de calcular horas trabalhadas
INSERT INTO CARGA_HORARIA (horas_diarias, entrada_padrao, saida_padrao, tempo_intervalo, fk_id_func)
VALUES
('08:00:00', '08:00:00', '17:00:00', '01:00:00', 10),
('08:00:00', '08:00:00', '17:00:00', '01:00:00', 11);

select * from CARGA_HORARIA;

--Teste para marcar os pontos de entrada e saida
--se tiver trabalhado a quantidade exata
INSERT INTO ENTRADA_SAIDA (entrada, saida, data_ponto, total_dia, fk_id_func)
VALUES
('08:00:00', '17:00:00', '2026-05-06', '00:00:00', 10);

--se tiver trabalhado uma hora a mais
INSERT INTO ENTRADA_SAIDA (entrada, saida, data_ponto, total_dia, fk_id_func)
VALUES
('08:00:00', '18:00:00', '2026-05-07', '00:00:00', 10);

--se tiver trabalhado uma hroa a menos
INSERT INTO ENTRADA_SAIDA (entrada, saida, data_ponto, total_dia, fk_id_func)
VALUES
('08:00:00', '16:00:00', '2026-05-08', '00:00:00', 10);

--teste com outro funcionario
INSERT INTO ENTRADA_SAIDA (entrada, saida, data_ponto, total_dia, fk_id_func)
VALUES
('08:00:00', '19:00:00', '2026-05-06', '00:00:00', 11);

select * from ENTRADA_SAIDA;

--verificar o banco de horas
SELECT * FROM BANCO_HORAS;

--participantes_reu
INSERT INTO PARTICIPANTES_REU (fk_id_reuniao, fk_id_func)
VALUES
(1, 10),
(1, 11),
(2, 10);

SELECT * FROM PARTICIPANTES_REU;

--his_medico
INSERT INTO HIS_MEDICO (atestado_func, ocorrencias, fk_id_func)
VALUES
('Atestado 2 dias', 'Gripe', 10),
('Atestado 1 dia', 'Dor de cabeça', 11);

SELECT * FROM HIS_MEDICO;

--chats
INSERT INTO CHATS (tipo_chat, fk_cod_empresa)
VALUES
('em grupo', 1),
('em dupla', 1);

SELECT * FROM CHATS;

--Midias
INSERT INTO MIDIA (nome_midia, tipo_midia, tamanho_midia)
VALUES
('relatorio.pdf', 'pdf', '2MB'),
('imagem.png', 'png', '500KB');

SELECT * FROM MIDIA;

--participantes_conversa
INSERT INTO PARTICIPANTES_CONVERSAS (fk_id_chat, fk_id_func)
VALUES
(1, 10),
(1, 11),
(2, 10),
(2, 11);

SELECT * FROM PARTICIPANTES_CONVERSAS;

--Mensagens
INSERT INTO MENSAGENS (conteudo_mensagens, data_envio, fk_id_chat, fk_id_func, fk_id_midia)
VALUES
('Bom dia equipe!', NOW(), 1, 10, 1),
('Segue o relatório', NOW(), 1, 11, 1),
('Oi, tudo bem?', NOW(), 2, 10, 2),
('Tudo sim!', NOW(), 2, 11, 2);

SELECT * FROM MENSAGENS;

--Teste de resagte de recompensas
SELECT fun_resgatar_recompensa(10, 1);
