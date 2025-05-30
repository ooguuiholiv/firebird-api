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
    SELECT GCOMPROMISSO.*, GAGENDACOMPROMISSO.*  FROM GAGENDACOMPROMISSO
    LEFT JOIN GCOMPROMISSO ON GAGENDACOMPROMISSO.IDCOMPROMISSO = GCOMPROMISSO.IDCOMPROMISSO;
  `;

  console.log(`Rota /alertas acessada. Origin: ${req.get("origin")}`);
  try {
    const dados = await queryFirebird(sql);
    res.json(dados.length ? {dados} : { message: "Nenhum cliente encontrado." });
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
    res.json(dados.length ? dados : { message: "Nenhum cliente encontrado." });
  } catch (err) {
    console.error("Erro em /clientes:", err.message);
    res
      .status(500)
      .json({ error: "Erro ao consultar banco.", details: err.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () =>
  console.log(`🔥 API rodando em http://localhost:${port}`)
);
