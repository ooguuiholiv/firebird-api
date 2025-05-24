import express from "express";
import { queryFirebird } from "./db.js";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();

const corsOptions = {
  origin: "https://control.mbaconstrutora.cloud", 
  methods: ["GET"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(express.json());

const allowedOrigin = "https://control.mbaconstrutora.cloud";

app.use((req, res, next) => {
  const requestOrigin = req.get("origin");
  if (requestOrigin !== allowedOrigin) {
    console.warn(
      `Bloqueado acesso não autorizado. Origin recebido: "${requestOrigin}". Referer: "${req.get(
        "referer"
      )}". IP: ${req.ip}.`
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

  console.log(`Rota /clientes acessada. Origin: ${req.get("origin")}`); // Adicionado log de Origin
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

  console.log(`Rota /funcionarios acessada. Origin: ${req.get("origin")}`); // Adicionado log de Origin
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
    WHERE TMOV.CODTMV = '2.2.13';
  `;

  console.log(`Rota /clientes acessada. Origin: ${req.get("origin")}`); // Adicionado log de Origin
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
