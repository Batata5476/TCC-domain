CREATE DATABASE COOPERA;

CREATE TABLE INFO_EMPRESA(
pk_id_empresa SERIAL PRIMARY KEY,--Serial gera números automaticos(autoincremento)
cnpj_empresa VARCHAR(18) UNIQUE NOT NULL,
nome_empresa VARCHAR(50) NOT NULL,
email_empresa VARCHAR(50) UNIQUE NOT NULL,
tipo_empresa VARCHAR(50) NOT NULL,
senha_empresa VARCHAR(15) NOT NULL
);

CREATE TABLE SETOR(
pk_id_setor SERIAL PRIMARY KEY,
nome_setor VARCHAR(30) NOT NULL
);

CREATE TABLE CARGO(
pk_id_cargo SERIAL PRIMARY KEY,
nome_cargo VARCHAR(30) NOT NULL	
);

CREATE TABLE TAREFAS(
pk_id_tarefas SERIAL PRIMARY KEY,
validade_tarefa DATE NOT NULL,
tipo_tarefa VARCHAR(30) NOT NULL,
prioridade_tarefa INT NOT NULL, --1 para urgente e 2 para normal
status_tarefa INT NOT NULL --1 para concluida,2 para em andamento,3 para pendente e 4 para cancelada
);

CREATE TABLE RECOMPENSAS(
pk_id_recompensa SERIAL PRIMARY KEY,
nome_recompensa VARCHAR(30) NOT NULL,
desc_recompensa VARCHAR(100) NOT NULL, 
valor_recomp INT NOT NULL, --valor é ou 100 pontos ou 200 pontos
--chave fk
fk_id_tarefa INT NOT NULL,

CONSTRAINT fk_tarefa FOREIGN KEY (fk_id_tarefa)
	REFERENCES TAREFAS(pk_id_tarefas)
);



CREATE TABLE REUNIAO(
pk_id_reuniao SERIAL PRIMARY KEY,
data_reuniao DATE NOT NULL,
horario_reuniao TIME NOT NULL,
assunto_reuniao VARCHAR(100) NOT NULL,
tipo_reuniao VARCHAR(30) NOT NULL --Ou empresarial ou bem-estar
);

CREATE TABLE INFO_FUNCIONARIO(
pk_id_func SERIAL PRIMARY KEY,
nome_func VARCHAR(50) NOT NULL,
cpf_func VARCHAR(14) UNIQUE NOT NULL,
email_func VARCHAR(50) UNIQUE NOT NULL,
pontos_acumulados INT NOT NULL, --começa em 0 e aumenta conforme o funcionario ganha pontos e diminui conforme ele resgata as recompensas
foto_func VARCHAR(100), --Armazena a URL ou o caminho do diretório onde a foto de perfil do funcionário está localizada
senha_func VARCHAR(15) NOT NULL,
--chaves fk
fk_id_empresa INT NOT NULL,
fk_id_setor INT NOT NULL,
fk_id_cargo INT NOT NULL,

CONSTRAINT fk_empresa FOREIGN KEY (fk_id_empresa)  
        REFERENCES INFO_EMPRESA (pk_id_empresa) ON DELETE CASCADE, --Se a empresa for apagada todos os funcionarios também são apagados automaticamente

CONSTRAINT fk_setor FOREIGN KEY (fk_id_setor) 
        REFERENCES SETOR(pk_id_setor),
        
    CONSTRAINT fk_cargo FOREIGN KEY (fk_id_cargo) 
        REFERENCES CARGO(pk_id_cargo)
);



CREATE TABLE FUNC_TAREFA(
pk_id_func_tarefa SERIAL PRIMARY KEY,
--chaves fk
fk_id_func INT NOT NULL,
fk_id_empresa INT NOT NULL,
fk_id_tarefa INT NOT NULL,

CONSTRAINT fk_funcionario FOREIGN KEY(fk_id_func)
	REFERENCES INFO_FUNCIONARIO(pk_id_func),

CONSTRAINT fk_empresa FOREIGN KEY (fk_id_empresa) 
        REFERENCES INFO_EMPRESA (pk_id_empresa),

CONSTRAINT fk_tarefa FOREIGN KEY(fk_id_tarefa)
	REFERENCES TAREFAS(pk_id_tarefas)
);

