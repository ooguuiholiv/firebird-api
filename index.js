import express from "express";
import { queryFirebird } from "./db.js";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();

const corsOptions = {
  origin: [
    "https://control.mbaconstrutora.cloud",
    "https://app.bubble.io",
    "https://bubble.io/apiservice/doapicallfromserver",
    "https://api.segment.io/v1/t",
    "https://api.sprig.com/sdk/1/visitors/0a91641e-112b-4a53-9ab2-67e7d6300b07/events",
    "https://api.segment.io/v1/m",
  ],
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.set("trust proxy", true);

app.use(cors(corsOptions));
app.use(express.json());

const allowedOrigin = [
  "https://bubble.io/apiservice/doapicallfromserver",
  "https://control.mbaconstrutora.cloud",
  "https://app.bubble.io",
  "https://api.segment.io/v1/t",
  "https://api.sprig.com/sdk/1/visitors/0a91641e-112b-4a53-9ab2-67e7d6300b07/events",
  "https://api.segment.io/v1/m",
];

app.use((req, res, next) => {
  const requestOrigin = req.get("origin");
  if (!allowedOrigin.includes(requestOrigin)) {
    console.warn(
      `Bloqueado acesso não autorizado. Origin recebido: "${requestOrigin}". Referer: "${req.get(
        "referer"
      )}". IP: ${req.ip}`
    );
    return res.status(403).json({ error: "Acesso não autorizado." });
  }

  next();
});

app.get("/clientes", async (req, res) => {
  const sql = `
    SELECT DISTINCT
      fcfo.nomefantasia,
      fcfo.cgccfo as CNPJ_CLIENTE
    FROM TMOV
    LEFT JOIN FCFO ON TMOV.CODCFO = FCFO.CODCFO
    WHERE TMOV.CODTMV = '2.2.13';
  `;

  console.log(`Rota /clientes acessada. Origin: ${req.get("origin")}`); 
  try {
    const dados = await queryFirebird(sql);
    res.json(dados.length ? dados : { message: "Nenhum cliente encontrado." });
  } catch (err) {
    console.error("Erro em /clientes:", err.message);
    res
      .status(500)
      .json({ error: "Erro ao consultar banco.", details: err.message });
  }
});


app.get("/alertas", async (req, res) => {
  const sql = `
    SELECT GCOMPROMISSO.DESCRICAO, GAGENDACOMPROMISSO.DATA  FROM GAGENDACOMPROMISSO
    LEFT JOIN GCOMPROMISSO ON GAGENDACOMPROMISSO.IDCOMPROMISSO = GCOMPROMISSO.IDCOMPROMISSO;
  `;

  console.log(`Rota /alertas acessada. Origin: ${req.get("origin")}`);
  try {
    const dados = await queryFirebird(sql);
    res.json(dados.length ? {dados} : { message: "Nenhum alerta encontrado." });
  } catch (err) {
    console.error("Erro em /alertas:", err.message);
    res
      .status(500)
      .json({ error: "Erro ao consultar banco.", details: err.message });
  }
});


app.get("/funcionarios", async (req, res) => {
  const sql = `
    SELECT
      fcfo.nomefantasia as nome_completo,
      fcfo.cgccfo as cpf,
      fcfo.inscrestadual as identidade,
      fcfo.telefone,
      fcfo.campoalfa1 as funcao,
      fcfo.dataop1 as admissao,
      fcfo.dataop3 as rescisao
    FROM FCFO
    WHERE FCFO.CODCFO LIKE 'T%'
    ORDER BY FCFO.NOMEFANTASIA ASC;
  `;

  console.log(`Rota /funcionarios acessada. Origin: ${req.get("origin")}`); 
  try {
    const dados = await queryFirebird(sql);
    res.json(
      dados.length ? dados : { message: "Nenhum funcionário encontrado." }
    );
  } catch (err) {
    console.error("Erro em /funcionarios:", err.message);
    res
      .status(500)
      .json({ error: "Erro ao consultar banco.", details: err.message });
  }
});

app.get("/contratos", async (req, res) => {
  const sql = `
    SELECT DISTINCT
      tmov.numeromov as contrato,
      tmov.segundonumero as NS,
      tmov.campolivre1 as plano,
      tmov.serie,
      fcfo.nomefantasia AS CLIENTE,
      fcfo.cgccfo as CNPJ_CLIENTE
    FROM TMOV
    LEFT JOIN FCFO ON TMOV.CODCFO = FCFO.CODCFO
    WHERE TMOV.CODTMV = '2.2.13'
    AND TMOV.STATUS <> 'C';
  `;

  console.log(`Rota /contratos acessada. Origin: ${req.get("origin")}`); 
  try {
    const dados = await queryFirebird(sql);
    res.json(dados.length ? dados : { message: "Nenhum contrato encontrado." });
  } catch (err) {
    console.error("Erro em /contratos:", err.message);
    res
      .status(500)
      .json({ error: "Erro ao consultar banco.", details: err.message });
  }
});


app.get("/v1/centro-custo", async (req, res) => {
  const sql = `
    WITH Preferido_CentroCusto AS (
    SELECT
        flan.idlan,
        COALESCE(frc.ccusto, fe.ccusto, flan.ccusto) AS ccusto_tratado,
        frc.ccusto AS rateio_de_cc,
        CASE 
            WHEN flan.historico CONTAINING 'BAIXA PARCIAL' THEN flan.valorbaixado
            WHEN  FLAN.HISTORICO CONTAINING 'IMP_RET' THEN flan.valorbaixado
            ELSE frc.valor
        END AS valor_cc,
        flan.ccusto AS cc,
        fe.ccusto AS cc_extrato
    FROM flan
    LEFT JOIN (
        SELECT idlan, ccusto, valor
        FROM flanratccusto
        WHERE origem = 'L'
    ) frc ON frc.idlan = flan.idlan
    LEFT JOIN (
        SELECT numerodocumento, cnpjcpf, ccusto
        FROM fextrato
    ) fe ON fe.numerodocumento = 
                CASE 
                    WHEN flan.statuslan = 'B' THEN flan.numerodocumento || '/' || COALESCE(CAST(flan.parcela AS VARCHAR(10)), '')
                    ELSE flan.numerodocumento
                END
            AND fe.cnpjcpf = flan.codcfo
)
SELECT 
    flan.datavencimento, 
    flan.databaixa,
    CASE 
        WHEN flan.statuslan = 'B' THEN flan.numerodocumento || '/' || COALESCE(CAST(flan.parcela AS VARCHAR(10)), '')
        ELSE flan.numerodocumento
    END AS numerodocumento, 
    flan.parcela,
    fcfo.nomefantasia,
    fcfo.cgccfo AS CNPJ_CPF, 
    flan.valororiginal,
    flan.valorbaixado,
    p.rateio_de_cc AS Rateio_de_CC,
    p.valor_cc AS VALOR_CC,
    p.cc AS CC,
    p.cc_extrato AS CC_extrato,
    p.ccusto_tratado AS CC_tratado,
    CASE 
        WHEN flan.pagrec = 'P' THEN 'PAGAR'
        WHEN flan.pagrec = 'R' THEN 'RECEBER'
        ELSE 'DESCONHECIDO' 
    END AS Tipo_Transacao,
    -- fccusto.descricao AS Descricao_Centro_Custo,
    flan.statuslan AS Status_do_lancamento
    -- flan.historico
FROM flan
LEFT JOIN fcfo ON fcfo.codcfo = flan.codcfo
LEFT JOIN Preferido_CentroCusto p ON p.idlan = flan.idlan
LEFT JOIN fccusto ON fccusto.cod = p.ccusto_tratado;
  `;

  console.log(`Rota /v1/centro-custo acessada. Origin: ${req.get("origin")}`);
  try {
    const dados = await queryFirebird(sql);
    res.json(
      dados.length ? { dados } : { message: "Nenhum centro de custo encontrado." }
    );
  } catch (err) {
    console.error("Erro em /v1/centro-custo:", err.message);
    res
      .status(500)
      .json({ error: "Erro ao consultar banco.", details: err.message });
  }
});


app.get("/v2/centro-custo", async (req, res) => {
  const sql = `
  WITH Preferido_CentroCusto AS (
  SELECT
    flan.idlan,
    COALESCE(frc.ccusto, fe.ccusto, flan.ccusto) AS ccusto_tratado,
    frc.ccusto AS rateio_de_cc,
    CASE 
      WHEN (flan.historico IS NOT NULL AND flan.historico CONTAINING 'BAIXA PARCIAL') THEN flan.valorbaixado
      WHEN (flan.historico IS NOT NULL AND flan.historico CONTAINING 'IMP_RET') THEN flan.valorbaixado
      ELSE frc.valor
    END AS valor_cc,
    flan.ccusto AS cc,
    fe.ccusto AS cc_extrato
  FROM flan
  LEFT JOIN (
    SELECT idlan, ccusto, valor
    FROM flanratccusto
    WHERE origem = 'L'
  ) frc ON frc.idlan = flan.idlan
  LEFT JOIN (
    SELECT numerodocumento, cnpjcpf, ccusto
    FROM fextrato
  ) fe ON fe.numerodocumento = 
    CASE 
      WHEN flan.statuslan = 'B' THEN 
        CAST(flan.numerodocumento AS VARCHAR(100) CHARACTER SET UTF8) || '/' || CAST(COALESCE(CAST(flan.parcela AS VARCHAR(10)), '') AS VARCHAR(10) CHARACTER SET UTF8)
      ELSE CAST(flan.numerodocumento AS VARCHAR(100) CHARACTER SET UTF8)
    END
    AND fe.cnpjcpf = flan.codcfo
)
SELECT 
  flan.datavencimento, 
  flan.databaixa,
  CAST(
    CASE 
      WHEN flan.statuslan = 'B' THEN 
        CAST(flan.numerodocumento AS VARCHAR(100) CHARACTER SET UTF8) || '/' || CAST(COALESCE(CAST(flan.parcela AS VARCHAR(10)), '') AS VARCHAR(10) CHARACTER SET UTF8)
      ELSE CAST(flan.numerodocumento AS VARCHAR(100) CHARACTER SET UTF8)
    END
  AS VARCHAR(200) CHARACTER SET UTF8) AS numerodocumento, 
  flan.parcela,
  fcfo.nomefantasia,
  fcfo.cgccfo AS CNPJ_CPF, 
  flan.valororiginal,
  flan.valorbaixado,
  p.rateio_de_cc AS Rateio_de_CC,
  p.valor_cc AS VALOR_CC,
  p.cc AS CC,
  p.cc_extrato AS CC_extrato,
  p.ccusto_tratado AS CC_tratado,
  CASE 
    WHEN flan.pagrec = 'P' THEN 'PAGAR'
    WHEN flan.pagrec = 'R' THEN 'RECEBER'
    ELSE 'DESCONHECIDO' 
  END AS Tipo_Transacao,
  flan.statuslan AS Status_do_lancamento
FROM flan
LEFT JOIN fcfo ON fcfo.codcfo = flan.codcfo
LEFT JOIN Preferido_CentroCusto p ON p.idlan = flan.idlan
LEFT JOIN fccusto ON fccusto.cod = p.ccusto_tratado;
  `;

  console.log(`Rota /v2/centro-custo acessada. Origin: ${req.get("origin")}`);
  try {
    const dados = await queryFirebird(sql);
    res.json(
      dados.length
        ? { dados }
        : { message: "Nenhum centro de custo encontrado." }
    );
  } catch (err) {
    console.error("Erro em /v2/centro-custo:", err.message);
    res
      .status(500)
      .json({ error: "Erro ao consultar banco.", details: err.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () =>
  console.log(`🔥 API rodando em http://localhost:${port}`)
);
