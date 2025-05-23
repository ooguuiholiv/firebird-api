import express from "express";
import { queryFirebird } from "./db.js";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(express.json());

app.get("/clientes", async (req, res) => {
  const sqlQueryFuncionarios = `
        SELECT DISTINCT   
            fcfo.nomefantasia, 
            fcfo.cgccfo   
        FROM
            TMOV
        LEFT JOIN FCFO ON TMOV.CODCFO = FCFO.CODCFO
        WHERE
            TMOV.CODTMV = '2.2.13';
    `;

  console.log("Rota /clientes acessada.");

  try {
    const dadosFuncionarios = await queryFirebird(sqlQueryFuncionarios);

    // Verifica se retornou dados e envia
    if (dadosFuncionarios && dadosFuncionarios.length > 0) {
      res.json(dadosFuncionarios);
    } else {
      // Se a query executou com sucesso mas não retornou linhas
      res.json({ message: "Nenhum funcionário encontrado com os critérios." });
    }
  } catch (err) {
    console.error("Erro ao buscar funcionários:", err.message);
    // Você pode querer logar err.odbcErrors aqui também se precisar de mais detalhes
    res.status(500).json({
      error: "Falha ao consultar o banco de dados.",
      // Em produção, você pode querer omitir err.message ou fornecer uma mensagem mais genérica.
      details: err.message,
    });
  }
});

app.get("/funcionarios", async (req, res) => {
  const sqlQueryFuncionarios = `
          SELECT    
            fcfo.nomefantasia as nome_completo, 
            fcfo.cgccfo as cpf,
            fcfo.inscrestadual as identidade,
            fcfo.telefone,
            TRIM(
                COALESCE(FCFO.RUA, '') ||
                CASE WHEN FCFO.NUMERO IS NOT NULL AND FCFO.NUMERO <> '' THEN ' ' || FCFO.NUMERO ELSE '' END ||
                CASE WHEN FCFO.BAIRRO IS NOT NULL AND FCFO.BAIRRO <> '' THEN ', ' || FCFO.BAIRRO ELSE '' END ||
                CASE WHEN FCFO.CIDADE IS NOT NULL AND FCFO.CIDADE <> '' THEN ' - ' || FCFO.CIDADE ELSE '' END
            ) AS ENDERECO_COMPLETO,
            fcfo.dataop1 as admissao
          FROM
              FCFO
          WHERE
             FCFO.CODCFO LIKE 'T%'
      `;

  console.log("Rota /funcionarios acessada.");

  try {
    const dadosFuncionarios = await queryFirebird(sqlQueryFuncionarios);

    // Verifica se retornou dados e envia
    if (dadosFuncionarios && dadosFuncionarios.length > 0) {
      res.json(dadosFuncionarios);
    } else {
      // Se a query executou com sucesso mas não retornou linhas
      res.json({ message: "Nenhum funcionário encontrado com os critérios." });
    }
  } catch (err) {
    console.error("Erro ao buscar funcionários:", err.message);
    // Você pode querer logar err.odbcErrors aqui também se precisar de mais detalhes
    res.status(500).json({
      error: "Falha ao consultar o banco de dados.",
      // Em produção, você pode querer omitir err.message ou fornecer uma mensagem mais genérica.
      details: err.message,
    });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () =>
  console.log(`🔥 API rodando em http://localhost:${port}`)
);
