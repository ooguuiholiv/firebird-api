import express from "express";
import { queryFirebird } from "./db.js";
import dotenv from "dotenv";
import cors from "cors";
import { readFile } from "fs/promises";
import iconv from "iconv-lite";

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
  const sql = await readFile("./consultas/clientes.sql", "utf8");

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
  const sql = await readFile("./consultas/alertas.sql", "utf8");

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
  const sql = await readFile("./consultas/funcionarios.sql", "utf8");

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
  const sql = await readFile('./consultas/contratos.sql', 'utf8');

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
  const sql = await readFile("./consultas/centro-custo.sql", "utf8");
  console.log(`Rota /v1/centro-custo acessada. Origin: ${req.get("origin")}`);

  try {
    const dadosRaw = await queryFirebird(sql);

    const dados = dadosRaw.map((row) => {
      // convertendo os campos que costumam quebrar
      return {
        ...row,
        nomefantasia: decodeBuffer(row.nomefantasia),
        numerodocumento: decodeBuffer(row.numerodocumento),
        ccusto_tratado: decodeBuffer(row.ccusto_tratado),
        rateio_de_cc: decodeBuffer(row.rateio_de_cc),
        cc: decodeBuffer(row.cc),
        cc_extrato: decodeBuffer(row.cc_extrato),
        // adiciona outros campos problemáticos aqui
      };
    });

    res.json(
      dados.length
        ? { dados }
        : { message: "Nenhum centro de custo encontrado." }
    );
  } catch (err) {
    console.error("Erro em /v1/centro-custo:", err.message);
    res
      .status(500)
      .json({ error: "Erro ao consultar banco.", details: err.message });
  }
});

function decodeBuffer(val) {
  if (!val) return null;
  if (Buffer.isBuffer(val)) return iconv.decode(val, "win1252"); // ou 'latin1'
  return val; // se já for string
}

const port = process.env.PORT || 3000;
app.listen(port, () =>
  console.log(`🔥 API rodando em http://localhost:${port}`)
);
