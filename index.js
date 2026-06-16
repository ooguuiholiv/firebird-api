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
    "https://funcionarios-search.francosys.com.br",
    "https://mbaconstrutoracombr.sharepoint.com",
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
  "https://funcionarios-search.francosys.com.br",
  "https://mbaconstrutoracombr.sharepoint.com",
];

app.use((req, res, next) => {
  const requestOrigin = req.get("origin");
  if (!allowedOrigin.includes(requestOrigin)) {
    console.warn(
      `Bloqueado acesso não autorizado. Origin recebido: "${requestOrigin}". Referer: "${req.get(
        "referer",
      )}". IP: ${req.ip}`,
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

app.get("/fornecedores", async (req, res) => {
  const sql = await readFile("./consultas/fornecedores.sql", "utf8");
  const { cpf_cnpj, cgccfo } = req.query;

  let valorBusca = cpf_cnpj || cgccfo;

  if (!valorBusca) {
    return res
      .status(400)
      .json({ error: "Faltam parâmetros obrigatórios: cpf_cnpj ou cgccfo" });
  }

  // Se o parâmetro contiver apenas números, formata como CPF ou CNPJ
  if (/^\d+$/.test(valorBusca)) {
    valorBusca = formatCpfCnpj(valorBusca);
  }

  const params = [valorBusca];
  console.log(`Rota /fornecedores acessada. Origin: ${req.get("origin")}`);
  try {
    const dadosRaw = await queryFirebird(sql, params);
    const dados = dadosRaw.map((row) => {
      return {
        ...row,
        NOME_COMPLETO: decodeBuffer(row.NOME_COMPLETO),
        CPF_CNPJ: decodeBuffer(row.CPF_CNPJ),
      };
    });
    res.json(dados.length ? dados : { message: "Nenhum fornecedor encontrado." });
  } catch (err) {
    console.error("Erro em /fornecedores:", err.message);
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
    res.json(
      dados.length ? { dados } : { message: "Nenhum alerta encontrado." },
    );
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
      dados.length ? dados : { message: "Nenhum funcionário encontrado." },
    );
  } catch (err) {
    console.error("Erro em /funcionarios:", err.message);
    res
      .status(500)
      .json({ error: "Erro ao consultar banco.", details: err.message });
  }
});

app.get("/contratos", async (req, res) => {
  const sql = await readFile("./consultas/contratos.sql", "utf8");

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

app.get("/gastos-contratos", async (req, res) => {
  const sql = await readFile("./consultas/gastos_contratos.sql", "utf8");

  console.log(`Rota /gastos-contratos acessada. Origin: ${req.get("origin")}`);
  try {
    const dados = await queryFirebird(sql);
    res.json(dados.length ? dados : { message: "Nenhum contrato encontrado." });
  } catch (err) {
    console.error("Erro em /gastos-contratos:", err.message);
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
        : { message: "Nenhum centro de custo encontrado." },
    );
  } catch (err) {
    console.error("Erro em /v1/centro-custo:", err.message);
    res
      .status(500)
      .json({ error: "Erro ao consultar banco.", details: err.message });
  }
});

app.get("/material-aplicado-obra", async (req, res) => {
  const sql = await readFile(
    "./consultas/material_aplicado_na_obra.sql",
    "utf8",
  );
  const { data_inicio, data_fim, numero_contrato, serie } = req.query;

  if (!data_inicio || !data_fim || !numero_contrato || !serie) {
    return res.status(400).json({
      error:
        "Faltam parâmetros obrigatórios: data_inicio, data_fim, numero_contrato, serie",
    });
  }

  const params = [data_inicio, data_fim, numero_contrato, serie];
  console.log(
    `Rota /material-aplicado-obra acessada. Origin: ${req.get("origin")}`,
  );

  try {
    const dadosRaw = await queryFirebird(sql, params);

    const dados = dadosRaw.map((row) => {
      return {
        ...row,
        NOME_CLIENTE: decodeBuffer(row.NOME_CLIENTE),
        FAN_CLIENTE: decodeBuffer(row.FAN_CLIENTE),
        CIDADE: decodeBuffer(row.CIDADE),
        PRODUTO: decodeBuffer(row.PRODUTO),
        UNIDADE: decodeBuffer(row.UNIDADE),
        FORNECEDOR_ORIGEM: decodeBuffer(row.FORNECEDOR_ORIGEM),
      };
    });

    res.json(dados.length ? dados : { message: "Nenhum material encontrado." });
  } catch (err) {
    console.error("Erro em /material-aplicado-obra:", err.message);
    res
      .status(500)
      .json({ error: "Erro ao consultar banco.", details: err.message });
  }
});

app.get("/lancamentos", async (req, res) => {
  const sql = await readFile("./consultas/lancamentos.sql", "utf8");
  const { data_inicio, data_fim } = req.query;

  if (!data_inicio || !data_fim) {
    return res
      .status(400)
      .json({ error: "Faltam parâmetros obrigatórios: data_inicio, data_fim" });
  }

  const params = [data_inicio, data_fim];
  console.log(`Rota /lancamentos acessada. Origin: ${req.get("origin")}`);

  try {
    const dadosRaw = await queryFirebird(sql, params);

    const dados = dadosRaw.map((row) => {
      return {
        ...row,
        NUMERODOCUMENTO: decodeBuffer(row.NUMERODOCUMENTO),
        PARCELA: decodeBuffer(row.PARCELA),
        TIPO: decodeBuffer(row.TIPO),
        CONTA_CAIXA: decodeBuffer(row.CONTA_CAIXA),
        CCUSTO: decodeBuffer(row.CCUSTO),
        DESCRICAO: decodeBuffer(row.DESCRICAO),
        CODCFO: decodeBuffer(row.CODCFO),
        NOME: decodeBuffer(row.NOME),
        HISTORICO: decodeBuffer(row.HISTORICO),
      };
    });

    res.json(
      dados.length ? dados : { message: "Nenhum lançamento encontrado." },
    );
  } catch (err) {
    console.error("Erro em /lancamentos:", err.message);
    res
      .status(500)
      .json({ error: "Erro ao consultar banco.", details: err.message });
  }
});

app.get("/pagamentos", async (req, res) => {
  const sql = await readFile("./consultas/pagamentos.sql", "utf8");
  const { data_inicio, data_fim } = req.query;

  if (!data_inicio || !data_fim) {
    return res
      .status(400)
      .json({ error: "Faltam parâmetros obrigatórios: data_inicio, data_fim" });
  }

  const params = [data_inicio, data_fim];
  console.log(`Rota /pagamentos acessada. Origin: ${req.get("origin")}`);

  try {
    const dadosRaw = await queryFirebird(sql, params);

    const dados = dadosRaw.map((row) => {
      return {
        ...row,
        NUMERODOCUMENTO: decodeBuffer(row.NUMERODOCUMENTO),
        PARCELA: decodeBuffer(row.PARCELA),
        TIPO: decodeBuffer(row.TIPO),
        CONTA_CAIXA: decodeBuffer(row.CONTA_CAIXA),
        CCUSTO: decodeBuffer(row.CCUSTO),
        DESCRICAO: decodeBuffer(row.DESCRICAO),
        CODCFO: decodeBuffer(row.CODCFO),
        NOME: decodeBuffer(row.NOME),
        HISTORICO: decodeBuffer(row.HISTORICO),
      };
    });

    res.json(
      dados.length ? dados : { message: "Nenhum pagamento encontrado." },
    );
  } catch (err) {
    console.error("Erro em /pagamentos:", err.message);
    res
      .status(500)
      .json({ error: "Erro ao consultar banco.", details: err.message });
  }
});

app.get("/statuslan", async (req, res) => {
  const sql = await readFile("./consultas/statuslan.sql", "utf8");
  const { numerodocumento, nomefantasia } = req.query;

  if (!numerodocumento) {
    return res
      .status(400)
      .json({ error: "Faltam parâmetros obrigatórios: numerodocumento" });
  }

  const params = [numerodocumento, nomefantasia];
  console.log(`Rota /statuslan acessada. Origin: ${req.get("origin")}`);

  try {
    const dadosRaw = await queryFirebird(sql, params);

    const dados = dadosRaw.map((row) => {
      return {
        ...row,
        NUMERODOCUMENTO: decodeBuffer(row.NUMERODOCUMENTO),
        NOMEFANTASIA: decodeBuffer(row.NOMEFANTASIA),
        STATUSLAN: decodeBuffer(row.STATUSLAN),
        DATABAIXA: decodeBuffer(row.DATABAIXA),
        HISTORICO: decodeBuffer(row.HISTORICO),
      };
    });

    res.json(
      dados.length ? dados : { message: "Nenhum lançamento encontrado." },
    );
  } catch (err) {
    console.error("Erro em /statuslan:", err.message);
    res
      .status(500)
      .json({ error: "Erro ao consultar banco.", details: err.message });
  }
});

app.get("/vr-aberto", async (req, res) => {
  const sql = await readFile("./consultas/vr_aberto.sql", "utf8");
  const { nomefantasia } = req.query;

  const busca = nomefantasia || "";
  const params = [busca];
  console.log(`Rota /vr-aberto acessada. Origin: ${req.get("origin")}`);

  try {
    const dadosRaw = await queryFirebird(sql, params);

    const dados = dadosRaw.map((row) => {
      return {
        ...row,
        NUMERODOCUMENTO: decodeBuffer(row.NUMERODOCUMENTO),
        NOMEFANTASIA: decodeBuffer(row.NOMEFANTASIA),
        STATUSLAN: decodeBuffer(row.STATUSLAN),
        HISTORICO: decodeBuffer(row.HISTORICO),
      };
    });

    res.json(
      dados.length
        ? dados
        : { message: "Nenhum lançamento em aberto encontrado." },
    );
  } catch (err) {
    console.error("Erro em /vr-aberto:", err.message);
    res
      .status(500)
      .json({ error: "Erro ao consultar banco.", details: err.message });
  }
});

function decodeBuffer(val) {
  if (!val) return null;
  if (Buffer.isBuffer(val)) return iconv.decode(val, "latin1"); // ou 'latin1'
  return val; // se já for string
}

function formatCpfCnpj(value) {
  const clean = value.replace(/\D/g, "");
  if (clean.length === 11) {
    return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  } else if (clean.length === 14) {
    return clean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  }
  return value;
}

const port = process.env.PORT || 3000;
app.listen(port, () =>
  console.log(`🔥 API rodando em http://localhost:${port}`),
);