CREATE TABLE HIS_RECOMPENSAS(
pk_id_resgate SERIAL PRIMARY KEY,
data_resgate TIMESTAMPTZ NOT NULL,
--chave fk
fk_id_func INT NOT NULL, 
fk_id_recompensa INT NOT NULL,

CONSTRAINT fk_funcionario FOREIGN KEY(fk_id_func)
	REFERENCES INFO_FUNCIONARIO(pk_id_func),

CONSTRAINT fk_recompensas FOREIGN KEY(fk_id_recompensa)
	REFERENCES RECOMPENSAS(pk_id_recompensa)
);

CREATE TABLE PARTICIPANTES_REU(
pk_id_participantes_reu SERIAL PRIMARY KEY,
--chaves fk
fk_id_reuniao INT NOT NULL,
fk_id_func INT NOT NULL,

CONSTRAINT fk_reuniao FOREIGN KEY(fk_id_reuniao)
	REFERENCES REUNIAO(pk_id_reuniao),

CONSTRAINT fk_funcionario FOREIGN KEY(fk_id_func)
	REFERENCES INFO_FUNCIONARIO(pk_id_func)
);

CREATE TABLE HIS_MEDICO(
pk_id_his_medico SERIAL PRIMARY KEY,
atestado_func VARCHAR(255),
ocorrencias varchar(50),
--chave fk
fk_id_func INT NOT NULL,

CONSTRAINT fk_funcionario FOREIGN KEY(fk_id_func)
	REFERENCES INFO_FUNCIONARIO(pk_id_func)
);

CREATE TABLE HUMOR_FUNC(
pk_id_humor SERIAL PRIMARY KEY,
humor_func INT, --Vai ser medido de 1-5 cada número representa um humor
dth_humor TIMESTAMPTZ,
--Chave fk
fk_id_func INT NOT NULL,

CONSTRAINT fk_funcionario FOREIGN KEY(fk_id_func)
	REFERENCES INFO_FUNCIONARIO(pk_id_func)
);

CREATE TABLE CHATS(
pk_id_chat SERIAL PRIMARY KEY,
tipo_chat VARCHAR(8) NOT NULL,--Terá as opções "em grupo" e "em dupla"
--chave fk
fk_id_empresa INT NOT NULL,

CONSTRAINT fk_empresa FOREIGN KEY (fk_id_empresa) 
        REFERENCES INFO_EMPRESA (pk_id_empresa) ON DELETE CASCADE --Se a empresa for apagada todos os chat também são apagados automaticament

);

CREATE TABLE MIDIA(
pk_id_midia SERIAL PRIMARY KEY,
nome_midia VARCHAR(100) UNIQUE NOT NULL,--Armazena o nome real ou renomeado da midia
tipo_midia VARCHAR(20) NOT NULL,--png,pdf,etc
tamanho_midia VARCHAR(200) NOT NULL
);

CREATE TABLE PARTICIPANTES_CONVERSAS(
pk_id_participantes_conversa SERIAL PRIMARY KEY,
--chaves fk
fk_id_chat INT NOT NULL,
fk_id_func INT NOT NULL,

CONSTRAINT fk_chat FOREIGN KEY (fk_id_chat)
	REFERENCES CHATS(pk_id_chat),

CONSTRAINT fk_funcionario FOREIGN KEY(fk_id_func)
	REFERENCES INFO_FUNCIONARIO(pk_id_func)
);

CREATE TABLE MENSAGENS(
pk_id_mensagens SERIAL PRIMARY KEY,
conteudo_mensagens VARCHAR(200) NOT NULL,
data_envio TIMESTAMPTZ NOT NULL,
--chaves fk
fk_id_chat INT NOT NULL,
fk_id_func INT NOT NULL,
fk_id_midia INT NULL,

CONSTRAINT fk_chat FOREIGN KEY (fk_id_chat)
	REFERENCES CHATS(pk_id_chat),

CONSTRAINT fk_funcionario FOREIGN KEY(fk_id_func)
	REFERENCES INFO_FUNCIONARIO(pk_id_func),

CONSTRAINT fk_midia FOREIGN KEY(fk_id_midia)
	REFERENCES MIDIA(pk_id_midia)
);

