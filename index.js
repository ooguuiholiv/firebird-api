import express from "express";
import { queryFirebird } from "./db.js";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();

// CORS seguro
const corsOptions = {
  origin: "https://control.mbaconstrutora.cloud", // sem barra no final!
  methods: ["GET"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(express.json());

// Middleware para validar estritamente o ORIGIN
const allowedOrigin = "https://control.mbaconstrutora.cloud";

app.use((req, res, next) => {
  const requestOrigin = req.get("origin");

  // Bloqueia se o Origin não for exatamente o permitido.
  // Isso inclui casos onde Origin é null (acesso direto) ou qualquer outro valor.
  if (requestOrigin !== allowedOrigin) {
    console.warn(
      `Bloqueado acesso não autorizado. Origin recebido: "${requestOrigin}". Referer: "${req.get(
        "referer"
      )}". IP: ${req.ip}.`
    );
    return res.status(403).json({ error: "Acesso não autorizado." });
  }

  // Se chegou aqui, o Origin é o permitido.
  next();
});

app.get("/clientes", async (req, res) => {
  const sql = `
    SELECT DISTINCT   
      fcfo.nomefantasia, 
      fcfo.cgccfo   
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
      fcfo.dataop1 as admissao
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

const port = process.env.PORT || 3000;
app.listen(port, () =>
  console.log(`🔥 API rodando em http://localhost:${port}`)
);