CREATE TABLE ENTRADA_SAIDA(--tabela de marcar ponto
pk_id_ponto SERIAL PRIMARY KEY,
entrada TIME NOT NULL,
saida TIME NOT NULL,
data_ponto DATE NOT NULL,
total_dia DECIMAL(5,2) NOT NULL, --Cálculo automático: (hora_saida - hora_entrada) - tempo_intervalo. Representa a quantidade líquida de horas trabalhadas no dia
--chave fk
fk_id_func INT NOT NULL,

CONSTRAINT fk_funcionario FOREIGN KEY(fk_id_func)
	REFERENCES INFO_FUNCIONARIO(pk_id_func)
);

CREATE TABLE CARGA_HORARIA(
pk_id_carga SERIAL PRIMARY KEY,
horas_diarias TIME NOT NULL,--Horas diarias que o funiconario tem que trabalhar de acordo com o contraro.EX: 08.00.00h
entrada_padrao TIME NOT NULL, --Horario que o funcionario tem que entrar de acordo com o contarto.EX:08.00h
saida_padrao TIME NOT NULL, --Horario que o funcionario tem que sair de acordo com o contarto.Ex:17.00h
tempo_intervalo TIME NOT NULL, --Ex:01.00h
--chave fk
fk_id_func INT NOT NULL,

CONSTRAINT fk_funcionario FOREIGN KEY(fk_id_func)
	REFERENCES INFO_FUNCIONARIO(pk_id_func)

);

CREATE TABLE BANCO_HORAS(
pk_id_banco_horas SERIAL PRIMARY KEY,
saldo_acumulado DECIMAL(10,2) NOT NULL,--Soma total de horas 
data_atualizacao TIMESTAMPTZ NOT NULL,--Mostra quando foi feito o ultimo calculo/atualização
--chave fk
fk_id_func INT NOT NULL,

CONSTRAINT fk_funcionario FOREIGN KEY(fk_id_func)
	REFERENCES INFO_FUNCIONARIO(pk_id_func)

);

CREATE TABLE TOKENS_AUTENTICACAO (
pk_id_token SERIAL PRIMARY KEY,
token VARCHAR(255) NOT NULL UNIQUE,
data_geracao TIMESTAMPTZ NOT NULL DEFAULT NOW(),
data_expiracao TIMESTAMPTZ NOT NULL,
ativo BOOLEAN DEFAULT TRUE,
--chave fk
fk_id_func INT NOT NULL,

    CONSTRAINT fk_funcionario_token FOREIGN KEY (fk_id_func)
        REFERENCES INFO_FUNCIONARIO(pk_id_func)
        ON DELETE CASCADE
);


--atualizações importantes
-- Nível do humor de 1 a 5
ALTER TABLE HUMOR_FUNC 
ADD CONSTRAINT chk_humor_nivel CHECK (humor_func BETWEEN 1 AND 5);

-- Prioridades da tarefa: 1 (urgente) e 2 (normal) 
ALTER TABLE TAREFAS 
ADD CONSTRAINT chk_prioridade CHECK (prioridade_tarefa IN (1, 2));

-- Status da tarefa: 1 a 4
ALTER TABLE TAREFAS 
ADD CONSTRAINT chk_status CHECK (status_tarefa IN (1, 2, 3, 4));

-- Tipo de chat: 'em dupla' ou 'em grupo' 
ALTER TABLE CHATS 
ADD CONSTRAINT chk_tipo_chat CHECK (tipo_chat IN ('em dupla', 'em grupo'));

-- Tipo de reunião: 'bem-estar' ou 'empresarial' 
ALTER TABLE REUNIAO 
ADD CONSTRAINT chk_tipo_reuniao CHECK (tipo_reuniao IN ('bem-estar', 'empresarial'));

--codigo para que defina o que cada número é no status_tarefa
SELECT 
    pk_id_tarefas,
    CASE 
        WHEN status_tarefa = 1 THEN 'Concluída'
        WHEN status_tarefa = 2 THEN 'Em andamento'
        WHEN status_tarefa = 3 THEN 'Pendente'
        WHEN status_tarefa = 4 THEN 'Cancelada'
    END AS status_descritivo
FROM TAREFAS;
--Codigo para definir o que e cada número no prioridade tarefa
SELECT
	pK_id_tarefas,
	CASE
		WHEN prioridade_tarefa = 1 THEN 'Urgente'
		WHEN prioridade_tarefa = 2 THEN 'Normal'
	END AS prioridade_descritiva
FROM TAREFAS;
--codigo que define o qeu e cada numero no humor_func

SELECT
	pk_id_humor,
	CASE
		WHEN humor_func = 1 THEN 'Muito ruim'
		WHEN humor_func = 2 THEN 'Ruim'
		WHEN humor_func = 3 THEN 'Mediano'
		WHEN humor_func = 4 THEN 'Bom'
		WHEN humor_func = 5 THEN 'Muito bom'
	END AS humor_descritivo
FROM HUMOR_FUNC;

--views
--views das tarefas(status e prioridade)
CREATE VIEW vw_tarefas AS
SELECT 
    pk_id_tarefas,
    validade_tarefa,
    tipo_tarefa,

    CASE 
        WHEN prioridade_tarefa = 1 THEN 'Urgente'
        WHEN prioridade_tarefa = 2 THEN 'Normal'
    END AS prioridade,

    CASE 
        WHEN status_tarefa = 1 THEN 'Concluída'
        WHEN status_tarefa = 2 THEN 'Em andamento'
        WHEN status_tarefa = 3 THEN 'Pendente'
        WHEN status_tarefa = 4 THEN 'Cancelada'
    END AS status

FROM TAREFAS;

SELECT * FROM vw_tarefas;

--view do humor_func
CREATE VIEW vw_humor_func AS
SELECT
    pk_id_humor,
    fk_id_func,
    dth_humor,

    CASE
        WHEN humor_func = 1 THEN 'Muito ruim'
        WHEN humor_func = 2 THEN 'Ruim'
        WHEN humor_func = 3 THEN 'Mediano'
        WHEN humor_func = 4 THEN 'Bom'
        WHEN humor_func = 5 THEN 'Muito bom'
    END AS humor

FROM HUMOR_FUNC;

SELECT * FROM vw_humor_func;

--view do funcionario
CREATE OR REPLACE VIEW vw_funcionario_completo AS
SELECT
    f.pk_id_func,
    f.nome_func,
    f.email_func,
    f.pontos_acumulados,

    e.nome_empresa,
    s.nome_setor,
    c.nome_cargo

FROM INFO_FUNCIONARIO f

JOIN INFO_EMPRESA e 
    ON f.fk_id_empresa = e.pk_id_empresa

JOIN SETOR s 
    ON f.fk_id_setor = s.pk_id_setor

JOIN CARGO c 
    ON f.fk_id_cargo = c.pk_id_cargo;

SELECT * FROM vw_funcionario_completo;

-- funções
--função para somar pontos
CREATE OR REPLACE FUNCTION fun_somar_pontos()
RETURNS TRIGGER AS $$
BEGIN
    -- Só soma pontos se mudou para concluída (representada pelo número 1)
    IF NEW.status_tarefa = 1 AND (OLD.status_tarefa IS NULL OR OLD.status_tarefa <> 1) THEN
        
        UPDATE INFO_FUNCIONARIO 
        SET pontos_acumulados = COALESCE(pontos_acumulados, 0) + 100
        WHERE pk_id_func IN (
            SELECT fk_id_func 
            FROM FUNC_TAREFA 
            WHERE fk_id_tarefa = NEW.pk_id_tarefas 
        );
        
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_concluir_tarefa ON TAREFAS;

CREATE TRIGGER trg_concluir_tarefa
AFTER UPDATE ON TAREFAS
FOR EACH ROW
EXECUTE FUNCTION fun_somar_pontos();

--função para resgatar recompensa
CREATE OR REPLACE FUNCTION fun_resgatar_recompensa(p_id_func INT, p_id_recompensa INT)
RETURNS TEXT AS $$
DECLARE
    v_pontos_atuais INT;
    v_custo_recompensa INT;
BEGIN
    -- Busca os pontos do funcionário
    SELECT pontos_acumulados INTO v_pontos_atuais 
    FROM INFO_FUNCIONARIO 
    WHERE pk_id_func = p_id_func;

    -- Busca o valor da recompensa(custo)
    SELECT valor_recomp INTO v_custo_recompensa 
    FROM RECOMPENSAS 
    WHERE pk_id_recompensa = p_id_recompensa;

    -- Validação de saldo
    IF COALESCE(v_pontos_atuais, 0) < v_custo_recompensa THEN
        RAISE EXCEPTION 
        'Saldo insuficiente! Você possui % pontos, mas a recompensa custa %.', 
        v_pontos_atuais, v_custo_recompensa;
    END IF;

    -- Subtrai pontos
    UPDATE INFO_FUNCIONARIO 
    SET pontos_acumulados = pontos_acumulados - v_custo_recompensa
    WHERE pk_id_func = p_id_func;

    -- Registra histórico
    INSERT INTO HIS_RECOMPENSAS (data_resgate, fk_id_func, fk_id_recompensa)
    VALUES (NOW(), p_id_func, p_id_recompensa);

    RETURN 'Resgate realizado com sucesso!';
END;
$$ LANGUAGE plpgsql;

--função para calcular a quantidade total de horas trabalhadas no dia
CREATE OR REPLACE FUNCTION fun_calcular_total_dia()
RETURNS TRIGGER AS $$
DECLARE
    v_intervalo TIME;
BEGIN
    -- Busca o tempo de intervalo do funcionário
    SELECT tempo_intervalo 
    INTO v_intervalo
    FROM CARGA_HORARIA
    WHERE fk_id_func = NEW.fk_id_func;

    -- Calcula total do dia
   NEW.total_dia := EXTRACT(EPOCH FROM ((NEW.saida - NEW.entrada) - v_intervalo)) / 3600;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_calcular_total_dia ON ENTRADA_SAIDA;

CREATE TRIGGER trg_calcular_total_dia
BEFORE INSERT OR UPDATE ON ENTRADA_SAIDA
FOR EACH ROW
EXECUTE FUNCTION fun_calcular_total_dia();

--função do banco de horas
CREATE OR REPLACE FUNCTION fun_atualizar_banco_horas()
RETURNS TRIGGER AS $$
DECLARE
    v_horas_diarias TIME;
    v_saldo_atual DECIMAL(10,2);
    v_diferenca INTERVAL;
BEGIN
    -- Busca carga horária
    SELECT horas_diarias 
    INTO v_horas_diarias
    FROM CARGA_HORARIA
    WHERE fk_id_func = NEW.fk_id_func;

    -- Calcula diferença
    v_diferenca := NEW.total_dia - (EXTRACT(EPOCH FROM v_horas_diarias) / 3600);

    -- Tenta pegar saldo atual
    SELECT saldo_acumulado 
    INTO v_saldo_atual
    FROM BANCO_HORAS
    WHERE fk_id_func = NEW.fk_id_func;

    -- Se não encontrou registro faz insert
    IF NOT FOUND THEN
        INSERT INTO BANCO_HORAS (saldo_acumulado, data_atualizacao, fk_id_func)
        VALUES (EXTRACT(EPOCH FROM v_diferenca)/3600, NOW(), NEW.fk_id_func);
    ELSE
        UPDATE BANCO_HORAS
        SET saldo_acumulado = saldo_acumulado + (EXTRACT(EPOCH FROM v_diferenca)/3600),
            data_atualizacao = NOW()
        WHERE fk_id_func = NEW.fk_id_func;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
